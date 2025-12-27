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
  titleDayColor: Color
  titleNightColor: Color
  descDayColor: Color
  descNightColor: Color
  refreshTimeDayColor: Color
  refreshTimeNightColor: Color
  refreshInterval: number
  enableBoxJs?: boolean
  boxJsUrl?: string
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
async function fetchConfigFromBoxJs(boxJsUrl: string): Promise<{ access: string | null; data: string | null; cookie: string | null }> {
  try {
    const baseUrl = boxJsUrl.replace(/\/$/, "")
    const [accessRes, dataRes, cookieRes] = await Promise.all([
      fetch(`${baseUrl}/query/data/10099.access`, {
        headers: { 'Accept': 'application/json' }
      }),
      fetch(`${baseUrl}/query/data/10099.data`, {
        headers: { 'Accept': 'application/json' }
      }),
      fetch(`${baseUrl}/query/data/10099.cookie`, {
        headers: { 'Accept': 'application/json' }
      })
    ])
    
    const access = accessRes.ok ? (await accessRes.json())?.val : null
    const data = dataRes.ok ? (await dataRes.json())?.val : null
    const cookie = cookieRes.ok ? (await cookieRes.json())?.val : null
    
    if (access && data && cookie) {
      console.log("✅ 从 BoxJs 成功读取配置")
      return { access, data, cookie }
    }
  } catch (error) {
    console.error("🚨 从 BoxJs 读取配置异常:", error)
  }
  return { access: null, data: null, cookie: null }
}

// 获取用户数据
async function fetchUserData(access: string, data: string, cookie: string): Promise<RadioData | null> {
  try {
    // 构建请求体（base64编码的数据）
    // 这里需要根据实际请求构建，但为了简化，我们直接使用原始请求
    const body = "ewogICJkYXRhIiA6ICJVeXU0anNNSHV1QjQ2cXlcL1dyVFNNSWFFV3BLXC90ZXowY0tRNFJVRUZqaW5TeTJ6QzFsZkRGaEtMTzBEeGNtWlFJUVFHWXdFeUxoQU5KTGxtTEt6a3NmQkMrbjJKTkVudjgyUHR3cUUrU0liK1ZtVzV0bkg5WTdKQVY4dzJvektcL29uQ2h3SlwvbHVDc2pTOFpMWTVKc3FkUnVjXC9cL0k4NVZjcGtyNkpyYm0zdkNKS1NZY2tJaVpBNjhpN2NMVUM5eXp0a3J4RWlTRjRFV2N0Vk81bUNQTis0U0pBdkhWRHRFSFhJYUJFT3BlRVR4UUg0MFJLOUpvXC9Nb0N3RHdOUzRmMDB0dnFCMDdOS0c2MVE1akc5QitHaktnd1I1RXlSZ001VmFjaGErRGZ5b1R4ZHhjajBEZWlDc0MxMXFnVERqVERKQklERFwvY3JlY2VKXC8zVDEwTHBJbWc9PSIKfQ=="
    
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        'content-length': '370',
        'content-type': 'application/json',
        'priority': 'u=3, i',
        'access': access,
        'accept': '*/*',
        't5hhv8ah': data,
        'accept-encoding': 'gzip, deflate, br',
        'user-agent': 'ChinaRadio/2.0.5 (iPhone; iOS 26.3; Scale/3.00)',
        'cookie': cookie,
        'accept-language': 'zh-Hans-CN;q=1',
      },
      body: body,
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
        
        console.log("💰 话费数据:", `${feeData.balance}${feeData.unit}`)
        console.log("📞 语音:", `已用${voiceUsed}分钟 剩余${voiceRemain}分钟 总计${voiceTotal}分钟`)
        console.log("📶 流量:", `已用${formatFlowValue(flowUsedMB, "MB").balance}${formatFlowValue(flowUsedMB, "MB").unit} 剩余${flowFormatted.balance}${flowFormatted.unit} 总计${formatFlowValue(flowTotalMB, "MB").balance}${formatFlowValue(flowTotalMB, "MB").unit}`)
        
        return {
          fee: feeData,
          voice: voiceData,
          flow: flowData,
          packName: userData.packName,
        }
      } else {
        console.warn("⚠️ API 返回非成功状态:", data.status, data.message)
      }
    } else {
      console.error("❌ HTTP 请求失败，状态码:", response.status)
    }
  } catch (error) {
    console.error("🚨 请求异常:", error)
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

// 卡片主题配置 - Catppuccin 配色方案
const cardThemes = {
  fee: {
    background: { light: "rgba(140, 170, 238, 0.12)", dark: "rgba(140, 170, 238, 0.18)" } as DynamicShapeStyle,
    iconColor: { light: "#8caaee", dark: "#8caaee" } as DynamicShapeStyle,
    titleColor: { light: "#737994", dark: "#99d1db" } as DynamicShapeStyle,
    descColor: { light: "#51576d", dark: "#c6d0f5" } as DynamicShapeStyle,
    icon: "creditcard.fill"
  },
  voice: {
    background: { light: "rgba(166, 209, 137, 0.12)", dark: "rgba(166, 209, 137, 0.18)" } as DynamicShapeStyle,
    iconColor: { light: "#a6d189", dark: "#a6d189" } as DynamicShapeStyle,
    titleColor: { light: "#626880", dark: "#81c8be" } as DynamicShapeStyle,
    descColor: { light: "#51576d", dark: "#c6d0f5" } as DynamicShapeStyle,
    icon: "phone.fill"
  },
  flow: {
    background: { light: "rgba(239, 159, 118, 0.12)", dark: "rgba(239, 159, 118, 0.18)" } as DynamicShapeStyle,
    iconColor: { light: "#ef9f76", dark: "#ef9f76" } as DynamicShapeStyle,
    titleColor: { light: "#737994", dark: "#e5c890" } as DynamicShapeStyle,
    descColor: { light: "#51576d", dark: "#c6d0f5" } as DynamicShapeStyle,
    icon: "antenna.radiowaves.left.and.right"
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

  return (
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
      </HStack>
    </VStack>
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
  
  if (settings?.enableBoxJs && settings?.boxJsUrl) {
    const boxJsConfig = await fetchConfigFromBoxJs(settings.boxJsUrl)
    if (boxJsConfig.access && boxJsConfig.data && boxJsConfig.cookie) {
      access = boxJsConfig.access
      data = boxJsConfig.data
      cookie = boxJsConfig.cookie
      console.log("✅ 使用 BoxJs 中的配置")
    } else {
      console.warn("⚠️ 从 BoxJs 读取配置失败，使用配置的本地值")
    }
  }

  if (!access || !data || !cookie) {
    Widget.present(<Text>请先在主应用中设置中国广电的 access、data 和 Cookie，或配置 BoxJs 地址。</Text>, reloadPolicy)
    return
  }

  const userData = await fetchUserData(access, data, cookie)

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

