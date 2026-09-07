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
  Chart,
  LineChart,
} from "scripting";
import {
  getMonitorData,
  formatNetworkSpeed,
  SynologySettings,
} from "./api";
import type { SynologyMonitorData, ChartMetricKey } from "./api";

const SETTINGS_KEY = "synologyMonitorSettings";
const HISTORY_KEY = "synologyChartHistory";
const MAX_POINTS = 20;

type DataPoint = {
  t: number;
  cpu: number;
  temp: number;
  ram: number;
  tx: number;
  rx: number;
};

function loadHistory(): DataPoint[] {
  return Storage.get<DataPoint[]>(HISTORY_KEY) ?? [];
}

function saveHistory(points: DataPoint[]) {
  Storage.set(HISTORY_KEY, points.slice(-MAX_POINTS));
}

function normalize(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values.map((v) => (v - min) / range);
}

// 曲线图组件
const METRIC_CONFIG: Record<ChartMetricKey, { label: string; color: string; fn: (p: DataPoint) => number }> = {
  cpu:  { label: "CPU",  color: "#8aadf4", fn: (p) => p.cpu },
  temp: { label: "温度", color: "#f5a97f", fn: (p) => p.temp },
  ram:  { label: "RAM",  color: "#c6a0f6", fn: (p) => p.ram },
  tx:   { label: "TX",   color: "#ed8796", fn: (p) => p.tx },
  rx:   { label: "RX",   color: "#a6da95", fn: (p) => p.rx },
};

function ChartView({ history, metrics }: { history: DataPoint[]; metrics: ChartMetricKey[] }) {
  if (history.length < 2) {
    return (
      <HStack frame={{ maxWidth: Infinity, height: 80 }} alignment="center">
        <Text font={11} foregroundStyle={{ light: "#9CA0B0", dark: "#6e738d" }}>
          数据收集中...
        </Text>
      </HStack>
    );
  }

  const activeMetrics = metrics.length > 0 ? metrics : (["cpu", "temp", "ram", "tx", "rx"] as ChartMetricKey[]);
  const dashColor: DynamicShapeStyle = { light: "#FFFFFF", dark: "#FFFFFF" };
  const dashes = "– – – – – – – – – – – – – – – – – – – – – – – – – – – – – – – – – – – – – – – – – – – –";

  return (
    <VStack spacing={4} frame={{ maxWidth: Infinity }}>
      {/* 图例 */}
      <HStack alignment="center" spacing={8} padding={{ leading: 16, trailing: 16 }}>
        {activeMetrics.map((key) => {
          const cfg = METRIC_CONFIG[key];
          return (
            <HStack alignment="center" spacing={3}>
              <Text font={9} foregroundStyle={cfg.color} lineLimit={1}>●</Text>
              <Text font={9} fontWeight="medium" foregroundStyle="#FFFFFF" lineLimit={1}>
                {cfg.label}
              </Text>
            </HStack>
          );
        })}
      </HStack>

      {/* 曲线图 */}
      <ZStack frame={{ maxWidth: Infinity, height: 80 }}>
        {/* 虚线参考线背景 */}
        <VStack spacing={0} frame={{ maxWidth: Infinity, maxHeight: Infinity }} padding={{ leading: 8, trailing: 8, top: 4, bottom: 4 }}>
          <Spacer />
          <Text font={9} foregroundStyle={dashColor} lineLimit={1}>{dashes}</Text>
          <Spacer />
          <Text font={9} foregroundStyle={dashColor} lineLimit={1}>{dashes}</Text>
          <Spacer />
          <Text font={9} foregroundStyle={dashColor} lineLimit={1}>{dashes}</Text>
          <Spacer />
          <Text font={9} foregroundStyle={dashColor} lineLimit={1}>{dashes}</Text>
          <Spacer />
          <Text font={9} foregroundStyle={dashColor} lineLimit={1}>{dashes}</Text>
          <Spacer />
        </VStack>

        {/* 曲线 */}
        {activeMetrics.map((key) => {
          const cfg = METRIC_CONFIG[key];
          const values = normalize(history.map(cfg.fn));
          return (
            <Chart
              chartXAxis="hidden"
              chartYAxis="hidden"
              frame={{ maxWidth: Infinity, height: 80 }}
              padding={{ top: 4, bottom: 4, leading: 8, trailing: 8 }}
              background="clear"
            >
              <LineChart
                marks={values.map((v, i) => ({
                  label: String(i),
                  value: v,
                  foregroundStyle: cfg.color,
                }))}
              />
            </Chart>
          );
        })}
      </ZStack>
    </VStack>
  );
}

// MetricItem
function MetricItem({
  icon,
  label,
  value,
  iconColor,
  textColor,
  width,
}: {
  icon: string;
  label: string;
  value: string;
  iconColor: DynamicShapeStyle;
  textColor: DynamicShapeStyle;
  width: number;
}) {
  return (
    <HStack alignment="center" spacing={0} frame={{ width, alignment: "leading" }}>
      <Image systemName={icon} font={12} foregroundStyle={iconColor} frame={{ width: 18, alignment: "center" }} />
      <Text font={11} fontWeight="semibold" foregroundStyle={textColor} lineLimit={1} frame={{ width: 34, alignment: "leading" }}>
        {label}
      </Text>
      <Text font={11} fontWeight="medium" foregroundStyle={textColor} lineLimit={1}>
        {value}
      </Text>
    </HStack>
  );
}

// 主组件视图
function WidgetView({
  data,
  history,
  metrics,
}: {
  data: SynologyMonitorData;
  history: DataPoint[];
  metrics: ChartMetricKey[];
}) {
  const textColor: DynamicShapeStyle = {
    light: "#FFFFFF",
    dark: "#FFFFFF",
  };

  const cpuColor: DynamicShapeStyle = {
    light: "#1E66F5",
    dark: "#8aadf4",
  };

  const memColor: DynamicShapeStyle = {
    light: "#8839EF",
    dark: "#c6a0f6",
  };

  const tempColor: DynamicShapeStyle = {
    light: "#FE640B",
    dark: "#f5a97f",
  };

  const fanColor: DynamicShapeStyle = {
    light: "#179299",
    dark: "#7dc4e4",
  };

  const rxColor: DynamicShapeStyle = {
    light: "#40A02B",
    dark: "#a6da95",
  };

  const txColor: DynamicShapeStyle = {
    light: "#D20F39",
    dark: "#ed8796",
  };

  const rxSpeed = formatNetworkSpeed(data.network.rx);
  const txSpeed = formatNetworkSpeed(data.network.tx);
  const tempValue = data.temperature.system !== null ? `${data.temperature.system}°C` : "--";

  return (
    <ZStack frame={{ maxWidth: Infinity, maxHeight: Infinity }}>
      <VStack
        padding={{ top: 8, leading: 0, bottom: 10, trailing: 0 }}
        spacing={0}
        frame={{ maxWidth: Infinity, maxHeight: Infinity }}
      >
        {/* 曲线图 */}
        <ChartView history={history} metrics={metrics} />

        {/* 监控数据 */}
        <VStack
          alignment="leading"
          padding={{ top: 10, leading: 16, bottom: 0, trailing: 16 }}
          spacing={6}
        >
          <HStack alignment="center" spacing={0}>
            <MetricItem icon="cpu" label="CPU:" value={`${Math.round(data.cpu)}%`} iconColor={cpuColor} textColor={textColor} width={85} />
            <MetricItem icon="thermometer.medium" label="温度:" value={tempValue} iconColor={tempColor} textColor={textColor} width={100} />
            <MetricItem icon="arrow.up.circle.fill" label="TX:" value={txSpeed} iconColor={txColor} textColor={textColor} width={110} />
          </HStack>
          <HStack alignment="center" spacing={0}>
            <MetricItem icon="memorychip" label="RAM:" value={`${Math.round(data.memory)}%`} iconColor={memColor} textColor={textColor} width={85} />
            <MetricItem icon="internaldrive" label="存储:" value={`${Math.round(data.disk)}%`} iconColor={fanColor} textColor={textColor} width={100} />
            <MetricItem icon="arrow.down.circle.fill" label="RX:" value={rxSpeed} iconColor={rxColor} textColor={textColor} width={110} />
          </HStack>
        </VStack>
      </VStack>
    </ZStack>
  );
}

// 渲染函数
async function render() {
  const settings = Storage.get<SynologySettings>(SETTINGS_KEY);

  const reloadPolicy: WidgetReloadPolicy = {
    policy: "after",
    date: new Date(Date.now() + 5 * 60 * 1000),
  };

  if (Widget.family !== "systemMedium") {
    Widget.present(
      <VStack padding spacing={8} alignment="center">
        <Text font="headline" foregroundStyle="systemRed">不支持的组件尺寸</Text>
        <Text font="body" foregroundStyle="secondaryLabel">请使用中型组件</Text>
      </VStack>,
      reloadPolicy
    );
    return;
  }

  if (!settings || !settings.serverUrl || !settings.username || !settings.password) {
    Widget.present(
      <VStack padding spacing={8} alignment="center">
        <Text font="headline" foregroundStyle="systemRed">未配置</Text>
        <Text font="body" foregroundStyle="secondaryLabel">请先在主应用中设置服务器地址、用户名和密码</Text>
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
          <Text font="body" foregroundStyle="secondaryLabel">无法连接到群晖NAS，请检查：</Text>
          <Text font="caption" foregroundStyle="secondaryLabel">• 服务器地址是否正确</Text>
          <Text font="caption" foregroundStyle="secondaryLabel">• 账号密码是否正确</Text>
          <Text font="caption" foregroundStyle="secondaryLabel">• 网络连接是否正常</Text>
        </VStack>,
        reloadPolicy
      );
      return;
    }

    // 缓存数据点
    const history = loadHistory();
    history.push({
      t: Date.now(),
      cpu: Math.round(data.cpu),
      temp: data.temperature.system ?? 0,
      ram: Math.round(data.memory),
      tx: data.network.tx,
      rx: data.network.rx,
    });
    saveHistory(history);

    const metrics = settings.chartMetrics ?? ["cpu", "temp", "ram", "tx", "rx"];

    Widget.present(
      <WidgetView data={data} history={history} metrics={metrics} />,
      reloadPolicy
    );
  } catch (error) {
    console.error("渲染出错:", error);
    Widget.present(
      <VStack padding spacing={8} alignment="center">
        <Text font="headline" foregroundStyle="systemRed">发生错误</Text>
        <Text font="body" foregroundStyle="secondaryLabel">{String(error)}</Text>
      </VStack>,
      reloadPolicy
    );
  }
}

render();
