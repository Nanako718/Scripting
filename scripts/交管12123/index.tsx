import {
  Navigation,
  Form,
  Section,
  Button,
  useState,
  Text,
  VStack,
  Spacer,
  TextField,
  Toggle,
} from "scripting";
import { Traffic12123Settings } from "./api";

const SETTINGS_KEY = "traffic12123Settings";
const VERSION = "1.0.0";

// 默认设置
const defaultSettings: Traffic12123Settings = {
  token: "",
  enableBoxJs: false,
  boxJsUrl: "",
  vehicleImageUrl: "",
  vehicleImageWidth: 120,
  vehicleImageHeight: 60,
  vehicleImageOffsetY: 30,
};

function SettingsPage() {
  const dismiss = Navigation.useDismiss();
  const initialSettings = Storage.get<Traffic12123Settings>(SETTINGS_KEY) ?? defaultSettings;

  // State for the form fields
  const [token, setToken] = useState(initialSettings.token);
  const [enableBoxJs, setEnableBoxJs] = useState(initialSettings.enableBoxJs ?? false);
  const [boxJsUrl, setBoxJsUrl] = useState(initialSettings.boxJsUrl ?? "");
  const [vehicleImageUrl, setVehicleImageUrl] = useState(initialSettings.vehicleImageUrl ?? "");
  const [vehicleImageWidth, setVehicleImageWidth] = useState(String(initialSettings.vehicleImageWidth ?? 120));
  const [vehicleImageHeight, setVehicleImageHeight] = useState(String(initialSettings.vehicleImageHeight ?? 60));
  const [vehicleImageOffsetY, setVehicleImageOffsetY] = useState(String(initialSettings.vehicleImageOffsetY ?? 30));

  const handleSave = () => {
    const width = parseInt(vehicleImageWidth, 10) || 120;
    const height = parseInt(vehicleImageHeight, 10) || 60;
    const offsetY = parseInt(vehicleImageOffsetY, 10) || 30;
    
    const newSettings: Traffic12123Settings = {
      token: token.trim(),
      enableBoxJs,
      boxJsUrl: boxJsUrl.trim(),
      vehicleImageUrl: vehicleImageUrl.trim(),
      vehicleImageWidth: width,
      vehicleImageHeight: height,
      vehicleImageOffsetY: offsetY,
    };
    
    // 如果启用 BoxJs，至少需要 URL
    if (enableBoxJs && !newSettings.boxJsUrl) {
      return;
    }
    
    // 如果未启用 BoxJs，至少需要 Token
    if (!enableBoxJs && !newSettings.token) {
      return;
    }
    
    Storage.set(SETTINGS_KEY, newSettings);
    dismiss();
  };

  return (
    <VStack>
      <Form>
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

        <Section title="Token 设置">
          <TextField
            title="Token"
            prompt="请输入 Token (params=...)"
            value={token}
            onChanged={setToken}
          />
        </Section>

        <Section title="车辆图片设置">
          <TextField
            title="车辆图片 URL"
            prompt="请输入车辆图片 URL（可选）"
            value={vehicleImageUrl}
            onChanged={setVehicleImageUrl}
          />
          <TextField
            title="图片宽度"
            prompt="请输入图片宽度（默认：120）"
            value={vehicleImageWidth}
            onChanged={setVehicleImageWidth}
          />
          <TextField
            title="图片高度"
            prompt="请输入图片高度（默认：60）"
            value={vehicleImageHeight}
            onChanged={setVehicleImageHeight}
          />
          <TextField
            title="图片上下位置"
            prompt="请输入上下偏移（默认：30，数值越大越靠下）"
            value={vehicleImageOffsetY}
            onChanged={setVehicleImageOffsetY}
          />
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
