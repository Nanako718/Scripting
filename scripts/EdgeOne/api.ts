import { fetch } from "scripting";

/** 显示范围：今日 / 近7天 */
export type TimeRange = "today" | "7days";

export type EdgeOneSettings = {
  secretId: string;
  secretKey: string;
  /** 小组件显示的数据范围，默认近7天 */
  timeRange?: TimeRange;
};

export type EdgeOneMetrics = {
  flux: number;
  request: number;
  bandwidth: number;
  hitFlux: number;
};

export const SETTINGS_KEY = "edgeOneSettings";

const HOST = "teo.tencentcloudapi.com";
const SERVICE = "teo";
const ACTION = "DescribeOverviewL7Data";
const VERSION = "2022-09-01";
const SIGNED_HEADERS = "content-type;host;x-tc-action";
const METRIC_NAMES = ["l7Flow_flux", "l7Flow_request", "l7Flow_bandwidth", "l7Flow_hit_outFlux"];

// ---------- 时间范围助手 ----------
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

/** 获取当前周期和环比周期的 StartTime/EndTime 字符串 */
export function getComparisonTimeRanges(timeRange: TimeRange): {
  current: { startStr: string; endStr: string };
  previous: { startStr: string; endStr: string };
} {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (timeRange === "today") {
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayEnd);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

    return {
      current: {
        startStr: formatLocalISO(todayStart, 0, 0, 0),
        endStr: formatLocalISO(todayEnd, 23, 59, 59),
      },
      previous: {
        startStr: formatLocalISO(yesterdayStart, 0, 0, 0),
        endStr: formatLocalISO(yesterdayEnd, 23, 59, 59),
      },
    };
  } else {
    // 近7天 (包含今天) vs 之前的 7 天
    const currentStart = new Date(todayStart);
    currentStart.setDate(currentStart.getDate() - 6);
    
    const previousEnd = new Date(currentStart);
    previousEnd.setDate(previousEnd.getDate() - 1);
    previousEnd.setHours(23, 59, 59, 999);
    
    const previousStart = new Date(previousEnd);
    previousStart.setDate(previousStart.getDate() - 6);
    previousStart.setHours(0, 0, 0, 0);

    return {
      current: {
        startStr: formatLocalISO(currentStart, 0, 0, 0),
        endStr: formatLocalISO(todayEnd, 23, 59, 59),
      },
      previous: {
        startStr: formatLocalISO(previousStart, 0, 0, 0),
        endStr: formatLocalISO(previousEnd, 23, 59, 59),
      },
    };
  }
}

// ---------- 纯 JS 签名实现 ----------
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

function rotr(n: number, b: number): number { return (n >>> b) | (n << (32 - b)); }
function ch(x: number, y: number, z: number): number { return (x & y) ^ (~x & z); }
function maj(x: number, y: number, z: number): number { return (x & y) ^ (x & z) ^ (y & z); }
function sigma0(x: number): number { return rotr(x, 2) ^ rotr(x, 13) ^ rotr(x, 22); }
function sigma1(x: number): number { return rotr(x, 6) ^ rotr(x, 11) ^ rotr(x, 25); }
function gamma0(x: number): number { return rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3); }
function gamma1(x: number): number { return rotr(x, 17) ^ rotr(x, 19) ^ (x >>> 10); }

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

  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
  const W = new Uint32Array(64);
  for (let i = 0; i < total; i += 64) {
    for (let t = 0; t < 16; t++) W[t] = view.getUint32(i + t * 4, false);
    for (let t = 16; t < 64; t++) W[t] = (gamma1(W[t - 2]) + W[t - 7] + gamma0(W[t - 15]) + W[t - 16]) >>> 0;
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let t = 0; t < 64; t++) {
      const T1 = (h + sigma1(e) + ch(e, f, g) + K[t] + W[t]) >>> 0;
      const T2 = (sigma0(a) + maj(a, b, c)) >>> 0;
      h = g; g = f; f = e; e = (d + T1) >>> 0; d = c; c = b; b = a; a = (T1 + T2) >>> 0;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
  }
  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  outView.setUint32(0, h0, false); outView.setUint32(4, h1, false); outView.setUint32(8, h2, false); outView.setUint32(12, h3, false);
  outView.setUint32(16, h4, false); outView.setUint32(20, h5, false); outView.setUint32(24, h6, false); outView.setUint32(28, h7, false);
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

// ---------- 腾讯云 API 签名 v3 ----------
function signTC3(secretId: string, secretKey: string, payload: string, timestamp: number): string {
  const date = getDate(timestamp);
  const canonicalHeaders = "content-type:application/json; charset=utf-8\nhost:" + HOST + "\nx-tc-action:" + ACTION.toLowerCase() + "\n";
  const canonicalRequest = "POST\n/\n\n" + canonicalHeaders + "\n" + SIGNED_HEADERS + "\n" + getHashHex(payload);
  const credentialScope = date + "/" + SERVICE + "/tc3_request";
  const stringToSign = "TC3-HMAC-SHA256\n" + timestamp + "\n" + credentialScope + "\n" + getHashHex(canonicalRequest);

  const kDate = hmacSha256(utf8Encode("TC3" + secretKey), utf8Encode(date));
  const kService = hmacSha256(kDate, utf8Encode(SERVICE));
  const kSigning = hmacSha256(kService, utf8Encode("tc3_request"));
  const signature = bytesToHex(hmacSha256(kSigning, utf8Encode(stringToSign)));
  return "TC3-HMAC-SHA256 Credential=" + secretId + "/" + credentialScope + ", SignedHeaders=" + SIGNED_HEADERS + ", Signature=" + signature;
}

// ---------- API 请求逻辑 ----------
export type OverviewL7Response = {
  Data?: Array<{
    TypeValue: Array<{
      MetricName: string;
      Sum: number;
      Max: number;
      Avg: number;
    }>;
  }>;
};

async function doFetch(secretId: string, secretKey: string, startStr: string, endStr: string): Promise<OverviewL7Response | null> {
  const payloadObj = {
    StartTime: startStr,
    EndTime: endStr,
    // Interval: "min",
    MetricNames: METRIC_NAMES,
  };
  const payload = JSON.stringify(payloadObj);
  const timestamp = Math.floor(Date.now() / 1000);
  const authorization = signTC3(secretId, secretKey, payload, timestamp);

  const res = await fetch("https://" + HOST + "/", {
    method: "POST",
    headers: {
      Authorization: authorization,
      "Content-Type": "application/json; charset=utf-8",
      Host: HOST,
      "X-TC-Action": ACTION,
      "X-TC-Timestamp": String(timestamp),
      "X-TC-Version": VERSION,
    },
    body: payload,
  });

  const resText = await res.text();
  if (!res.ok) throw new Error(resText || "API 请求失败");
  const json = JSON.parse(resText);
  if (json.Response?.Error) throw new Error(json.Response.Error.Message || "API 返回错误");
  return json.Response || null;
}

function extractMetrics(response: OverviewL7Response | null): EdgeOneMetrics {
  const metrics: EdgeOneMetrics = { flux: 0, request: 0, bandwidth: 0, hitFlux: 0 };
  if (!response?.Data?.length) return metrics;
  const typeValue = response.Data[0]?.TypeValue;
  if (!typeValue) return metrics;
  for (const m of typeValue) {
    if (m.MetricName === "l7Flow_flux") metrics.flux = m.Sum;
    else if (m.MetricName === "l7Flow_request") metrics.request = m.Sum;
    else if (m.MetricName === "l7Flow_bandwidth") metrics.bandwidth = m.Max;
    else if (m.MetricName === "l7Flow_hit_outFlux") metrics.hitFlux = m.Sum;
  }
  return metrics;
}

/** 同时获取当前和环比周期的数据 */
export async function fetchMetricsWithTrend(settings: EdgeOneSettings): Promise<{
  current: EdgeOneMetrics;
  previous: EdgeOneMetrics;
} | null> {
  const secretId = String(settings?.secretId ?? "").trim();
  const secretKey = String(settings?.secretKey ?? "").trim();
  if (!secretId || !secretKey) return null;

  const timeRange = settings?.timeRange === "today" ? "today" : "7days";
  const { current, previous } = getComparisonTimeRanges(timeRange);

  const [currRes, prevRes] = await Promise.all([
    doFetch(secretId, secretKey, current.startStr, current.endStr),
    doFetch(secretId, secretKey, previous.startStr, previous.endStr),
  ]);

  return {
    current: extractMetrics(currRes),
    previous: extractMetrics(prevRes),
  };
}

// ---------- 格式化工具 ----------
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
