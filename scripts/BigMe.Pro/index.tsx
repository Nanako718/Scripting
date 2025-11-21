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
} from "scripting";
import { BigMeSettings } from "./util/api";

const SETTINGS_KEY = "bigMeSettings";

// 默认设置
const defaultSettings: BigMeSettings = {
  email: "",
  password: "",
};

function SettingsPage() {
  const dismiss = Navigation.useDismiss();
  const initialSettings = Storage.get<BigMeSettings>(SETTINGS_KEY) ?? defaultSettings;

  // State for the form fields
  const [email, setEmail] = useState(initialSettings.email);
  const [password, setPassword] = useState(initialSettings.password);

  const handleSave = () => {
    const newSettings: BigMeSettings = {
      email: email.trim(),
      password: password.trim(),
    };
    
    if (!newSettings.email || !newSettings.password) {
      return;
    }
    
    Storage.set(SETTINGS_KEY, newSettings);
    dismiss();
  };

  return (
    <VStack>
      <Form>
        <Section
          title="账号设置"
          footer={
            <Text>
              请输入您的 BigMe.Pro 账号和密码。这些信息将用于获取您的订阅流量信息。
            </Text>
          }
        >
          <TextField
            title="邮箱"
            prompt="请输入邮箱"
            value={email}
            onChanged={setEmail}
          />
          <TextField
            title="密码"
            prompt="请输入密码"
            value={password}
            onChanged={setPassword}
          />
        </Section>

        <Button title="保存设置" action={handleSave} />
      </Form>
      <Spacer />
    </VStack>
  );
}

Navigation.present(<SettingsPage />);

