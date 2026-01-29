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
  Image,
} from "scripting";
import { EdgeOneSettings, SETTINGS_KEY, TimeRange } from "./api";

const defaultSettings: EdgeOneSettings = {
  secretId: "",
  secretKey: "",
  timeRange: "7days",
};

function getVersion(): string {
  try {
    const scriptJsonPath = FileManager.scriptsDirectory + "/EdgeOne/script.json";
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

function SettingsPage() {
  const dismiss = Navigation.useDismiss();
  const initialSettings = Storage.get<EdgeOneSettings>(SETTINGS_KEY) ?? defaultSettings;

  const [secretId, setSecretId] = useState(initialSettings.secretId);
  const [secretKey, setSecretKey] = useState(initialSettings.secretKey);
  const [timeRange, setTimeRange] = useState<TimeRange>(initialSettings.timeRange ?? "7days");

  const handleSave = () => {
    const newSettings: EdgeOneSettings = {
      secretId: secretId.trim(),
      secretKey: secretKey.trim(),
      timeRange: timeRange,
    };

    if (!newSettings.secretId || !newSettings.secretKey) {
      return;
    }

    Storage.set(SETTINGS_KEY, newSettings);
    dismiss();
  };

  return (
    <VStack>
      <Form>
        <Section title="腾讯云 API 密钥">
          <TextField
            title="Secret ID (TENCENTCLOUD_SECRET_ID)"
            value={secretId}
            prompt="请输入 Secret ID"
            onChanged={setSecretId}
          />
          <TextField
            title="Secret Key (TENCENTCLOUD_SECRET_KEY)"
            value={secretKey}
            prompt="请输入 Secret Key"
            onChanged={setSecretKey}
          />
          <Text font="caption" foregroundStyle="secondaryLabel" padding={{ top: 4 }}>
            请在腾讯云控制台「访问管理」-「API 密钥管理」中获取；Secret ID 为 AKID 开头的字符串。
          </Text>
        </Section>

        <Section title="显示范围">
          <Button
            action={() => setTimeRange("today")}
          >
            <HStack alignment="center" spacing={8}>
              <Text font="body">今日</Text>
              <Spacer />
              {timeRange === "today" ? (
                <Image systemName="checkmark" foregroundStyle="accentColor" />
              ) : null}
            </HStack>
          </Button>
          <Button
            action={() => setTimeRange("7days")}
          >
            <HStack alignment="center" spacing={8}>
              <Text font="body">近7天</Text>
              <Spacer />
              {timeRange === "7days" ? (
                <Image systemName="checkmark" foregroundStyle="accentColor" />
              ) : null}
            </HStack>
          </Button>
          <Text font="caption" foregroundStyle="secondaryLabel" padding={{ top: 4 }}>
            小组件展示的数据时间范围
          </Text>
        </Section>

        <Button title="保存设置" action={handleSave} />
      </Form>
      <Spacer />
      <VStack alignment="center" spacing={4} padding={{ bottom: 10 }}>
        <Text font="caption2" foregroundStyle="secondaryLabel">
          Version {VERSION}
        </Text>
      </VStack>
    </VStack>
  );
}

Navigation.present(<SettingsPage />);
