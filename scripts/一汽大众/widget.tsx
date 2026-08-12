// 一汽大众中型组件
// 左上：VW Logo + 车辆名称 + 副标题
// 右上：锁车状态
// 左下：续航圆角进度条
// 右下：330 车辆图片

import { HStack, Image, RoundedRectangle, Script, Spacer, Text, VStack, Widget } from 'scripting'
import { getSession } from './api'
import { getDefaultBasicVehicle, getDefaultFullVehicle } from './vehicle'
import type { BasicVehicleData, FullVehicleData } from './types'

// 颜色常量
const SUCCESS_COLOR = '#34C759'
const DANGER_COLOR = '#d20f39'
const WARNING_COLOR = '#eed49f'

const BAR_BG_COLOR = '#a5adce'
const TITLE_COLOR = '#e6e9ef'
const SUBTITLE_COLOR = '#9ca0b0'
const SECONDARY_COLOR = '#8E8E93'

// 图片链接
const VW_LOGO_URL =
  'https://img.alicdn.com/imgextra/i1/2038135983/O1CN01qQJPD21u4GnjSqt68_!!2038135983.png'

const CAR_IMAGE_URL =
  'https://raw.githubusercontent.com/Nanako718/Scripting/main/images/330.png'

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

// 获取车辆数据
const fetchVehicleData = async (): Promise<
  BasicVehicleData | FullVehicleData | null
> => {
  const session = getSession()

  if (!session) {
    return null
  }

  try {
    const ent = await (await import('./vehicle')).getCurrentEntitlement()

    if (ent.featureTier === 'FULL') {
      return await getDefaultFullVehicle(false)
    }

    return await getDefaultBasicVehicle()
  } catch (error) {
    console.error('[组件] 获取车辆数据失败:', error)
    return null
  }
}

// 中型组件视图
const MediumWidgetView = ({
  data
}: {
  data: BasicVehicleData | FullVehicleData
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
          top: 12,
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
          bottom: 14,
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
    </VStack>
  )
}

// 组件运行逻辑
const runWidget = async () => {
  console.log('[组件] 开始渲染中型组件')

  const data = await fetchVehicleData()

  if (!data) {
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
    data.vehicle.displayName
  )

  Widget.present(
    <MediumWidgetView data={data} />
  )
}

runWidget()