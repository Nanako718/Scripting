import {
  Widget,
  VStack,
  HStack,
  Text,
  Spacer,
  WidgetReloadPolicy,
  ZStack,
  Image,
  DynamicShapeStyle,
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
  /** 标题：Tencent 灰字 */
  tencentGray: { light: "#8E8E93", dark: "#AEAEB2" } as DynamicShapeStyle,
  /** 标题：EdgeOne 腾讯云蓝 */
  edgeBlue: { light: "#006EFF", dark: "#3B9EFF" } as DynamicShapeStyle,
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

/** l7Flow_bandwidth：bps，展示为 Mbps（10⁶ bps），与控制台常见一致 */
function splitMbps(bps: number): { val: string; unit: string } {
  if (!Number.isFinite(bps) || bps <= 0) return { val: "0", unit: "Mbps" };
  if (bps < 1e6) return { val: (bps / 1e3).toFixed(2), unit: "Kbps" };
  return { val: (bps / 1e6).toFixed(2), unit: "Mbps" };
}

function splitPercent(pct: number): { val: string; unit: string } {
  if (!Number.isFinite(pct) || pct < 0) return { val: "—", unit: "" };
  const v = Math.min(100, Math.max(0, pct));
  return { val: v.toFixed(2), unit: "%" };
}

/** 日志与调试：与卡片展示一致的字符串 */
function formatMetricsForLog(m: EdgeOneMetrics): Record<string, string> {
  const tf = splitBytes(m.totalFlux);
  const bw = splitMbps(m.bandwidthPeakBps);
  const hit = splitPercent(m.cacheHitRate);
  return {
    总流量: `${tf.val}${tf.unit}`,
    总请求数: `${Math.round(m.request)}次`,
    带宽峰值: `${bw.val}${bw.unit}`,
    缓存命中率: hit.val ? `${hit.val}${hit.unit}` : "—",
  };
}

type TrendDisplay = { main: string; suffix: string; direction: "up" | "down" | "flat" };

/** 环比增长率（%）= (当前 − 上一) / 上一 × 100 */
function calculateChange(current: number, previous: number): TrendDisplay | null {
  if (current < 0 || previous < 0) return null;
  if (previous === 0) return null;
  const diff = current - previous;
  const ratePct = (diff / previous) * 100;
  if (!Number.isFinite(ratePct)) return null;
  const direction: "up" | "down" | "flat" = diff > 0 ? "up" : diff < 0 ? "down" : "flat";
  const main = direction === "flat" ? "0.0" : ratePct.toFixed(1);
  return { main, suffix: "%", direction };
}

/**
 * 缓存命中率较上：百分点差（非增长率），当前 − 上一；界面与另三项一致用 % 后缀。
 */
function calculateHitRatePointsDiff(currentPct: number, previousPct: number): TrendDisplay | null {
  if (!Number.isFinite(currentPct) || !Number.isFinite(previousPct)) return null;
  if (currentPct < 0 || previousPct < 0) return null;
  const diff = currentPct - previousPct;
  const direction: "up" | "down" | "flat" = diff > 0 ? "up" : diff < 0 ? "down" : "flat";
  const main = direction === "flat" ? "0.00" : diff.toFixed(2);
  return { main, suffix: "%", direction };
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
          <Text font={14} fontWeight="bold" foregroundStyle={theme.tencentGray}>Tencent</Text>
          <Text font={10} fontWeight="bold" foregroundStyle={theme.edgeBlue}>EdgeOne</Text>
          <Spacer />
          <Text font={10} fontWeight="medium" foregroundStyle={theme.secondary}>{timeRangeLabel} · {timeString}</Text>
        </HStack>

        {/* 2x2：与控制台概览一致 — 总流量、总请求、带宽峰值、缓存命中率 */}
        <VStack spacing={6}>
          <HStack spacing={6}>
            <MetricCard
              icon="chart.bar.fill"
              label="总流量"
              parts={splitBytes(current.totalFlux)}
              trend={calculateChange(current.totalFlux, previous.totalFlux)}
              color={theme.green}
            />
            <MetricCard
              icon="cursorarrow.click.2"
              label="总请求数"
              parts={splitRequest(current.request)}
              trend={calculateChange(current.request, previous.request)}
              color={theme.yellow}
            />
          </HStack>
          <HStack spacing={6}>
            <MetricCard
              icon="speedometer"
              label="带宽峰值"
              parts={splitMbps(current.bandwidthPeakBps)}
              trend={calculateChange(current.bandwidthPeakBps, previous.bandwidthPeakBps)}
              color={theme.blue}
            />
            <MetricCard
              icon="externaldrive.fill.badge.icloud"
              label="缓存命中率"
              parts={splitPercent(current.cacheHitRate)}
              trend={calculateHitRatePointsDiff(current.cacheHitRate, previous.cacheHitRate)}
              trendGoodWhenUp
              color={theme.mauve}
            />
          </HStack>
        </VStack>
      </VStack>
    </ZStack>
  );
}

function MetricCard({
  icon,
  label,
  parts,
  trend,
  color,
  trendGoodWhenUp,
}: {
  icon: string;
  label: string;
  parts: { val: string; unit: string };
  trend: TrendDisplay | null;
  color: any;
  /** 为 true 时环比上升为绿（用于命中率等越高越好） */
  trendGoodWhenUp?: boolean;
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
            <HStack alignment="firstTextBaseline" spacing={0}>
              <Text
                font={8}
                fontWeight="bold"
                foregroundStyle={
                  trend.direction === "flat"
                    ? theme.secondary
                    : trendGoodWhenUp
                      ? trend.direction === "up"
                        ? theme.green
                        : theme.red
                      : trend.direction === "up"
                        ? theme.red
                        : theme.green
                }
              >
                {trend.main}
              </Text>
              <Text
                font={6}
                fontWeight="medium"
                foregroundStyle={
                  trend.direction === "flat"
                    ? theme.secondary
                    : trendGoodWhenUp
                      ? trend.direction === "up"
                        ? theme.green
                        : theme.red
                      : trend.direction === "up"
                        ? theme.red
                        : theme.green
                }
              >
                {trend.suffix}
              </Text>
            </HStack>
            <Image
              systemName={
                trend.direction === "flat" ? "equal" : trend.direction === "up" ? "arrow.up" : "arrow.down"
              }
              font={6}
              fontWeight="bold"
              foregroundStyle={
                trend.direction === "flat"
                  ? theme.secondary
                  : trendGoodWhenUp
                    ? trend.direction === "up"
                      ? theme.green
                      : theme.red
                    : trend.direction === "up"
                      ? theme.red
                      : theme.green
              }
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

  if (!settings) {
    Widget.present(<VStack padding={16} alignment="center"><Text font="headline" foregroundStyle={theme.red}>未配置</Text></VStack>, reloadPolicy);
    return;
  }

  const sid = String(settings.secretId ?? (settings as EdgeOneSettings & { accessKeyId?: string }).accessKeyId ?? "").trim();
  const skey = String(settings.secretKey ?? (settings as EdgeOneSettings & { accessKeySecret?: string }).accessKeySecret ?? "").trim();
  if (!sid || !skey) {
    Widget.present(<VStack padding={16} alignment="center"><Text font="headline" foregroundStyle={theme.red}>未配置 Secret ID / Key</Text></VStack>, reloadPolicy);
    return;
  }

  try {
    const data = await fetchMetricsWithTrend(settings);
    if (!data) throw new Error("获取数据失败");
    const c = data.current;
    const p = data.previous;
    console.log("[EdgeOne] 本周期（展示值）", formatMetricsForLog(c));
    console.log("[EdgeOne] 上周期（对比基准）", formatMetricsForLog(p));
    console.log("[EdgeOne] 命中率公式", "1 - l7Flow_inFlux_hy / l7Flow_outFlux（回源+分析接口）");
    const timeRange = settings.timeRange === "today" ? "today" : "7days";
    const timeRangeLabel =
      timeRange === "today"
        ? "当日(至此刻) · 较上一等长时段"
        : "近7天 · 较上一等长时段";
    Widget.present(<WidgetView data={data} timeRangeLabel={timeRangeLabel} />, reloadPolicy);
  } catch (error) {
    console.log("[EdgeOne] 小组件请求异常:", {
      error,
      message: error instanceof Error ? error.message : String(error),
      settings: {
        hasSecretId: Boolean(sid),
        hasSecretKey: Boolean(skey),
        timeRange: settings?.timeRange ?? "7days",
      },
    });
    Widget.present(<VStack padding={16} alignment="center"><Text font="headline" foregroundStyle={theme.red}>请求失败</Text><Text font="body" foregroundStyle={theme.secondary} padding={{ top: 4 }}>{String(error)}</Text></VStack>, reloadPolicy);
  }
}

render();
