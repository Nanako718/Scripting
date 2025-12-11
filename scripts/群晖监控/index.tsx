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
} from "scripting";
import { SynologySettings } from "./api";

const SETTINGS_KEY = "synologyMonitorSettings";

// 从 script.json 读取版本号
function getVersion(): string {
  try {
    const scriptJsonPath = FileManager.scriptsDirectory + "/群晖监控/script.json";
    if (FileManager.existsSync(scriptJsonPath)) {
      const content = FileManager.readAsStringSync(scriptJsonPath);
      const scriptJson = JSON.parse(content);
      return scriptJson.version || "1.0.0";
    }
  } catch (error) {
    console.error("读取版本号失败:", error);
  }
  return "1.0.0";
}

const VERSION = getVersion();

// 默认设置
const defaultSettings: SynologySettings = {
  serverUrl: "",
  username: "",
  password: "",
  deviceName: "",
};

function SettingsPage() {
  const dismiss = Navigation.useDismiss();
  const initialSettings = Storage.get<SynologySettings>(SETTINGS_KEY) ?? defaultSettings;

  // State for the form fields
  const [serverUrl, setServerUrl] = useState(initialSettings.serverUrl);
  const [username, setUsername] = useState(initialSettings.username);
  const [password, setPassword] = useState(initialSettings.password);
  const [deviceName, setDeviceName] = useState(initialSettings.deviceName ?? "");

  const handleSave = () => {
    const newSettings: SynologySettings = {
      serverUrl: serverUrl.trim(),
      username: username.trim(),
      password: password.trim(),
      deviceName: deviceName.trim() || undefined,
    };

    // 验证必填项
    if (!newSettings.serverUrl || !newSettings.username || !newSettings.password) {
      return;
    }

    Storage.set(SETTINGS_KEY, newSettings);
    dismiss();
  };

  return (
    <VStack>
      <Form>
        <Section title="服务器设置">
          <TextField
            title="服务器地址"
            value={serverUrl}
            prompt="192.168.1.100:5000"
            onChanged={setServerUrl}
          />
          <Text font="caption" foregroundStyle="secondaryLabel" padding={{ top: 4 }}>
            请输入群晖NAS的地址（例如：192.168.1.100:5000 或 https://nas.example.com）
          </Text>
        </Section>

        <Section title="登录凭证">
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
          <Text font="caption" foregroundStyle="secondaryLabel" padding={{ top: 4 }}>
            请输入群晖NAS的登录账号和密码
          </Text>
        </Section>

        <Section title="设备名称（可选）">
          <TextField
            title="设备名称"
            value={deviceName}
            prompt="例如：test"
            onChanged={setDeviceName}
          />
          <Text font="caption" foregroundStyle="secondaryLabel" padding={{ top: 4 }}>
            自定义设备显示名称，留空则使用服务器地址
          </Text>
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
  );
}

Navigation.present(<SettingsPage />);
