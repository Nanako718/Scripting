import { fetch } from "scripting";

export type TimeRange = "today" | "7days";

export type EdgeOneSettings = {
  secretId: string;
  secretKey: string;
  /** 站点 ZoneId（如 zone-xxx）；留空则查询账号下全部站点（ZoneIds 传 *） */
  zoneId?: string;
  timeRange?: TimeRange;
};

export type EdgeOneMetrics = {
  /** 总流量：l7Flow_flux 的 Sum；若无则用 l7Flow_outFlux + l7Flow_inFlux（字节）— 与控制台「总流量」 */
  totalFlux: number;
  /** 总请求数：l7Flow_request 的 Sum（次） */
  request: number;
  /** 带宽峰值（bps）：l7Flow_bandwidth 的 Max；否则 max(outBandwidth.Max, inBandwidth.Max) */
  bandwidthPeakBps: number;
  /**
   * 缓存命中率（%）：与控制台一致，1 − (源站响应 ÷ EdgeOne 响应)；
   * 源站=l7Flow_inFlux_hy（回源接口），Edge=l7Flow_outFlux（分析接口）。回源未拉到为 -1。
   */
  cacheHitRate: number;
};

export const SETTINGS_KEY = "edgeOneSettings";

const HOST = "teo.tencentcloudapi.com";
const SERVICE = "teo";
const VERSION = "2022-09-01";
const SIGNED_HEADERS = "content-type;host;x-tc-action";
const ACTION_TIMING_L7 = "DescribeTimingL7AnalysisData";
const ACTION_ORIGIN_PULL = "DescribeTimingL7OriginPullData";
/** 与网页指标分析同源：七层访问时序 + 命中率用回源接口取源站响应字节 */
const METRIC_NAMES_L7_FULL = [
  "l7Flow_outFlux",
  "l7Flow_inFlux",
  "l7Flow_flux",
  "l7Flow_outBandwidth",
  "l7Flow_inBandwidth",
  "l7Flow_bandwidth",
  "l7Flow_request",
];

function pad2(n: number): string {
  return n < 10 ? "0" + n : String(n);
}

function formatLocalISO(d: Date, hour: number, minute: number, second: number): string {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  const h = pad2(hour);
  const min = pad2(minute);
  const sec = pad2(second);
  const offset = -d.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const oh = pad2(Math.floor(Math.abs(offset) / 60));
  const om = pad2(Math.abs(offset) % 60);
  return `${y}-${m}-${day}T${h}:${min}:${sec}${sign}${oh}:${om}`;
}

/**
 * 当前周期与上一周期（环比基准）：
 * - 两段时间等长、首尾相接（上一段结束紧邻当前段开始）、无重叠无间隔。
 * - 「当日」：当前 = 今日 00:00 ~ 此刻；上一周期 = 将此时段整体向前平移等长。
 * - 「近7天」：当前 = 此刻前滚动 7 天 ~ 此刻；上一周期 = 再往前等长 7 天。
 */
export function getComparisonTimeRanges(timeRange: TimeRange): {
  current: { startStr: string; endStr: string };
  previous: { startStr: string; endStr: string };
} {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  if (timeRange === "today") {
    const durationMs = Math.max(60_000, now.getTime() - todayStart.getTime());
    const previousEnd = new Date(todayStart.getTime() - 1);
    const previousStart = new Date(todayStart.getTime() - durationMs);
    return {
      current: {
        startStr: formatLocalISO(todayStart, 0, 0, 0),
        endStr: formatLocalISO(now, now.getHours(), now.getMinutes(), now.getSeconds()),
      },
      previous: {
        startStr: formatLocalISO(
          previousStart,
          previousStart.getHours(),
          previousStart.getMinutes(),
          previousStart.getSeconds()
        ),
        endStr: formatLocalISO(
          previousEnd,
          previousEnd.getHours(),
          previousEnd.getMinutes(),
          previousEnd.getSeconds()
        ),
      },
    };
  }

  const currentEnd = new Date(now);
  const currentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const previousEnd = new Date(currentStart.getTime() - 1);
  const previousStart = new Date(currentStart.getTime() - 7 * 24 * 60 * 60 * 1000);

  return {
    current: {
      startStr: formatLocalISO(
        currentStart,
        currentStart.getHours(),
        currentStart.getMinutes(),
        currentStart.getSeconds()
      ),
      endStr: formatLocalISO(currentEnd, currentEnd.getHours(), currentEnd.getMinutes(), currentEnd.getSeconds()),
    },
    previous: {
      startStr: formatLocalISO(
        previousStart,
        previousStart.getHours(),
        previousStart.getMinutes(),
        previousStart.getSeconds()
      ),
      endStr: formatLocalISO(
        previousEnd,
        previousEnd.getHours(),
        previousEnd.getMinutes(),
        previousEnd.getSeconds()
      ),
    },
  };
}

/** 文档：2h 内 min，2 天内 5min，7 天内 hour，超过 7 天 day；与不传 Interval 时服务端推算一致 */
function inferInterval(startStr: string, endStr: string): "min" | "5min" | "hour" | "day" {
  const startMs = Date.parse(startStr);
  const endMs = Date.parse(endStr);
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return "hour";
  const span = Math.max(0, endMs - startMs);
  const twoHours = 2 * 60 * 60 * 1000;
  const twoDays = 2 * 24 * 60 * 60 * 1000;
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  if (span <= twoHours) return "min";
  if (span <= twoDays) return "5min";
  if (span <= sevenDays) return "hour";
  return "day";
}

function utf8Encode(str: string): Uint8Array {
  const n = str.length;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    let c = str.charCodeAt(i);
    if (c < 0x80) out.push(c);
    else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    else if (c < 0xd800 || c >= 0xe000)
      out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    else {
      i++;
      const c2 = str.charCodeAt(i);
      const u = 0x10000 + ((c & 0x3ff) << 10) + (c2 & 0x3ff);
      out.push(0xf0 | (u >> 18), 0x80 | ((u >> 12) & 0x3f), 0x80 | ((u >> 6) & 0x3f), 0x80 | (u & 0x3f));
    }
  }
  return new Uint8Array(out);
}

const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function rotr(n: number, b: number): number {
  return (n >>> b) | (n << (32 - b));
}
function ch(x: number, y: number, z: number): number {
  return (x & y) ^ (~x & z);
}
function maj(x: number, y: number, z: number): number {
  return (x & y) ^ (x & z) ^ (y & z);
}
function sigma0(x: number): number {
  return rotr(x, 2) ^ rotr(x, 13) ^ rotr(x, 22);
}
function sigma1(x: number): number {
  return rotr(x, 6) ^ rotr(x, 11) ^ rotr(x, 25);
}
function gamma0(x: number): number {
  return rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3);
}
function gamma1(x: number): number {
  return rotr(x, 17) ^ rotr(x, 19) ^ (x >>> 10);
}

function sha256Bytes(data: Uint8Array): Uint8Array {
  const msg = new Uint8Array(data);
  const len = msg.length;
  const bitLen = len * 8;
  const padLen = len % 64 < 56 ? 56 - (len % 64) : 120 - (len % 64);
  const total = len + padLen + 8;
  const buf = new Uint8Array(total);
  buf.set(msg);
  buf[len] = 0x80;
  const view = new DataView(buf.buffer);
  view.setUint32(total - 4, (bitLen >>> 0) & 0xffffffff, false);
  view.setUint32(total - 8, Math.floor(bitLen / 0x100000000), false);

  let h0 = 0x6a09e667,
    h1 = 0xbb67ae85,
    h2 = 0x3c6ef372,
    h3 = 0xa54ff53a;
  let h4 = 0x510e527f,
    h5 = 0x9b05688c,
    h6 = 0x1f83d9ab,
    h7 = 0x5be0cd19;
  const W = new Uint32Array(64);
  for (let i = 0; i < total; i += 64) {
    for (let t = 0; t < 16; t++) W[t] = view.getUint32(i + t * 4, false);
    for (let t = 16; t < 64; t++) W[t] = (gamma1(W[t - 2]) + W[t - 7] + gamma0(W[t - 15]) + W[t - 16]) >>> 0;
    let a = h0,
      b = h1,
      c = h2,
      d = h3,
      e = h4,
      f = h5,
      g = h6,
      h = h7;
    for (let t = 0; t < 64; t++) {
      const T1 = (h + sigma1(e) + ch(e, f, g) + K[t] + W[t]) >>> 0;
      const T2 = (sigma0(a) + maj(a, b, c)) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + T1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (T1 + T2) >>> 0;
    }
    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }
  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  outView.setUint32(0, h0, false);
  outView.setUint32(4, h1, false);
  outView.setUint32(8, h2, false);
  outView.setUint32(12, h3, false);
  outView.setUint32(16, h4, false);
  outView.setUint32(20, h5, false);
  outView.setUint32(24, h6, false);
  outView.setUint32(28, h7, false);
  return out;
}

function bytesToHex(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += ("0" + bytes[i].toString(16)).slice(-2);
  return s;
}

function hmacSha256(key: Uint8Array, message: Uint8Array): Uint8Array {
  const blockSize = 64;
  let K = key;
  if (K.length > blockSize) K = sha256Bytes(K);
  if (K.length < blockSize) {
    const padded = new Uint8Array(blockSize);
    padded.set(K);
    K = padded;
  }
  const ipad = new Uint8Array(blockSize);
  const opad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    ipad[i] = K[i] ^ 0x36;
    opad[i] = K[i] ^ 0x5c;
  }
  const inner = new Uint8Array(blockSize + message.length);
  inner.set(ipad);
  inner.set(message, blockSize);
  const innerHash = sha256Bytes(inner);
  const outer = new Uint8Array(blockSize + 32);
  outer.set(opad);
  outer.set(innerHash, blockSize);
  return sha256Bytes(outer);
}

function getHashHex(str: string): string {
  return bytesToHex(sha256Bytes(utf8Encode(str)));
}

function getDate(timestamp: number): string {
  const d = new Date(timestamp * 1000);
  const y = d.getUTCFullYear();
  const m = pad2(d.getUTCMonth() + 1);
  const day = pad2(d.getUTCDate());
  return `${y}-${m}-${day}`;
}

function signTC3(secretId: string, secretKey: string, action: string, payload: string, timestamp: number): string {
  const date = getDate(timestamp);
  const canonicalHeaders =
    "content-type:application/json; charset=utf-8\nhost:" + HOST + "\nx-tc-action:" + action.toLowerCase() + "\n";
  const canonicalRequest = "POST\n/\n\n" + canonicalHeaders + "\n" + SIGNED_HEADERS + "\n" + getHashHex(payload);
  const credentialScope = date + "/" + SERVICE + "/tc3_request";
  const stringToSign = "TC3-HMAC-SHA256\n" + timestamp + "\n" + credentialScope + "\n" + getHashHex(canonicalRequest);

  const kDate = hmacSha256(utf8Encode("TC3" + secretKey), utf8Encode(date));
  const kService = hmacSha256(kDate, utf8Encode(SERVICE));
  const kSigning = hmacSha256(kService, utf8Encode("tc3_request"));
  const signature = bytesToHex(hmacSha256(kSigning, utf8Encode(stringToSign)));
  return (
    "TC3-HMAC-SHA256 Credential=" +
    secretId +
    "/" +
    credentialScope +
    ", SignedHeaders=" +
    SIGNED_HEADERS +
    ", Signature=" +
    signature
  );
}

export type TimingDataRecordRow = {
  TypeKey?: string;
  TypeValue?: Array<{
    MetricName?: string;
    Sum?: number;
    Max?: number;
    Avg?: number;
  }>;
};

/** DescribeTimingL7AnalysisData 返回 Data；部分接口返回 TimingDataRecords，结构相同 */
export type TimingL7AnalysisResponse = {
  Data?: TimingDataRecordRow[];
  TimingDataRecords?: TimingDataRecordRow[];
};

async function doFetchTimingL7Analysis(
  secretId: string,
  secretKey: string,
  startStr: string,
  endStr: string,
  zoneIds: string[],
  metricNames: string[]
): Promise<TimingL7AnalysisResponse | null> {
  const spanMs = Date.parse(endStr) - Date.parse(startStr);
  const max31d = 31 * 24 * 60 * 60 * 1000;
  if (!Number.isNaN(spanMs) && spanMs > max31d) {
    throw new Error("查询时间范围不能超过 31 天");
  }

  /** 不传已废弃的 Area；地域筛选请用 Filters.country（本小组件未接） */
  const payloadObj: Record<string, unknown> = {
    StartTime: startStr,
    EndTime: endStr,
    MetricNames: metricNames,
    ZoneIds: zoneIds,
    Interval: inferInterval(startStr, endStr),
  };
  const payload = JSON.stringify(payloadObj);
  const timestamp = Math.floor(Date.now() / 1000);
  const authorization = signTC3(secretId, secretKey, ACTION_TIMING_L7, payload, timestamp);

  const res = await fetch("https://" + HOST + "/", {
    method: "POST",
    headers: {
      Authorization: authorization,
      "Content-Type": "application/json; charset=utf-8",
      Host: HOST,
      "X-TC-Action": ACTION_TIMING_L7,
      "X-TC-Timestamp": String(timestamp),
      "X-TC-Version": VERSION,
    },
    body: payload,
  });

  const resText = await res.text();
  if (!res.ok) throw new Error(resText || "腾讯云 API 请求失败");
  const json = JSON.parse(resText);
  if (json.Response?.Error) throw new Error(json.Response.Error.Message || "腾讯云 API 返回错误");
  return json.Response || null;
}

function getTimingDataRows(resp: TimingL7AnalysisResponse | null): TimingDataRecordRow[] {
  if (!resp) return [];
  const rows = resp.Data?.length ? resp.Data : resp.TimingDataRecords;
  return Array.isArray(rows) ? rows : [];
}

type AnalysisPartial = {
  edgeOutFlux: number;
  totalFlux: number;
  request: number;
  bandwidthPeakBps: number;
};

function extractAnalysisPartial(response: TimingL7AnalysisResponse | null): AnalysisPartial {
  let sumOutFlux = 0;
  let sumInFlux = 0;
  let sumFlux = 0;
  let sumRequest = 0;
  let maxOutBw = 0;
  let maxInBw = 0;
  let maxBandwidth = 0;

  for (const row of getTimingDataRows(response)) {
    for (const m of row.TypeValue ?? []) {
      const name = m.MetricName;
      const sum = m.Sum ?? 0;
      const mx = m.Max ?? 0;
      if (name === "l7Flow_outFlux") sumOutFlux += sum;
      else if (name === "l7Flow_inFlux") sumInFlux += sum;
      else if (name === "l7Flow_flux") sumFlux += sum;
      else if (name === "l7Flow_request") sumRequest += sum;
      else if (name === "l7Flow_outBandwidth") {
        if (mx > maxOutBw) maxOutBw = mx;
      } else if (name === "l7Flow_inBandwidth") {
        if (mx > maxInBw) maxInBw = mx;
      } else if (name === "l7Flow_bandwidth") {
        if (mx > maxBandwidth) maxBandwidth = mx;
      }
    }
  }

  const totalFlux = sumFlux > 0 ? sumFlux : sumOutFlux + sumInFlux;
  const bandwidthPeakBps = maxBandwidth > 0 ? maxBandwidth : Math.max(maxOutBw, maxInBw);
  return {
    edgeOutFlux: sumOutFlux,
    totalFlux,
    request: sumRequest,
    bandwidthPeakBps,
  };
}

function sumMetricSumFromRows(rows: TimingDataRecordRow[], metricName: string): number {
  let t = 0;
  for (const row of rows) {
    for (const m of row.TypeValue ?? []) {
      if (m.MetricName === metricName) t += m.Sum ?? 0;
    }
  }
  return t;
}

/** 与腾讯云指标分析文档一致：1 − (源站响应流量 / EdgeOne 响应流量)，结果 0–100（%） */
function computeConsoleCacheHitPercent(edgeOneOutFluxSum: number, originResponseFluxSum: number): number {
  if (!Number.isFinite(edgeOneOutFluxSum) || edgeOneOutFluxSum <= 0) return 0;
  if (!Number.isFinite(originResponseFluxSum) || originResponseFluxSum < 0) return 0;
  const ratio = originResponseFluxSum / edgeOneOutFluxSum;
  const pct = (1 - Math.min(1, ratio)) * 100;
  return Math.min(100, Math.max(0, pct));
}

function mergeEdgeOneMetrics(analysis: AnalysisPartial, originInfluxHySum: number | null): EdgeOneMetrics {
  let cacheHitRate = -1;
  if (originInfluxHySum !== null) {
    const raw = computeConsoleCacheHitPercent(analysis.edgeOutFlux, originInfluxHySum);
    cacheHitRate = Math.round(raw * 100) / 100;
  }
  return {
    totalFlux: analysis.totalFlux,
    request: analysis.request,
    bandwidthPeakBps: analysis.bandwidthPeakBps,
    cacheHitRate,
  };
}

async function doFetchTimingL7OriginPull(
  secretId: string,
  secretKey: string,
  startStr: string,
  endStr: string,
  zoneIds: string[]
): Promise<TimingL7AnalysisResponse | null> {
  const spanMs = Date.parse(endStr) - Date.parse(startStr);
  const max31d = 31 * 24 * 60 * 60 * 1000;
  if (!Number.isNaN(spanMs) && spanMs > max31d) {
    throw new Error("查询时间范围不能超过 31 天");
  }
  const payloadObj: Record<string, unknown> = {
    ZoneIds: zoneIds,
    MetricNames: ["l7Flow_inFlux_hy"],
    StartTime: startStr,
    EndTime: endStr,
    Interval: inferInterval(startStr, endStr),
  };
  const payload = JSON.stringify(payloadObj);
  const timestamp = Math.floor(Date.now() / 1000);
  const authorization = signTC3(secretId, secretKey, ACTION_ORIGIN_PULL, payload, timestamp);

  const res = await fetch("https://" + HOST + "/", {
    method: "POST",
    headers: {
      Authorization: authorization,
      "Content-Type": "application/json; charset=utf-8",
      Host: HOST,
      "X-TC-Action": ACTION_ORIGIN_PULL,
      "X-TC-Timestamp": String(timestamp),
      "X-TC-Version": VERSION,
    },
    body: payload,
  });

  const resText = await res.text();
  if (!res.ok) throw new Error(resText || "腾讯云回源数据 API 请求失败");
  const json = JSON.parse(resText);
  if (json.Response?.Error) throw new Error(json.Response.Error.Message || "腾讯云回源数据 API 返回错误");
  return json.Response || null;
}

function resolveCredentials(settings: EdgeOneSettings & Record<string, unknown>): {
  secretId: string;
  secretKey: string;
  zoneIds: string[];
} {
  const secretId = String(settings.secretId ?? settings.accessKeyId ?? "").trim();
  const secretKey = String(settings.secretKey ?? settings.accessKeySecret ?? "").trim();
  const zoneRaw = String(settings.zoneId ?? settings.siteId ?? "").trim();
  /** 文档：最多 100 个站点；账号级汇总用 *（数组元素为字符串 "*"） */
  const parsed = zoneRaw
    ? zoneRaw
        .split(/[\s,，]+/)
        .map((z) => z.trim())
        .filter(Boolean)
        .slice(0, 100)
    : [];
  const zoneIds = parsed.length > 0 ? parsed : ["*"];
  return { secretId, secretKey, zoneIds };
}

export async function fetchMetricsWithTrend(settings: EdgeOneSettings): Promise<{
  current: EdgeOneMetrics;
  previous: EdgeOneMetrics;
} | null> {
  const s = settings as EdgeOneSettings & Record<string, unknown>;
  const { secretId, secretKey, zoneIds } = resolveCredentials(s);
  if (!secretId || !secretKey) return null;

  const timeRange = settings?.timeRange === "today" ? "today" : "7days";
  const { current, previous } = getComparisonTimeRanges(timeRange);

  let currAnalysis: TimingL7AnalysisResponse | null;
  let currOrigin: TimingL7AnalysisResponse | null = null;
  try {
    const [a, o] = await Promise.all([
      doFetchTimingL7Analysis(secretId, secretKey, current.startStr, current.endStr, zoneIds, METRIC_NAMES_L7_FULL),
      doFetchTimingL7OriginPull(secretId, secretKey, current.startStr, current.endStr, zoneIds).catch(() => null),
    ]);
    currAnalysis = a;
    currOrigin = o;
  } catch (error) {
    console.log("[EdgeOne] 当前周期数据拉取失败:", {
      timeRange,
      startTime: current.startStr,
      endTime: current.endStr,
      zoneIds,
      message: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }

  const currPart = extractAnalysisPartial(currAnalysis);
  const currOriginSum =
    currOrigin === null ? null : sumMetricSumFromRows(getTimingDataRows(currOrigin), "l7Flow_inFlux_hy");

  let prevAnalysis: TimingL7AnalysisResponse | null = null;
  let prevOrigin: TimingL7AnalysisResponse | null = null;
  try {
    const [a, o] = await Promise.all([
      doFetchTimingL7Analysis(secretId, secretKey, previous.startStr, previous.endStr, zoneIds, METRIC_NAMES_L7_FULL),
      doFetchTimingL7OriginPull(secretId, secretKey, previous.startStr, previous.endStr, zoneIds).catch(() => null),
    ]);
    prevAnalysis = a;
    prevOrigin = o;
  } catch {
    // 环比静默失败
  }

  const prevPart = extractAnalysisPartial(prevAnalysis);
  const prevOriginSum =
    prevOrigin === null ? null : sumMetricSumFromRows(getTimingDataRows(prevOrigin), "l7Flow_inFlux_hy");

  return {
    current: mergeEdgeOneMetrics(currPart, currOriginSum),
    previous: mergeEdgeOneMetrics(prevPart, prevOriginSum),
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
}

export function formatNumber(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return String(Math.round(n));
}
