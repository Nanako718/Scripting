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
  zoneId: "",
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
  const stored = Storage.get<Record<string, unknown>>(SETTINGS_KEY) ?? {};
  const initialSettings: EdgeOneSettings = {
    secretId: String(stored.secretId ?? stored.accessKeyId ?? defaultSettings.secretId ?? ""),
    secretKey: String(stored.secretKey ?? stored.accessKeySecret ?? defaultSettings.secretKey ?? ""),
    zoneId: String(stored.zoneId ?? stored.siteId ?? defaultSettings.zoneId ?? ""),
    timeRange: stored.timeRange === "today" ? "today" : "7days",
  };

  const [secretId, setSecretId] = useState(String(initialSettings.secretId));
  const [secretKey, setSecretKey] = useState(String(initialSettings.secretKey));
  const [zoneId, setZoneId] = useState(String(initialSettings.zoneId ?? ""));
  const [timeRange, setTimeRange] = useState<TimeRange>(initialSettings.timeRange ?? "7days");

  const handleSave = () => {
    const newSettings: EdgeOneSettings = {
      secretId: secretId.trim(),
      secretKey: secretKey.trim(),
      zoneId: zoneId.trim(),
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
            title="Secret ID"
            value={secretId}
            prompt="请输入 Secret ID"
            onChanged={setSecretId}
          />
          <TextField
            title="Secret Key"
            value={secretKey}
            prompt="请输入 Secret Key"
            onChanged={setSecretKey}
          />
          <TextField
            title="Zone ID（可选）"
            value={zoneId}
            prompt="zone-xxx；多站点用逗号分隔，最多 100 个；留空则传 *"
            onChanged={setZoneId}
          />
          <Text font="caption" foregroundStyle="secondaryLabel" padding={{ top: 4 }}>
            命中率与控制台一致：需 DescribeTimingL7OriginPullData（l7Flow_inFlux_hy）权限；与分析接口同一时间窗。较上一等长时段：与当前选窗等长、紧邻当前开始时刻之前（整体向前平移一个身位），无重叠无间隔。总流量、请求、带宽峰值为较上周期增长率＝(当前−上一)÷上一×100%；缓存命中率较上为当前减上一（语义为百分点差、非增长率），小组件上与另三项相同以 % 展示。ZoneIds 可留空 *；Interval 自动推算。
          </Text>
        </Section>

        <Section title="显示范围">
          <Button action={() => setTimeRange("today")}>
            <HStack alignment="center" spacing={8}>
              <Text font="body">今日</Text>
              <Spacer />
              {timeRange === "today" ? <Image systemName="checkmark" foregroundStyle="accentColor" /> : null}
            </HStack>
          </Button>
          <Button action={() => setTimeRange("7days")}>
            <HStack alignment="center" spacing={8}>
              <Text font="body">近7天</Text>
              <Spacer />
              {timeRange === "7days" ? <Image systemName="checkmark" foregroundStyle="accentColor" /> : null}
            </HStack>
          </Button>
          <Text font="caption" foregroundStyle="secondaryLabel" padding={{ top: 4 }}>
            近7天为当前时刻往前滚动 7 天
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
