// 一汽大众中型组件
// version: 2026-09-21-2310 ui-v2.6-agibot-font
// 第一套 classic：VW Logo + 车辆名 + 锁车 + 分段续航 + 底部信息栏
// 第二套 magotan：顶栏左 MAGOTAN / 右状态；主体左车图，右油位·续航·油耗（标签左、数值右）

import {
  HStack,
  Image,
  RoundedRectangle,
  Spacer,
  Text,
  VStack,
  Widget
} from 'scripting'
import { getSession, hasVehicleAccountSession } from './api'
import { getCurrentEntitlement, getDefaultBasicVehicle, getDefaultFullVehicle } from './vehicle'
import { fetchOilPrice } from './oilPriceApi'
import type { BasicVehicleData, FullVehicleData } from './types'

// 与 index.tsx 相同的样式存储 key（此处直接读 Storage，避免额外模块依赖）
const WIDGET_UI_STYLE_KEY = 'yqdz_widget_ui_style'
const readWidgetUiStyle = (): 'classic' | 'magotan' => {
  const stored = Storage.get<string>(WIDGET_UI_STYLE_KEY)
  return stored === 'magotan' ? 'magotan' : 'classic'
}

// Scripting 的 fill/foregroundStyle 需要字面量 hex，不能是普通 string
type WidgetHexColor = `#${string}`

// 进度条渲染颜色常量
const SUCCESS_COLOR: WidgetHexColor = '#34C759'   // 充足
const DANGER_COLOR: WidgetHexColor = '#d41010'    // 低
const WARNING_COLOR: WidgetHexColor = '#ff9d00'   // 中等

const BAR_BG_COLOR: WidgetHexColor = '#e3e3e8'  // 进度条背景色
const TITLE_COLOR: WidgetHexColor = '#f9f9fa'     // 主标题文字
const SUBTITLE_COLOR: WidgetHexColor = '#e1e1e4'  // 副标题文字
const SECONDARY_COLOR: WidgetHexColor = '#e1e1e4' // 次要元素 / 图标描边

// 图片链接
const VW_LOGO_URL =
  'https://img.alicdn.com/imgextra/i1/2038135983/O1CN01qQJPD21u4GnjSqt68_!!2038135983.png'

const CAR_IMAGE_URL =
  'https://raw.githubusercontent.com/Nanako718/Scripting/main/images/vw300.png'

// 第二套 UI 使用的 MAGOTAN 车图
const MAGOTAN_CAR_IMAGE_URL =
  'https://raw.githubusercontent.com/Nanako718/Scripting/refs/heads/main/images/MT330.PNG'

// 密集分段进度条
const BAR_COUNT = 30

// 根据百分比获取进度条颜色
const getRangeColor = (percent: number): WidgetHexColor => {
  if (percent <= 20) {
    return DANGER_COLOR
  }

  if (percent <= 50) {
    return WARNING_COLOR
  }

  return SUCCESS_COLOR
}

const formatUpdateTime = (raw: string | null | undefined): string => {
  if (!raw) {
    return '--:--'
  }
  const text = String(raw).trim()
  // 尝试取 HH:mm（兼容 ISO / 本地字符串）
  const isoMatch = text.match(/T(\d{2}):(\d{2})/)
  if (isoMatch) {
    return `${isoMatch[1]}:${isoMatch[2]}`
  }
  const timeMatch = text.match(/(\d{1,2}):(\d{2})/)
  if (timeMatch) {
    return timeMatch[1].padStart(2, '0') + ':' + timeMatch[2]
  }
  return text.slice(-5)
}

const formatFuelConsumption = (
  tankCapacity: string,
  rangeKm: number,
  rangePercent: number
): string => {
  const tc = parseFloat(tankCapacity)
  if (tc > 0 && rangePercent > 0 && rangeKm > 0) {
    return (tc * rangePercent / rangeKm).toFixed(1)
  }
  return '--'
}

const getOilLevelPercent = (data: BasicVehicleData | FullVehicleData): number | null => {
  // 用户确认：油位 = 续航百分比 rangePercent（oil.levelPercent 不可靠）
  const percent = data.vehicle.rangePercent
  return typeof percent === 'number' && Number.isFinite(percent) ? percent : null
}

// 密集分段进度条 - 窄条圆角 + 小间距
const ProgressBar = ({
  percent,
  color
}: {
  percent: number
  color: WidgetHexColor
}) => {
  const clamped = Math.max(0, Math.min(100, percent))
  const end = Math.floor((clamped / 100) * BAR_COUNT)

  const bars: JSX.Element[] = []

  for (let i = 0; i < BAR_COUNT; i++) {
    bars.push(
      <RoundedRectangle
        key={i}
        cornerRadius={1}
        frame={{ width: 2, height: 10 }}
        fill={i < end ? color : BAR_BG_COLOR}
      />
    )

    if (i < BAR_COUNT - 1) {
      bars.push(
        <Spacer
          key={`s-${i}`}
          minLength={1.5}
        />
      )
    }
  }

  return (
    <HStack
      spacing={0}
      alignment="center"
      frame={{ maxWidth: 'infinity' }}
    >
      {bars}
    </HStack>
  )
}

// 油价设置
type OilSettings = {
  oilGrade: string
  tankCapacity: string
  useManualProvince: boolean
  manualProvinceId: string
}

type LoadedVehicle = {
  data: BasicVehicleData | FullVehicleData
  temperature: number | null
}

const loadVehicleBundle = async (): Promise<LoadedVehicle | null> => {
  try {
    const ent = await getCurrentEntitlement()
    if (ent.featureTier === 'FULL') {
      const data = await getDefaultFullVehicle(false)
      return { data, temperature: data.vehicle.outsideTemperatureC ?? null }
    }
    const data = await getDefaultBasicVehicle()
    return { data, temperature: data.vehicle.outsideTemperatureC ?? null }
  } catch (error) {
    console.error('[组件] 获取车辆数据失败:', error)
    return null
  }
}

// 获取车辆数据 + 油价数据
const fetchVehicleData = async (): Promise<{
  vehicleData: BasicVehicleData | FullVehicleData | null
  oilPrice: number | null
  oilGrade: string
  tankCapacity: string
  temperature: number | null
}> => {
  const session = getSession()
  // 对齐 JoinerCar：小组件只在车企账号仍绑定时拉车辆数据
  const hasVehicleAccount = hasVehicleAccountSession(session)
  const oilSettings = Storage.get<OilSettings>('oilPriceSettings')
  const oilGrade = oilSettings?.oilGrade || '95'
  const tankCapacity = oilSettings?.tankCapacity || ''
  const manualProvinceId = oilSettings?.useManualProvince ? oilSettings.manualProvinceId : undefined

  const vehicleTask: Promise<LoadedVehicle | null> = hasVehicleAccount
    ? loadVehicleBundle()
    : Promise.resolve(null)

  const oilTask = (async (): Promise<number | null> => {
    try {
      const data = await fetchOilPrice(oilGrade, manualProvinceId)
      return data?.currentPrice ?? null
    } catch (error) {
      console.error('[组件] 获取油价数据失败:', error)
      return null
    }
  })()

  const [loadedVehicle, oilPrice] = await Promise.all([vehicleTask, oilTask])
  const vehicleData = loadedVehicle?.data ?? null
  const temperature = loadedVehicle?.temperature ?? null
  const oilLevel = vehicleData ? getOilLevelPercent(vehicleData) : null

  console.log('\n========== 组件数据源 ==========')
  console.log('UI 样式:', readWidgetUiStyle())
  console.log('汽油标号:', oilGrade)
  console.log('油箱容量:', tankCapacity, 'L')
  console.log('油价:', oilPrice)
  console.log('温度:', temperature)
  console.log('续航里程:', vehicleData?.vehicle.rangeKm, 'km')
  console.log('续航百分比:', vehicleData?.vehicle.rangePercent, '%')
  console.log('油位:', oilLevel)
  console.log('=================================\n')

  return { vehicleData, oilPrice, oilGrade, tankCapacity, temperature }
}

// ============ 第一套：经典中型组件 ============

const MediumWidgetViewClassic = ({
  data,
  oilPrice,
  oilGrade,
  tankCapacity,
  temperature
}: {
  data: BasicVehicleData | FullVehicleData
  oilPrice: number | null
  oilGrade: string
  tankCapacity: string
  temperature: number | null
}) => {
  const v = data.vehicle
  const isLocked = v.isLocked === true
  const lockColor = isLocked ? SUCCESS_COLOR : DANGER_COLOR
  const barColor = getRangeColor(v.rangePercent)

  return (
    <VStack
      alignment="leading"
      spacing={0}
      frame={{
        maxWidth: 'infinity',
        maxHeight: 'infinity'
      }}
    >
      {/* 顶部行：VW Logo + 车辆名称 + 锁车状态 */}
      <HStack
        alignment="center"
        spacing={6}
        padding={{
          top: 15,
          leading: 14,
          trailing: 14,
          bottom: 0
        }}
        frame={{ maxWidth: 'infinity' }}
      >
        <Image
          imageUrl={VW_LOGO_URL}
          resizable
          scaleToFit
          frame={{
            width: 18,
            height: 18
          }}
        />

        <VStack
          alignment="leading"
          spacing={0}
        >
          <Text
            font="footnote"
            fontWeight="semibold"
            foregroundStyle={TITLE_COLOR}
            lineLimit={1}
          >
            {v.displayName}
          </Text>

          <Text
            font="caption2"
            foregroundStyle={SUBTITLE_COLOR}
            lineLimit={1}
          >
            {v.subtitle}
          </Text>
        </VStack>

        <Spacer />

        <Image
          systemName={isLocked ? 'lock.fill' : 'lock.open'}
          foregroundStyle={lockColor}
          frame={{
            width: 20,
            height: 20
          }}
        />
      </HStack>

      {/* 下半部分：续航 + 车辆图片 */}
      <HStack
        alignment="center"
        spacing={12}
        padding={{
          top: 8,
          leading: 14,
          bottom: -8,
          trailing: 14
        }}
        frame={{
          maxWidth: 'infinity',
          maxHeight: 'infinity'
        }}
      >
        <VStack
          alignment="leading"
          spacing={5}
          frame={{ maxWidth: 'infinity' }}
        >
          <HStack
            alignment="lastTextBaseline"
            spacing={2}
            frame={{ maxWidth: 'infinity' }}
          >
            <Text
              font="title"
              fontWeight="bold"
              foregroundStyle={TITLE_COLOR}
            >
              {v.rangeKm}
            </Text>

            <Text
              font="caption"
              foregroundStyle={SECONDARY_COLOR}
            >
              km
            </Text>

            <Spacer minLength={6} />

            <Text
              font="caption2"
              fontWeight="medium"
              foregroundStyle={barColor}
            >
              {v.rangePercent}%
            </Text>
          </HStack>

          <ProgressBar
            percent={v.rangePercent}
            color={barColor}
          />
        </VStack>

        <Image
          imageUrl={CAR_IMAGE_URL}
          resizable
          scaleToFit
          frame={{
            width: 165,
            height: 108
          }}
        />
      </HStack>

      {/* 底部信息栏：油价 / 油耗 / 温度 / 总里程 */}
      <HStack
        alignment="center"
        spacing={0}
        padding={{
          top: 0,
          leading: 14,
          bottom: 15,
          trailing: 14
        }}
        frame={{
          maxWidth: 'infinity'
        }}
      >
        <Image
          systemName="fuelpump.fill"
          foregroundStyle="#FF9500"
          font="caption2"
        />
        <Text
          font="caption2"
          foregroundStyle={SECONDARY_COLOR}
          padding={{ leading: 3 }}
        >
          ¥ {oilPrice !== null ? oilPrice.toFixed(2) : '--'}/L
        </Text>

        <Spacer />

        <Image
          systemName="drop.fill"
          foregroundStyle="#5AC8FA"
          font="caption2"
        />
        <Text
          font="caption2"
          foregroundStyle={SECONDARY_COLOR}
          padding={{ leading: 3 }}
        >
          {formatFuelConsumption(tankCapacity, v.rangeKm, v.rangePercent)}L/100Km
        </Text>

        <Spacer />

        <Image
          systemName="thermometer.medium"
          foregroundStyle="#FF3B30"
          font="caption2"
        />
        <Text
          font="caption2"
          foregroundStyle={SECONDARY_COLOR}
          padding={{ leading: 3 }}
        >
          {temperature !== null ? `${temperature}°C` : '--°C'}
        </Text>

        <Spacer />

        <Image
          systemName="road.lanes"
          foregroundStyle="#34C759"
          font="caption2"
        />
        <Text
          font="caption2"
          foregroundStyle={SECONDARY_COLOR}
          padding={{ leading: 3 }}
        >
          {data.featureTier === 'FULL' ? ((data as FullVehicleData).vehicle.totalMileageKm?.toLocaleString() ?? '--') : '--'}Km
        </Text>
      </HStack>
    </VStack>
  )
}

// ============ 第二套：MAGOTAN 中型组件 ============

const MediumWidgetViewMagotan = ({
  data,
  tankCapacity
}: {
  data: BasicVehicleData | FullVehicleData
  tankCapacity: string
}) => {
  const v = data.vehicle
  const updateTime = formatUpdateTime(v.appRefreshedAt || data.servedAt)
  const oilLevel = getOilLevelPercent(data)
  const oilColor = oilLevel === null
    ? SECONDARY_COLOR
    : (oilLevel <= 15 ? DANGER_COLOR : (oilLevel <= 30 ? WARNING_COLOR : SUCCESS_COLOR))
  const rangeColor = getRangeColor(v.rangePercent)

  return (
    <VStack
      alignment="leading"
      spacing={0}
      frame={{
        maxWidth: 'infinity',
        maxHeight: 'infinity'
      }}
    >
      {/* 顶行：左 MAGOTAN，右 对号+更新时间+VW Logo（用户反馈：左右对调） */}
      <HStack
        alignment="center"
        spacing={6}
        padding={{
          top: 12,
          leading: 14,
          trailing: 14,
          bottom: 0
        }}
        frame={{ maxWidth: 'infinity' }}
      >
        {/* MAGOTAN：用户提供的 Agibot Display（PostScript: AgibotDisplay）
            字体文件：assets/AgibotDisplay-Regular.ttf
            若未生效：在 iOS/Scripting 中安装该字体，或用 FontPicker.pickFont() 查看 PostScript 名 */}
        <Text
          font={{ name: 'AgibotDisplay', size: 24 }}
          foregroundStyle={TITLE_COLOR}
          lineLimit={1}
        >
          MAGOTAN
        </Text>

        <Spacer />

        <Image
          systemName="checkmark.circle.fill"
          foregroundStyle={SUCCESS_COLOR}
          font="caption"
          frame={{ width: 14, height: 14 }}
        />

        <Text
          font="caption2"
          foregroundStyle={SECONDARY_COLOR}
          lineLimit={1}
        >
          {updateTime}
        </Text>

        <Image
          imageUrl={VW_LOGO_URL}
          resizable
          scaleToFit
          frame={{ width: 16, height: 16 }}
        />
      </HStack>

      {/* 主体：左车辆图，右油位/续航/油耗（标签左对齐、数值右对齐） */}
      <HStack
        alignment="center"
        spacing={10}
        padding={{
          top: 6,
          leading: 14,
          bottom: 14,
          trailing: 14
        }}
        frame={{
          maxWidth: 'infinity',
          maxHeight: 'infinity'
        }}
      >
        <Image
          imageUrl={MAGOTAN_CAR_IMAGE_URL}
          resizable
          scaleToFit
          frame={{
            width: 168,
            height: 104
          }}
        />

        <Spacer minLength={8} />

        <VStack
          alignment="leading"
          spacing={8}
          frame={{ maxWidth: 'infinity' }}
        >
          {/* 油位 = 续航百分比：标签左对齐，数值右对齐 */}
          <HStack
            alignment="firstTextBaseline"
            spacing={0}
            frame={{ maxWidth: 'infinity' }}
          >
            <Text
              font="caption2"
              foregroundStyle={SECONDARY_COLOR}
            >
              油位
            </Text>
            <Spacer minLength={16} />
            <Text
              font="headline"
              fontWeight="bold"
              foregroundStyle={oilColor}
              monospacedDigit
            >
              {oilLevel !== null ? `${oilLevel}%` : '--%'}
            </Text>
          </HStack>

          {/* 续航里程 */}
          <HStack
            alignment="firstTextBaseline"
            spacing={0}
            frame={{ maxWidth: 'infinity' }}
          >
            <Text
              font="caption2"
              foregroundStyle={SECONDARY_COLOR}
            >
              续航里程
            </Text>
            <Spacer minLength={16} />
            <HStack
              alignment="lastTextBaseline"
              spacing={2}
            >
              <Text
                font="headline"
                fontWeight="bold"
                foregroundStyle={rangeColor}
                monospacedDigit
              >
                {v.rangeKm}
              </Text>
              <Text
                font="caption2"
                foregroundStyle={SECONDARY_COLOR}
              >
                km
              </Text>
            </HStack>
          </HStack>

          {/* 油耗 */}
          <HStack
            alignment="firstTextBaseline"
            spacing={0}
            frame={{ maxWidth: 'infinity' }}
          >
            <Text
              font="caption2"
              foregroundStyle={SECONDARY_COLOR}
            >
              油耗
            </Text>
            <Spacer minLength={16} />
            <HStack
              alignment="lastTextBaseline"
              spacing={2}
            >
              <Text
                font="subheadline"
                fontWeight="semibold"
                foregroundStyle={TITLE_COLOR}
                monospacedDigit
              >
                {formatFuelConsumption(tankCapacity, v.rangeKm, v.rangePercent)}
              </Text>
              <Text
                font="caption2"
                foregroundStyle={SECONDARY_COLOR}
              >
                L/100KM
              </Text>
            </HStack>
          </HStack>
        </VStack>
      </HStack>
    </VStack>
  )
}

// 组件运行逻辑
const runWidget = async () => {
  const uiStyle = readWidgetUiStyle()
  console.log('[组件] 开始渲染中型组件, 样式:', uiStyle)

  const result = await fetchVehicleData()

  if (!result.vehicleData) {
    console.log('[组件] 无车辆数据，显示空状态')

    Widget.present(
      <VStack
        alignment="center"
        spacing={8}
        padding={16}
        frame={{
          maxWidth: 'infinity',
          maxHeight: 'infinity'
        }}
      >
        <Text
          font="headline"
          foregroundStyle={SECONDARY_COLOR}
        >
          暂无车辆数据
        </Text>

        <Text
          font="caption"
          foregroundStyle={SECONDARY_COLOR}
        >
          请先在脚本中登录一汽大众账号
        </Text>
      </VStack>
    )

    return
  }

  console.log(
    '[组件] 渲染车辆数据:',
    result.vehicleData.vehicle.displayName,
    '样式:',
    uiStyle
  )

  if (uiStyle === 'magotan') {
    Widget.present(
      <MediumWidgetViewMagotan
        data={result.vehicleData}
        tankCapacity={result.tankCapacity}
      />
    )
    return
  }

  Widget.present(
    <MediumWidgetViewClassic
      data={result.vehicleData}
      oilPrice={result.oilPrice}
      oilGrade={result.oilGrade}
      tankCapacity={result.tankCapacity}
      temperature={result.temperature}
    />
  )
}

runWidget()
