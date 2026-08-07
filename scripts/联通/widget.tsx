import {
  Color,
  HStack,
  Image,
  Rectangle,
  Spacer,
  Text,
  VStack,
  Widget,
  WidgetReloadPolicy,
  fetch,
} from "scripting"

// 设置结构定义
type ChinaUnicomSettings = {
  cookie: string
  titleDayColor: string
  titleNightColor: string
  descDayColor: string
  descNightColor: string
  refreshTimeDayColor: string
  refreshTimeNightColor: string
  refreshInterval: number
  showFlow?: boolean
  showOtherFlow?: boolean
  otherFlowMatchType?: "flowType" | "addupItemCode"
  otherFlowMatchValue?: string
  enableBoxJs?: boolean
  boxJsUrl?: string
  chartMode?: "flow" | "voice"
}

const SETTINGS_KEY = "chinaUnicomSettings"
const CACHE_FILE = "china_unicom_readings.json"
const PADDING = 14

// API 地址
const API_URL = "https://m.client.10010.com/mobileserviceimportant/home/queryUserInfoSeven?version=iphone_c@10.0100&desmobiel=13232135179&showType=0"
const API_DETAIL_URL = "https://m.client.10010.com/servicequerybusiness/operationservice/queryOcsPackageFlowLeftContentRevisedInJune"

// 话费数据类型
type FeeData = {
  title: string
  balance: string
  unit: string
}

// 组件数据结构
type UnicomData = {
  fee: FeeData
  voice: { title: string; balance: string; unit: string; used?: number; total?: number }
  flow: { title: string; balance: string; unit: string; used?: number; total?: number }
  otherFlow?: { title: string; balance: string; unit: string; used?: number; total?: number }
}

// 详细 API 响应结构
type DetailApiResponse = {
  code: string
  resources?: Array<{
    type: string
    userResource: string
    remainResource: string
    details?: Array<{
      use: string
      total: string
      remain: string
      addUpItemName: string
      feePolicyName: string
      flowType?: string
      addupItemCode?: string
    }>
  }>
  canuseFlowAllUnit?: string
  canuseVoiceAllUnit?: string
  canuseSmsAllUnit?: string
  flowSumList?: Array<{
    flowtype: string
    xcanusevalue: string
    xusedvalue: string
    elemtype?: string
  }>
  fresSumList?: Array<{
    flowtype: string
    xcanusevalue: string
    xusedvalue: string
  }>
}

// ========== 日期工具 ==========

function todayStr(): string {
  const d = new Date()
  const pad = (n: number) => n < 10 ? "0" + n : "" + n
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function formatDate(dateStr: string): string {
  const parts = dateStr.split("-")
  if (parts.length < 3) return dateStr
  return parseInt(parts[1]) + "月" + parseInt(parts[2]) + "日"
}

// 格式化流量值
function formatFlowValue(value: number, unit: string = "MB"): { balance: string; unit: string } {
  if (value >= 1024) {
    return { balance: (value / 1024).toFixed(2), unit: "GB" }
  }
  return { balance: value.toFixed(2), unit }
}

// ========== 每日读数存储（与新澳燃气一致） ==========

type DailyReading = { date: string; flowValue: number; voiceValue: number }

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
    const trimmed = readings.slice(-31)
    FileManager.writeAsStringSync(path, JSON.stringify(trimmed))
  } catch (_) { }
}

function updateReadings(flowUsed: number, voiceUsed: number): DailyReading[] {
  const readings = loadReadings()
  const today = todayStr()
  const existing = readings.find(r => r.date === today)
  if (existing) {
    existing.flowValue = flowUsed
    existing.voiceValue = voiceUsed
  } else {
    readings.push({ date: today, flowValue: flowUsed, voiceValue: voiceUsed })
  }
  saveReadings(readings)
  return readings
}

function daysAgoDateStr(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  const pad = (n: number) => n < 10 ? "0" + n : "" + n
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function calcDeltas(readings: DailyReading[], count: number, mode: "flow" | "voice"): { deltas: number[]; startDate: string; endDate: string } {
  const sorted = [...readings].sort((a, b) => a.date.localeCompare(b.date))
  const endDate = todayStr()
  const startDate = daysAgoDateStr(count - 1)

  // 构建日期到读数的映射
  const map = new Map<string, DailyReading>()
  for (const r of sorted) map.set(r.date, r)

  // 按固定日期范围逐天计算差值
  const deltas: number[] = []
  for (let i = 0; i < count; i++) {
    const d = new Date()
    d.setDate(d.getDate() - (count - 1) + i)
    const pad = (n: number) => n < 10 ? "0" + n : "" + n
    const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    const prevDate = new Date(d)
    prevDate.setDate(prevDate.getDate() - 1)
    const prevStr = `${prevDate.getFullYear()}-${pad(prevDate.getMonth() + 1)}-${pad(prevDate.getDate())}`

    const curr = map.get(dateStr)
    const prev = map.get(prevStr)
    if (curr && prev) {
      const currVal = mode === "flow" ? curr.flowValue : curr.voiceValue
      const prevVal = mode === "flow" ? prev.flowValue : prev.voiceValue
      const diff = currVal - prevVal
      deltas.push(diff > 0 ? diff : 0)
    } else {
      deltas.push(0)
    }
  }

  return { deltas, startDate, endDate }
}

// ========== API ==========

// 从 BoxJs 读取 Cookie
async function fetchCookieFromBoxJs(boxJsUrl: string): Promise<string | null> {
  try {
    const url = `${boxJsUrl.replace(/\/$/, "")}/query/data/10010.cookie`
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    })
    if (response.ok) {
      const data = await response.json()
      const cookie = data?.val
      if (cookie && typeof cookie === 'string' && cookie.trim()) {
        return cookie.trim()
      }
    }
  } catch (error) {
    console.error("从 BoxJs 读取 Cookie 异常:", error)
  }
  return null
}

// 获取话费数据
async function fetchFeeData(cookie: string): Promise<FeeData | null> {
  try {
    const response = await fetch(API_URL, {
      headers: {
        'Host': 'm.client.10010.com',
        'User-Agent': 'ChinaUnicom.x CFNetwork iOS/16.3 unicom{version:iphone_c@10.0100}',
        'cookie': cookie,
      }
    })
    if (response.ok) {
      const data = await response.json()
      if (data.code === 'Y') {
        const { feeResource } = data
        return {
          title: feeResource?.dynamicFeeTitle || "余额",
          balance: feeResource?.feePersent || "0",
          unit: feeResource?.newUnit || "元",
        }
      }
    }
  } catch (error) {
    console.error("请求异常:", error)
  }
  return null
}

// 获取详细数据
async function fetchDetailData(cookie: string): Promise<DetailApiResponse | null> {
  try {
    const response = await fetch(API_DETAIL_URL, {
      headers: {
        'Host': 'm.client.10010.com',
        'User-Agent': 'ChinaUnicom.x CFNetwork iOS/16.3 unicom{version:iphone_c@10.0100}',
        'cookie': cookie,
      }
    })
    if (response.ok) {
      const data = await response.json()
      if (data.code === '0000' || data.code === 'Y') {
        return data as DetailApiResponse
      }
    }
  } catch (error) {
    console.error("获取详细数据失败:", error)
  }
  return null
}

// 从详细 API 提取语音和流量数据
function extractVoiceAndFlowData(detailData: DetailApiResponse): {
  voice: { title: string; balance: string; unit: string; used?: number; total?: number }
  flow: { title: string; balance: string; unit: string; used?: number; total?: number }
} | null {
  try {
    const voiceResource = detailData.resources?.find(r => r.type === "Voice")
    const voiceRemain = voiceResource?.remainResource || "0"
    const voiceUsed = voiceResource?.userResource || "0"
    const voiceTotal = parseFloat(voiceRemain) + parseFloat(voiceUsed)
    const voiceUnit = detailData.canuseVoiceAllUnit || "分钟"

    const generalFlow = detailData.flowSumList?.find(item => item.flowtype === "1")
    let flowRemainMB = 0
    let flowUsedMB = 0

    if (generalFlow?.xcanusevalue) {
      flowRemainMB = parseFloat(generalFlow.xcanusevalue)
      flowUsedMB = parseFloat(generalFlow.xusedvalue || "0")
    } else {
      const flowResource = detailData.resources?.find(r => r.type === "Flow")
      const remainStr = flowResource?.remainResource || "0"
      const usedStr = flowResource?.userResource || "0"
      const unit = detailData.canuseFlowAllUnit || "GB"
      if (unit === "MB") {
        flowRemainMB = parseFloat(remainStr)
        flowUsedMB = parseFloat(usedStr)
      } else if (unit === "GB") {
        flowRemainMB = parseFloat(remainStr) * 1024
        flowUsedMB = parseFloat(usedStr) * 1024
      }
    }

    const flowFormatted = formatFlowValue(flowRemainMB, "MB")
    const flowTotalMB = flowRemainMB + flowUsedMB

    return {
      voice: {
        title: "剩余语音",
        balance: voiceRemain,
        unit: voiceUnit,
        used: parseFloat(voiceUsed),
        total: voiceTotal,
      },
      flow: {
        title: "通用流量",
        balance: flowFormatted.balance,
        unit: flowFormatted.unit,
        used: flowUsedMB,
        total: flowTotalMB,
      },
    }
  } catch (error) {
    console.error("提取数据失败:", error)
    return null
  }
}

// ========== 柱形图（与新澳燃气一致） ==========

function BarChart({ deltas, barHeight }: { deltas: number[]; barHeight: number }) {
  const max = Math.max(...deltas, 0.1)
  const lastIndex = deltas.length - 1
  return (
    <HStack alignment="bottom" spacing={2} frame={{ height: barHeight }}>
      {deltas.map((d, i) => {
        const ratio = d / max
        const h = Math.max(ratio * barHeight, 2)
        const isLast = i === lastIndex
        const opacity = 0.2 + ratio * 0.35
        const color: Color = isLast ? "rgba(255,140,56,0.9)" : `rgba(160,160,170,${opacity})` as Color
        return (
          <Rectangle
            key={i}
            fill={color}
            frame={{ height: h, width: 10 }}
            clipShape={{ type: "rect", cornerRadius: 2, style: "continuous" }}
          />
        )
      })}
      <Spacer />
    </HStack>
  )
}

// ========== 中型组件 ==========

function MediumWidget({ data, settings, deltas, startDate, endDate }: { data: UnicomData; settings: ChinaUnicomSettings; deltas: number[]; startDate: string; endDate: string }) {
  const showFlow = settings?.showFlow !== false
  const hasOtherFlow = data.otherFlow != null

  const flowRemain =
    data.flow?.total != null && data.flow?.used != null
      ? Math.max(0, data.flow.total - data.flow.used)
      : 0
  const otherRemain =
    data.otherFlow?.total != null && data.otherFlow?.used != null
      ? Math.max(0, data.otherFlow.total - data.otherFlow.used)
      : 0
  const totalFlowFormatted = formatFlowValue(flowRemain + otherRemain, "MB")

  return (
    <VStack padding={{ leading: PADDING, trailing: PADDING, top: 18, bottom: 20 }} spacing={0}>
      {/* 顶部：标题 + 状态 */}
      <HStack frame={{ maxWidth: Infinity }}>
        <HStack spacing={4}>
          <Image imageUrl="https://raw.githubusercontent.com/Nanako718/Scripting/main/images/10010.png" resizable={true} frame={{ width: 16, height: 16 }} />
          <Text font="callout" fontWeight="semibold" foregroundStyle="label">中国联通</Text>
        </HStack>
        <Spacer />
        <HStack spacing={4}>
          <Image systemName="checkmark.circle.fill" foregroundStyle="systemGreen" font="caption2" />
          <Text font="caption2" foregroundStyle="systemGreen">正常</Text>
        </HStack>
      </HStack>

      <Spacer minLength={10} />

      {/* 余额 + 用量数据 */}
      <HStack alignment="top" frame={{ maxWidth: Infinity }}>
        {/* 左侧：余额 */}
        <VStack alignment="leading" spacing={4}>
          <Text font="caption2" foregroundStyle="tertiaryLabel">{data.fee.title}</Text>
          <Text font="title2" fontWeight="bold" foregroundStyle="label">
            {data.fee.balance + " " + data.fee.unit}
          </Text>
        </VStack>

        <Spacer />

        {/* 右侧：通用流量 + 其他流量(如有)/剩余语音 */}
        <VStack alignment="trailing" spacing={8}>
          <VStack alignment="trailing" spacing={2}>
            <Text font="caption2" foregroundStyle="tertiaryLabel">{data.flow.title}</Text>
            <Text font="callout" fontWeight="bold" foregroundStyle="label">
              {showFlow ? totalFlowFormatted.balance + " " + totalFlowFormatted.unit : "--"}
            </Text>
          </VStack>
          <VStack alignment="trailing" spacing={2}>
            <Text font="caption2" foregroundStyle="tertiaryLabel">
              {hasOtherFlow ? "其他流量" : data.voice.title}
            </Text>
            <Text font="callout" fontWeight="bold" foregroundStyle="label">
              {hasOtherFlow
                ? data.otherFlow!.balance + " " + data.otherFlow!.unit
                : data.voice.balance + " " + data.voice.unit}
            </Text>
          </VStack>
        </VStack>
      </HStack>

      <Spacer />

      {/* 底部：柱形图 + 日期 */}
      <VStack spacing={6}>
        <BarChart deltas={deltas} barHeight={24} />
        <HStack frame={{ maxWidth: Infinity }}>
        <Text font="caption2" foregroundStyle="tertiaryLabel">{formatDate(startDate)}</Text>
        <Spacer />
        <Text font="caption2" foregroundStyle="#FF8C38">{formatDate(endDate)}</Text>
      </HStack>
      </VStack>
    </VStack>
  )
}

// ========== 小型组件 ==========

function SmallWidget({ data, settings, deltas, startDate, endDate }: { data: UnicomData; settings: ChinaUnicomSettings; deltas: number[]; startDate: string; endDate: string }) {
  const showFlow = settings?.showFlow !== false

  const flowRemain =
    data.flow?.total != null && data.flow?.used != null
      ? Math.max(0, data.flow.total - data.flow.used)
      : 0
  const otherRemain =
    data.otherFlow?.total != null && data.otherFlow?.used != null
      ? Math.max(0, data.otherFlow.total - data.otherFlow.used)
      : 0
  const totalFlowFormatted = formatFlowValue(flowRemain + otherRemain, "MB")

  return (
    <VStack padding={{ leading: PADDING, trailing: PADDING, bottom: 18, top: 12 }} alignment="leading" spacing={4}>
      <Text font="caption" foregroundStyle="secondaryLabel">剩余流量</Text>
      <Text font="title3" fontWeight="bold" foregroundStyle="label">
        {showFlow ? totalFlowFormatted.balance + " " + totalFlowFormatted.unit : "--"}
      </Text>
      <Text font="caption2" foregroundStyle="tertiaryLabel">{"话费 " + data.fee.balance + " " + data.fee.unit}</Text>
      <Spacer />
      <VStack spacing={6}>
        <BarChart deltas={deltas} barHeight={50} />
        <HStack frame={{ maxWidth: Infinity }}>
          <Text font="caption2" foregroundStyle="tertiaryLabel">{formatDate(startDate)}</Text>
          <Spacer />
          <Text font="caption2" foregroundStyle="#FF8C38">{formatDate(endDate)}</Text>
        </HStack>
      </VStack>
    </VStack>
  )
}

// ========== 入口 ==========

async function main() {
  const settings = Storage.get<ChinaUnicomSettings>(SETTINGS_KEY)

  const refreshInterval = settings?.refreshInterval ?? 15
  const nextUpdate = new Date(Date.now() + refreshInterval * 60 * 1000)
  const reloadPolicy: WidgetReloadPolicy = {
    policy: "after",
    date: nextUpdate
  }

  let cookie = settings?.cookie || ""

  if (settings?.enableBoxJs && settings?.boxJsUrl) {
    const boxJsCookie = await fetchCookieFromBoxJs(settings.boxJsUrl)
    if (boxJsCookie) {
      cookie = boxJsCookie
    }
  }

  if (!cookie) {
    Widget.present(
      <VStack alignment="center" padding={PADDING}>
        <Image imageUrl="https://raw.githubusercontent.com/Nanako718/Scripting/main/images/10010.png" resizable={true} frame={{ width: 28, height: 28 }} />
        <Text font="caption" foregroundStyle="secondaryLabel" padding={{ top: 6 }}>
          请先打开应用配置 Cookie
        </Text>
      </VStack>,
      reloadPolicy
    )
    return
  }

  try {
    const [feeData, detailData] = await Promise.all([
      fetchFeeData(cookie),
      fetchDetailData(cookie)
    ])

    if (!feeData || !detailData) {
      Widget.present(
        <VStack alignment="center" padding={PADDING}>
          <Image systemName="wifi.exclamationmark" font="title" foregroundStyle="systemRed" />
          <Text font="caption" foregroundStyle="secondaryLabel" padding={{ top: 6 }}>
            获取数据失败
          </Text>
          <Text font="caption2" foregroundStyle="tertiaryLabel">请检查网络或 Cookie</Text>
        </VStack>,
        reloadPolicy
      )
      return
    }

    const voiceAndFlowData = extractVoiceAndFlowData(detailData)
    if (!voiceAndFlowData) {
      Widget.present(
        <VStack alignment="center" padding={PADDING}>
          <Text foregroundStyle="secondaryLabel">提取数据失败</Text>
        </VStack>,
        reloadPolicy
      )
      return
    }

    // 提取其他流量数据
    let otherFlowData: { title: string; balance: string; unit: string; used?: number; total?: number } | undefined
    const showOtherFlow = settings?.showOtherFlow ?? true
    const matchType = settings?.otherFlowMatchType ?? "flowType"
    const matchValue = settings?.otherFlowMatchValue ?? "3"

    if (showOtherFlow && detailData) {
      let totalRemainMB = 0
      let totalUsedMB = 0

      if (matchType === "flowType" && matchValue === "3") {
        const item = detailData.flowSumList?.find(item => item.flowtype === "3")
        if (item) {
          totalRemainMB = parseFloat(item.xcanusevalue || "0")
          totalUsedMB = parseFloat(item.xusedvalue || "0")
        }
      }

      if (totalRemainMB === 0 && matchType === "flowType") {
        const item = detailData.fresSumList?.find(item => item.flowtype === matchValue)
        if (item) {
          totalRemainMB = parseFloat(item.xcanusevalue || "0")
          totalUsedMB = parseFloat(item.xusedvalue || "0")
        }
      }

      if (totalRemainMB === 0) {
        const unit = detailData.canuseFlowAllUnit || "MB"
        detailData.resources?.find(r => r.type === "Flow")?.details?.forEach((detail: any) => {
          const match = matchType === "flowType"
            ? detail.flowType === matchValue
            : detail.addupItemCode === matchValue
          if (match && detail.remain) {
            const remain = parseFloat(detail.remain)
            const used = parseFloat(detail.use || "0")
            if (!isNaN(remain) && remain > 0) {
              if (unit === "MB") {
                totalRemainMB += remain
                totalUsedMB += used
              } else if (unit === "GB") {
                totalRemainMB += remain * 1024
                totalUsedMB += used * 1024
              }
            }
          }
        })
      }

      if (totalRemainMB > 0 || totalUsedMB > 0) {
        const formatted = formatFlowValue(totalRemainMB, "MB")
        otherFlowData = {
          title: "其他流量",
          balance: formatted.balance,
          unit: formatted.unit,
          used: totalUsedMB,
          total: totalRemainMB + totalUsedMB
        }
      }
    }

    const mergedData: UnicomData = {
      fee: feeData,
      voice: voiceAndFlowData.voice,
      flow: voiceAndFlowData.flow,
      otherFlow: otherFlowData,
    }

    // 更新每日读数并计算柱形图数据
    const flowUsed = (voiceAndFlowData.flow.used ?? 0) + (otherFlowData?.used ?? 0)
    const voiceUsed = voiceAndFlowData.voice.used ?? 0
    const readings = updateReadings(flowUsed, voiceUsed)

    const chartMode = settings?.chartMode ?? "flow"
    const barCount = Widget.family === "systemSmall" ? 7 : 15
    const { deltas, startDate, endDate } = calcDeltas(readings, barCount, chartMode)

    if (Widget.family === "systemSmall") {
      Widget.present(<SmallWidget data={mergedData} settings={settings!} deltas={deltas} startDate={startDate} endDate={endDate} />, reloadPolicy)
    } else {
      Widget.present(<MediumWidget data={mergedData} settings={settings!} deltas={deltas} startDate={startDate} endDate={endDate} />, reloadPolicy)
    }
  } catch (e) {
    Widget.present(
      <VStack alignment="center" padding={PADDING}>
        <Image systemName="wifi.exclamationmark" font="title" foregroundStyle="systemRed" />
        <Text font="caption" foregroundStyle="secondaryLabel" padding={{ top: 6 }}>
          获取失败
        </Text>
        <Text font="caption2" foregroundStyle="tertiaryLabel">
          {(e as Error).message}
        </Text>
      </VStack>,
      reloadPolicy
    )
  }
}

main()
