import {
  Navigation,
  Form,
  Section,
  TextField,
  ColorPicker,
  Button,
  Color,
  useState,
  Text,
  VStack,
  Spacer,
  HStack,
  Link,
  Toggle
} from "scripting"

// Define the settings structure
type ChinaRadioSettings = {
  access: string
  data: string
  cookie: string
  titleDayColor: Color
  titleNightColor: Color
  descDayColor: Color
  descNightColor: Color
  refreshTimeDayColor: Color
  refreshTimeNightColor: Color
  refreshInterval: number
  enableBoxJs: boolean
  boxJsUrl: string
}

const SETTINGS_KEY = "chinaRadioSettings"
const VERSION = "1.0.0"

// Default settings - 适配暗色模式的简洁配色
const defaultSettings: ChinaRadioSettings = {
  access: "",
  data: "",
  cookie: "",
  // 标题颜色：浅色模式用深灰，暗色模式用浅灰
  titleDayColor: "#666666",
  titleNightColor: "#CCCCCC",
  // 内容颜色：浅色模式用黑色，暗色模式用白色
  descDayColor: "#000000",
  descNightColor: "#FFFFFF",
  // 刷新时间颜色：浅色模式用中灰，暗色模式用浅灰
  refreshTimeDayColor: "#999999",
  refreshTimeNightColor: "#AAAAAA",
  refreshInterval: 15,
  // BoxJs 配置
  enableBoxJs: false,
  boxJsUrl: "",
}

function SettingsPage() {
  const dismiss = Navigation.useDismiss()
  const initialSettings = Storage.get<ChinaRadioSettings>(SETTINGS_KEY) ?? defaultSettings

  // State for the form fields
  const [access, setAccess] = useState(initialSettings.access)
  const [data, setData] = useState(initialSettings.data)
  const [cookie, setCookie] = useState(initialSettings.cookie)
  const [titleDayColor, setTitleDayColor] = useState(initialSettings.titleDayColor)
  const [titleNightColor, setTitleNightColor] = useState(initialSettings.titleNightColor)
  const [descDayColor, setDescDayColor] = useState(initialSettings.descDayColor)
  const [descNightColor, setDescNightColor] = useState(initialSettings.descNightColor)
  const [refreshTimeDayColor, setRefreshTimeDayColor] = useState(initialSettings.refreshTimeDayColor)
  const [refreshTimeNightColor, setRefreshTimeNightColor] = useState(initialSettings.refreshTimeNightColor)
  const [refreshInterval, setRefreshInterval] = useState(initialSettings.refreshInterval)
  const [enableBoxJs, setEnableBoxJs] = useState(initialSettings.enableBoxJs ?? false)
  const [boxJsUrl, setBoxJsUrl] = useState(initialSettings.boxJsUrl ?? "")

  const handleSave = () => {
    const newSettings: ChinaRadioSettings = {
      access,
      data,
      cookie,
      titleDayColor,
      titleNightColor,
      descDayColor,
      descNightColor,
      refreshTimeDayColor,
      refreshTimeNightColor,
      refreshInterval,
      enableBoxJs,
      boxJsUrl,
    }
    Storage.set(SETTINGS_KEY, newSettings)
    dismiss()
  }

  return (
    <VStack>
      <Form>
        <Section title="登录凭证">
          <TextField
            title="Access"
            value={access}
            prompt="在此处粘贴 access"
            onChanged={setAccess}
          />
          <TextField
            title="Data"
            value={data}
            prompt="在此处粘贴 data"
            onChanged={setData}
          />
          <TextField
            title="Cookie"
            value={cookie}
            prompt="在此处粘贴 Cookie"
            onChanged={setCookie}
          />
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
        </Section>

        <Section title="BoxJs 配置">
          <Toggle
            title="启用 BoxJs"
            value={enableBoxJs}
            onChanged={setEnableBoxJs}
          />
          {enableBoxJs ? (
            <TextField
              title="BoxJs 地址"
              value={boxJsUrl}
              prompt="请输入 BoxJs 地址，例如：http://boxjs.com"
              onChanged={setBoxJsUrl}
            />
          ) : null}
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

