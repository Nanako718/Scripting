import { Button, ControlWidget, List, Navigation, NavigationStack, Script, Section, Text, TextField, SecureField, Toggle, VStack, useState } from "scripting"
import { storageKey, configKey, QBConfig } from "./app_intents"

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

const getSpeedLimitMode = async (config: QBConfig): Promise<boolean | null> => {
  try {
    const sid = await loginQB(config)
    if (!sid) return null

    const response = await fetch(`${config.url}/api/v2/transfer/info`, {
      method: 'GET',
      headers: { 'Cookie': `SID=${sid}` },
    })

    if (!response.ok) return null

    const data = await response.json() as { speed_limits_mode?: number }
    // speed_limits_mode: 0 = disabled, 1 = enabled
    return data.speed_limits_mode === 1
  } catch {
    return null
  }
}

const setSpeedLimitMode = async (config: QBConfig, enabled: boolean): Promise<boolean> => {
  try {
    const sid = await loginQB(config)
    if (!sid) return false

    const mode = enabled ? 1 : 0
    const speedLimitResponse = await fetch(`${config.url}/api/v2/transfer/setSpeedLimitsMode`, {
      method: 'POST',
      headers: { 'Cookie': `SID=${sid}` },
      body: `mode=${mode}`,
    })

    return speedLimitResponse.ok
  } catch {
    return false
  }
}

function View() {
  const dismiss = Navigation.useDismiss()
  const [enabled, setEnabled] = useState(() => Storage.get<boolean>(storageKey) ?? false)
  const [config, setConfig] = useState<QBConfig>(() => Storage.get<QBConfig>(configKey) ?? { url: "", username: "", password: "" })
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

    const newConfig: QBConfig = { url: url.trim(), username: username.trim(), password: password.trim() }
    
    // 测试连接并获取当前状态
    setSaving(true)
    try {
      const currentState = await getSpeedLimitMode(newConfig)
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
    const success = await setSpeedLimitMode(config, newValue)
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
      navigationTitle="qB限速"
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
        footer={<Text>配置 qBittorrent 服务器地址和登录信息</Text>}
      >
        <TextField
          title="服务器地址"
          prompt="https://example.com:8080"
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

