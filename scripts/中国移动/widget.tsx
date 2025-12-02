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
type ChinaMobileSettings = {
  refreshInterval: number
}

const SETTINGS_KEY = "chinaMobileSettings"
const REWRITE_URL = "https://api.example.com/10086/query"
const CACHE_FILE = "cm_data_cache.json"

// 组件数据结构（用于 UI 显示）
type MobileData = {
  fee: { title: string; balance: string; unit: string; plan?: string }
  voice: { title: string; balance: string; unit: string; used?: number; total?: number }
  flow: { title: string; balance: string; unit: string; used?: number; total?: number }
  flowDir?: { title: string; balance: string; unit: string; used?: number; total?: number }
}

// 将解析后的数据转换为 UI 显示格式
function convertToMobileData(parsed: any): MobileData {
  return {
    fee: {
      title: "剩余话费",
      balance: parsed.fee.val,
      unit: parsed.fee.unit,
      plan: parsed.fee.plan
    },
    flow: {
      title: "通用流量",
      balance: parsed.flowGen.remain,
      unit: parsed.flowGen.unit,
      used: parseFloat(parsed.flowGen.used),
      total: parseFloat(parsed.flowGen.total),
    },
    flowDir: {
      title: "定向流量",
      balance: parsed.flowDir.remain,
      unit: parsed.flowDir.unit,
      used: parseFloat(parsed.flowDir.used),
      total: parseFloat(parsed.flowDir.total),
    },
    voice: {
      title: "剩余语音",
      balance: parsed.voice.remain,
      unit: parsed.voice.unit,
      used: parseFloat(parsed.voice.used),
      total: parseFloat(parsed.voice.total),
    },
  }
}

// 从 REWRITE_URL API 读取数据（通过 Quantumult X 重写规则）
async function loadFromRewriteApi(): Promise<any> {
  try {
    const response = await fetch(REWRITE_URL, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    })
    
    if (response.ok) {
      const res = await response.json()
      if (res && res.fee) {
        return res
      }
    }
  } catch (error) {
    console.error("[中国移动] API 请求失败:", error)
  }
  return null
}

// 从缓存读取（使用 FileManager，与原代码一致）
function loadFromCache(): any {
  try {
    const path = FileManager.appGroupDocumentsDirectory + "/" + CACHE_FILE
    if (FileManager.existsSync(path)) {
      try {
        const data = FileManager.readAsStringSync(path)
        return JSON.parse(data)
      } catch (e) {
        console.error("[中国移动] 解析缓存失败")
        return null
      }
    }
  } catch (e) {
    console.error("[中国移动] 读取缓存失败")
  }
  return null
}

// 保存到缓存（使用 FileManager，与原代码一致）
function saveToCache(data: any) {
  try {
    const path = FileManager.appGroupDocumentsDirectory + "/" + CACHE_FILE
    // 添加更新时间（如果没有）
    if (!data.updateTime) {
      const now = new Date()
      data.updateTime = `${now.getHours()}:${now.getMinutes() < 10 ? "0" + now.getMinutes() : now.getMinutes()}`
    }
    FileManager.writeAsStringSync(path, JSON.stringify(data))
  } catch (e) {
    console.error("[中国移动] 保存缓存失败")
  }
}

// 数据解析（完全按照原代码逻辑，返回包含 ok 字段的对象）
function parseData(res: any): { 
  ok: boolean
  fee: any
  flowGen: any
  flowDir: any
  voice: any
  source?: string
  refreshInterval?: number
  small_style?: any
  medium_style?: any
  user_boxjs_url?: string
} | null {
  try {
    let fee = "0"
    let planFee = "0"
    if (res.fee) {
      if (res.fee.curFee !== undefined) fee = res.fee.curFee
      else if (res.fee.val !== undefined) fee = res.fee.val
      
      if (res.fee.realFee !== undefined) planFee = res.fee.realFee
      else if (res.fee.curFeeTotal !== undefined) planFee = res.fee.curFeeTotal
    }
    
    let flowGen = { total: "0", used: "0", remain: "0", unit: "MB" }
    let flowDir = { total: "0", used: "0", remain: "0", unit: "MB" }
    let voiceVal = { total: "0", used: "0", remain: "0", unit: "分" }

    if (res.plan && res.plan.planRemianFlowListRes) {
      const flowRoot = res.plan.planRemianFlowListRes
      const list = flowRoot.planRemianFlowRes || []
      
      let buckets = {
        gen: { t: 0, u: 0, r: 0 }, 
        dir: { t: 0, u: 0, r: 0 } 
      }

      for (let item of list) {
        let unitMult = 1

        let t = parseFloat(item.flowSumNum || 0) * unitMult
        let u = parseFloat(item.flowUsdNum || 0) * unitMult
        let r = parseFloat(item.flowRemainNum || 0) * unitMult

        if (u === 0 && t > r) u = t - r
        if (t === 0) t = u + r

        let type: 'gen' | 'dir' = (item.flowtype == '1') ? 'dir' : 'gen'
        buckets[type].t += t
        buckets[type].u += u
        buckets[type].r += r
      }

      const fmt = (num: number) => {
        if (num > 1024) return { val: (num / 1024).toFixed(2), unit: "GB" }
        return { val: Math.floor(num).toString(), unit: "MB" }
      }

      let genFmt = fmt(buckets.gen.r)
      let div = (genFmt.unit === "GB") ? 1024 : 1
      flowGen = {
        remain: genFmt.val,
        total: (buckets.gen.t / div).toFixed(div === 1 ? 0 : 2),
        used: (buckets.gen.u / div).toFixed(div === 1 ? 0 : 2),
        unit: genFmt.unit
      }
      
      let dirFmt = fmt(buckets.dir.r)
      let dirDiv = (dirFmt.unit === "GB") ? 1024 : 1
      flowDir = {
        remain: dirFmt.val,
        total: (buckets.dir.t / dirDiv).toFixed(dirDiv === 1 ? 0 : 2),
        used: (buckets.dir.u / dirDiv).toFixed(dirDiv === 1 ? 0 : 2),
        unit: dirFmt.unit
      }
    }

    if (res.plan && res.plan.planRemianVoiceListRes) {
      const vList = res.plan.planRemianVoiceListRes.planRemianVoiceInfoRes || []
      let item = vList.find((i: any) => i.voicetype === '0') || (vList.length > 0 ? vList[0] : null)
      if (item) {
        let t = parseFloat(item.voiceSumNum || 0)
        let u = parseFloat(item.voiceUsdNum || 0)
        let r = parseFloat(item.voiceRemainNum || 0)

        if (u === 0 && t > r) u = t - r
        
        voiceVal = {
          total: Math.floor(t).toString(),
          used: Math.floor(u).toString(),
          remain: Math.floor(r).toString(),
          unit: "分"
        }
      }
    } else if (res.voice && res.voice.val) {
      voiceVal.remain = res.voice.val
    }
    
    // 按照原代码返回格式
    const result = {
      ok: true,
      fee: { val: fee, unit: "元", plan: planFee },
      flowGen: flowGen,
      flowDir: flowDir,
      voice: voiceVal,
    }
    return result
  } catch (e) {
    console.error("[中国移动] 数据解析错误")
    return {
      ok: false,
      fee: { val: "0", unit: "元", plan: "0" },
      flowGen: { total: "0", used: "0", remain: "0", unit: "MB" },
      flowDir: { total: "0", used: "0", remain: "0", unit: "MB" },
      voice: { total: "0", used: "0", remain: "0", unit: "分" }
    }
  }
}

// 格式化流量值
function formatFlowValue(value: number, unit: string = "MB"): { balance: string; unit: string } {
  if (unit === "GB" && value < 1) {
    return {
      balance: (value * 1024).toFixed(2),
      unit: "MB"
    }
  }
  if (unit === "MB" && value >= 1024) {
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

// 卡片主题配置 - 使用联通风格的 Catppuccin 配色
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
  },
  flowDir: {
    background: { light: "rgba(202, 158, 230, 0.12)", dark: "rgba(202, 158, 230, 0.18)" } as DynamicShapeStyle,
    iconColor: { light: "#ca9ee6", dark: "#ca9ee6" } as DynamicShapeStyle,
    titleColor: { light: "#737994", dark: "#babbf1" } as DynamicShapeStyle,
    descColor: { light: "#51576d", dark: "#c6d0f5" } as DynamicShapeStyle,
    icon: "wifi.circle.fill"
  }
}

// 可复用卡片组件（联通风格）
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
            imageUrl="https://raw.githubusercontent.com/anker1209/icon/main/zgyd.png" 
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
              imageUrl="https://raw.githubusercontent.com/anker1209/icon/main/zgyd.png" 
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
              imageUrl="https://raw.githubusercontent.com/anker1209/icon/main/zgyd.png" 
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
  data: MobileData
  titleStyle: DynamicShapeStyle
  descStyle: DynamicShapeStyle
}) {
  // 计算总流量剩余（通用流量 + 定向流量）
  const flowRemain = (data.flow?.total && data.flow?.used !== undefined) 
    ? Math.max(0, data.flow.total - data.flow.used) : 0
  const flowDirRemain = (data.flowDir?.total && data.flowDir?.used !== undefined)
    ? Math.max(0, data.flowDir.total - data.flowDir.used) : 0
  
  // 统一单位后相加
  const flowRemainMB = data.flow?.unit === "GB" ? flowRemain * 1024 : flowRemain
  const flowDirRemainMB = data.flowDir?.unit === "GB" ? flowDirRemain * 1024 : flowDirRemain
  const totalFlowFormatted = formatFlowValue(flowRemainMB + flowDirRemainMB, "MB")
  
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

// 使用联通的默认颜色（硬编码）
const DEFAULT_TITLE_STYLE: DynamicShapeStyle = {
  light: "#666666",
  dark: "#CCCCCC",
}
const DEFAULT_DESC_STYLE: DynamicShapeStyle = {
  light: "#000000",
  dark: "#FFFFFF",
}

function WidgetView({ data }: { data: MobileData }) {
  const titleStyle = DEFAULT_TITLE_STYLE
  const descStyle = DEFAULT_DESC_STYLE

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
        {data.flowDir ? (
          <DataCard
            title={data.flowDir.title}
            value={data.flowDir.balance}
            unit={data.flowDir.unit}
            theme={cardThemes.flowDir}
            titleStyle={titleStyle}
            descStyle={descStyle}
            progressUsed={data.flowDir.used}
            progressTotal={data.flowDir.total}
          />
        ) : null}
      </HStack>
    </VStack>
  )
}

async function render() {
  const oldCache = loadFromCache() || {}
  const settings = Storage.get<ChinaMobileSettings>(SETTINGS_KEY)
  const currentInterval = oldCache.refreshInterval || settings?.refreshInterval || 60
  
  const nextUpdate = new Date(Date.now() + currentInterval * 60 * 1000)
  const reloadPolicy: WidgetReloadPolicy = {
    policy: "after",
    date: nextUpdate
  }

  // 1. 优先尝试从 REWRITE_URL API 读取（通过 Quantumult X 重写规则）
  try {
    const apiData = await loadFromRewriteApi()
    
    if (apiData && apiData.fee) {
      const pData = parseData(apiData)
      
      if (pData && pData.ok) {
        pData.source = "API"
        pData.refreshInterval = currentInterval
        // 保留缓存中的样式配置
        if (oldCache.small_style) pData.small_style = oldCache.small_style
        if (oldCache.medium_style) pData.medium_style = oldCache.medium_style
        
        saveToCache(pData)
        
        const mobileData = convertToMobileData(pData)
        Widget.present(<WidgetView data={mobileData} />, reloadPolicy)
        return
      }
    }
  } catch (e) {
    console.error("[中国移动] API 读取失败")
  }

  // 2. 如果 API 失败，尝试使用缓存
  const cache = loadFromCache()
  if (cache && cache.ok && cache.fee) {
    cache.usingCache = true
    cache.source = "Cache"
    const mobileData = convertToMobileData(cache)
    Widget.present(<WidgetView data={mobileData} />, reloadPolicy)
    return
  }

  // 3. 最后返回错误信息
  console.error("[中国移动] 获取数据失败")
  Widget.present(
    <VStack spacing={8} padding={16} alignment="center">
      <Text font="headline">获取数据失败</Text>
      <Text font="body" foregroundStyle="secondaryLabel">
        请确保已安装 Quantumult X 重写规则
      </Text>
      <Text font="caption" foregroundStyle="secondaryLabel">
        请在主应用中点击"安装重写规则"按钮
      </Text>
    </VStack>, 
    reloadPolicy
  )
}

render()

