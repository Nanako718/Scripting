import {
  Navigation,
  Form,
  Section,
  TextField,
  Button,
  useState,
  Text,
  VStack,
  Spacer,
  HStack,
  Toggle,
} from "scripting"

// Define the settings structure
type MoviePilotPTSettings = {
  serverUrl: string
  username: string
  password: string
  refreshInterval: number
  sortByDanger: boolean
}

const SETTINGS_KEY = "moviePilotPTSettings"
const VERSION = "1.0.0"

// Default settings
const defaultSettings: MoviePilotPTSettings = {
  serverUrl: "",
  username: "",
  password: "",
  refreshInterval: 15,
  sortByDanger: false,
}

function SettingsPage() {
  const dismiss = Navigation.useDismiss()
  const initialSettings = Storage.get<MoviePilotPTSettings>(SETTINGS_KEY) ?? defaultSettings

  // State for the form fields
  const [serverUrl, setServerUrl] = useState(initialSettings.serverUrl)
  const [username, setUsername] = useState(initialSettings.username)
  const [password, setPassword] = useState(initialSettings.password)
  const [refreshInterval, setRefreshInterval] = useState(initialSettings.refreshInterval)
  const [sortByDanger, setSortByDanger] = useState(initialSettings.sortByDanger ?? false)

  const handleSave = () => {
    const newSettings: MoviePilotPTSettings = {
      serverUrl: serverUrl.trim(),
      username: username.trim(),
      password: password.trim(),
      refreshInterval,
      sortByDanger,
    }
    Storage.set(SETTINGS_KEY, newSettings)
    dismiss()
  }

  return (
    <VStack>
      <Form>
        <Section
          title="服务器设置"
          footer={<Text>请输入 MoviePilot 服务器的地址（例如：http://192.168.121.165:4001）</Text>}
        >
          <TextField
            title="服务器地址"
            value={serverUrl}
            prompt="http://192.168.121.165:4001"
            onChanged={setServerUrl}
          />
        </Section>

        <Section
          title="登录凭证"
          footer={<Text>请输入 MoviePilot 的登录账号和密码</Text>}
        >
          <TextField
            title="用户名"
            value={username}
            prompt="请输入用户名"
            onChanged={setUsername}
          />
          <TextField
            title="密码"
            value={password}
            prompt="请输入密码"
            onChanged={setPassword}
          />
        </Section>

        <Section
          title="刷新设置"
          footer={<Text>设置小组件自动刷新的频率（分钟）。</Text>}
        >
          <TextField
            title="刷新间隔 (分钟)"
            value={String(refreshInterval)}
            onChanged={(text) => {
              const interval = parseInt(text, 10)
              setRefreshInterval(isNaN(interval) ? 0 : interval)
            }}
          />
        </Section>

        <Section
          title="显示设置"
          footer={<Text>开启后，站点列表将按危险度排序（分享率越低越靠前）。</Text>}
        >
          <Toggle
            title="危险度排序"
            value={sortByDanger}
            onChanged={setSortByDanger}
          />
        </Section>

        <Button title="保存设置" action={handleSave} />
      </Form>
      <Spacer />
      <VStack alignment="center" spacing={4} padding={{ bottom: 10 }}>
        <HStack alignment="center" spacing={4}>
          <Text font="caption2" foregroundStyle="secondaryLabel">
            开发：
          </Text>
          <Text font="caption2" foregroundStyle="accentColor">@DTZSGHNR</Text>
        </HStack>
        <Text font="caption2" foregroundStyle="secondaryLabel">
          Version {VERSION}
        </Text>
      </VStack>
    </VStack>
  )
}

Navigation.present(<SettingsPage />)
