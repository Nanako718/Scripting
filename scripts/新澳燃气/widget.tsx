import {
  AccessoryWidgetBackground,
  HStack,
  Image,
  Spacer,
  Text,
  VStack,
  Widget,
  ZStack,
  fetch,
} from "scripting"
import { SmallWidget, BarChart, formatDate } from "./small_widget"

const API_BASE = "https://wechatapp.ecej.com/livingpay/v3/xcx"
const SALT = "8796135e9f8349d998345f9f13d8bd95"
const SETTINGS_KEY = "xinao_gas_settings"
const CACHE_FILE = "xinao_gas_readings.json"
const PADDING = 14

// MD5
function md5(str: string): string {
  function L(k: number, d: number): number { return (k << d) | (k >>> (32 - d)) }
  function K(G: number, k: number): number {
    var I, d, F, H, x
    F = (G & 2147483648); H = (k & 2147483648); I = (G & 1073741824); d = (k & 1073741824)
    x = (G & 1073741823) + (k & 1073741823)
    if (I & d) return (x ^ 2147483648 ^ F ^ H)
    if (I | d) { if (x & 1073741824) return (x ^ 3221225472 ^ F ^ H); else return (x ^ 1073741824 ^ F ^ H) }
    else return (x ^ F ^ H)
  }
  function r(d: number, F: number, k: number): number { return (d & F) | ((~d) & k) }
  function q(d: number, F: number, k: number): number { return (d & k) | (F & (~k)) }
  function p(d: number, F: number, k: number): number { return (d ^ F ^ k) }
  function n(d: number, F: number, k: number): number { return (F ^ (d | (~k))) }
  function u(G: number, F: number, aa: number, Z: number, k: number, H: number, I: number): number {
    G = K(G, K(K(r(F, aa, Z), k), I)); return K(L(G, H), F)
  }
  function f(G: number, F: number, aa: number, Z: number, k: number, H: number, I: number): number {
    G = K(G, K(K(q(F, aa, Z), k), I)); return K(L(G, H), F)
  }
  function D(G: number, F: number, aa: number, Z: number, k: number, H: number, I: number): number {
    G = K(G, K(K(p(F, aa, Z), k), I)); return K(L(G, H), F)
  }
  function t(G: number, F: number, aa: number, Z: number, k: number, H: number, I: number): number {
    G = K(G, K(K(n(F, aa, Z), k), I)); return K(L(G, H), F)
  }
  function e(G: string): number[] {
    var k: number; var F = G.length; var x = F + 8; var Z = (x - (x % 64)) / 64; var H = (Z + 1) * 16
    var aa = Array(H - 1); var d = 0; var I = 0
    while (I < F) { k = (I - (I % 4)) / 4; d = (I % 4) * 8; aa[k] = (aa[k] | (G.charCodeAt(I) << d)); I++ }
    k = (I - (I % 4)) / 4; d = (I % 4) * 8; aa[k] = aa[k] | (128 << d); aa[H - 2] = F << 3; aa[H - 1] = F >>> 29; return aa
  }
  function B(x: number): string {
    var k = ""; var F: number = 0; var Z: number
    for (Z = 0; Z <= 3; Z++) { F = (x >>> (Z * 8)) & 255; var d = "0" + F.toString(16); k = k + d.substr(d.length - 2, 2) }
    return k
  }
  var C: number[] = []; var P: number, h: number, E: number, v: number, g: number, Y: number, X: number, V: number, U: number
  var S = 7, Q = 12, N = 17, M = 22; var A = 5, z = 9, y = 14, w = 20; var o = 4, m = 11, l = 16, j = 23; var W = 6, T = 10, R = 15, O = 21
  var i = e(str)
  Y = 1732584193; X = 4023233417; V = 2562383102; U = 271733878
  for (P = 0; P < i.length; P += 16) {
    h = Y; E = X; v = V; g = U
    Y = u(Y, X, V, U, i[P], S, 3614090360); U = u(U, Y, X, V, i[P + 1], Q, 3905402710)
    V = u(V, U, Y, X, i[P + 2], N, 606105819); X = u(X, V, U, Y, i[P + 3], M, 3250441966)
    Y = u(Y, X, V, U, i[P + 4], S, 4118548399); U = u(U, Y, X, V, i[P + 5], Q, 1200080426)
    V = u(V, U, Y, X, i[P + 6], N, 2821735955); X = u(X, V, U, Y, i[P + 7], M, 4249261313)
    Y = u(Y, X, V, U, i[P + 8], S, 1770035416); U = u(U, Y, X, V, i[P + 9], Q, 2336552879)
    V = u(V, U, Y, X, i[P + 10], N, 4294925233); X = u(X, V, U, Y, i[P + 11], M, 2304563134)
    Y = u(Y, X, V, U, i[P + 12], S, 1804603682); U = u(U, Y, X, V, i[P + 13], Q, 4254626195)
    V = u(V, U, Y, X, i[P + 14], N, 2792965006); X = u(X, V, U, Y, i[P + 15], M, 1236535329)
    Y = f(Y, X, V, U, i[P + 1], A, 4129170786); U = f(U, Y, X, V, i[P + 6], z, 3225465664)
    V = f(V, U, Y, X, i[P + 11], y, 643717713); X = f(X, V, U, Y, i[P], w, 3921069994)
    Y = f(Y, X, V, U, i[P + 5], A, 3593408605); U = f(U, Y, X, V, i[P + 10], z, 38016083)
    V = f(V, U, Y, X, i[P + 15], y, 3634488961); X = f(X, V, U, Y, i[P + 4], w, 3889429448)
    Y = f(Y, X, V, U, i[P + 9], A, 568446438); U = f(U, Y, X, V, i[P + 14], z, 3275163606)
    V = f(V, U, Y, X, i[P + 3], y, 4107603335); X = f(X, V, U, Y, i[P + 8], w, 1163531501)
    Y = f(Y, X, V, U, i[P + 13], A, 2850285829); U = f(U, Y, X, V, i[P + 2], z, 4243563512)
    V = f(V, U, Y, X, i[P + 7], y, 1735328473); X = f(X, V, U, Y, i[P + 12], w, 2368359562)
    Y = D(Y, X, V, U, i[P + 5], o, 4294588738); U = D(U, Y, X, V, i[P + 8], m, 2272392833)
    V = D(V, U, Y, X, i[P + 11], l, 1839030562); X = D(X, V, U, Y, i[P + 14], j, 4259657740)
    Y = D(Y, X, V, U, i[P + 1], o, 2763975236); U = D(U, Y, X, V, i[P + 4], m, 1272893353)
    V = D(V, U, Y, X, i[P + 7], l, 4139469664); X = D(X, V, U, Y, i[P + 10], j, 3200236656)
    Y = D(Y, X, V, U, i[P + 13], o, 681279174); U = D(U, Y, X, V, i[P], m, 3936430074)
    V = D(V, U, Y, X, i[P + 3], l, 3572445317); X = D(X, V, U, Y, i[P + 6], j, 76029189)
    Y = D(Y, X, V, U, i[P + 9], o, 3654602809); U = D(U, Y, X, V, i[P + 12], m, 3873151461)
    V = D(V, U, Y, X, i[P + 15], l, 530742520); X = D(X, V, U, Y, i[P + 2], j, 3299628645)
    Y = t(Y, X, V, U, i[P], W, 4096336452); U = t(U, Y, X, V, i[P + 7], T, 1126891415)
    V = t(V, U, Y, X, i[P + 14], R, 2878612391); X = t(X, V, U, Y, i[P + 5], O, 4237533241)
    Y = t(Y, X, V, U, i[P + 12], W, 1700485571); U = t(U, Y, X, V, i[P + 3], T, 2399980690)
    V = t(V, U, Y, X, i[P + 10], R, 4293915773); X = t(X, V, U, Y, i[P + 1], O, 2240044497)
    Y = t(Y, X, V, U, i[P + 8], W, 1873313359); U = t(U, Y, X, V, i[P + 15], T, 4264355552)
    V = t(V, U, Y, X, i[P + 6], R, 2734768916); X = t(X, V, U, Y, i[P + 13], O, 1309151649)
    Y = t(Y, X, V, U, i[P + 4], W, 4149444226); U = t(U, Y, X, V, i[P + 11], T, 3174756917)
    V = t(V, U, Y, X, i[P + 2], R, 718787259); X = t(X, V, U, Y, i[P + 9], O, 3951481745)
    Y = K(Y, h); X = K(X, E); V = K(V, v); U = K(U, g)
  }
  return (B(Y) + B(X) + B(V) + B(U)).toLowerCase()
}

function genAppKey(): string {
  const now = new Date()
  const pad = (n: number) => n < 10 ? "0" + n : "" + n
  const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  return ts + md5(ts + SALT)
}

function makeHeaders(token: string) {
  return {
    "Content-Type": "application/x-www-form-urlencoded",
    "token": token,
    "token-type": "2",
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 27_0 like Mac OS X)",
    "Referer": "https://servicewechat.com/wxd722317df8c566fe/258/page-frame.html",
  }
}

// ========== 日志 ==========

type LogEntry = {
  ts: string
  api: string
  ok: boolean
  detail: string
}

const LOG_KEY = "xinao_gas_logs"

function addLog(api: string, ok: boolean, detail: string) {
  try {
    const now = new Date()
    const pad = (n: number) => n < 10 ? "0" + n : "" + n
    const ts = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
    const entry: LogEntry = { ts, api, ok, detail }

    if (ok) {
      console.log(`┌─ [${ts}] API: ${api}`)
      console.log(`│  状态: 成功`)
      console.log(`└─ 数据: ${detail}`)
    } else {
      console.log(`┌─ [${ts}] API: ${api}`)
      console.log(`│  状态: 失败`)
      console.log(`└─ 原因: ${detail}`)
    }

    const existing = Storage.get<LogEntry[]>(LOG_KEY)
    const logs = Array.isArray(existing) ? existing : []
    logs.push(entry)
    Storage.set<LogEntry[]>(LOG_KEY, logs.slice(-20))
  } catch (_) { }
}

// ========== API ==========

async function getCards(token: string) {
  const appKey = genAppKey()
  const url = `${API_BASE}/getBingCardListV2.json`
  const body = `token=${token}&appKey=${appKey}&clientType=gaswx&moduleCode=0`
  const res = await fetch(url, {
    method: "POST",
    headers: makeHeaders(token),
    body,
  })
  const json = await res.json()
  const ok = json.resultCode === 200
  if (ok) {
    const count = json.data?.length ?? 0
    const cards = json.data?.map((c: any) => c.platformCardNo || c.cardNo || "?").join(", ") || "无"
    addLog("getBingCardListV2", true, `找到 ${count} 张卡: ${cards}`)
  } else {
    addLog("getBingCardListV2", false, json.message || "未知错误")
  }
  if (!ok) throw new Error(json.message || "获取卡列表失败")
  return json.data as any[]
}

async function getBill(token: string, companyCode: string, platformCardNo: string) {
  const appKey = genAppKey()
  const params = `token=${token}&clientType=gaswx&appKey=${appKey}&companyCode=${companyCode}&platformOnlyCardNo=${platformCardNo}`
  const url = `${API_BASE}/getBillV2.json?${params}`
  const res = await fetch(url, {
    method: "GET",
    headers: { "token": token, "token-type": "2", "Content-Type": "application/json;charset=UTF-8", "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 27_0 like Mac OS X)", "Referer": "https://servicewechat.com/wxd722317df8c566fe/258/page-frame.html" },
  })
  const json = await res.json()
  const ok = json.resultCode === 200
  if (ok) {
    const d = json.data || {}
    const balance = d.totalBalance ?? d.balance ?? 0
    const arrears = d.totalArrears ?? 0
    addLog("getBillV2", true, `余额: ¥${balance}, 欠费: ¥${arrears}`)
  } else {
    addLog("getBillV2", false, json.message || "未知错误")
  }
  if (!ok) throw new Error(json.message || "获取账单失败")
  return json.data
}

async function getMeterInfo(token: string, contractNo: string) {
  const appKey = genAppKey()
  const url = `${API_BASE}/iot/meterGasInfo.json`
  const body = `refreshFlag=false&appKey=${appKey}&clientType=gaswx&token=${token}&contractNo=${contractNo}`
  const res = await fetch(url, {
    method: "POST",
    headers: makeHeaders(token),
    body,
  })
  const json = await res.json()
  const ok = json.resultCode === 200
  if (ok) {
    const d = json.data || {}
    const monthTotal = d.currentMonthTotal ?? "null"
    const lastReading = d.lastReading ?? d.meterReading ?? "无"
    const meterNo = d.meterNo ?? d.meterNumber ?? "未知"
    addLog("meterGasInfo", true, `本月用气: ${monthTotal} m³, 表号: ${meterNo}, 上期读数: ${lastReading}`)
  } else {
    addLog("meterGasInfo", false, json.message || "未知错误")
  }
  if (!ok) return null
  return json.data
}

async function fetchTokenFromBoxJs(boxJsUrl: string): Promise<string | null> {
  try {
    const url = `${boxJsUrl.replace(/\/$/, "")}/query/data/xinao_gas.token`
    const response = await fetch(url, { headers: { "Accept": "application/json" } })
    if (response.ok) {
      const data = await response.json()
      const token = data?.val
      if (token && typeof token === "string" && token.trim()) return token.trim()
    }
  } catch (_) { }
  return null
}

// ========== 每日读数存储 ==========

type DailyReading = { date: string; value: number }

function todayStr(): string {
  const d = new Date()
  const pad = (n: number) => n < 10 ? "0" + n : "" + n
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function loadReadings(): DailyReading[] {
  try {
    const path = FileManager.appGroupDocumentsDirectory + "/" + CACHE_FILE
    if (FileManager.existsSync(path)) {
      const data = FileManager.readAsStringSync(path)
      const arr = JSON.parse(data)
      if (Array.isArray(arr)) return arr
    }
  } catch (_) { }
  return []
}

function saveReadings(readings: DailyReading[]) {
  try {
    const path = FileManager.appGroupDocumentsDirectory + "/" + CACHE_FILE
    // 只保留最近 31 天
    const trimmed = readings.slice(-31)
    FileManager.writeAsStringSync(path, JSON.stringify(trimmed))
  } catch (_) { }
}

function updateReadings(currentMonthTotal: number): DailyReading[] {
  const readings = loadReadings()
  const today = todayStr()
  const existing = readings.find(r => r.date === today)
  if (existing) {
    existing.value = currentMonthTotal
  } else {
    readings.push({ date: today, value: currentMonthTotal })
  }
  saveReadings(readings)
  return readings
}

function calcDeltas(readings: DailyReading[], count: number): { deltas: number[]; startDate: string; endDate: string } {
  const sorted = [...readings].sort((a, b) => a.date.localeCompare(b.date))
  const recent = sorted.slice(-(count + 1))
  const deltas: number[] = []
  for (let i = 1; i < recent.length; i++) {
    const d = recent[i].value - recent[i - 1].value
    deltas.push(d > 0 ? d : 0)
  }
  while (deltas.length < count) deltas.unshift(0)
  const result = deltas.slice(-count)
  const start = recent.length > 1 ? recent[1].date : todayStr()
  const end = recent.length > 0 ? recent[recent.length - 1].date : todayStr()
  return { deltas: result, startDate: start, endDate: end }
}

// ========== 缓存 ==========

const CACHE_KEY = "xinao_gas_cached_data"

type CachedData = {
  bill: any
  deltas: number[]
  usage: number
  avg: string
  startDate?: string
  endDate?: string
}

// ========== 中型组件 ==========

function MediumWidget({ bill, deltas, usage, avg, startDate, endDate, tokenExpired }: { bill: any; deltas: number[]; usage: number; avg: string; startDate?: string; endDate?: string; tokenExpired?: boolean }) {
  const balance = bill.totalBalance ?? bill.balance ?? 0
  const arrears = bill.totalArrears ?? 0
  const hasArrears = arrears > 0
  const displayBalance = hasArrears ? -arrears : balance
  const hasUsage = usage > 0
  const usageStr = hasUsage ? usage.toFixed(1) : "--"
  const statusColor = hasArrears ? "systemRed" : "systemGreen"

  const now = new Date()
  const endStr = endDate || todayStr()
  const startStr = startDate || (() => {
    const d = new Date(now.getTime() - 14 * 86400000)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  })()

  return (
    <ZStack alignment="leading">
      <AccessoryWidgetBackground />
      <VStack padding={{ leading: PADDING, trailing: PADDING, top: 18, bottom: 20 }} spacing={0}>
      {/* 顶部：标题 + 状态 */}
      <HStack frame={{ maxWidth: Infinity }}>
        <HStack spacing={4}>
          <Image systemName="flame.fill" foregroundStyle="#FF8C38" font="callout" />
          <Text font="callout" fontWeight="semibold" foregroundStyle="label">新澳燃气</Text>
        </HStack>
        <Spacer />
        {tokenExpired ? (
          <HStack spacing={4}>
            <Image systemName="exclamationmark.circle.fill" foregroundStyle="systemRed" font="caption2" />
            <Text font="caption2" foregroundStyle="systemRed">未登录</Text>
          </HStack>
        ) : (
          <HStack spacing={4}>
            <Image
              systemName={hasArrears ? "exclamationmark.circle.fill" : "checkmark.circle.fill"}
              foregroundStyle={statusColor}
              font="caption2"
            />
            <Text font="caption2" foregroundStyle={statusColor}>
              {hasArrears ? "有欠费" : "正常"}
            </Text>
          </HStack>
        )}
      </HStack>

      <Spacer minLength={10} />

      {/* 余额 + 用气数据 */}
      <HStack alignment="top" frame={{ maxWidth: Infinity }}>
        {/* 左侧：余额 */}
        <VStack alignment="leading" spacing={4}>
          <Text font="caption2" foregroundStyle="tertiaryLabel">余额</Text>
          <Text font="title2" fontWeight="bold" foregroundStyle={hasArrears ? "systemRed" : "label"}>
            {"¥" + displayBalance.toFixed(2)}
          </Text>
        </VStack>

        <Spacer />

        {/* 右侧：本月用气 + 日均 */}
        <VStack alignment="trailing" spacing={8}>
          <VStack alignment="trailing" spacing={2}>
            <Text font="caption2" foregroundStyle="tertiaryLabel">本月用气</Text>
            <Text font="callout" fontWeight="bold" foregroundStyle="label">
              {usageStr + " m³"}
            </Text>
          </VStack>
          <VStack alignment="trailing" spacing={2}>
            <Text font="caption2" foregroundStyle="tertiaryLabel">日均</Text>
            <Text font="callout" fontWeight="bold" foregroundStyle="label">
              {avg + " m³/天"}
            </Text>
          </VStack>
        </VStack>
      </HStack>

      <Spacer />

      {/* 底部：柱形图 + 日期 */}
      <VStack spacing={6}>
        <BarChart deltas={deltas} barHeight={24} />
        <HStack frame={{ maxWidth: Infinity }}>
          <Text font="caption2" foregroundStyle="tertiaryLabel">{formatDate(startStr)}</Text>
          <Spacer />
          <Text font="caption2" foregroundStyle="#FF8C38">{formatDate(endStr)}</Text>
        </HStack>
      </VStack>
      </VStack>
    </ZStack>
  )
}

// ========== 入口 ==========

async function main() {
  let token = ""
  const settings = Storage.get<{ enableBoxJs: boolean; boxJsUrl: string; token: string }>(SETTINGS_KEY)

  if (settings?.enableBoxJs && settings?.boxJsUrl) {
    const t = await fetchTokenFromBoxJs(settings.boxJsUrl)
    if (t) token = t
  }
  if (!token && settings?.token) token = settings.token
  if (!token) token = Widget.parameter || ""

  if (!token) {
    // 尝试使用缓存数据
    const cached = Storage.get<CachedData>(CACHE_KEY)
    if (cached) {
      const family = Widget.family
      if (family === "systemSmall") {
        Widget.present(<SmallWidget deltas={cached.deltas} usage={cached.usage} avg={cached.avg} startDate={cached.startDate} endDate={cached.endDate} />)
      } else {
        Widget.present(<MediumWidget bill={cached.bill} deltas={cached.deltas} usage={cached.usage} avg={cached.avg} startDate={cached.startDate} endDate={cached.endDate} tokenExpired={true} />)
      }
      return
    }
    Widget.present(
      <ZStack alignment="center">
        <AccessoryWidgetBackground />
        <VStack alignment="center" padding={PADDING}>
          <Image systemName="flame.fill" font="title" foregroundStyle="#FF8C38" />
          <Text font="caption" foregroundStyle="secondaryLabel" padding={{ top: 6 }}>
            请先打开应用配置 Token
          </Text>
        </VStack>
      </ZStack>
    )
    return
  }

  try {
    const cards = await getCards(token)
    if (!cards || cards.length === 0) {
      Widget.present(
        <ZStack alignment="center">
          <AccessoryWidgetBackground />
          <VStack alignment="center" padding={PADDING}>
            <Text foregroundStyle="secondaryLabel">未找到绑定的燃气卡</Text>
          </VStack>
        </ZStack>
      )
      return
    }

    const card = cards[0]
    const [bill, meter] = await Promise.all([
      getBill(token, card.companyCode, card.platformCardNo),
      getMeterInfo(token, card.contractNo),
    ])

    // 处理气量数据
    const monthTotal = meter?.currentMonthTotal
    const hasUsage = monthTotal != null && !isNaN(parseFloat(String(monthTotal))) && parseFloat(String(monthTotal)) > 0
    const usage = hasUsage ? parseFloat(String(monthTotal)) : 0
    const avg = hasUsage ? (usage / new Date().getDate()).toFixed(1) : "--"

    // 更新每日读数并计算差值
    let deltas: number[] = []
    let startDate = todayStr()
    let endDate = todayStr()
    if (hasUsage) {
      const readings = updateReadings(usage)
      const barCount = Widget.family === "systemSmall" ? 7 : 15
      const result = calcDeltas(readings, barCount)
      deltas = result.deltas
      startDate = result.startDate
      endDate = result.endDate
    } else {
      const barCount = Widget.family === "systemSmall" ? 7 : 15
      deltas = Array.from({ length: barCount }, () => 0)
    }

    // 缓存数据
    const cacheData: CachedData = { bill, deltas, usage, avg, startDate, endDate }
    Storage.set(CACHE_KEY, cacheData)

    const family = Widget.family
    if (family === "systemSmall") {
      Widget.present(<SmallWidget deltas={deltas} usage={usage} avg={avg} startDate={startDate} endDate={endDate} />)
    } else {
      Widget.present(<MediumWidget bill={bill} deltas={deltas} usage={usage} avg={avg} startDate={startDate} endDate={endDate} />)
    }
  } catch (e) {
    // 尝试使用缓存数据
    const cached = Storage.get<CachedData>(CACHE_KEY)
    if (cached) {
      const family = Widget.family
      if (family === "systemSmall") {
        Widget.present(<SmallWidget deltas={cached.deltas} usage={cached.usage} avg={cached.avg} startDate={cached.startDate} endDate={cached.endDate} />)
      } else {
        Widget.present(<MediumWidget bill={cached.bill} deltas={cached.deltas} usage={cached.usage} avg={cached.avg} startDate={cached.startDate} endDate={cached.endDate} tokenExpired={true} />)
      }
      return
    }
    Widget.present(
      <ZStack alignment="center">
        <AccessoryWidgetBackground />
        <VStack alignment="center" padding={PADDING}>
          <Image systemName="wifi.exclamationmark" font="title" foregroundStyle="systemRed" />
          <Text font="caption" foregroundStyle="secondaryLabel" padding={{ top: 6 }}>
            获取失败
          </Text>
          <Text font="caption2" foregroundStyle="tertiaryLabel">
            {(e as Error).message}
          </Text>
        </VStack>
      </ZStack>
    )
  }
}

main()
