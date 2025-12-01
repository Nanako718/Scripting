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
  SecureField,
} from "scripting";

// 定义设置结构
type ChinaTelecomSettings = {
  apiUrl: string;
  mobile: string;
  password: string;
};

const SETTINGS_KEY = "chinaTelecomSettings";
const VERSION = "1.0.0";

// 默认设置
const defaultSettings: ChinaTelecomSettings = {
  apiUrl: "http://192.168.121.165:10000",
  mobile: "",
  password: "",
};

function SettingsPage() {
  const dismiss = Navigation.useDismiss();
  const initialSettings = Storage.get<ChinaTelecomSettings>(SETTINGS_KEY) ?? defaultSettings;

  // State for the form fields
  const [apiUrl, setApiUrl] = useState(initialSettings.apiUrl || defaultSettings.apiUrl);
  const [mobile, setMobile] = useState(initialSettings.mobile);
  const [password, setPassword] = useState(initialSettings.password);

  const handleSave = () => {
    const newSettings: ChinaTelecomSettings = {
      apiUrl: apiUrl.trim(),
      mobile: mobile.trim(),
      password: password.trim(),
    };
    
    // 保存设置
    Storage.set(SETTINGS_KEY, newSettings);
    // 同时保存到共享存储，以便 api.ts 可以访问
    Storage.set("mobile", newSettings.mobile, { shared: true });
    Storage.set("password", newSettings.password, { shared: true });
    
    dismiss();
  };

  return (
    <VStack>
      <Form>
        <Section title="接口设置">
          <TextField
            title="接口地址"
            prompt="请输入基础 URL，例如：http://192.168.121.165:10000"
            value={apiUrl}
            onChanged={setApiUrl}
          />
          <Text font="caption2" foregroundStyle="secondaryLabel" padding={{ top: 4 }}>
            系统会自动在 URL 后添加 /summary 路径
          </Text>
        </Section>

        <Section title="账号设置">
          <TextField
            title="手机号"
            prompt="请输入11位手机号"
            value={mobile}
            onChanged={setMobile}
          />
          <SecureField
            title="密码"
            prompt="请输入密码"
            value={password}
            onChanged={setPassword}
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

