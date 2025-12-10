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
} from "scripting"
import {
  fetchTrafficData,
  fetchTokenFromBoxJs,
  TrafficData,
  Traffic12123Settings
} from "./api"

const SETTINGS_KEY = "traffic12123Settings"
const VEHICLE_IMAGE_CACHE_KEY = "traffic12123_vehicle_image_path"
const VEHICLE_IMAGE_URL_KEY = "traffic12123_vehicle_image_url"

// 下载并缓存车辆图片
async function getVehicleImagePath(imageUrl?: string): Promise<string | null> {
  if (!imageUrl) return null

  try {
    // 检查缓存：如果 URL 相同且文件存在，直接返回
    const cachedUrl = Storage.get<string>(VEHICLE_IMAGE_URL_KEY)
    const cachedPath = Storage.get<string>(VEHICLE_IMAGE_CACHE_KEY)
    
    if (cachedUrl === imageUrl && cachedPath && FileManager.existsSync(cachedPath)) {
      return cachedPath
    }

    // URL 变化或缓存文件不存在，清除旧缓存
    if (cachedPath && FileManager.existsSync(cachedPath)) {
      try {
        FileManager.removeSync(cachedPath)
      } catch (e) {
        // 忽略删除失败
      }
    }

    // 下载新图片
    const response = await fetch(imageUrl)
    if (!response.ok) {
      return null
    }

    const imageData = await response.arrayBuffer()
    const fileName = `vehicle_${Date.now()}.png`
    const tempDir = FileManager.temporaryDirectory
    const filePath = `${tempDir}/${fileName}`

    // 将 ArrayBuffer 转换为 Uint8Array
    const uint8Array = new Uint8Array(imageData)
    FileManager.writeAsBytesSync(filePath, uint8Array)
    
    // 同时缓存 URL 和文件路径
    Storage.set(VEHICLE_IMAGE_URL_KEY, imageUrl)
    Storage.set(VEHICLE_IMAGE_CACHE_KEY, filePath)

    return filePath
  } catch (error) {
    return null
  }
}

// 主组件视图
function WidgetView({ data, vehicleImagePath, imageWidth, imageHeight, imageOffsetY }: { 
  data: TrafficData; 
  vehicleImagePath?: string | null;
  imageWidth?: number;
  imageHeight?: number;
  imageOffsetY?: number;
}) {
  // 使用渐变背景色（浅蓝色到稍深的蓝色）
  const lightBg: DynamicShapeStyle = {
    light: '#E8F4FD', // 浅蓝色背景
    dark: '#1A1A2E'
  }

  const primaryBlue: DynamicShapeStyle = {
    light: '#2581F2',
    dark: '#4A9EFF'
  }

  const purple: DynamicShapeStyle = {
    light: '#722ED1',
    dark: '#9D6FFF'
  }

  const textColor: DynamicShapeStyle = {
    light: '#000000',
    dark: '#FFFFFF'
  }

  return (
    <ZStack
      frame={{ maxWidth: Infinity, maxHeight: Infinity }}
      widgetBackground={{
        style: lightBg,
        shape: {
          type: "rect",
          cornerRadius: 20,
          style: "continuous"
        }
      }}
    >
      {/* 主内容层 */}
      <VStack
        padding={{ top: 13, leading: 13, bottom: 13, trailing: 13 }}
        spacing={0}
      >
        <HStack alignment="top" spacing={0}>
          {/* ========== 左侧区域：车牌、准驾、换证、年检、违章、记分 ========== */}
          <VStack alignment="leading" spacing={0} frame={{ width: 100 }} padding={{ trailing: 3 }}>
            {/* 车牌号 */}
            <Text
              font={19.5}
              fontWeight="medium"
              foregroundStyle={textColor}
              lineLimit={1}
              padding={{ bottom: 3 }}
            >
              {data.plateNumber}
            </Text>
            
            {/* 准驾车型 */}
            <HStack alignment="center" spacing={4.8}>
              <Image
                systemName="car.fill"
                font={15}
                foregroundStyle={primaryBlue}
              />
              <Text
                font={11.5}
                fontWeight="medium"
                foregroundStyle={textColor}
                lineLimit={1}
                opacity={0.78}
              >
                准驾车型 {data.drivingLicenseType}
              </Text>
            </HStack>
            
            {/* 换证日期 */}
            <Text
              font={11.5}
              fontWeight="medium"
              foregroundStyle={textColor}
              lineLimit={1}
              opacity={0.78}
            >
              换证 {data.renewalDate}
            </Text>
            
            {/* 年检日期 */}
            <Text
              font={11.5}
              fontWeight="medium"
              foregroundStyle={textColor}
              lineLimit={1}
              opacity={0.78}
            >
              年检 {data.annualInspectionDate}
            </Text>

            <Spacer />

            {/* 违章按钮 */}
            <ZStack
              frame={{ width: 90 }}
              clipShape={{
                type: "rect",
                cornerRadius: 10,
                style: "continuous"
              }}
            >
              <RoundedRectangle
                cornerRadius={10}
                style="continuous"
                stroke={{
                  shapeStyle: primaryBlue,
                  strokeStyle: {
                    lineWidth: 1,
                    lineCap: "round",
                    lineJoin: "round"
                  }
                }}
              />
              <HStack
                alignment="center"
                padding={{ top: 3, leading: 10, bottom: 3, trailing: 10 }}
                spacing={4}
              >
                <Image
                  systemName="exclamationmark.triangle.fill"
                  font={16}
                  foregroundStyle={primaryBlue}
                />
                <Text
                  font={11}
                  fontWeight="medium"
                  foregroundStyle={primaryBlue}
                  lineLimit={1}
                >
                  {data.violationCount} 违章
                </Text>
              </HStack>
            </ZStack>
            <Spacer minLength={8} />

            {/* 记分按钮 */}
            <ZStack
              frame={{ width: 90 }}
              clipShape={{
                type: "rect",
                cornerRadius: 10,
                style: "continuous"
              }}
            >
              <RoundedRectangle
                cornerRadius={10}
                style="continuous"
                stroke={{
                  shapeStyle: purple,
                  strokeStyle: {
                    lineWidth: 1,
                    lineCap: "round",
                    lineJoin: "round"
                  }
                }}
              />
              <HStack
                alignment="center"
                padding={{ top: 3, leading: 10, bottom: 3, trailing: 10 }}
                spacing={4}
              >
                <Image
                  systemName="square.fill"
                  font={16}
                  foregroundStyle={purple}
                />
                <Text
                  font={11}
                  fontWeight="medium"
                  foregroundStyle={purple}
                  lineLimit={1}
                  opacity={0.75}
                >
                  记{data.penaltyPoints}分
                </Text>
              </HStack>
            </ZStack>
          </VStack>
          
          <Spacer />
          
          {/* ========== 右侧区域：12123、备案信息 ========== */}
          <VStack alignment="leading" spacing={0} frame={{ width: 200 }}>
            {/* 12123标识 */}
            <HStack alignment="center" spacing={0} padding={{ bottom: 3 }}>
              <Spacer />
              <Text
                font={18}
                fontWeight="medium"
                foregroundStyle={primaryBlue}
                lineLimit={1}
              >
                12123
              </Text>
            </HStack>
            
            <Spacer />
            
            {/* 备案信息 */}
            <VStack alignment="center" spacing={0} frame={{ width: 200, height: 28 }}>
              <Text
                font={11}
                fontWeight="medium"
                foregroundStyle={textColor}
                lineLimit={2}
                opacity={0.8}
                minScaleFactor={0.7}
                frame={{ maxWidth: Infinity }}
                multilineTextAlignment="center"
              >
                {data.recordInfo}
              </Text>
            </VStack>
          </VStack>
        </HStack>
      </VStack>
      
      {/* 车辆图片层 - 悬浮在最上层，参考联通小组件的实现方式 */}
      {/* 图片位置：右侧区域，12123 下方，备案信息上方 */}
      {vehicleImagePath ? (
        <VStack alignment="leading" frame={{ maxWidth: Infinity, maxHeight: Infinity }} padding={{ top: 13, leading: 13, bottom: 13, trailing: 13 }}>
          <Spacer minLength={imageOffsetY ?? 30} />
          <HStack alignment="center" frame={{ maxWidth: Infinity }}>
            <Spacer />
            <VStack alignment="leading">
              <Image
                filePath={vehicleImagePath}
                frame={{ width: imageWidth ?? 120, height: imageHeight ?? 60 }}
                resizable
              />
            </VStack>
          </HStack>
          <Spacer />
        </VStack>
      ) : null}
    </ZStack>
  )
}

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
    Widget.present(
      <VStack padding spacing={8} alignment="center">
        <Text font="headline" foregroundStyle="systemRed">未配置 Token</Text>
        <Text font="body" foregroundStyle="secondaryLabel">
          请先在主应用中设置 Token
        </Text>
        <Text font="caption" foregroundStyle="secondaryLabel">
          从支付宝小程序交管12123获取，或配置 BoxJs
        </Text>
      </VStack>,
      reloadPolicy
    )
    return
  }

  try {
    const data = await fetchTrafficData(token)

    if (!data) {
      Widget.present(
        <VStack padding spacing={8} alignment="center">
          <Text font="headline" foregroundStyle="systemRed">获取数据失败</Text>
          <Text font="body" foregroundStyle="secondaryLabel">
            verifyToken 可能已过期
          </Text>
          <Text font="caption" foregroundStyle="secondaryLabel">
            请重新获取 Token
          </Text>
        </VStack>,
        reloadPolicy
      )
      return
    }

    // 下载车辆图片（如果配置了）
    const imageUrl = settings?.vehicleImageUrl || data.vehicleImageUrl;
    const vehicleImagePath = imageUrl ? await getVehicleImagePath(imageUrl) : null;
    
    Widget.present(
      <WidgetView 
        data={data} 
        vehicleImagePath={vehicleImagePath}
        imageWidth={settings?.vehicleImageWidth}
        imageHeight={settings?.vehicleImageHeight}
        imageOffsetY={settings?.vehicleImageOffsetY}
      />, 
      reloadPolicy
    );
  } catch (error) {
    console.error('渲染出错:', error)
    if (error instanceof Error) {
      console.error('错误信息:', error.message)
      console.error('错误堆栈:', error.stack)
    }
    Widget.present(
      <VStack padding spacing={8} alignment="center">
        <Text font="headline" foregroundStyle="systemRed">发生错误</Text>
        <Text font="body" foregroundStyle="secondaryLabel">
          {String(error)}
        </Text>
      </VStack>,
      reloadPolicy
    )
  }
}

render()
