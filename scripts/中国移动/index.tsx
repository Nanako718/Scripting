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
  refreshInterval: number
}

const SETTINGS_KEY = "chinaMobileSettings"
const VERSION = "1.0.0"
const REWRITE_RULE_URL = "https://raw.githubusercontent.com/Nanako718/Scripting/refs/heads/main/Quantumult%20X/scripting.sgmodule"

// Default settings
const defaultSettings: ChinaMobileSettings = {
  refreshInterval: 60,
}

function SettingsPage() {
  const dismiss = Navigation.useDismiss()
  const initialSettings = Storage.get<ChinaMobileSettings>(SETTINGS_KEY) ?? defaultSettings

  // State for the form fields
  const [refreshInterval, setRefreshInterval] = useState(initialSettings.refreshInterval)

  const handleSave = () => {
    const newSettings: ChinaMobileSettings = {
      refreshInterval,
    }
    Storage.set(SETTINGS_KEY, newSettings)
    dismiss()
  }

  // Quantumult X URL Scheme - 直接添加重写规则
  // 使用 Quantumult X 的 URL Scheme 来添加远程资源
  const qxRewriteUrl = `quantumult-x:///update-configuration?remote-resource=${encodeURIComponent(REWRITE_RULE_URL)}`
  
  // 复制重写规则 URL 到剪贴板并打开 Quantumult X
  const handleInstallRewrite = async () => {
    // 先复制到剪贴板（备用方案）
    await Pasteboard.setString(REWRITE_RULE_URL)
    
    // 打开 Quantumult X 并尝试添加重写规则
    await Safari.openURL(qxRewriteUrl)
  }

  return (
    <VStack>
      <Form>
        <Section title="重写规则安装">
          <Text font="body" padding={{ bottom: 8 }}>
            本脚本需要通过 Quantumult X 重写规则来获取数据。点击下方按钮直接安装：
          </Text>
          <Button 
            title="📥 点击安装重写规则" 
            action={handleInstallRewrite}
          />
          <Text font="caption2" foregroundStyle="secondaryLabel" padding={{ top: 8 }}>
            • 点击按钮将自动复制重写规则地址并打开 Quantumult X{'\n'}
            • 如果未自动添加，请在 Quantumult X 中手动添加：设置 → 重写 → + → 从 URL 添加{'\n'}
            • 重写规则地址已复制到剪贴板，可直接粘贴{'\n'}
            • 确保已启用 MitM 并安装证书
          </Text>
          <Text 
            font="caption" 
            foregroundStyle="secondaryLabel" 
            padding={{ top: 8 }}
          >
            重写规则地址：{REWRITE_RULE_URL}
          </Text>
        </Section>

        <Button title="保存设置" action={handleSave} />
      </Form>
      <Spacer />
      <VStack alignment="center" spacing={4} padding={{ bottom: 10 }}>
        <HStack alignment="center" spacing={4}>
          <Text font="caption2" foregroundStyle="secondaryLabel">
            数据来源：Quantumult X 重写规则
          </Text>
        </HStack>
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

