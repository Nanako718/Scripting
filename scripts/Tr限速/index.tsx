import { Button, ControlWidget, List, Navigation, NavigationStack, Script, Section, Text, TextField, SecureField, Toggle, VStack, useState } from "scripting"
import { storageKey, configKey, TRConfig } from "./app_intents"

const base64Encode = (str: string): string => Data.fromRawString(str)!.toBase64String()

const makeRPCRequest = async (config: TRConfig, method: string, args?: Record<string, any>): Promise<any> => {
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
    body: JSON.stringify({ method, arguments: args || {} }),
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

  if (!response.ok) return null

  const data = await response.json() as { result: string; arguments?: any }
  if (data.result !== 'success') return null

  return data.arguments
}

const getAltSpeedEnabled = async (config: TRConfig): Promise<boolean | null> => {
  try {
    const sessionInfo = await makeRPCRequest(config, 'session-get')
    if (!sessionInfo) return null
    return sessionInfo['alt-speed-enabled'] === true
  } catch {
    return null
  }
}

const setAltSpeedEnabled = async (config: TRConfig, enabled: boolean): Promise<boolean> => {
  try {
    const result = await makeRPCRequest(config, 'session-set', { 'alt-speed-enabled': enabled })
    return result !== null
  } catch {
    return false
  }
}

function View() {
  const dismiss = Navigation.useDismiss()
  const [enabled, setEnabled] = useState(() => Storage.get<boolean>(storageKey) ?? false)
  const [config, setConfig] = useState<TRConfig>(() => Storage.get<TRConfig>(configKey) ?? { url: "", username: "", password: "" })
  const [url, setUrl] = useState(config.url)
  const [username, setUsername] = useState(config.username)
  const [password, setPassword] = useState(config.password)
  const [saving, setSaving] = useState(false)

  const handleSaveConfig = async () => {
    if (!url.trim() || !username.trim() || !password.trim()) {
      await Dialog.alert({
        title: "配置错误",
        message: "请填写完整的服务器地址、用户名和密码",
        buttonLabel: "确定"
      })
      return
    }

    const newConfig: TRConfig = { url: url.trim(), username: username.trim(), password: password.trim() }
    
    // 测试连接并获取当前状态
    setSaving(true)
    try {
      const currentState = await getAltSpeedEnabled(newConfig)
      if (currentState !== null) {
        Storage.set(configKey, newConfig)
        setConfig(newConfig)
        // 同步当前状态
        setEnabled(currentState)
        Storage.set(storageKey, currentState)
        ControlWidget.reloadToggles()
        
        await Dialog.alert({
          title: "保存成功",
          message: `配置已保存，当前限速状态：${currentState ? "已开启" : "已关闭"}`,
          buttonLabel: "确定"
        })
      } else {
        await Dialog.alert({
          title: "连接失败",
          message: "无法连接到服务器，请检查配置是否正确",
          buttonLabel: "确定"
        })
      }
    } catch (error) {
      await Dialog.alert({
        title: "保存失败",
        message: "保存配置时发生错误",
        buttonLabel: "确定"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (newValue: boolean) => {
    if (!config.url || !config.username || !config.password) {
      console.error("请先配置地址和账号")
      return
    }

    setSaving(true)
    const success = await setAltSpeedEnabled(config, newValue)
    if (success) {
      setEnabled(newValue)
      Storage.set(storageKey, newValue)
      ControlWidget.reloadToggles()
    } else {
      console.error("设置限速模式失败")
    }
    setSaving(false)
  }

  return <NavigationStack>
    <List
      navigationTitle="Tr限速"
      navigationBarTitleDisplayMode="inline"
      toolbar={{
        topBarLeading: <Button
          title="完成"
          action={dismiss}
        />
      }}
    >
      <Section
        header={<Text>配置</Text>}
        footer={<Text>配置 Transmission 服务器地址和登录信息</Text>}
      >
        <TextField
          title="服务器地址"
          prompt="https://example.com:9091"
          value={url}
          onChanged={setUrl}
        />
        <TextField
          title="用户名"
          prompt="请输入用户名"
          value={username}
          onChanged={setUsername}
        />
        <SecureField
          title="密码"
          prompt="请输入密码"
          value={password}
          onChanged={setPassword}
        />
        <Button
          title={saving ? "保存中..." : "保存配置"}
          disabled={saving}
          action={handleSaveConfig}
        />
      </Section>

      <Section
        header={<Text>限速控制</Text>}
        footer={<Text>切换限速模式。在控制中心添加 Toggle 控制，选择当前脚本即可同步控制。</Text>}
      >
        <Toggle
          title="开启限速"
          value={enabled}
          disabled={saving || !config.url || !config.username || !config.password}
          onChanged={handleToggle}
        />
      </Section>
    </List>
  </NavigationStack>
}

async function run() {
  await Navigation.present({
    element: <View />
  })

  Script.exit()
}

run()

