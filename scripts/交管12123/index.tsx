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
  HStack,
  Link,
  List,
  NavigationLink,
  Image,
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

function GuidePage() {
  const dismiss = Navigation.useDismiss();
  const [selectedTool, setSelectedTool] = useState<"QX" | "Loon">("QX");
  
  // 工具选项
  const tools = ["QX", "Loon"] as const;
  const toolLabels = ["Quantumult X", "Loon"];
  const selectedIndex = tools.indexOf(selectedTool);

  const boxjsRewrite = async () => {
    const url = 'https://github.com/chavyleung/scripts/raw/master/box/rewrite/boxjs.rewrite.quanx.conf';
    const tagName = 'boxjs';
    // 使用 Quantumult X 的 URL scheme 直接安装，格式参考 module.quantumult 实现
    const config = JSON.stringify({
      rewrite_remote: [
        `${url}, tag=${tagName}, update-interval=172800, opt-parser=true, enabled=true`
      ]
    });
    const qxUrl = `quantumult-x:///add-resource?remote-resource=${encodeURIComponent(config)}`;
    // 在 scripting 框架中，直接使用 openURL 打开 URL scheme
    await Safari.openURL(qxUrl);
  };

  const installLoonBoxJs = async () => {
    const url = "loon://import?plugin=https://kelee.one/Tool/Loon/Lpx/BoxJs.lpx";
    await Safari.openURL(url);
  };

  const installQXRewrite = async () => {
    const url = "https://raw.githubusercontent.com/Nanako718/Scripting/main/Quantumult X/12123.sgmodule";
    const tagName = '交管12123';
    // 使用 Quantumult X 的 URL scheme 直接安装，格式参考 module.quantumult 实现
    const config = JSON.stringify({
      rewrite_remote: [
        `${url}, tag=${tagName}, update-interval=172800, opt-parser=true, enabled=true`
      ]
    });
    const qxUrl = `quantumult-x:///add-resource?remote-resource=${encodeURIComponent(config)}`;
    await Safari.openURL(qxUrl);
  };

  const installLoonPlugin = async () => {
    const url = "https://raw.githubusercontent.com/Nanako718/Scripting/main/Loon/12123.plugin";
    // 复制链接到剪贴板
    await Pasteboard.setString(url);
    // 打开 Loon
    await Safari.openURL("loon:///");
    // 显示提示
    await Dialog.alert({
      title: "链接已复制",
      message: "插件链接已复制到剪贴板，请在打开Loon后手动添加",
      buttonLabel: "确定"
    });
  };

  const installBoxJsSubscription = async () => {
    const subscriptionUrl = "https://raw.githubusercontent.com/Nanako718/Scripting/main/BoxJs/DTZSGHNR.json";
    const boxjsUrl = `http://boxjs.com/#/sub/add/${encodeURIComponent(subscriptionUrl)}`;
    await Safari.present(boxjsUrl, false);
  };

function ToolSelectionPage({
  currentTool,
  onToolSelected,
}: {
  currentTool: "QX" | "Loon";
  onToolSelected: (tool: "QX" | "Loon") => void;
}) {
  const dismiss = Navigation.useDismiss();
  const tools: Array<{ label: string; value: "QX" | "Loon" }> = [
    { label: "Quantumult X", value: "QX" },
    { label: "Loon", value: "Loon" },
  ];

  return (
    <List>
      <Section title="选择工具">
        {tools.map((tool) => (
          <Button
            key={tool.value}
            action={() => {
              onToolSelected(tool.value);
              dismiss();
            }}
          >
            <HStack alignment="center" spacing={8}>
              <Text font="body">{tool.label}</Text>
              <Spacer />
              {currentTool === tool.value ? (
                <Image systemName="checkmark" foregroundStyle="accentColor" />
              ) : null}
            </HStack>
          </Button>
        ))}
      </Section>
    </List>
  );
}

  return (
    <VStack>
      <Form>
        <Section title="选择工具">
          <Text font="caption" foregroundStyle="secondaryLabel" padding={{ bottom: 8 }}>
            当前选择：{selectedTool === "QX" ? "Quantumult X" : "Loon"}
          </Text>
          <Button
            title={selectedTool === "QX" ? "✓ Quantumult X" : "Quantumult X"}
            action={() => setSelectedTool("QX")}
          />
          <Button
            title={selectedTool === "Loon" ? "✓ Loon" : "Loon"}
            action={() => setSelectedTool("Loon")}
          />
        </Section>

        <Section title="第一步：安装 BoxJS">
          {selectedTool === "QX" ? (
            <>
              <Text font="body">
                点击下方链接安装 BoxJS 重写规则
              </Text>
              <Link url={(() => {
                const url = 'https://github.com/chavyleung/scripts/raw/master/box/rewrite/boxjs.rewrite.quanx.conf';
                const tagName = 'boxjs';
                const config = `
    {
      "rewrite_remote": [
        "${url}, tag=${tagName}, update-interval=172800, opt-parser=true, enabled=true"
      ]
    }`;
                const encode = encodeURIComponent(config);
                return `quantumult-x:///add-resource?remote-resource=${encode}`;
              })()}>
                <Text font="body">安装 BoxJS (Quantumult X)</Text>
              </Link>
            </>
          ) : (
            <>
              <Text font="body">
                点击下方链接安装 BoxJS 插件
              </Text>
              <Link url="loon://import?plugin=https://kelee.one/Tool/Loon/Lpx/BoxJs.lpx">
                <Text font="body">安装 BoxJS (Loon)</Text>
              </Link>
            </>
          )}
        </Section>

        <Section title="第二步：订阅 BoxJS 配置">
          <Text font="body">
            在 BoxJS 中订阅以下链接：
          </Text>
          <Text font="caption" foregroundStyle="secondaryLabel">
            https://raw.githubusercontent.com/Nanako718/Scripting/main/BoxJs/DTZSGHNR.json
          </Text>
          <Button title="一键订阅" action={installBoxJsSubscription} />
        </Section>

        <Section title={`第三步：安装 ${selectedTool === "QX" ? "重写规则" : "插件"}`}>
          {selectedTool === "QX" ? (
            <>
              <Text font="body">
                点击下方链接安装重写规则：
              </Text>
              <Text font="caption" foregroundStyle="secondaryLabel">
                https://raw.githubusercontent.com/Nanako718/Scripting/main/QuantumultX/12123.sgmodule
              </Text>
              <Link url={(() => {
                const url = "https://raw.githubusercontent.com/Nanako718/Scripting/main/QuantumultX/12123.sgmodule";
                const tagName = '交管12123';
                const config = `
    {
      "rewrite_remote": [
        "${url}, tag=${tagName}, update-interval=172800, opt-parser=true, enabled=true"
      ]
    }`;
                const encode = encodeURIComponent(config);
                return `quantumult-x:///add-resource?remote-resource=${encode}`;
              })()}>
                <Text font="body">安装重写规则</Text>
              </Link>
            </>
          ) : (
            <>
              <Text font="body">
                点击下方按钮安装插件：
              </Text>
              <Text font="caption" foregroundStyle="secondaryLabel">
                https://raw.githubusercontent.com/Nanako718/Scripting/main/Loon/12123.plugin
              </Text>
              <Button title="安装插件" action={installLoonPlugin} />
            </>
          )}
        </Section>

        <Section title="使用说明">
          <Text font="body">
            1. 完成以上步骤后，打开 交管12123 支付宝小程序
          </Text>
          <Text font="body">
            2. 登录后会自动抓取 Token
          </Text>
          <Text font="body">
            3. Token 会自动保存到 BoxJS
          </Text>
          <Text font="body">
            4. 在设置页面启用 BoxJS 并配置地址即可使用
          </Text>
        </Section>

        <Button title="完成" action={dismiss} />
      </Form>
    </VStack>
  );
}

function SettingsPage() {
  const dismiss = Navigation.useDismiss();
  const initialSettings = Storage.get<Traffic12123Settings>(SETTINGS_KEY) ?? defaultSettings;

  const openGuide = () => {
    Navigation.present(<GuidePage />);
  };

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
        <Section title="配置向导">
          <Button title="查看配置向导" action={openGuide} />
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
