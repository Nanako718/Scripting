import type { CaptchaResult } from './vehicle-types'

export type TencentCaptchaErrorStatus = 'failed' | 'cancelled' | 'timeout' | 'invalid_result'

export class TencentCaptchaError extends Error {
  status: TencentCaptchaErrorStatus
  ret?: number

  constructor(status: TencentCaptchaErrorStatus, message: string, ret?: number) {
    super(message)
    this.name = 'TencentCaptchaError'
    this.status = status
    this.ret = ret
  }
}

type TencentCaptchaMessage = {
  type: 'captcha_success' | 'captcha_failed'
  ticket?: string
  randstr?: string
  ret?: number
  message?: string
}

type TencentCaptchaOptions = {
  appId: string
  callbackName: string
  title: string
  description?: string
  scriptUrl?: string
  timeoutMs?: number
}

const DEFAULT_TENCENT_CAPTCHA_SCRIPT_URL = 'https://turing.captcha.qcloud.com/TCaptcha.js'
const DEFAULT_TENCENT_CAPTCHA_TIMEOUT_MS = 120_000
const CAPTCHA_BRIDGE_HANDLER_NAME = 'tencentCaptcha'

const assertSafeJavaScriptIdentifier = (value: string): string => {
  if (/^[A-Za-z_$][0-9A-Za-z_$]*$/.test(value)) {
    return value
  }

  throw new Error('Tencent Captcha callback name is invalid')
}

const escapeHtmlText = (value: string): string => {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

const buildTencentCaptchaHtml = (options: Required<TencentCaptchaOptions>): string => {
  const callbackName = assertSafeJavaScriptIdentifier(options.callbackName)
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { margin: 0; padding: 24px; background: #0b1220; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
      .card { padding: 20px; border-radius: 16px; background: #111827; box-shadow: 0 18px 48px rgba(15, 23, 42, 0.3); }
      .title { font-size: 18px; font-weight: 600; margin-bottom: 10px; }
      .desc { font-size: 13px; line-height: 1.7; color: #cbd5e1; margin-bottom: 16px; }
      button { width: 100%; border: 0; border-radius: 12px; padding: 14px 16px; background: #2563eb; color: #fff; font-size: 15px; font-weight: 600; }
    </style>
    <script src="${escapeHtmlText(options.scriptUrl)}"></script>
  </head>
  <body>
    <div class="card">
      <div class="title">${escapeHtmlText(options.title)}</div>
      <div class="desc">${escapeHtmlText(options.description)}</div>
      <button id="startBtn">开始验证</button>
    </div>
    <script>
      var appId = ${JSON.stringify(options.appId)}
      var callbackName = ${JSON.stringify(callbackName)}
      var hasStarted = false

      function postCaptchaMessage(payload) {
        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.${CAPTCHA_BRIDGE_HANDLER_NAME}) {
          window.webkit.messageHandlers.${CAPTCHA_BRIDGE_HANDLER_NAME}.postMessage(payload)
        }
      }

      window[callbackName] = function(res) {
        if (!res || res.ret !== 0 || !res.ticket || !res.randstr) {
          postCaptchaMessage({
            type: "captcha_failed",
            ret: res && res.ret,
            message: res && (res.errMsg || res.errorCode || "")
          })
          return
        }

        postCaptchaMessage({
          type: "captcha_success",
          ticket: res.ticket,
          randstr: res.randstr
        })
      }

      function startCaptcha() {
        if (!window.TencentCaptcha) {
          postCaptchaMessage({
            type: "captcha_failed",
            message: "TencentCaptcha is not available"
          })
          return
        }

        hasStarted = true
        new window.TencentCaptcha(appId, window[callbackName], { needFeedBack: false, loading: true }).show()
      }

      document.getElementById("startBtn").addEventListener("click", startCaptcha)
      window.onload = function() {
        if (!hasStarted) {
          setTimeout(startCaptcha, 50)
        }
      }
    </script>
  </body>
</html>`
}

const createCaptchaErrorFromMessage = (payload: TencentCaptchaMessage): TencentCaptchaError => {
  const status: TencentCaptchaErrorStatus = payload.ret === 2 ? 'cancelled' : 'failed'
  const message = payload.message?.trim() || (status === 'cancelled' ? '验证码已取消，请重新验证' : '验证码校验失败，请重新验证')
  return new TencentCaptchaError(status, message, payload.ret)
}

const assertCaptchaResult = (payload: TencentCaptchaMessage): CaptchaResult => {
  if (
    payload.type === 'captcha_success' &&
    typeof payload.ticket === 'string' &&
    payload.ticket.trim() !== '' &&
    typeof payload.randstr === 'string' &&
    payload.randstr.trim() !== ''
  ) {
    return {
      ticket: payload.ticket,
      randstr: payload.randstr
    }
  }

  throw new TencentCaptchaError('invalid_result', '验证码返回结果无效，请重新验证', payload.ret)
}

export const requestTencentCaptcha = async (options: TencentCaptchaOptions): Promise<CaptchaResult> => {
  const trustedOptions: Required<TencentCaptchaOptions> = {
    appId: options.appId,
    callbackName: options.callbackName,
    title: options.title,
    description: options.description ?? '请手动完成滑块验证，验证成功后会自动返回脚本。',
    scriptUrl: options.scriptUrl ?? DEFAULT_TENCENT_CAPTCHA_SCRIPT_URL,
    timeoutMs: options.timeoutMs ?? DEFAULT_TENCENT_CAPTCHA_TIMEOUT_MS
  }
  const webView = new WebViewController()
  let resolveResult: (value: CaptchaResult) => void = () => {}
  let rejectResult: (reason?: unknown) => void = () => {}
  let settled = false
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  try {
    const resultPromise = new Promise<CaptchaResult>((resolve, reject) => {
      resolveResult = resolve
      rejectResult = reject
    })

    await webView.addScriptMessageHandler<TencentCaptchaMessage, null>(CAPTCHA_BRIDGE_HANDLER_NAME, payload => {
      if (!payload || settled) {
        return null
      }

      settled = true
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }

      if (payload.type === 'captcha_failed') {
        rejectResult(createCaptchaErrorFromMessage(payload))
      } else {
        try {
          resolveResult(assertCaptchaResult(payload))
        } catch (error) {
          rejectResult(error)
        }
      }
      webView.dismiss()
      return null
    })

    await webView.loadHTML(buildTencentCaptchaHtml(trustedOptions))
    const presentPromise = webView.present({ navigationTitle: trustedOptions.title })

    timeoutId = setTimeout(() => {
      if (!settled) {
        settled = true
        rejectResult(new TencentCaptchaError('timeout', '验证码验证超时，请重新验证'))
        webView.dismiss()
      }
    }, trustedOptions.timeoutMs)

    void presentPromise.then(
      () => {
        if (!settled) {
          settled = true
          rejectResult(new TencentCaptchaError('cancelled', '验证码已取消，请重新验证'))
        }
      },
      error => {
        if (!settled) {
          settled = true
          rejectResult(error)
        }
      }
    )

    const result = await resultPromise
    await presentPromise
    return result
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    webView.dispose()
  }
}
