import { AppIntentManager, AppIntentProtocol, ControlWidget } from "scripting"

export const storageKey = "tr.speedlimit.state"
export const configKey = "tr.speedlimit.config"

export interface TRConfig {
  url: string
  username: string
  password: string
}

const base64Encode = (str: string): string => Data.fromRawString(str)!.toBase64String()

const setAltSpeedEnabled = async (config: TRConfig, enabled: boolean): Promise<boolean> => {
  try {
    const rpcUrl = `${config.url}/transmission/rpc`
    const auth = base64Encode(`${config.username}:${config.password}`)
    let sessionId = Storage.get<string>('tr.session.id') || ''

    const makeRequest = async (sid: string) => fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
        'X-Transmission-Session-Id': sid,
      },
      body: JSON.stringify({ 
        method: 'session-set', 
        arguments: { 'alt-speed-enabled': enabled } 
      }),
    })

    let response = await makeRequest(sessionId)

    if (response.status === 409) {
      const newSessionId = response.headers.get('X-Transmission-Session-Id') || 
                           response.headers.get('x-transmission-session-id') || ''
      if (newSessionId) {
        Storage.set('tr.session.id', newSessionId)
        sessionId = newSessionId
        response = await makeRequest(sessionId)
      }
    }

    if (!response.ok) return false

    const data = await response.json()
    return data.result === 'success'
  } catch {
    return false
  }
}

export const ToggleTRSpeedLimitIntent = AppIntentManager.register({
  name: "ToggleTRSpeedLimitIntent",
  protocol: AppIntentProtocol.AppIntent,
  perform: async (
    state: {
      value: boolean
    }
  ) => {
    const config = Storage.get<TRConfig>(configKey)
    if (!config) {
      console.error("配置未设置")
      return
    }

    const success = await setAltSpeedEnabled(config, state.value)
    if (success) {
      Storage.set(storageKey, state.value)
      ControlWidget.reloadToggles()
    } else {
      console.error("设置限速模式失败")
    }
  }
})

