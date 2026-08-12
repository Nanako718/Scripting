// 一汽大众 API 客户端
// 使用代理后端 jc-api.i95.me

import { Headers, fetch } from 'scripting'
import { encrypt, decrypt, isCryptoEnvelope, CryptoError } from './crypto'
import type { TerminalApiResponse, TerminalSession } from './types'

// ============ 配置 ============
const BASE_URL = 'https://jc-api.i95.me'
const TIMEOUT_SECONDS = 20
const PLATFORM = 'iPhone_iOS27.0_Scripting'
const APP_VERSION = '6.0.2'

// ============ 错误类 ============
export class ApiError extends Error {
  path: string
  code: string
  requestId: string
  status: number
  reason: string
  retryable: boolean

  constructor(path: string, code: string, message: string, requestId: string, status: number, reason: string, retryable: boolean) {
    super(message)
    this.name = 'ApiError'
    this.path = path
    this.code = code
    this.requestId = requestId
    this.status = status
    this.reason = reason
    this.retryable = retryable
  }
}

// ============ 内部工具 ============
const buildHeaders = (session?: TerminalSession): Headers => {
  const headers = new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Request-Id': UUID.string()
  })

  if (session) {
    headers.set('Authorization', `Bearer ${session.accessToken}`)
    headers.set('X-Terminal-App-Version', APP_VERSION)
    headers.set('X-Terminal-Platform', PLATFORM)
  }

  return headers
}

const isPlainPath = (path: string): boolean => {
  return path === '/v1/terminal/register' || path === '/v1/terminal/refresh-token' || path.startsWith('/v1/runtime-parameters/')
}

const buildRequestBody = (path: string, method: string, body: object | undefined, session?: TerminalSession): string | undefined => {
  if (!body || method === 'GET' || method === 'HEAD') return undefined
  if (!session || isPlainPath(path)) return JSON.stringify(body)
  return JSON.stringify(encrypt(body, session.crypto))
}

const parseResponse = (path: string, status: number, rawPayload: unknown, session?: TerminalSession): TerminalApiResponse => {
  // 加密响应
  if (session && !isPlainPath(path) && isCryptoEnvelope(rawPayload)) {
    if (rawPayload.keyId !== session.crypto.keyId) {
      throw new ApiError(path, 'UNAUTHORIZED', '加密密钥不匹配', '', status, 'crypto_key_mismatch', true)
    }
    const decrypted = decrypt(rawPayload, session.crypto)
    if (typeof decrypted === 'object' && decrypted !== null) {
      const payload = decrypted as Partial<TerminalApiResponse>
      if (typeof payload.code === 'string' && typeof payload.message === 'string' && typeof payload.requestId === 'string') {
        return payload as TerminalApiResponse
      }
    }
    throw new ApiError(path, 'UNAUTHORIZED', '解密响应无效', '', status, 'invalid_crypto_envelope', true)
  }

  // 明文响应
  if (typeof rawPayload === 'object' && rawPayload !== null) {
    const payload = rawPayload as Partial<TerminalApiResponse>
    if (typeof payload.code === 'string' && typeof payload.message === 'string' && typeof payload.requestId === 'string') {
      return payload as TerminalApiResponse
    }
  }

  throw new ApiError(path, 'BAD_RESPONSE', '响应格式无效', '', status, 'invalid_response', false)
}

// ============ 核心请求函数 ============
export const requestJson = async <T = unknown>(
  path: string,
  options: { method?: string; body?: object; session?: TerminalSession } = {}
): Promise<T> => {
  const url = `${BASE_URL}${path}`
  const method = options.method ?? 'GET'
  const body = buildRequestBody(path, method, options.body, options.session)

  const response = await fetch(url, {
    method,
    headers: buildHeaders(options.session),
    body,
    timeout: TIMEOUT_SECONDS,
    allowInsecureRequest: false
  })

  const responseText = await response.text()
  let rawPayload: unknown
  try {
    rawPayload = JSON.parse(responseText)
  } catch {
    throw new ApiError(path, 'BAD_RESPONSE', `非 JSON 响应: ${responseText.slice(0, 200)}`, '', response.status, 'non_json', false)
  }

  const payload = parseResponse(path, response.status, rawPayload, options.session)

  if (payload.code !== 'OK') {
    const errorInfo = payload.error ?? { reason: '', retryable: false }
    throw new ApiError(path, payload.code, payload.message || payload.code, payload.requestId, response.status, errorInfo.reason, errorInfo.retryable)
  }

  return payload.data as T
}

// ============ 会话管理 ============
const SESSION_KEY = 'yqdz_terminal_session'
let currentSession: TerminalSession | null = null

// 从 Keychain 加载会话
const loadSession = (): TerminalSession | null => {
  try {
    const json = Keychain.get(SESSION_KEY)
    if (!json) return null
    const session = JSON.parse(json) as TerminalSession
    // 验证基本结构
    if (session.accessToken && session.refreshToken && session.crypto?.enabled) {
      return session
    }
    return null
  } catch {
    return null
  }
}

// 保存会话到 Keychain
const saveSession = (session: TerminalSession | null): void => {
  if (session) {
    Keychain.set(SESSION_KEY, JSON.stringify(session))
  } else {
    Keychain.remove(SESSION_KEY)
  }
}

export const getSession = (): TerminalSession | null => {
  if (!currentSession) {
    currentSession = loadSession()
  }
  return currentSession
}

export const setSession = (session: TerminalSession | null): void => {
  currentSession = session
  saveSession(session)
}

export const ensureSession = async (): Promise<TerminalSession> => {
  if (currentSession) {
    // 检查是否过期（提前 60 秒刷新）
    if (currentSession.expiresAt - Date.now() > 60 * 1000) {
      return currentSession
    }
    // 尝试刷新
    try {
      return await refreshSession(currentSession)
    } catch {
      // 刷新失败，重新注册
    }
  }
  return await registerTerminal()
}

export const registerTerminal = async (): Promise<TerminalSession> => {
  const data = await requestJson<{
    terminal: { terminalId: string; platform: string; status: string }
    token: { accessToken: string; refreshToken: string; expiresIn: number }
    crypto: TerminalSession['crypto']
    featureTier: string
    entitlementExpiresAt: string | null
    fawvwAccountId: string | null
  }>('/v1/terminal/register', {
    method: 'POST',
    body: {
      platform: PLATFORM,
      deviceId: Device.uuid ?? UUID.string(),
      appVersion: APP_VERSION
    }
  })

  const session: TerminalSession = {
    terminalId: data.terminal.terminalId,
    terminalStatus: data.terminal.status,
    accessToken: data.token.accessToken,
    refreshToken: data.token.refreshToken,
    expiresIn: data.token.expiresIn,
    expiresAt: Date.now() + data.token.expiresIn * 1000,
    crypto: data.crypto,
    featureTier: data.featureTier as TerminalSession['featureTier'],
    entitlementExpiresAt: data.entitlementExpiresAt,
    fawvwAccountId: data.fawvwAccountId
  }

  currentSession = session
  saveSession(session)
  return session
}

export const refreshSession = async (session: TerminalSession): Promise<TerminalSession> => {
  const data = await requestJson<{
    token: { accessToken: string; refreshToken: string; expiresIn: number }
    crypto: TerminalSession['crypto']
  }>('/v1/terminal/refresh-token', {
    method: 'POST',
    body: { refreshToken: session.refreshToken }
  })

  const refreshed: TerminalSession = {
    ...session,
    accessToken: data.token.accessToken,
    refreshToken: data.token.refreshToken,
    expiresIn: data.token.expiresIn,
    expiresAt: Date.now() + data.token.expiresIn * 1000,
    crypto: data.crypto
  }

  currentSession = refreshed
  saveSession(refreshed)
  return refreshed
}

// ============ 带鉴权的请求 ============
export const requestAuthedJson = async <T = unknown>(
  path: string,
  options: { method?: string; body?: object } = {}
): Promise<T> => {
  const session = await ensureSession()

  try {
    return await requestJson<T>(path, { ...options, session })
  } catch (error) {
    // Token 失效，尝试恢复
    if (error instanceof ApiError && error.reason === 'invalid_access_token') {
      const recovered = await refreshSession(session)
      return await requestJson<T>(path, { ...options, session: recovered })
    }
    throw error
  }
}
