import {
  Widget,
  VStack,
  HStack,
  Text,
  Image,
  Color,
  Spacer,
  fetch,
  WidgetReloadPolicy,
  DynamicShapeStyle,
} from "scripting"

// 设置结构定义
type ChinaUnicomSettings = {
  cookie: string
  titleDayColor: Color
  titleNightColor: Color
  descDayColor: Color
  descNightColor: Color
  refreshTimeDayColor: Color
  refreshTimeNightColor: Color
  refreshInterval: number
  showFlow?: boolean
  showOtherFlow?: boolean
  otherFlowMatchType?: "flowType" | "addupItemCode"
  otherFlowMatchValue?: string
  enableBoxJs?: boolean
  boxJsUrl?: string
}

const SETTINGS_KEY = "chinaUnicomSettings"

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
  // 流量汇总列表：flowtype=1通用流量，2定向流量，3其他流量
  flowSumList?: Array<{
    flowtype: string      // 流量类型
    xcanusevalue: string  // 剩余流量（MB）
    xusedvalue: string    // 已用流量（MB）
    elemtype?: string
  }>
  fresSumList?: Array<{
    flowtype: string
    xcanusevalue: string
    xusedvalue: string
  }>
}

// 从 BoxJs 读取 Cookie
async function fetchCookieFromBoxJs(boxJsUrl: string): Promise<string | null> {
  try {
    const url = `${boxJsUrl.replace(/\/$/, "")}/query/data/10010.cookie`

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      // BoxJs 返回格式: { "key": "10010.cookie", "val": "cookie值" }
      const cookie = data?.val
      if (cookie && typeof cookie === 'string' && cookie.trim()) {
        return cookie.trim()
      }
    }
  } catch (error) {
    console.error("🚨 从 BoxJs 读取 Cookie 异常:", error)
  }
  return null
}

// 获取话费数据（仅从第一个 API）
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
        const feeData: FeeData = {
          title: feeResource?.dynamicFeeTitle || "剩余话费",
          balance: feeResource?.feePersent || "0",
          unit: feeResource?.newUnit || "元",
        }
        return feeData
      }
    }
  } catch (error) {
    console.error("🚨 请求异常:", error)
  }
  return null
}

// 获取详细数据（从第二个 API）
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
    console.error("❌ 获取详细数据失败:", error)
  }
  return null
}

// 从详细 API 提取语音和流量数据
function extractVoiceAndFlowData(detailData: DetailApiResponse): {
  voice: { title: string; balance: string; unit: string; used?: number; total?: number }
  flow: { title: string; balance: string; unit: string; used?: number; total?: number }
} | null {
  try {
    // 提取语音数据
    const voiceResource = detailData.resources?.find(r => r.type === "Voice")
    const voiceRemain = voiceResource?.remainResource || "0"
    const voiceUsed = voiceResource?.userResource || "0"
    const voiceTotal = parseFloat(voiceRemain) + parseFloat(voiceUsed)
    const voiceUnit = detailData.canuseVoiceAllUnit || "分钟"
    
    // 提取流量数据：优先从 flowSumList 获取通用流量（flowtype="1"）
    const generalFlow = detailData.flowSumList?.find(item => item.flowtype === "1")
    let flowRemainMB = 0
    let flowUsedMB = 0
    
    if (generalFlow?.xcanusevalue) {
      flowRemainMB = parseFloat(generalFlow.xcanusevalue)
      flowUsedMB = parseFloat(generalFlow.xusedvalue || "0")
    } else {
      // 兼容：从 resources 获取
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
    
    const result = {
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

    return result
  } catch (error) {
    console.error("❌ 提取数据失败:", error)
    return null
  }
}

// 格式化流量值（自动转换单位）
function formatFlowValue(value: number, unit: string = "MB"): { balance: string; unit: string } {
  if (value >= 1024) {
    return {
      balance: (value / 1024).toFixed(2),
      unit: "GB"
    }
  }
  return {
    balance: value.toFixed(2),
    unit
  }
}

const theme = {
  bg: { light: "#F2F2F7", dark: "#000000" } as DynamicShapeStyle,
  card: { light: "#FFFFFF", dark: "#1C1C1E" } as DynamicShapeStyle,
  text: { light: "#000000", dark: "#FFFFFF" } as DynamicShapeStyle,
  secondary: { light: "#8E8E93", dark: "#8E8E93" } as DynamicShapeStyle,
  green: { light: "#34C759", dark: "#30D158" } as DynamicShapeStyle,
  blue: { light: "#007AFF", dark: "#0A84FF" } as DynamicShapeStyle,
  orange: { light: "#FF9500", dark: "#FF9F0A" } as DynamicShapeStyle,
  purple: { light: "#AF52DE", dark: "#BF5AF2" } as DynamicShapeStyle,
}

const WIDGET_INSET = 12
const CARD_GAP = 6

function continuousRectShape(cornerRadius: number) {
  return {
    type: "rect" as const,
    cornerRadius,
    style: "continuous" as const,
  }
}

function widgetContainerCornerRadius(): number {
  const { width, height } = Widget.displaySize
  const shortEdge = Math.min(width, height)
  return Math.round(Math.min(24, Math.max(18, shortEdge * 0.14)))
}

function metricCardCornerRadius(compact?: boolean): number {
  const outer = widgetContainerCornerRadius()
  const ratio = compact ? 0.5 : 0.55
  return Math.round(Math.max(10, Math.min(14, outer * ratio)))
}

function WidgetInsetBody({ children }: { children: any }) {
  return (
    <VStack
      frame={{ maxWidth: Infinity, maxHeight: Infinity }}
      padding={WIDGET_INSET}
      spacing={CARD_GAP}
    >
      {children}
    </VStack>
  )
}

function MetricCard({
  icon,
  label,
  parts,
  color,
  compact,
}: {
  icon: string
  label: string
  parts: { val: string; unit: string }
  color: DynamicShapeStyle
  compact?: boolean
}) {
  const valFont = compact ? 14 : 17
  const unitFont = compact ? 9 : 10
  const labelFont = compact ? 8 : 9
  const iconFont = compact ? 9 : 10

  return (
    <VStack
      alignment="leading"
      spacing={compact ? 4 : 6}
      padding={compact ? 8 : 10}
      frame={{ minWidth: 0, maxWidth: Infinity, maxHeight: Infinity }}
      widgetBackground={{
        style: theme.card,
        shape: continuousRectShape(metricCardCornerRadius(compact)),
      }}
    >
      <HStack alignment="center" spacing={4}>
        <Image systemName={icon} font={iconFont} foregroundStyle={color} />
        <Text font={labelFont} fontWeight="semibold" foregroundStyle={theme.secondary} lineLimit={1}>
          {label}
        </Text>
        <Spacer minLength={0} />
      </HStack>
      <HStack alignment="lastTextBaseline" spacing={2}>
        <Text font={valFont} fontWeight="bold" foregroundStyle={theme.text} lineLimit={1} minScaleFactor={0.7}>
          {parts.val}
        </Text>
        {parts.unit ? (
          <Text
            font={unitFont}
            fontWeight="semibold"
            foregroundStyle={theme.secondary}
            lineLimit={1}
            padding={{ bottom: 1 }}
          >
            {parts.unit}
          </Text>
        ) : null}
      </HStack>
    </VStack>
  )
}

function MediumWidgetView({ data, settings }: { data: UnicomData; settings: ChinaUnicomSettings }) {
  const showFlow = settings?.showFlow !== false
  const showOther = settings?.showOtherFlow !== false && data.otherFlow

  const flowParts = showFlow
    ? { val: data.flow.balance, unit: data.flow.unit }
    : { val: "—", unit: "" }

  const otherParts = showOther
    ? { val: data.otherFlow!.balance, unit: data.otherFlow!.unit }
    : { val: "—", unit: "" }

  return (
    <VStack
      frame={{ maxWidth: Infinity, maxHeight: Infinity }}
      widgetBackground={{
        style: theme.bg,
        shape: continuousRectShape(widgetContainerCornerRadius()),
      }}
    >
      <WidgetInsetBody>
        <HStack spacing={CARD_GAP} frame={{ maxWidth: Infinity, maxHeight: Infinity }}>
          <MetricCard
            icon="creditcard.fill"
            label={data.fee.title}
            parts={{ val: data.fee.balance, unit: data.fee.unit }}
            color={theme.green}
          />
          <MetricCard
            icon="phone.fill"
            label={data.voice.title}
            parts={{ val: data.voice.balance, unit: data.voice.unit }}
            color={theme.blue}
          />
        </HStack>
        <HStack spacing={CARD_GAP} frame={{ maxWidth: Infinity, maxHeight: Infinity }}>
          <MetricCard
            icon="antenna.radiowaves.left.and.right"
            label={data.flow.title}
            parts={flowParts}
            color={theme.orange}
          />
          <MetricCard
            icon="wifi.circle.fill"
            label={data.otherFlow?.title ?? "其他流量"}
            parts={otherParts}
            color={theme.purple}
          />
        </HStack>
      </WidgetInsetBody>
    </VStack>
  )
}

function SmallWidgetView({ data, settings }: { data: UnicomData; settings: ChinaUnicomSettings }) {
  const flowRemain =
    data.flow?.total != null && data.flow?.used != null
      ? Math.max(0, data.flow.total - data.flow.used)
      : 0
  const otherRemain =
    data.otherFlow?.total != null && data.otherFlow?.used != null
      ? Math.max(0, data.otherFlow.total - data.otherFlow.used)
      : 0
  const totalFlowFormatted = formatFlowValue(flowRemain + otherRemain, "MB")

  const showFlow = settings?.showFlow !== false

  return (
    <VStack
      frame={{ maxWidth: Infinity, maxHeight: Infinity }}
      widgetBackground={{
        style: theme.bg,
        shape: continuousRectShape(widgetContainerCornerRadius()),
      }}
    >
      <WidgetInsetBody>
        <MetricCard
          icon="creditcard.fill"
          label={data.fee.title}
          parts={{ val: data.fee.balance, unit: data.fee.unit }}
          color={theme.green}
          compact
        />
        <MetricCard
          icon="antenna.radiowaves.left.and.right"
          label="剩余总流量"
          parts={showFlow ? { val: totalFlowFormatted.balance, unit: totalFlowFormatted.unit } : { val: "—", unit: "" }}
          color={theme.orange}
          compact
        />
        <MetricCard
          icon="phone.fill"
          label={data.voice.title}
          parts={{ val: data.voice.balance, unit: data.voice.unit }}
          color={theme.blue}
          compact
        />
      </WidgetInsetBody>
    </VStack>
  )
}

function WidgetView({ data, settings }: { data: UnicomData; settings: ChinaUnicomSettings }) {
  if (Widget.family === "systemSmall") {
    return <SmallWidgetView data={data} settings={settings} />
  }
  return <MediumWidgetView data={data} settings={settings} />
}

async function render() {
  const settings = Storage.get<ChinaUnicomSettings>(SETTINGS_KEY)
  
  const refreshInterval = settings?.refreshInterval ?? 15
  const nextUpdate = new Date(Date.now() + refreshInterval * 60 * 1000)
  const reloadPolicy: WidgetReloadPolicy = {
    policy: "after",
    date: nextUpdate
  }

  // 确定使用的 Cookie：如果开启了 BoxJs，优先从 BoxJs 读取
  let cookie = settings?.cookie || ""
  
  if (settings?.enableBoxJs && settings?.boxJsUrl) {
    const boxJsCookie = await fetchCookieFromBoxJs(settings.boxJsUrl)
    if (boxJsCookie) {
      cookie = boxJsCookie
    }
  }

  if (!cookie) {
    Widget.present(<Text>请先在主应用中设置联通 Cookie，或配置 BoxJs 地址。</Text>, reloadPolicy)
    return
  }

  // 并行获取两个 API 数据
  const [feeData, detailData] = await Promise.all([
    fetchFeeData(cookie),
    fetchDetailData(cookie)
  ])

  if (!feeData || !detailData) {
    Widget.present(<Text>获取数据失败，请检查网络或 Cookie。</Text>, reloadPolicy)
    return
  }

  const voiceAndFlowData = extractVoiceAndFlowData(detailData)
  if (!voiceAndFlowData) {
    Widget.present(<Text>提取数据失败。</Text>, reloadPolicy)
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
    
    // 方法1：从 flowSumList 获取（flowtype="3"）
    // flowSumList 中的值单位是 MB
    if (matchType === "flowType" && matchValue === "3") {
      const item = detailData.flowSumList?.find(item => item.flowtype === "3")
      if (item) {
        totalRemainMB = parseFloat(item.xcanusevalue || "0")
        totalUsedMB = parseFloat(item.xusedvalue || "0")
      }
    }
    
    // 方法2：从 fresSumList 获取
    // fresSumList 中的值单位也是 MB
    if (totalRemainMB === 0 && matchType === "flowType") {
      const item = detailData.fresSumList?.find(item => item.flowtype === matchValue)
      if (item) {
        totalRemainMB = parseFloat(item.xcanusevalue || "0")
        totalUsedMB = parseFloat(item.xusedvalue || "0")
      }
    }
    
    // 方法3：从 resources 计算
    // resources 中的值需要根据 canuseFlowAllUnit 判断单位
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
      const totalMB = totalRemainMB + totalUsedMB
      
      otherFlowData = {
        title: "其他流量",
        balance: formatted.balance,
        unit: formatted.unit,
        used: totalUsedMB,
        total: totalMB
      }
    }
  }

  const mergedData: UnicomData = {
    fee: feeData,
    voice: voiceAndFlowData.voice,
    flow: voiceAndFlowData.flow,
    otherFlow: otherFlowData,
  }

  // 确保 settings 不为 null
  if (!settings) {
    Widget.present(<Text>请先在主应用中设置联通 Cookie，或配置 BoxJs 地址。</Text>, reloadPolicy)
    return
  }

  Widget.present(<WidgetView data={mergedData} settings={settings} />, reloadPolicy)
}

render()