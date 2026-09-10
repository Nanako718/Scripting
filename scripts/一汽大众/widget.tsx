// 一汽大众中型组件
// 左上：VW Logo + 车辆名称 + 副标题
// 右上：锁车状态
// 左下：续航圆角进度条
// 右下：330 车辆图片

import {
  HStack,
  Image,
  RoundedRectangle,
  Script,
  Spacer,
  Text,
  VStack,
  Widget
} from 'scripting'
import { getSession } from './api'
import { getDefaultBasicVehicle, getDefaultFullVehicle } from './vehicle'
import { fetchOilPrice } from './oilPriceApi'
import type { BasicVehicleData, FullVehicleData } from './types'

// 进度条渲染颜色常量
const SUCCESS_COLOR = '#34C759'   // 充足
const DANGER_COLOR = '#d41010'    // 低
const WARNING_COLOR = '#ff9d00'   // 中等

const BAR_BG_COLOR = '#e3e3e8'  // 进度条背景色
const TITLE_COLOR = '#f9f9fa'     // 主标题文字 
const SUBTITLE_COLOR = '#e1e1e4'  // 副标题文字
const SECONDARY_COLOR = '#e1e1e4' // 次要元素 / 图标描边

// 图片链接
const VW_LOGO_URL =
  'https://img.alicdn.com/imgextra/i1/2038135983/O1CN01qQJPD21u4GnjSqt68_!!2038135983.png'

const CAR_IMAGE_URL =
  'https://raw.githubusercontent.com/Nanako718/Scripting/main/images/vw300.png'

// 密集分段进度条
const BAR_COUNT = 30

// 根据百分比获取进度条颜色
const getRangeColor = (percent: number): string => {
  if (percent <= 20) {
    return DANGER_COLOR
  }

  if (percent <= 50) {
    return WARNING_COLOR
  }

  return SUCCESS_COLOR
}

// 密集分段进度条 - 窄条圆角 + 小间距
const ProgressBar = ({
  percent,
  color
}: {
  percent: number
  color: string
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

// 获取车辆数据 + 油价数据
const fetchVehicleData = async (): Promise<{
  vehicleData: BasicVehicleData | FullVehicleData | null
  oilPrice: number | null
  oilGrade: string
  tankCapacity: string
  temperature: number | null
}> => {
  const session = getSession()
  const oilSettings = Storage.get<OilSettings>('oilPriceSettings')
  const oilGrade = oilSettings?.oilGrade || '95'
  const tankCapacity = oilSettings?.tankCapacity || ''
  const manualProvinceId = oilSettings?.useManualProvince ? oilSettings.manualProvinceId : undefined

  let vehicleData: BasicVehicleData | FullVehicleData | null = null
  let oilPrice: number | null = null
  let temperature: number | null = null

  // 并行获取车辆数据和油价
  const tasks: Promise<void>[] = []

  if (session) {
    tasks.push(
      (async () => {
        try {
          const ent = await (await import('./vehicle')).getCurrentEntitlement()
          if (ent.featureTier === 'FULL') {
            vehicleData = await getDefaultFullVehicle(false)
          } else {
            vehicleData = await getDefaultBasicVehicle()
          }
          temperature = vehicleData?.vehicle.outsideTemperatureC ?? null
        } catch (error) {
          console.error('[组件] 获取车辆数据失败:', error)
        }
      })()
    )
  }

  tasks.push(
    (async () => {
      try {
        const data = await fetchOilPrice(oilGrade, manualProvinceId)
        oilPrice = data?.currentPrice ?? null
      } catch (error) {
        console.error('[组件] 获取油价数据失败:', error)
      }
    })()
  )

  await Promise.all(tasks)

  const oilPct = vehicleData?.featureTier === 'FULL' ? (vehicleData as FullVehicleData).vehicle.oil?.levelPercent : null
  console.log('\n========== 组件数据源 ==========')
  console.log('汽油标号:', oilGrade)
  console.log('油箱容量:', tankCapacity, 'L')
  console.log('油价:', oilPrice)
  console.log('温度:', temperature)
  console.log('续航里程:', vehicleData?.vehicle.rangeKm, 'km')
  console.log('续航百分比:', vehicleData?.vehicle.rangePercent, '%')
  if (vehicleData?.featureTier === 'FULL') {
    console.log('油量支持:', (vehicleData as FullVehicleData).vehicle.oil?.supported)
    console.log('油量百分比:', (vehicleData as FullVehicleData).vehicle.oil?.levelPercent, '%')
    console.log('油量升数:', (vehicleData as FullVehicleData).vehicle.oil?.volumeLiters, 'L')
    console.log('油量状态:', (vehicleData as FullVehicleData).vehicle.oil?.status)
  }
  console.log('权益等级:', vehicleData?.featureTier)
  console.log('=================================\n')

  return { vehicleData, oilPrice, oilGrade, tankCapacity, temperature }
}

// 中型组件视图
const MediumWidgetView = ({
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

  // 锁车状态颜色
  const lockColor = isLocked
    ? SUCCESS_COLOR
    : DANGER_COLOR

  // 续航颜色根据百分比自动变化
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
          systemName={
            isLocked
              ? 'lock.fill'
              : 'lock.open'
          }
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
        {/* 左侧：续航信息 */}
        <VStack
          alignment="leading"
          spacing={5}
          frame={{ maxWidth: 'infinity' }}
        >
          {/* 续航 + 百分比 */}
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

          {/* 进度条 */}
          <ProgressBar
            percent={v.rangePercent}
            color={barColor}
          />
        </VStack>

        {/* 右侧：车辆图片 */}
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
        {/* 加油图标 + 油价 */}
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

        {/* 油耗 */}
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
          {(() => {
            const tc = parseFloat(tankCapacity)
            if (tc > 0 && v.rangePercent > 0 && v.rangeKm > 0) {
              return (tc * v.rangePercent / v.rangeKm).toFixed(1)
            }
            return '--'
          })()}L/100Km
        </Text>

        <Spacer />

        {/* 温度 */}
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

        {/* 总里程 */}
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

// 组件运行逻辑
const runWidget = async () => {
  console.log('[组件] 开始渲染中型组件')

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
          请先在 App 中登录
        </Text>
      </VStack>
    )

    return
  }

  console.log(
    '[组件] 渲染车辆数据:',
    result.vehicleData.vehicle.displayName
  )

  Widget.present(
    <MediumWidgetView
      data={result.vehicleData}
      oilPrice={result.oilPrice}
      oilGrade={result.oilGrade}
      tankCapacity={result.tankCapacity}
      temperature={result.temperature}
    />
  )
}

runWidget()