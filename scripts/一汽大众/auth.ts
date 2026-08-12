// 一汽大众登录模块

import { requestAuthedJson, requestJson, ensureSession, setSession } from './api'
import type { TerminalMeData, RuntimeConfigData, LoginResult, SmsSendResult } from './types'

// ============ 登录接口 ============

/** 获取登录配置（验证码 AppId 等） */
export const getLoginOptions = async (): Promise<{ passwordCaptchaAppId: string; captchaCallbackName: string }> => {
  return await requestAuthedJson('/v1/fawvw/login/options')
}

/** 密码登录 */
export const loginByPassword = async (
  mobile: string,
  password: string,
  deviceDid: string,
  ticket: string,
  randstr: string
): Promise<LoginResult> => {
  return await requestAuthedJson('/v1/fawvw/login/password', {
    method: 'POST',
    body: { mobile, password, ticket, randstr, deviceDid }
  })
}

/** 发送短信验证码 */
export const sendSmsCode = async (mobile: string, deviceDid: string): Promise<SmsSendResult> => {
  return await requestAuthedJson('/v1/fawvw/login/sms/send', {
    method: 'POST',
    body: { mobile, deviceDid }
  })
}

/** 验证短信验证码 */
export const verifySmsCode = async (
  mobile: string,
  deviceDid: string,
  verificationCode: string
): Promise<LoginResult> => {
  return await requestAuthedJson('/v1/fawvw/login/sms/verify', {
    method: 'POST',
    body: { mobile, verificationCode, deviceDid }
  })
}

// ============ 同步接口 ============

/** 同步终端用户信息 */
export const syncMe = async (): Promise<TerminalMeData> => {
  return await requestAuthedJson('/v1/me')
}

/** 同步运行时配置 */
export const syncRuntimeConfig = async (): Promise<RuntimeConfigData> => {
  return await requestAuthedJson('/v1/runtime-config')
}

// ============ 完整登录流程 ============

export interface LoginOptions {
  mobile: string
  password: string
  deviceDid: string
  /** 腾讯验证码回调，返回 ticket 和 randstr */
  onCaptcha: (appId: string, callbackName: string) => Promise<{ ticket: string; randstr: string }>
  /** 短信验证码回调，返回验证码 */
  onSmsCode: () => Promise<string>
  /** 状态回调 */
  onStatus?: (message: string) => void
}

/**
 * 完整的一汽大众登录流程
 * 1. 获取登录配置
 * 2. 腾讯验证码验证
 * 3. 密码登录
 * 4. 如需短信验证，发送并验证
 * 5. 同步用户信息和运行时配置
 */
export const login = async (options: LoginOptions): Promise<{ fawvwAccountId: string; vehicleCount: number }> => {
  const { mobile, password, deviceDid, onCaptcha, onSmsCode, onStatus } = options

  // 1. 获取登录配置
  onStatus?.('正在获取登录配置...')
  const loginOptions = await getLoginOptions()

  // 2. 腾讯验证码
  onStatus?.('正在进行安全验证...')
  const captcha = await onCaptcha(loginOptions.passwordCaptchaAppId, loginOptions.captchaCallbackName)

  // 3. 密码登录
  onStatus?.('正在登录...')
  let loginResult = await loginByPassword(mobile, password, deviceDid, captcha.ticket, captcha.randstr)

  // 4. 短信验证（如需要）
  if (loginResult.loginState === 'SMS_REQUIRED') {
    onStatus?.('正在发送短信验证码...')
    await sendSmsCode(mobile, deviceDid)

    const smsCode = await onSmsCode()
    onStatus?.('正在验证短信验证码...')
    loginResult = await verifySmsCode(mobile, deviceDid, smsCode)
  }

  if (loginResult.loginState !== 'SUCCEEDED') {
    throw new Error(`登录失败: ${loginResult.loginState}`)
  }

  // 5. 同步状态
  onStatus?.('正在同步账号状态...')
  await syncMe()
  await syncRuntimeConfig()

  return {
    fawvwAccountId: loginResult.fawvwAccountId!,
    vehicleCount: loginResult.vehicleCount ?? 0
  }
}

// ============ 登出 ============

export const logout = (): void => {
  setSession(null)
}
