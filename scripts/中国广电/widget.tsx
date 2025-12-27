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
type ChinaRadioSettings = {
  access: string
  data: string
  cookie: string
  body?: string
  titleDayColor: Color
  titleNightColor: Color
  descDayColor: Color
  descNightColor: Color
  refreshTimeDayColor: Color
  refreshTimeNightColor: Color
  refreshInterval: number
  enableBoxJs?: boolean
  boxJsUrl?: string
  enableLog?: boolean
}

const SETTINGS_KEY = "chinaRadioSettings"

// API 地址
const API_URL = "https://app.10099.com.cn/contact-web/api/busi/qryUserInfo"

// 组件数据结构
type RadioData = {
  fee: { title: string; balance: string; unit: string }
  voice: { title: string; balance: string; unit: string; used?: number; total?: number }
  flow: { title: string; balance: string; unit: string; used?: number; total?: number }
  packName?: string
}

// API 响应结构
type ApiResponse = {
  status: string
  message: string
  data?: {
    respDesc: string
    userData?: {
      voice: number
      flowUserd: number
      voiceAll: number
      fee: number
      finBalance: string
      flowAll: number
      voiceUsed: number
      flow: number
      packName: string
      openDate: string
      sms: number
    }
    respCode: string
  }
  timestamp: number
  ok: boolean
}

// 从 BoxJs 读取配置
async function fetchConfigFromBoxJs(boxJsUrl: string): Promise<{ access: string | null; data: string | null; cookie: string | null; body: string | null }> {
  try {
    const baseUrl = boxJsUrl.replace(/\/$/, "")
    const [accessRes, dataRes, cookieRes, bodyRes] = await Promise.all([
      fetch(`${baseUrl}/query/data/10099.access`, {
        headers: { 'Accept': 'application/json' }
      }),
      fetch(`${baseUrl}/query/data/10099.data`, {
        headers: { 'Accept': 'application/json' }
      }),
      fetch(`${baseUrl}/query/data/10099.cookie`, {
        headers: { 'Accept': 'application/json' }
      }),
      fetch(`${baseUrl}/query/data/10099.body`, {
        headers: { 'Accept': 'application/json' }
      })
    ])
    
    const access = accessRes.ok ? (await accessRes.json())?.val : null
    const data = dataRes.ok ? (await dataRes.json())?.val : null
    const cookie = cookieRes.ok ? (await cookieRes.json())?.val : null
    const body = bodyRes.ok ? (await bodyRes.json())?.val : null
    
    if (access && data && cookie) {
      return { access, data, cookie, body }
    }
  } catch (error) {
    // Ignore errors
  }
  return { access: null, data: null, cookie: null, body: null }
}

// 获取原始 API 响应
async function fetchRawApiResponse(access: string, data: string, cookie: string, body?: string): Promise<string | null> {
  try {
    const requestBody = body || ""
    
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      'priority': 'u=3, i',
      'access': access,
      'accept': '*/*',
      't5hhv8ah': data,
      'accept-encoding': 'gzip, deflate, br',
      'user-agent': 'ChinaRadio/2.0.5 (iPhone; iOS 26.3; Scale/3.00)',
      'cookie': cookie,
      'accept-language': 'zh-Hans-CN;q=1',
    }
    
    if (requestBody) {
      headers['content-length'] = String(requestBody.length)
    }
    
    const response = await fetch(API_URL, {
      method: "POST",
      headers,
      body: requestBody,
    })

    if (response.ok) {
      const rawText = await response.text()
      return rawText
    }
  } catch (error) {
    // Ignore errors
  }
  return null
}

// 获取用户数据
async function fetchUserData(access: string, data: string, cookie: string, body?: string): Promise<RadioData | null> {
  try {
    // body 是 base64 编码的字符串，直接使用，不要 JSON.stringify
    // 如果没有 body，使用空字符串（而不是空 JSON）
    const requestBody = body || ""
    
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      'priority': 'u=3, i',
      'access': access,
      'accept': '*/*',
      't5hhv8ah': data,
      'accept-encoding': 'gzip, deflate, br',
      'user-agent': 'ChinaRadio/2.0.5 (iPhone; iOS 26.3; Scale/3.00)',
      'cookie': cookie,
      'accept-language': 'zh-Hans-CN;q=1',
    }
    
    // 设置 content-length（body 存在时）
    if (requestBody) {
      headers['content-length'] = String(requestBody.length)
    }
    
    const response = await fetch(API_URL, {
      method: "POST",
      headers,
      body: requestBody,
    })

    if (response.ok) {
      const data: ApiResponse = await response.json()
      
      if (data.status === "000000" && data.data?.userData) {
        const userData = data.data.userData
        
        // 话费数据（单位：元）
        const fee = parseFloat(userData.finBalance || "0")
        const feeData = {
          title: "剩余话费",
          balance: fee.toFixed(2),
          unit: "元",
        }
        
        // 语音数据（单位：分钟）
        const voiceTotal = userData.voiceAll || 0
        const voiceUsed = userData.voiceUsed || 0
        const voiceRemain = userData.voice || 0
        const voiceData = {
          title: "剩余语音",
          balance: voiceRemain.toString(),
          unit: "分钟",
          used: voiceUsed,
          total: voiceTotal,
        }
        
        // 流量数据（单位：KB，需要转换为MB/GB）
        const flowTotalKB = userData.flowAll || 0
        const flowUsedKB = userData.flowUserd || 0
        const flowRemainKB = userData.flow || 0
        
        const flowTotalMB = flowTotalKB / 1024
        const flowUsedMB = flowUsedKB / 1024
        const flowRemainMB = flowRemainKB / 1024
        
        const flowFormatted = formatFlowValue(flowRemainMB, "MB")
        const flowData = {
          title: "剩余流量",
          balance: flowFormatted.balance,
          unit: flowFormatted.unit,
          used: flowUsedMB,
          total: flowTotalMB,
        }
        
        return {
          fee: feeData,
          voice: voiceData,
          flow: flowData,
          packName: userData.packName,
        }
      }
    }
  } catch (error) {
    // Ignore errors
  }
  return null
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

// 卡片主题配置 - Catppuccin Macchiato 配色方案（参考群晖监控）
const cardThemes = {
  fee: {
    background: { light: "rgba(30, 102, 245, 0.12)", dark: "rgba(138, 173, 244, 0.18)" } as DynamicShapeStyle,
    iconColor: { light: "#1E66F5", dark: "#8aadf4" } as DynamicShapeStyle,
    titleColor: { light: "#6E738D", dark: "#a5adce" } as DynamicShapeStyle,
    descColor: { light: "#4C4F69", dark: "#cad3f5" } as DynamicShapeStyle,
    icon: "creditcard.fill"
  },
  voice: {
    background: { light: "rgba(136, 57, 239, 0.12)", dark: "rgba(198, 160, 246, 0.18)" } as DynamicShapeStyle,
    iconColor: { light: "#8839EF", dark: "#c6a0f6" } as DynamicShapeStyle,
    titleColor: { light: "#6E738D", dark: "#a5adce" } as DynamicShapeStyle,
    descColor: { light: "#4C4F69", dark: "#cad3f5" } as DynamicShapeStyle,
    icon: "phone.fill"
  },
  flow: {
    background: { light: "rgba(254, 100, 11, 0.12)", dark: "rgba(245, 169, 127, 0.18)" } as DynamicShapeStyle,
    iconColor: { light: "#FE640B", dark: "#f5a97f" } as DynamicShapeStyle,
    titleColor: { light: "#6E738D", dark: "#a5adce" } as DynamicShapeStyle,
    descColor: { light: "#4C4F69", dark: "#cad3f5" } as DynamicShapeStyle,
    icon: "antenna.radiowaves.left.and.right"
  },
  flowUsed: {
    background: { light: "rgba(23, 146, 153, 0.12)", dark: "rgba(125, 196, 228, 0.18)" } as DynamicShapeStyle,
    iconColor: { light: "#179299", dark: "#7dc4e4" } as DynamicShapeStyle,
    titleColor: { light: "#6E738D", dark: "#a5adce" } as DynamicShapeStyle,
    descColor: { light: "#4C4F69", dark: "#cad3f5" } as DynamicShapeStyle,
    icon: "arrow.up.arrow.down"
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
            cornerRadius: 15,
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
            imageUrl="https://raw.githubusercontent.com/Nanako718/Scripting/main/images/10099.png" 
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
            cornerRadius: 12,
            style: "continuous"
          }
        }}
      >
        <HStack alignment="center" frame={{ width: 20, height: 20 }}>
          {useLogoAsIcon ? (
            <Image 
              imageUrl="https://raw.githubusercontent.com/Nanako718/Scripting/main/images/10099.png" 
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
              imageUrl="https://raw.githubusercontent.com/Nanako718/Scripting/main/images/10099.png" 
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
  data: RadioData
  titleStyle: DynamicShapeStyle
  descStyle: DynamicShapeStyle
}) {
  // Catppuccin Macchiato 配色方案（参考群晖监控）
  const bgColor: DynamicShapeStyle = {
    light: "#EFF1F5", // Latte Base
    dark: "#24273a",  // Macchiato Base
  }
  
  return (
    <ZStack
      frame={{ maxWidth: Infinity, maxHeight: Infinity }}
      widgetBackground={{
        style: bgColor,
        shape: {
          type: "rect",
          cornerRadius: 24,
          style: "continuous",
        },
      }}
    >
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
          title={data.flow.title}
          value={data.flow.balance}
          unit={data.flow.unit}
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
    </ZStack>
  )
}

function WidgetView({ data, settings }: { data: RadioData; settings: ChinaRadioSettings }) {
  const titleStyle: DynamicShapeStyle = {
    light: settings.titleDayColor,
    dark: settings.titleNightColor,
  }
  const descStyle: DynamicShapeStyle = {
    light: settings.descDayColor,
    dark: settings.descNightColor,
  }

  if (Widget.family === "systemSmall") {
    return <SmallWidgetView data={data} titleStyle={titleStyle} descStyle={descStyle} />
  }

  const flowUsedFormatted = data.flow.used ? formatFlowValue(data.flow.used, "MB") : null
  
  // Catppuccin Macchiato 配色方案（参考群晖监控）
  const bgColor: DynamicShapeStyle = {
    light: "#EFF1F5", // Latte Base
    dark: "#24273a",  // Macchiato Base
  }
  
  return (
    <ZStack
      frame={{ maxWidth: Infinity, maxHeight: Infinity }}
      widgetBackground={{
        style: bgColor,
        shape: {
          type: "rect",
          cornerRadius: 24,
          style: "continuous",
        },
      }}
    >
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
          {flowUsedFormatted && data.flow.used && data.flow.total ? (
            <DataCard
              title="已用流量"
              value={flowUsedFormatted.balance}
              unit={flowUsedFormatted.unit}
              theme={cardThemes.flowUsed}
              titleStyle={titleStyle}
              descStyle={descStyle}
              progressUsed={data.flow.used}
              progressTotal={data.flow.total}
            />
          ) : null}
        </HStack>
      </VStack>
    </ZStack>
  )
}

async function render() {
  const settings = Storage.get<ChinaRadioSettings>(SETTINGS_KEY)
  
  const refreshInterval = settings?.refreshInterval ?? 15
  const nextUpdate = new Date(Date.now() + refreshInterval * 60 * 1000)
  const reloadPolicy: WidgetReloadPolicy = {
    policy: "after",
    date: nextUpdate
  }

  // 确定使用的配置：如果开启了 BoxJs，优先从 BoxJs 读取
  let access = settings?.access || ""
  let data = settings?.data || ""
  let cookie = settings?.cookie || ""
  let body = settings?.body || ""
  
  if (settings?.enableBoxJs && settings?.boxJsUrl) {
    const boxJsConfig = await fetchConfigFromBoxJs(settings.boxJsUrl)
    if (boxJsConfig.access && boxJsConfig.data && boxJsConfig.cookie) {
      access = boxJsConfig.access
      data = boxJsConfig.data
      cookie = boxJsConfig.cookie
      body = boxJsConfig.body || body
    }
  }

  if (!access || !data || !cookie) {
    Widget.present(<Text>请先在主应用中设置中国广电的 access、data 和 Cookie，或配置 BoxJs 地址。</Text>, reloadPolicy)
    return
  }

  // 如果开启了日志模式，获取并输出原始 API 响应
  if (settings?.enableLog) {
    const rawResponse = await fetchRawApiResponse(access, data, cookie, body)
    if (rawResponse) {
      console.log("=== API 原始响应 ===")
      console.log(rawResponse)
      console.log("==================")
    }
  }

  const userData = await fetchUserData(access, data, cookie, body)

  if (!userData) {
    Widget.present(<Text>获取数据失败，请检查网络或配置。</Text>, reloadPolicy)
    return
  }

  // 确保 settings 不为 null
  if (!settings) {
    Widget.present(<Text>请先在主应用中设置中国广电的配置，或配置 BoxJs 地址。</Text>, reloadPolicy)
    return
  }

  Widget.present(<WidgetView data={userData} settings={settings} />, reloadPolicy)
}

render()

