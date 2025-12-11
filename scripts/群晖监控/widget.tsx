import {
  Widget,
  VStack,
  HStack,
  Text,
  Spacer,
  DynamicShapeStyle,
  WidgetReloadPolicy,
  ZStack,
  Image,
  Gauge,
} from "scripting";
import {
  getMonitorData,
  formatNetworkSpeed,
  SynologySettings,
  normalizeServerUrl,
} from "./api";

const SETTINGS_KEY = "synologyMonitorSettings";

// 监控数据类型
type MonitorData = {
  cpu: number;
  memory: number;
  disk: number;
  network: { rx: number; tx: number };
  ping: number;
  online: boolean;
};

// 圆形进度条组件
function CircularProgress({
  value,
  label,
  icon,
  color,
  labelColor,
}: {
  value: number;
  label: string;
  icon: string;
  color: DynamicShapeStyle;
  labelColor: DynamicShapeStyle;
}) {
  const percentage = Math.min(100, Math.max(0, value));
  const normalizedValue = percentage / 100;

  return (
    <VStack alignment="center" spacing={8}>
      <Gauge
        value={normalizedValue}
        min={0}
        max={1}
        label={<Text font={9} fontWeight="medium" foregroundStyle={labelColor}>{label}</Text>}
        currentValueLabel={
          <VStack alignment="center" spacing={3}>
            <Image
              systemName={icon}
              font={16}
              foregroundStyle={color}
            />
            <Text
              font={12}
              fontWeight="bold"
              foregroundStyle={color}
            >
              {Math.round(percentage)}%
            </Text>
          </VStack>
        }
        gaugeStyle="accessoryCircular"
        tint={color}
      />
    </VStack>
  );
}

// 主组件视图
function WidgetView({
  data,
  deviceName,
}: {
  data: MonitorData;
  deviceName: string;
}) {
  // Catppuccin Macchiato 配色方案
  const bgColor: DynamicShapeStyle = {
    light: "#EFF1F5", // Latte Base (亮色模式使用Latte)
    dark: "#24273a",  // Macchiato Base
  };

  const surfaceColor: DynamicShapeStyle = {
    light: "#DCE0E8", // Latte Surface0
    dark: "#363a4f",  // Macchiato Surface0
  };

  const textColor: DynamicShapeStyle = {
    light: "#4C4F69", // Latte Text
    dark: "#cad3f5",  // Macchiato Text
  };

  const secondaryTextColor: DynamicShapeStyle = {
    light: "#6E738D", // Latte Subtext0
    dark: "#a5adce",  // Macchiato Subtext0
  };

  const mutedTextColor: DynamicShapeStyle = {
    light: "#9CA0B0", // Latte Overlay0
    dark: "#6e738d",  // Macchiato Overlay0
  };

  const onlineColor: DynamicShapeStyle = {
    light: "#40A02B", // Latte Green
    dark: "#a6da95",  // Macchiato Green
  };

  const offlineColor: DynamicShapeStyle = {
    light: "#D20F39", // Latte Red
    dark: "#ed8796",  // Macchiato Red
  };

  const cpuColor: DynamicShapeStyle = {
    light: "#1E66F5", // Latte Blue
    dark: "#8aadf4",  // Macchiato Blue
  };

  const memoryColor: DynamicShapeStyle = {
    light: "#8839EF", // Latte Mauve
    dark: "#c6a0f6",  // Macchiato Mauve
  };

  const diskColor: DynamicShapeStyle = {
    light: "#FE640B", // Latte Peach
    dark: "#f5a97f",  // Macchiato Peach
  };

  const networkColor: DynamicShapeStyle = {
    light: "#179299", // Latte Sapphire
    dark: "#7dc4e4",  // Macchiato Sapphire
  };

  const currentTime = new Date();
  const timeString = currentTime.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <ZStack
      frame={{ maxWidth: Infinity, maxHeight: Infinity }}
      widgetBackground={{
        style: bgColor,
        shape: {
          type: "rect",
          cornerRadius: 24,
          style: "continuous",
        },
      }}
    >
      <VStack
        padding={{ top: 16, leading: 16, bottom: 16, trailing: 16 }}
        spacing={0}
      >
        {/* 头部：设备名称和在线状态 */}
        <HStack alignment="center" spacing={0} padding={{ bottom: 16 }}>
          <HStack alignment="center" spacing={8}>
            <ZStack
              frame={{ width: 12, height: 12 }}
              widgetBackground={{
                style: data.online ? onlineColor : offlineColor,
                shape: {
                  type: "rect",
                  cornerRadius: 6,
                  style: "continuous",
                },
              }}
            />
            <Text
              font={17}
              fontWeight="bold"
              foregroundStyle={textColor}
              lineLimit={1}
            >
              {deviceName || "群晖"}
            </Text>
          </HStack>
          <Spacer />
          {data.online ? (
            <HStack
              alignment="center"
              spacing={6}
              padding={{ top: 4, leading: 8, bottom: 4, trailing: 8 }}
              widgetBackground={{
                style: surfaceColor,
                shape: {
                  type: "rect",
                  cornerRadius: 8,
                  style: "continuous",
                },
              }}
            >
              <Text
                font={11}
                fontWeight="semibold"
                foregroundStyle={onlineColor}
                lineLimit={1}
              >
                Online
              </Text>
              <Text
                font={11}
                fontWeight="medium"
                foregroundStyle={mutedTextColor}
                lineLimit={1}
              >
                {data.ping}ms
              </Text>
            </HStack>
          ) : (
            <HStack
              alignment="center"
              spacing={6}
              padding={{ top: 4, leading: 8, bottom: 4, trailing: 8 }}
              widgetBackground={{
                style: surfaceColor,
                shape: {
                  type: "rect",
                  cornerRadius: 8,
                  style: "continuous",
                },
              }}
            >
              <Text
                font={11}
                fontWeight="semibold"
                foregroundStyle={offlineColor}
                lineLimit={1}
              >
                Offline
              </Text>
            </HStack>
          )}
        </HStack>

        {/* 中间：CPU、内存、磁盘使用率 */}
        <HStack
          alignment="center"
          spacing={0}
          padding={{ bottom: 16 }}
          frame={{ minWidth: 0, maxWidth: Infinity }}
        >
          <Spacer />
          <CircularProgress
            value={data.cpu}
            label="CPU"
            icon="cpu"
            color={cpuColor}
            labelColor={secondaryTextColor}
          />
          <Spacer minLength={12} />
          <CircularProgress
            value={data.memory}
            label="MEM"
            icon="memorychip"
            color={memoryColor}
            labelColor={secondaryTextColor}
          />
          <Spacer minLength={12} />
          <CircularProgress
            value={data.disk}
            label="DISK"
            icon="externaldrive"
            color={diskColor}
            labelColor={secondaryTextColor}
          />
          <Spacer />
        </HStack>

        {/* 底部：网络流量和更新时间 */}
        <HStack
          alignment="center"
          spacing={0}
          padding={{ top: 12, leading: 12, bottom: 8, trailing: 12 }}
          widgetBackground={{
            style: surfaceColor,
            shape: {
              type: "rect",
              cornerRadius: 12,
              style: "continuous",
            },
          }}
        >
          <HStack alignment="center" spacing={6}>
            <Image
              systemName="arrow.up.circle.fill"
              font={10}
              foregroundStyle={networkColor}
            />
            <Text
              font={10}
              fontWeight="medium"
              foregroundStyle={textColor}
              lineLimit={1}
            >
              {formatNetworkSpeed(data.network.tx)}
            </Text>
            <Image
              systemName="arrow.down.circle.fill"
              font={10}
              foregroundStyle={networkColor}
            />
            <Text
              font={10}
              fontWeight="medium"
              foregroundStyle={textColor}
              lineLimit={1}
            >
              {formatNetworkSpeed(data.network.rx)}
            </Text>
          </HStack>
          <Spacer />
          <HStack alignment="center" spacing={4}>
            <Image
              systemName="clock.fill"
              font={9}
              foregroundStyle={mutedTextColor}
            />
            <Text
              font={10}
              fontWeight="medium"
              foregroundStyle={mutedTextColor}
              lineLimit={1}
            >
              {timeString}
            </Text>
          </HStack>
        </HStack>
      </VStack>
    </ZStack>
  );
}

// 渲染函数
async function render() {
  const settings = Storage.get<SynologySettings>(SETTINGS_KEY);

  const reloadPolicy: WidgetReloadPolicy = {
    policy: "after",
    date: new Date(Date.now() + 5 * 60 * 1000), // 5分钟后刷新
  };

  // 检查组件尺寸
  if (Widget.family !== "systemMedium") {
    Widget.present(
      <VStack padding spacing={8} alignment="center">
        <Text font="headline" foregroundStyle="systemRed">不支持的组件尺寸</Text>
        <Text font="body" foregroundStyle="secondaryLabel">
          请使用中型组件
        </Text>
      </VStack>,
      reloadPolicy
    );
    return;
  }

  // 检查配置
  if (!settings || !settings.serverUrl || !settings.username || !settings.password) {
    Widget.present(
      <VStack padding spacing={8} alignment="center">
        <Text font="headline" foregroundStyle="systemRed">未配置</Text>
        <Text font="body" foregroundStyle="secondaryLabel">
          请先在主应用中设置服务器地址、用户名和密码
        </Text>
      </VStack>,
      reloadPolicy
    );
    return;
  }

  try {
    const data = await getMonitorData(settings);

    if (!data || !data.online) {
      Widget.present(
        <VStack padding spacing={8} alignment="center">
          <Text font="headline" foregroundStyle="systemRed">连接失败</Text>
          <Text font="body" foregroundStyle="secondaryLabel">
            无法连接到群晖NAS，请检查：
          </Text>
          <Text font="caption" foregroundStyle="secondaryLabel">
            • 服务器地址是否正确
          </Text>
          <Text font="caption" foregroundStyle="secondaryLabel">
            • 账号密码是否正确
          </Text>
          <Text font="caption" foregroundStyle="secondaryLabel">
            • 网络连接是否正常
          </Text>
        </VStack>,
        reloadPolicy
      );
      return;
    }

    const deviceName = settings.deviceName || normalizeServerUrl(settings.serverUrl).replace(/^https?:\/\//, "").split(":")[0];

    Widget.present(
      <WidgetView data={data} deviceName={deviceName} />,
      reloadPolicy
    );
  } catch (error) {
    console.error("渲染出错:", error);
    Widget.present(
      <VStack padding spacing={8} alignment="center">
        <Text font="headline" foregroundStyle="systemRed">发生错误</Text>
        <Text font="body" foregroundStyle="secondaryLabel">
          {String(error)}
        </Text>
      </VStack>,
      reloadPolicy
    );
  }
}

render();
