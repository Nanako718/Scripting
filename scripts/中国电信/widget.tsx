import {
  Widget,
  VStack,
  HStack,
  Text,
  Image,
  Color,
  Spacer,
  Rectangle,
  WidgetReloadPolicy,
  fetch,
} from "scripting"
import { getSettings, queryImportantData } from "./telecomApi"

const SETTINGS_KEY = "chinaTelecomSettings"
const CACHE_FILE = "china_telecom_readings.json"
const PADDING = 14
const LOGO_URL = "https://raw.githubusercontent.com/Nanako718/Scripting/refs/heads/main/images/10000.png"
const LOGO_CACHE_KEY = "chinaTelecom_logo_path"

// ========== 数据结构 ==========

type TelecomData = {
  fee: { title: string; balance: string; unit: string }
  voice: { title: string; balance: string; unit: string; used?: number; total?: number }
  flow: { title: string; balance: string; unit: string; used?: number; total?: number }
  otherFlow?: { title: string; balance: string; unit: string; used?: number; total?: number }
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

// ========== 每日读数存储 ==========

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

  const map = new Map<string, DailyReading>()
  for (const r of sorted) map.set(r.date, r)

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

// ========== Logo ==========

async function getLogoPath(): Promise<string | null> {
  try {
    const cachedPath = Storage.get<string>(LOGO_CACHE_KEY)
    if (cachedPath && FileManager.existsSync(cachedPath)) {
      return cachedPath
    }

    const response = await fetch(LOGO_URL)
    if (!response.ok) return null

    const imageData = await response.arrayBuffer()
    const fileName = "chinaTelecom_logo.png"
    const tempDir = FileManager.temporaryDirectory
    const filePath = `${tempDir}/${fileName}`
    const uint8Array = new Uint8Array(imageData)
    FileManager.writeAsBytesSync(filePath, uint8Array)
    Storage.set(LOGO_CACHE_KEY, filePath)

    return filePath
  } catch (_) {
    return null
  }
}

// ========== 数据转换 ==========

function convertToTelecomData(apiData: any): TelecomData {
  const responseData = apiData.responseData?.data
  if (!responseData) {
    throw new Error("API 响应数据格式不正确")
  }

  const balanceInfo = responseData.balanceInfo
  const indexBalanceDataInfo = balanceInfo?.indexBalanceDataInfo
  const phoneBillRegion = balanceInfo?.phoneBillRegion

  let balance = parseFloat(indexBalanceDataInfo?.balance || "0")
  const arrear = parseFloat(indexBalanceDataInfo?.arrear || "0")

  let feeTitle = "剩余话费"
  let feeValue = balance

  if (arrear > 0) {
    feeTitle = "账户余额"
    feeValue = balance - arrear
  } else if (balance === 0 && phoneBillRegion?.subTitleHh) {
    const realTimeFee = parseFloat(phoneBillRegion.subTitleHh.replace("元", "") || "0")
    if (realTimeFee > 0) {
      feeTitle = "实时费用"
      feeValue = realTimeFee
    }
  }

  const feeData = {
    title: feeTitle,
    balance: feeValue.toFixed(2),
    unit: "元"
  }

  const voiceInfo = responseData.voiceInfo
  const voiceDataInfo = voiceInfo?.voiceDataInfo
  const voiceBalance = parseFloat(voiceDataInfo?.balance || "0")
  const voiceUsed = parseFloat(voiceDataInfo?.used || "0")
  const voiceTotal = parseFloat(voiceDataInfo?.total || "0")
  const voiceData = {
    title: "剩余语音",
    balance: voiceBalance.toFixed(0),
    unit: "分钟",
    used: voiceUsed,
    total: voiceTotal > 0 ? voiceTotal : (voiceUsed + voiceBalance)
  }

  const flowInfo = responseData.flowInfo
  const commonFlow = flowInfo?.commonFlow
  const commonBalanceBytes = parseFloat(commonFlow?.balance || "0")
  const commonUsedBytes = parseFloat(commonFlow?.used || "0")
  const commonBalanceMB = commonBalanceBytes / 1024
  const commonUsedMB = commonUsedBytes / 1024
  const commonTotalMB = commonBalanceMB + commonUsedMB

  const flowFormatted = formatFlowValue(commonBalanceMB, "MB")
  const flowData = {
    title: "通用流量",
    balance: flowFormatted.balance,
    unit: flowFormatted.unit,
    used: commonUsedMB,
    total: commonTotalMB
  }

  const specialAmount = flowInfo?.specialAmount
  let otherFlowData: { title: string; balance: string; unit: string; used?: number; total?: number } | undefined
  if (specialAmount) {
    const specialBalanceBytes = parseFloat(specialAmount.balance || "0")
    const specialUsedBytes = parseFloat(specialAmount.used || "0")
    const specialBalanceMB = specialBalanceBytes / 1024
    const specialUsedMB = specialUsedBytes / 1024
    const specialTotalMB = specialBalanceMB + specialUsedMB

    if (specialBalanceMB > 0 || specialUsedMB > 0) {
      const otherFlowFormatted = formatFlowValue(specialBalanceMB, "MB")
      otherFlowData = {
        title: "其他流量",
        balance: otherFlowFormatted.balance,
        unit: otherFlowFormatted.unit,
        used: specialUsedMB,
        total: specialTotalMB
      }
    }
  }

  return {
    fee: feeData,
    voice: voiceData,
    flow: flowData,
    otherFlow: otherFlowData
  }
}

// ========== 柱形图 ==========

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

function MediumWidget({ data, deltas, startDate, endDate }: { data: TelecomData; deltas: number[]; startDate: string; endDate: string }) {
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
          <Image imageUrl={LOGO_URL} resizable={true} frame={{ width: 16, height: 16 }} />
          <Text font="callout" fontWeight="semibold" foregroundStyle="label">中国电信</Text>
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
              {totalFlowFormatted.balance + " " + totalFlowFormatted.unit}
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

function SmallWidget({ data, deltas, startDate, endDate }: { data: TelecomData; deltas: number[]; startDate: string; endDate: string }) {
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
        {totalFlowFormatted.balance + " " + totalFlowFormatted.unit}
      </Text>
      <Text font="caption2" foregroundStyle="tertiaryLabel">{data.fee.title + " " + data.fee.balance + " " + data.fee.unit}</Text>
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

async function render() {
  const refreshInterval = 15
  const nextUpdate = new Date(Date.now() + refreshInterval * 60 * 1000)
  const reloadPolicy: WidgetReloadPolicy = {
    policy: "after",
    date: nextUpdate
  }

  const settings = getSettings()
  if (!settings || !settings.mobile || !settings.password) {
    Widget.present(
      <VStack alignment="center" padding={PADDING}>
        <Image imageUrl={LOGO_URL} resizable={true} frame={{ width: 28, height: 28 }} />
        <Text font="caption" foregroundStyle="secondaryLabel" padding={{ top: 6 }}>
          请先在主应用中设置手机号和密码
        </Text>
      </VStack>,
      reloadPolicy
    )
    return
  }

  try {
    const logoPath = await getLogoPath()
    const apiData = await queryImportantData()
    const telecomData = convertToTelecomData(apiData)

    // 更新每日读数并计算柱形图数据
    const flowUsed = (telecomData.flow.used ?? 0) + (telecomData.otherFlow?.used ?? 0)
    const voiceUsed = telecomData.voice.used ?? 0
    const readings = updateReadings(flowUsed, voiceUsed)

    const chartMode: "flow" | "voice" = "flow"
    const barCount = Widget.family === "systemSmall" ? 7 : 15
    const { deltas, startDate, endDate } = calcDeltas(readings, barCount, chartMode)

    if (Widget.family === "systemSmall") {
      Widget.present(<SmallWidget data={telecomData} deltas={deltas} startDate={startDate} endDate={endDate} />, reloadPolicy)
    } else {
      Widget.present(<MediumWidget data={telecomData} deltas={deltas} startDate={startDate} endDate={endDate} />, reloadPolicy)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("渲染失败:", errorMessage)
    Widget.present(
      <VStack alignment="center" padding={PADDING}>
        <Image systemName="wifi.exclamationmark" font="title" foregroundStyle="systemRed" />
        <Text font="caption" foregroundStyle="secondaryLabel" padding={{ top: 6 }}>
          获取数据失败
        </Text>
        <Text font="caption2" foregroundStyle="tertiaryLabel">{errorMessage}</Text>
      </VStack>,
      reloadPolicy
    )
  }
}

render()
