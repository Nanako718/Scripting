import {
  Widget,
  VStack,
  HStack,
  Text,
  Spacer,
  WidgetReloadPolicy,
  ZStack,
  Image,
} from "scripting";
import {
  fetchMetricsWithTrend,
  EdgeOneSettings,
  SETTINGS_KEY,
  EdgeOneMetrics,
} from "./api";

// Apple 系统级配色
const theme = {
  bg: { light: "#F2F2F7", dark: "#000000" } as any,   // 系统背景色
  card: { light: "#FFFFFF", dark: "#1C1C1E" } as any, // 系统二级容器色
  text: { light: "#000000", dark: "#FFFFFF" } as any, // 纯黑/纯白核心文字
  secondary: { light: "#8E8E93", dark: "#8E8E93" } as any, // 系统灰色
  blue: { light: "#007AFF", dark: "#0A84FF" } as any,
  mauve: { light: "#AF52DE", dark: "#BF5AF2" } as any,
  red: { light: "#FF3B30", dark: "#FF453A" } as any,
  green: { light: "#34C759", dark: "#32D74B" } as any,
  yellow: { light: "#FF9500", dark: "#FF9F0A" } as any,
};

/** 流量格式化：与控制台一致使用 SI 单位 1MB=10^6 B */
function splitBytes(bytes: number): { val: string; unit: string } {
  if (bytes < 1e3) return { val: bytes.toString(), unit: "B" };
  if (bytes < 1e6) return { val: (bytes / 1e3).toFixed(1), unit: "KB" };
  if (bytes < 1e9) return { val: (bytes / 1e6).toFixed(2), unit: "MB" };
  return { val: (bytes / 1e9).toFixed(2), unit: "GB" };
}

function splitRequest(n: number): { val: string; unit: string } {
  if (n >= 10000) return { val: (n / 10000).toFixed(2), unit: "万次" };
  return { val: Math.round(n).toString(), unit: "次" };
}

function splitBandwidth(n: number): { val: string; unit: string } {
  if (n >= 1e6) return { val: (n / 1e6).toFixed(2), unit: "Mbps" };
  if (n >= 1e3) return { val: (n / 1e3).toFixed(1), unit: "Kbps" };
  return { val: Math.round(n).toString(), unit: "bps" };
}

function calculateChange(current: number, previous: number): { percent: string; isIncrease: boolean } | null {
  if (previous <= 0) return null;
  const diff = current - previous;
  const percent = (Math.abs(diff) / previous * 100).toFixed(1);
  return { percent, isIncrease: diff >= 0 };
}

function WidgetView({
  data,
  timeRangeLabel,
}: {
  data: { current: EdgeOneMetrics; previous: EdgeOneMetrics };
  timeRangeLabel: string;
}) {
  const { current, previous } = data;
  const timeString = new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  // 缓存命中率：按 命中流量/总流量；控制台若按「命中请求数/总请求数」会不同
  const hitRate = current.flux > 0 ? (current.hitFlux / current.flux * 100).toFixed(1) : "0.0";

  return (
    <ZStack
      frame={{ maxWidth: Infinity, maxHeight: Infinity }}
      widgetBackground={{
        style: theme.bg,
        shape: { type: "rect", cornerRadius: 24, style: "continuous" } as any,
      }}
    >
      <VStack padding={{ top: 18, leading: 16, bottom: 18, trailing: 16 }} spacing={0}>
        {/* 标题行 */}
        <HStack alignment="center" padding={{ bottom: 10 }} spacing={4}>
          <Text font={14} fontWeight="bold" foregroundStyle={theme.blue}>Tencent</Text>
          <Text font={10} fontWeight="bold" foregroundStyle={"#8E8E93" as any}>EdgeOne</Text>
          <Spacer />
          <Text font={10} fontWeight="medium" foregroundStyle={theme.secondary}>{timeRangeLabel} · {timeString}</Text>
        </HStack>

        {/* 2x2 矩阵 */}
        <VStack spacing={6}>
          <HStack spacing={6}>
            <MetricCard
              icon="arrow.up.arrow.down.circle.fill"
              label="访问流量"
              parts={splitBytes(current.flux)}
              trend={calculateChange(current.flux, previous.flux)}
              color={theme.blue}
            />
            <MetricCard
              icon="bolt.horizontal.circle.fill"
              label="访问带宽"
              parts={splitBandwidth(current.bandwidth)}
              trend={calculateChange(current.bandwidth, previous.bandwidth)}
              color={theme.mauve}
            />
          </HStack>
          <HStack spacing={6}>
            <MetricCard
              icon="cursorarrow.click.2"
              label="请求总数"
              parts={splitRequest(current.request)}
              trend={calculateChange(current.request, previous.request)}
              color={theme.yellow}
            />
            <MetricCard
              icon="checkmark.shield.fill"
              label="缓存命中"
              parts={{ val: hitRate, unit: "%" }}
              trend={null}
              color={theme.green}
            />
          </HStack>
        </VStack>
      </VStack>
    </ZStack>
  );
}

function MetricCard({ 
  icon, label, parts, trend, color 
}: { 
  icon: string, label: string, parts: { val: string, unit: string }, trend: any, color: any 
}) {
  return (
    <VStack
      alignment="leading"
      spacing={6}
      padding={10}
      frame={{ minWidth: 0, maxWidth: Infinity }}
      widgetBackground={{
        style: theme.card,
        shape: { type: "rect", cornerRadius: 14, style: "continuous" } as any,
      }}
    >
      {/* 顶部行：图标 + 标签 + 趋势 */}
      <HStack alignment="center" spacing={4}>
        <Image systemName={icon} font={10} foregroundStyle={color} />
        <Text font={9} fontWeight="bold" foregroundStyle={theme.secondary}>{label}</Text>
        <Spacer />
        {trend && (
          <HStack alignment="center" spacing={1}>
            <Text font={8} fontWeight="bold" foregroundStyle={trend.isIncrease ? theme.red : theme.green}>
              {trend.percent}%
            </Text>
            <Image 
              systemName={trend.isIncrease ? "arrow.up" : "arrow.down"} 
              font={6} 
              fontWeight="bold"
              foregroundStyle={trend.isIncrease ? theme.red : theme.green} 
            />
          </HStack>
        )}
      </HStack>
      
      {/* 数值行：区分数字和单位 */}
      <HStack alignment="lastTextBaseline" spacing={2}>
        <Text font={17} fontWeight="bold" foregroundStyle={theme.text} lineLimit={1}>
          {parts.val}
        </Text>
        <Text font={10} fontWeight="bold" foregroundStyle={theme.secondary} lineLimit={1} padding={{ bottom: 1 }}>
          {parts.unit}
        </Text>
      </HStack>
    </VStack>
  );
}

async function render() {
  const settings = Storage.get<EdgeOneSettings>(SETTINGS_KEY);
  const reloadPolicy: any = { policy: "after", date: new Date(Date.now() + 15 * 60 * 1000) };

  if (Widget.family !== "systemMedium") {
    Widget.present(<VStack padding={16} alignment="center"><Text font="headline" foregroundStyle={theme.red}>仅支持中型组件</Text></VStack>, reloadPolicy);
    return;
  }

  if (!settings?.secretId || !settings?.secretKey) {
    Widget.present(<VStack padding={16} alignment="center"><Text font="headline" foregroundStyle={theme.red}>未配置密钥</Text></VStack>, reloadPolicy);
    return;
  }

  try {
    const data = await fetchMetricsWithTrend(settings);
    if (!data) throw new Error("获取数据失败");
    const c = data.current;
    const hitRatePct = c.flux > 0 ? (c.hitFlux / c.flux * 100).toFixed(2) : "0";
    console.log("[EdgeOne] API 四个指标 raw:", {
      总流量_flux: c.flux,
      总请求数_request: c.request,
      带宽峰值_bandwidth: c.bandwidth,
      缓存命中流量_hitFlux: c.hitFlux,
    });
    console.log("[EdgeOne] API 四个指标 展示:", {
      总流量: (c.flux / 1e6).toFixed(2) + "MB",
      总请求数: c.request >= 10000 ? (c.request / 10000).toFixed(2) + "万次" : c.request + "次",
      带宽峰值: c.bandwidth >= 1e6 ? (c.bandwidth / 1e6).toFixed(2) + "Mbps" : (c.bandwidth / 1e3).toFixed(2) + "Kbps",
      缓存命中率: hitRatePct + "%",
    });
    const timeRange = settings.timeRange === "today" ? "today" : "7days";
    const timeRangeLabel = timeRange === "today" ? "当日" : "近7天";
    Widget.present(<WidgetView data={data} timeRangeLabel={timeRangeLabel} />, reloadPolicy);
  } catch (error) {
    Widget.present(<VStack padding={16} alignment="center"><Text font="headline" foregroundStyle={theme.red}>请求失败</Text><Text font="body" foregroundStyle={theme.secondary} padding={{ top: 4 }}>{String(error)}</Text></VStack>, reloadPolicy);
  }
}

render();
