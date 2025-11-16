import {
  Widget,
  VStack,
  HStack,
  Text,
  Image,
  Color,
  Spacer,
  fetch,
  DynamicShapeStyle,
  WidgetReloadPolicy,
  ZStack,
  Gauge,
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
}

const SETTINGS_KEY = "chinaUnicomSettings"

// API 地址
const API_URL = "https://m.client.10010.com/mobileserviceimportant/home/queryUserInfoSeven?version=iphone_c@10.0100&desmobiel=13232135179&showType=0"
const API_DETAIL_URL = "https://m.client.10010.com/servicequerybusiness/operationservice/queryOcsPackageFlowLeftContentRevisedInJune"

// 组件数据结构
type UnicomData = {
  fee: { title: string; balance: string; unit: string }
  voice: { title: string; balance: string; unit: string; used?: number; total?: number }
  flow: { title: string; balance: string; unit: string; used?: number; total?: number }
  otherFlow?: { title: string; balance: string; unit: string; used?: number; total?: number }
}

// 话费数据类型
type FeeData = {
  title: string
  balance: string
  unit: string
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
        const feeData = {
          title: feeResource?.dynamicFeeTitle || "剩余话费",
          balance: feeResource?.feePersent || "0",
          unit: feeResource?.newUnit || "元",
        }
        console.log("💰 话费数据:", `${feeData.balance}${feeData.unit}`)
        return feeData
      } else {
        console.warn("⚠️ API 返回非成功状态:", data.code, data.msg || data.message)
      }
    } else {
      console.error("❌ HTTP 请求失败，状态码:", response.status)
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
        title: "剩余流量",
        balance: flowFormatted.balance,
        unit: flowFormatted.unit,
        used: flowUsedMB,
        total: flowTotalMB,
      },
    }
    
    console.log("📞 语音:", `已用${voiceUsed}${voiceUnit} 剩余${voiceRemain}${voiceUnit} 总计${voiceTotal}${voiceUnit}`)
    console.log("📶 通用流量:", `已用${formatFlowValue(flowUsedMB, "MB").balance}${formatFlowValue(flowUsedMB, "MB").unit} 剩余${flowFormatted.balance}${flowFormatted.unit} 总计${formatFlowValue(flowTotalMB, "MB").balance}${formatFlowValue(flowTotalMB, "MB").unit}`)
    
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

// 卡片主题配置
const cardThemes = {
  fee: {
    background: { light: "rgba(0, 122, 255, 0.15)", dark: "rgba(64, 156, 255, 0.2)" } as DynamicShapeStyle,
    iconColor: { light: "#007AFF", dark: "#5AC8FA" } as DynamicShapeStyle,
    titleColor: { light: "#0051D5", dark: "#7DB8FF" } as DynamicShapeStyle,
    descColor: { light: "#003D9E", dark: "#A8D0FF" } as DynamicShapeStyle,
    icon: "creditcard.fill"
  },
  voice: {
    background: { light: "rgba(52, 199, 89, 0.15)", dark: "rgba(48, 209, 88, 0.2)" } as DynamicShapeStyle,
    iconColor: { light: "#34C759", dark: "#30D158" } as DynamicShapeStyle,
    titleColor: { light: "#248A3D", dark: "#5FE877" } as DynamicShapeStyle,
    descColor: { light: "#1A5F2A", dark: "#7FEB9A" } as DynamicShapeStyle,
    icon: "phone.fill"
  },
  flow: {
    background: { light: "rgba(255, 149, 0, 0.15)", dark: "rgba(255, 159, 10, 0.2)" } as DynamicShapeStyle,
    iconColor: { light: "#FF9500", dark: "#FF9F0A" } as DynamicShapeStyle,
    titleColor: { light: "#CC7700", dark: "#FFB84D" } as DynamicShapeStyle,
    descColor: { light: "#995500", dark: "#FFD180" } as DynamicShapeStyle,
    icon: "antenna.radiowaves.left.and.right"
  },
  otherFlow: {
    background: { light: "rgba(175, 82, 222, 0.15)", dark: "rgba(191, 90, 242, 0.2)" } as DynamicShapeStyle,
    iconColor: { light: "#AF52DE", dark: "#BF5AF2" } as DynamicShapeStyle,
    titleColor: { light: "#8B41B1", dark: "#D19FF5" } as DynamicShapeStyle,
    descColor: { light: "#6B3185", dark: "#E3BFF8" } as DynamicShapeStyle,
    icon: "wifi.circle.fill"
  }
}

// 可复用卡片组件
function DataCard({
  title,
  value,
  unit,
  theme,
  titleStyle,
  descStyle,
  showLogo,
  progressUsed,
  progressTotal
}: {
  title: string
  value: string
  unit: string
  theme: typeof cardThemes.fee
  titleStyle: DynamicShapeStyle
  descStyle: DynamicShapeStyle
  showLogo?: boolean
  progressUsed?: number
  progressTotal?: number
}) {
  const showProgress = progressUsed !== undefined && progressTotal !== undefined && progressTotal > 0
  const progressPercentage = showProgress ? progressUsed / progressTotal! : 0
  const percentageText = showProgress ? `${Math.round(progressPercentage * 100)}%` : "0%"
  const cardTitleStyle = theme.titleColor || titleStyle
  const cardDescStyle = theme.descColor || descStyle
  
  return (
    <ZStack>
      <VStack
        alignment="center"
        padding={{ top: 8, leading: 6, bottom: 8, trailing: 6 }}
        frame={{ minWidth: 0, maxWidth: Infinity }}
        widgetBackground={{
          style: theme.background,
          shape: {
            type: "rect",
            cornerRadius: 8,
            style: "continuous"
          }
        }}
      >
        <Image 
          systemName={theme.icon} 
          font={13}
          fontWeight="medium"
          foregroundStyle={theme.iconColor} 
        />
        <Spacer minLength={3} />
        <VStack alignment="center" spacing={2}>
          <Text 
            font={8} 
            fontWeight="medium" 
            foregroundStyle={cardTitleStyle}
            lineLimit={1}
            minScaleFactor={0.8}
          >{title}</Text>
          <Text
            font={13}
            fontWeight="bold"
            foregroundStyle={cardDescStyle}
            lineLimit={1}
            minScaleFactor={0.7}
          >{`${value}${unit}`}</Text>
        </VStack>
      </VStack>
      {showProgress ? (
        <VStack alignment="center">
          <Spacer />
          <VStack
            alignment="center"
            frame={{ width: 28, height: 28 }}
          >
            <Gauge
              value={progressPercentage}
              min={0}
              max={1}
              label={<Text font={1}> </Text>}
              currentValueLabel={
                <Text 
                  font={10}
                  fontWeight="semibold"
                  foregroundStyle={theme.descColor || descStyle}
                >
                  {percentageText}
                </Text>
              }
              gaugeStyle="accessoryCircularCapacity"
              tint={theme.iconColor}
              scaleEffect={0.7}
            />
          </VStack>
          <Spacer />
        </VStack>
      ) : null}
      {showLogo ? (
        <VStack alignment="center">
          <Spacer />
          <Image 
            imageUrl="https://raw.githubusercontent.com/Enjoyee/Scriptable/v2/img/ic_logo_10010.png" 
            frame={{ width: 32, height: 32 }} 
            resizable 
          />
          <Spacer />
        </VStack>
      ) : null}
    </ZStack>
  )
}

// 小尺寸组件卡片
function SmallDataCard({
  title,
  value,
  unit,
  theme,
  titleStyle,
  descStyle,
  showLogo,
  useLogoAsIcon
}: {
  title: string
  value: string
  unit: string
  theme: typeof cardThemes.fee
  titleStyle: DynamicShapeStyle
  descStyle: DynamicShapeStyle
  showLogo?: boolean
  useLogoAsIcon?: boolean
}) {
  const cardTitleStyle = theme.titleColor || titleStyle
  const cardDescStyle = theme.descColor || descStyle
  
  return (
    <ZStack>
      <HStack
        alignment="center"
        padding={{ top: 6, leading: 8, bottom: 6, trailing: 8 }}
        spacing={6}
        frame={{ minWidth: 0, maxWidth: Infinity }}
        widgetBackground={{
          style: theme.background,
          shape: {
            type: "rect",
            cornerRadius: 8,
            style: "continuous"
          }
        }}
      >
        <HStack alignment="center" frame={{ width: 20, height: 20 }}>
          {useLogoAsIcon ? (
            <Image 
              imageUrl="https://raw.githubusercontent.com/Enjoyee/Scriptable/v2/img/ic_logo_10010.png" 
              frame={{ width: 16, height: 16 }} 
              resizable 
            />
          ) : (
            <Image 
              systemName={theme.icon} 
              font={12}
              fontWeight="medium"
              foregroundStyle={theme.iconColor} 
            />
          )}
        </HStack>
        <VStack alignment="leading" spacing={2} frame={{ minWidth: 0, maxWidth: Infinity }}>
          <Text 
            font={9} 
            fontWeight="medium" 
            foregroundStyle={cardTitleStyle}
            lineLimit={1}
            minScaleFactor={0.8}
          >
            {title}
          </Text>
          <Text
            font={14}
            fontWeight="bold"
            foregroundStyle={cardDescStyle}
            lineLimit={1}
            minScaleFactor={0.7}
          >
            {`${value}${unit}`}
          </Text>
        </VStack>
        {showLogo && !useLogoAsIcon ? (
          <HStack alignment="center" frame={{ width: 20, height: 20 }}>
            <Image 
              imageUrl="https://raw.githubusercontent.com/Enjoyee/Scriptable/v2/img/ic_logo_10010.png" 
              frame={{ width: 16, height: 16 }} 
              resizable 
            />
          </HStack>
        ) : null}
      </HStack>
    </ZStack>
  )
}

// 小尺寸组件视图
function SmallWidgetView({ data, titleStyle, descStyle }: { 
  data: UnicomData
  titleStyle: DynamicShapeStyle
  descStyle: DynamicShapeStyle
}) {
  // 计算总流量剩余（通用流量 + 其他流量）
  const flowRemain = (data.flow?.total && data.flow?.used !== undefined) 
    ? Math.max(0, data.flow.total - data.flow.used) : 0
  const otherFlowRemain = (data.otherFlow?.total && data.otherFlow?.used !== undefined)
    ? Math.max(0, data.otherFlow.total - data.otherFlow.used) : 0
  const totalFlowFormatted = formatFlowValue(flowRemain + otherFlowRemain, "MB")
  
  return (
    <VStack alignment="leading" padding={{ top: 8, leading: 8, bottom: 8, trailing: 8 }} spacing={6}>
      <SmallDataCard
        title={data.fee.title}
        value={data.fee.balance}
        unit={data.fee.unit}
        theme={cardThemes.fee}
        titleStyle={titleStyle}
        descStyle={descStyle}
        useLogoAsIcon={true}
      />
      <SmallDataCard
        title="剩余总流量"
        value={totalFlowFormatted.balance}
        unit={totalFlowFormatted.unit}
        theme={cardThemes.flow}
        titleStyle={titleStyle}
        descStyle={descStyle}
      />
      <SmallDataCard
        title={data.voice.title}
        value={data.voice.balance}
        unit="MIN"
        theme={cardThemes.voice}
        titleStyle={titleStyle}
        descStyle={descStyle}
      />
    </VStack>
  )
}

function WidgetView({ data, settings }: { data: UnicomData; settings: ChinaUnicomSettings }) {
  const titleStyle: DynamicShapeStyle = {
    light: settings.titleDayColor,
    dark: settings.titleNightColor,
  }
  const descStyle: DynamicShapeStyle = {
    light: settings.descDayColor,
    dark: settings.descNightColor,
  }
  const refreshTimeStyle: DynamicShapeStyle = {
    light: settings.refreshTimeDayColor,
    dark: settings.refreshTimeNightColor,
  }

  if (Widget.family === "systemSmall") {
    return <SmallWidgetView data={data} titleStyle={titleStyle} descStyle={descStyle} />
  }

  return (
    <ZStack>
      <VStack alignment="leading" padding={{ top: 10, leading: 10, bottom: 10, trailing: 10 }} spacing={8}>
        <HStack alignment="center" spacing={6}>
          <DataCard
            title={data.fee.title}
            value={data.fee.balance}
            unit={data.fee.unit}
            theme={cardThemes.fee}
            titleStyle={titleStyle}
            descStyle={descStyle}
            showLogo={true}
          />
          <DataCard
            title={data.voice.title}
            value={data.voice.balance}
            unit={data.voice.unit}
            theme={cardThemes.voice}
            titleStyle={titleStyle}
            descStyle={descStyle}
            progressUsed={data.voice.used}
            progressTotal={data.voice.total}
          />
          {settings?.showFlow !== false ? (
            <DataCard
              title={data.flow.title}
              value={data.flow.balance}
              unit={data.flow.unit}
              theme={cardThemes.flow}
              titleStyle={titleStyle}
              descStyle={descStyle}
              progressUsed={data.flow.used}
              progressTotal={data.flow.total}
            />
          ) : null}
          {data.otherFlow && settings?.showOtherFlow !== false ? (
            <DataCard
              title={data.otherFlow.title}
              value={data.otherFlow.balance}
              unit={data.otherFlow.unit}
              theme={cardThemes.otherFlow}
              titleStyle={titleStyle}
              descStyle={descStyle}
              progressUsed={data.otherFlow.used}
              progressTotal={data.otherFlow.total}
            />
          ) : null}
        </HStack>
        
        <Spacer />
      </VStack>
      <VStack>
        <Spacer />
        <HStack alignment="center" padding={{ leading: 10, trailing: 10, bottom: 8 }}>
          <HStack alignment="center" spacing={4}>
            <Image 
              systemName="arrow.clockwise" 
              font={9}
              fontWeight="medium"
              foregroundStyle={refreshTimeStyle} 
            />
            <Text font={10} fontWeight="medium" foregroundStyle={refreshTimeStyle}>
              {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })}
            </Text>
          </HStack>
          <Spacer />
        </HStack>
      </VStack>
    </ZStack>
  )
}

async function render() {
  const settings = Storage.get<ChinaUnicomSettings>(SETTINGS_KEY)
  
  const refreshInterval = settings?.refreshInterval ?? 15
  const nextUpdate = new Date(Date.now() + refreshInterval * 60 * 1000)
  const reloadPolicy: WidgetReloadPolicy = {
    policy: "after",
    date: nextUpdate
  }

  if (!settings || !settings.cookie) {
    Widget.present(<Text>请先在主应用中设置联通 Cookie。</Text>, reloadPolicy)
    return
  }

  // 并行获取两个 API 数据
  const [feeData, detailData] = await Promise.all([
    fetchFeeData(settings.cookie),
    fetchDetailData(settings.cookie)
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
    let totalRemain = 0
    let totalUsed = 0
    
    // 方法1：从 flowSumList 获取（flowtype="3"）
    if (matchType === "flowType" && matchValue === "3") {
      const item = detailData.flowSumList?.find(item => item.flowtype === "3")
      if (item) {
        totalRemain = parseFloat(item.xcanusevalue || "0")
        totalUsed = parseFloat(item.xusedvalue || "0")
      }
    }
    
    // 方法2：从 fresSumList 获取
    if (totalRemain === 0 && matchType === "flowType") {
      const item = detailData.fresSumList?.find(item => item.flowtype === matchValue)
      if (item) {
        totalRemain = parseFloat(item.xcanusevalue || "0")
        totalUsed = parseFloat(item.xusedvalue || "0")
      }
    }
    
    // 方法3：从 resources 计算
    if (totalRemain === 0) {
      detailData.resources?.find(r => r.type === "Flow")?.details?.forEach((detail: any) => {
        const match = matchType === "flowType" 
          ? detail.flowType === matchValue
          : detail.addupItemCode === matchValue
        
        if (match && detail.remain) {
          const remain = parseFloat(detail.remain)
          const used = parseFloat(detail.use || "0")
          if (!isNaN(remain) && remain > 0) {
            totalRemain += remain
            totalUsed += used
          }
        }
      })
    }
    
    if (totalRemain > 0 || totalUsed > 0) {
      const unit = detailData.canuseFlowAllUnit || "MB"
      const formatted = formatFlowValue(totalRemain, unit)
      const totalMB = totalRemain + totalUsed
      
      otherFlowData = {
        title: "其他流量",
        balance: formatted.balance,
        unit: formatted.unit,
        used: totalUsed,
        total: totalMB
      }
      
      console.log("🌐 其他流量:", 
        `已用${formatFlowValue(totalUsed, unit).balance}${formatFlowValue(totalUsed, unit).unit} ` +
        `剩余${formatted.balance}${formatted.unit} ` +
        `总计${formatFlowValue(totalMB, unit).balance}${formatFlowValue(totalMB, unit).unit}`
      )
    }
  }

  const mergedData: UnicomData = {
    fee: feeData,
    voice: voiceAndFlowData.voice,
    flow: voiceAndFlowData.flow,
    otherFlow: otherFlowData,
  }

  Widget.present(<WidgetView data={mergedData} settings={settings} />, reloadPolicy)
}

render()