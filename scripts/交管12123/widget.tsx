import {
  Widget,
  VStack,
  HStack,
  Text,
  Image,
  Spacer,
  DynamicShapeStyle,
  WidgetReloadPolicy,
  ZStack,
  RoundedRectangle,
  Rectangle,
  Link,
} from "scripting"
import {
  fetchTrafficData,
  fetchTokenFromBoxJs,
  TrafficData,
  Traffic12123Settings
} from "./api"

const SETTINGS_KEY = "traffic12123Settings"

// 记分图片映射
const POINTS_IMAGE_MAP: Record<number, string> = {
  0: '0',
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: '11',
  12: '12',
}

function getPointsImageName(points: number): string {
  const clamped = Math.max(0, Math.min(12, points))
  return POINTS_IMAGE_MAP[clamped] || POINTS_IMAGE_MAP[0]
}

// 主组件视图
function WidgetView({ data, tokenExpired }: { data: TrafficData; tokenExpired?: boolean }) {
  const primaryBlue: DynamicShapeStyle = {
    light: '#2581F2',
    dark: '#4A9EFF'
  }

  const textColor: DynamicShapeStyle = {
    light: '#000000',
    dark: '#FFFFFF'
  }

  const secondaryText: DynamicShapeStyle = {
    light: '#666666',
    dark: '#AAAAAA'
  }

  const pointsImageName = getPointsImageName(data.penaltyPoints)
  const pointsImageUrl = `https://raw.githubusercontent.com/Nanako718/Scripting/refs/heads/main/images/${pointsImageName}.png`

  return (
    <ZStack
      frame={{ maxWidth: Infinity, maxHeight: Infinity }}
    >
      <VStack
        padding={{ top: 8, leading: 13, bottom: 10, trailing: 13 }}
        spacing={0}
      >
        {/* Token 过期提示 */}
        {tokenExpired && (
          <HStack alignment="center" spacing={4} padding={{ bottom: 4 }}>
            <Image systemName="exclamationmark.circle.fill" font={10} foregroundStyle={{ light: '#FF6B6B', dark: '#FF6B6B' }} />
            <Text font={10} foregroundStyle={{ light: '#FF6B6B', dark: '#FF6B6B' }} lineLimit={1}>Token已过期，请更新</Text>
          </HStack>
        )}

        {/* 标题行：车牌号 + 违章数 */}
        <HStack alignment="center" spacing={0}>
          <Text
            font={19}
            fontWeight="bold"
            foregroundStyle={textColor}
            lineLimit={1}
          >
            {data.plateNumber}
          </Text>
          <Spacer />
          <Text
            font={14}
            fontWeight="medium"
            foregroundStyle={primaryBlue}
            lineLimit={1}
          >
            {data.violationCount}违章
          </Text>
        </HStack>

        {/* 横向分界线 */}
        <Rectangle frame={{ height: 0.5 }} foregroundStyle={{ light: 'rgba(0,0,0,0.15)', dark: 'rgba(255,255,255,0.2)' }} padding={{ top: 6, bottom: 6 }} />

        {/* 下方内容 */}
        <HStack alignment="bottom" spacing={0}>
          {/* 左侧：记分图片 + 准驾车型 */}
          <VStack alignment="center" spacing={8} frame={{ maxWidth: Infinity }}>
            <Image
              imageUrl={pointsImageUrl}
              frame={{ width: 80, height: 65 }}
              resizable={true}
            />
            <HStack alignment="center" spacing={2}>
              <Image
                systemName="car.fill"
                font={9}
                foregroundStyle={secondaryText}
              />
              <Text
                font={9}
                foregroundStyle={secondaryText}
                lineLimit={1}
              >
                准驾车型{data.drivingLicenseType}
              </Text>
            </HStack>
          </VStack>

          {/* 竖向分界线（居中） */}
          <Rectangle frame={{ width: 0.5 }} foregroundStyle={{ light: 'rgba(0,0,0,0.15)', dark: 'rgba(255,255,255,0.2)' }} padding={{ leading: 8, trailing: 8 }} />

          {/* 右侧：日期 */}
          <VStack alignment="leading" spacing={8} frame={{ maxWidth: Infinity }}>
            <HStack alignment="center" spacing={6}>
              <RoundedRectangle cornerRadius={2} foregroundStyle={{ light: '#2581F2', dark: '#4A9EFF' }} frame={{ width: 3, height: 14 }} />
              <Text font={11} foregroundStyle={secondaryText} lineLimit={1}>换证</Text>
              <Text font={12} fontWeight="medium" foregroundStyle={textColor} lineLimit={1}>{data.renewalDate}</Text>
            </HStack>
            <HStack alignment="center" spacing={6}>
              <RoundedRectangle cornerRadius={2} foregroundStyle={{ light: '#F5A623', dark: '#F5A623' }} frame={{ width: 3, height: 14 }} />
              <Text font={11} foregroundStyle={secondaryText} lineLimit={1}>年检</Text>
              <Text font={12} fontWeight="medium" foregroundStyle={textColor} lineLimit={1}>{data.annualInspectionDate}</Text>
            </HStack>
            <HStack alignment="center" spacing={6}>
              <RoundedRectangle cornerRadius={2} foregroundStyle={{ light: '#722ED1', dark: '#9D6FFF' }} frame={{ width: 3, height: 14 }} />
              <Text font={11} foregroundStyle={secondaryText} lineLimit={1}>清分</Text>
              <Text font={12} fontWeight="medium" foregroundStyle={textColor} lineLimit={1}>{data.reaccDate}</Text>
            </HStack>
          </VStack>
        </HStack>
      </VStack>
    </ZStack>
  )
}

// 缓存数据的key
const CACHE_KEY = "traffic12123CachedData"

// 渲染函数
async function render() {
  const settings = Storage.get<Traffic12123Settings>(SETTINGS_KEY)

  const reloadPolicy: WidgetReloadPolicy = {
    policy: "after",
    date: new Date(Date.now() + 15 * 60 * 1000), // 15分钟后刷新
  }

  // 检查组件尺寸
  if (Widget.family !== "systemMedium") {
    Widget.present(
      <VStack padding spacing={8} alignment="center">
        <Text font="headline" foregroundStyle="systemRed">不支持的组件尺寸</Text>
        <Text font="body" foregroundStyle="secondaryLabel">
          请使用中型组件
        </Text>
      </VStack>,
      reloadPolicy
    )
    return
  }

  // 获取 Token（优先从 BoxJs 读取）
  let token: string | null = null

  if (settings?.enableBoxJs && settings?.boxJsUrl) {
    token = await fetchTokenFromBoxJs(settings.boxJsUrl)
  }

  // 如果 BoxJs 没有获取到，使用本地配置
  if (!token && settings?.token) {
    token = settings.token
  }

  // 检查 token 配置
  if (!token) {
    // 尝试使用缓存数据
    const cachedData = Storage.get<TrafficData>(CACHE_KEY)
    if (cachedData) {
      Widget.present(
        <WidgetView data={cachedData} tokenExpired={true} />,
        reloadPolicy
      )
      return
    }
    Widget.present(
      <Link url="alipays://platformapi/startapp?appId=2019050964403523">
        <VStack padding spacing={8} alignment="center">
          <Text font="headline" foregroundStyle="systemRed">未配置 Token</Text>
          <Text font="body" foregroundStyle="secondaryLabel">
            请先在主应用中设置 Token
          </Text>
          <Text font="caption" foregroundStyle="secondaryLabel">
            从支付宝小程序交管12123获取，或配置 BoxJs
          </Text>
          <Text font="caption" foregroundStyle="accentColor" padding={{ top: 8 }}>
            点击打开支付宝小程序
          </Text>
        </VStack>
      </Link>,
      reloadPolicy
    )
    return
  }

  try {
    const data = await fetchTrafficData(token)

    if (!data) {
      // Token过期，尝试使用缓存数据
      const cachedData = Storage.get<TrafficData>(CACHE_KEY)
      if (cachedData) {
        Widget.present(
          <WidgetView data={cachedData} tokenExpired={true} />,
          reloadPolicy
        )
        return
      }
      Widget.present(
        <Link url="alipays://platformapi/startapp?appId=2019050964403523">
          <VStack padding spacing={8} alignment="center">
            <Text font="headline" foregroundStyle="systemRed">获取数据失败</Text>
            <Text font="body" foregroundStyle="secondaryLabel">
              Token 可能已过期
            </Text>
            <Text font="caption" foregroundStyle="secondaryLabel">
              请重新获取 Token
            </Text>
            <Text font="caption" foregroundStyle="accentColor" padding={{ top: 8 }}>
              点击打开支付宝小程序
            </Text>
          </VStack>
        </Link>,
        reloadPolicy
      )
      return
    }

    // 缓存最新数据
    Storage.set(CACHE_KEY, data)

    Widget.present(
      <WidgetView data={data} />,
      reloadPolicy
    );
  } catch (error) {
    console.error('渲染出错:', error)
    if (error instanceof Error) {
      console.error('错误信息:', error.message)
      console.error('错误堆栈:', error.stack)
    }
    // 出错时尝试使用缓存数据
    const cachedData = Storage.get<TrafficData>(CACHE_KEY)
    if (cachedData) {
      Widget.present(
        <WidgetView data={cachedData} tokenExpired={true} />,
        reloadPolicy
      )
      return
    }
    Widget.present(
      <Link url="alipays://platformapi/startapp?appId=2019050964403523">
        <VStack padding spacing={8} alignment="center">
          <Text font="headline" foregroundStyle="systemRed">发生错误</Text>
          <Text font="body" foregroundStyle="secondaryLabel">
            {String(error)}
          </Text>
          <Text font="caption" foregroundStyle="accentColor" padding={{ top: 8 }}>
            点击打开支付宝小程序
          </Text>
        </VStack>
      </Link>,
      reloadPolicy
    )
  }
}

render()
