import { AppIntentManager, AppIntentProtocol, ControlWidget } from "scripting"

export const storageKey = "qb.speedlimit.state"
export const configKey = "qb.speedlimit.config"

export interface QBConfig {
  url: string
  username: string
  password: string
}

const extractSID = (setCookie: string | null): string | null =>
  setCookie?.match(/SID=([^;]+)/)?.[1] ?? null

const loginQB = async (config: QBConfig): Promise<string | null> => {
  try {
    const response = await fetch(`${config.url}/api/v2/auth/login`, {
      method: 'POST',
      body: `username=${encodeURIComponent(config.username)}&password=${encodeURIComponent(config.password)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    
    if ((await response.text()) !== 'Ok.') return null
    return extractSID(response.headers.get('set-cookie') || response.headers.get('Set-Cookie'))
  } catch {
    return null
  }
}

const setSpeedLimitMode = async (config: QBConfig, enabled: boolean): Promise<boolean> => {
  try {
    const sid = await loginQB(config)
    if (!sid) return false

    const mode = enabled ? 1 : 0
    const response = await fetch(`${config.url}/api/v2/transfer/setSpeedLimitsMode`, {
      method: 'POST',
      headers: { 'Cookie': `SID=${sid}` },
      body: `mode=${mode}`,
    })

    return response.ok
  } catch {
    return false
  }
}

export const ToggleQBSpeedLimitIntent = AppIntentManager.register({
  name: "ToggleQBSpeedLimitIntent",
  protocol: AppIntentProtocol.AppIntent,
  perform: async (
    state: {
      value: boolean
    }
  ) => {
    const config = Storage.get<QBConfig>(configKey)
    if (!config) {
      console.error("配置未设置")
      return
    }

    const success = await setSpeedLimitMode(config, state.value)
    if (success) {
      Storage.set(storageKey, state.value)
      ControlWidget.reloadToggles()
    } else {
      console.error("设置限速模式失败")
    }
  }
})

