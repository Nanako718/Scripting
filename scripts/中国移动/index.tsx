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
  Link,
} from "scripting"

// Define the settings structure
type ChinaMobileSettings = {
  boxJsUrl: string
  refreshInterval: number
}

const SETTINGS_KEY = "chinaMobileSettings"
const VERSION = "1.0.0"
const DEFAULT_BOXJS_URL = "http://127.0.0.1:9999"

// Default settings
const defaultSettings: ChinaMobileSettings = {
  boxJsUrl: DEFAULT_BOXJS_URL,
  refreshInterval: 60,
}

function SettingsPage() {
  const dismiss = Navigation.useDismiss()
  const initialSettings = Storage.get<ChinaMobileSettings>(SETTINGS_KEY) ?? defaultSettings

  // State for the form fields
  const [boxJsUrl, setBoxJsUrl] = useState(initialSettings.boxJsUrl)
  const [refreshInterval, setRefreshInterval] = useState(initialSettings.refreshInterval)

  const handleSave = () => {
    const newSettings: ChinaMobileSettings = {
      boxJsUrl,
      refreshInterval,
    }
    Storage.set(SETTINGS_KEY, newSettings)
    dismiss()
  }

  return (
    <VStack>
      <Form>
        <Section title="BoxJS 配置">
          <TextField
            title="BoxJS 地址"
            value={boxJsUrl}
            prompt="例如：http://192.168.1.5:9999"
            onChanged={setBoxJsUrl}
          />
          <Text font="caption2" foregroundStyle="secondaryLabel" padding={{ top: 4 }}>
            请在此处输入您的 BoxJS 访问地址（例如 http://192.168.1.5:9999 或 http://boxjs.com）。数据将从 BoxJS 的 cm_data key 中读取。
          </Text>
        </Section>

        <Section title="刷新设置">
          <TextField
            title="刷新间隔 (分钟)"
            value={String(refreshInterval)}
            onChanged={(text) => {
              const interval = parseInt(text, 10)
              setRefreshInterval(isNaN(interval) ? 0 : interval)
            }}
          />
          <Text font="caption2" foregroundStyle="secondaryLabel" padding={{ top: 4 }}>
            设置小组件自动刷新的频率（分钟）。
          </Text>
        </Section>

        <Button title="保存设置" action={handleSave} />
      </Form>
      <Spacer />
      <VStack alignment="center" spacing={4} padding={{ bottom: 10 }}>
        <HStack alignment="center" spacing={4}>
          <Text font="caption2" foregroundStyle="secondaryLabel">
            ©界面样式修改自
          </Text>
          <Link url="mailto:627908664@qq.com">
            <Text font="caption2" foregroundStyle="accentColor">@王大大</Text>
          </Link>
        </HStack>
        <HStack alignment="center" spacing={4}>
          <Text font="caption2" foregroundStyle="secondaryLabel">
            数据来源：中国移动 BoxJS
          </Text>
        </HStack>
        <HStack alignment="center" spacing={4}>
          <Text font="caption2" foregroundStyle="secondaryLabel">
            优化开发：
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

