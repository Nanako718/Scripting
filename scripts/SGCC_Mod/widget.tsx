/**
 * 电量小组件 —— Home Assistant 版。
 *
 * 移植（Scripting 版）：SylvanRoe · telegram: @Air_QT
 * 维护：jpcnmm · telegram: @jpcnmm
 *
 * 原创UI，修改套用请注明来源
 */
import {
  Widget,
  VStack,
  HStack,
  ZStack,
  Text,
  Image,
  Spacer,
  Rectangle,
  type DynamicShapeStyle,
  type ShapeStyle,
} from 'scripting'
import { getBillData } from './lib/api'
import { loadSettings } from './lib/store'
import { recentDays, shortTime } from './lib/calc'
import type { BillViewModel } from './lib/types'

const settings = loadSettings()

const bg: DynamicShapeStyle = { light: '#F2F2F7', dark: '#1C1C1E' }
const panelBg: DynamicShapeStyle = { light: '#E2E2E7', dark: '#2C2C2F' }
const labelColor: DynamicShapeStyle = { light: '#6E6E73', dark: '#98989F' }
const valueColor: DynamicShapeStyle = { light: '#1C1C1E', dark: '#F2F2F7' }
const sepGray: DynamicShapeStyle = { light: 'rgba(120,120,120,0.35)', dark: 'rgba(180,180,180,0.28)' }

const chartColor = '#0db38e' as ShapeStyle
const accentColor = '#3A9690' as ShapeStyle

const LOGO_URL = 'https://raw.githubusercontent.com/anker1209/icon/main/gjdw.png'
const PANEL_WIDTH = 124

function formatKwh(n: number): string {
  return n < 10 ? n.toFixed(2) : n.toFixed(0)
}

function Metric({ label, value, unit, align = 'leading' }: {
  label: string; value: string; unit: string; align?: 'leading' | 'trailing'
}) {
  return (
    <VStack alignment={align} spacing={1}>
      <Text font={11} fontWeight="semibold" foregroundStyle={labelColor}>{label}</Text>
      <HStack alignment="firstTextBaseline" spacing={1.5}>
        <Text font={17} fontWeight="medium" fontDesign="rounded" foregroundStyle={valueColor}>{value}</Text>
        <Text font={9} fontWeight="semibold" foregroundStyle={labelColor}>{unit}</Text>
      </HStack>
    </VStack>
  )
}

const BAR_W = 5
const BAR_GAP = 6
const CHART_H = 31
const CORNER_R = 2
const CHART_BOX_HEIGHT = 34
const BASELINE_DESCENT = 4
const VALUE_FONT = 9
const VALUE_GAP = 1

function DayChart({ data }: { data: BillViewModel['dayElePq'] }) {
  const bars = recentDays(data, settings.dayAmount)
  const n = bars.length
  const showValues = settings.showChartValues && n <= 7
  const gap = showValues ? 3 : BAR_GAP
  const VALUE_W = 16
  const itemW = showValues ? Math.max(BAR_W, VALUE_W) : BAR_W
  const chartWidth = n * itemW + (n - 1) * gap
  if (n === 0) {
    return <Text font={11} fontWeight="semibold" foregroundStyle={labelColor} frame={{ width: chartWidth }}>暂无用电数据</Text>
  }
  const max = Math.max(...bars.map(b => b.elePq), 0.01)
  const boxHeight = showValues ? CHART_BOX_HEIGHT + VALUE_FONT + VALUE_GAP : CHART_BOX_HEIGHT
  return (
    <ZStack alignment="bottomLeading" frame={{ width: chartWidth, height: boxHeight }} offset={{ x: 0, y: -BASELINE_DESCENT }}>
      <HStack alignment="bottom" spacing={gap}>
        {bars.map(item => {
          const ratio = item.elePq / max
          const h = Math.max(ratio * CHART_H, 2)
          return (
            <VStack key={item.label} alignment="center" spacing={VALUE_GAP}>
              {showValues ? <Text font={VALUE_FONT} fontWeight="bold" foregroundStyle={labelColor} frame={{ width: VALUE_W }}>{Math.round(item.elePq)}</Text> : null}
              <Rectangle fill={chartColor} frame={{ width: BAR_W, height: h }} clipShape={{ type: 'rect', cornerRadius: CORNER_R }} />
            </VStack>
          )
        })}
      </HStack>
    </ZStack>
  )
}

function DayFeeMetric({ vm, align = 'leading' }: { vm: BillViewModel; align?: 'leading' | 'trailing' }) {
  return (
    <VStack alignment={align} spacing={1}>
      <Text font={10} fontWeight="semibold" foregroundStyle={labelColor} lineLimit={1}>今日用电</Text>
      <HStack alignment="firstTextBaseline" spacing={1}>
        <Text font={18} fontWeight="semibold" fontDesign="rounded" foregroundStyle={chartColor} lineLimit={1}>{vm.dayFee.toFixed(2)}</Text>
        <Text font={10} fontWeight="semibold" foregroundStyle={labelColor}>度</Text>
      </HStack>
    </VStack>
  )
}

function LeftPanel({ vm, logoImage }: { vm: BillViewModel; logoImage?: UIImage | null }) {
  return (
    <VStack alignment="leading" spacing={0} padding={{ leading: 22, trailing: 12, vertical: 24 }}>
      <HStack padding={{ trailing: 10 }}>
        <Spacer />
        {logoImage ? (
          <Image image={logoImage} resizable scaleToFit frame={{ width: 50, height: 50 }} />
        ) : (
          <Image systemName="bolt.circle.fill" resizable scaleToFit frame={{ width: 50, height: 50 }} foregroundStyle={accentColor} />
        )}
        <Spacer />
      </HStack>
      <Spacer />
      <Text font={10} fontWeight="semibold" foregroundStyle={labelColor}>上期电费</Text>
      <HStack alignment="firstTextBaseline" spacing={2}>
        <Text
          font={(() => { const len = vm.monthFee.toFixed(2).length; return len <= 5 ? 22 : len === 6 ? 20 : 18; })()}
          fontWeight="semibold" fontDesign="rounded" foregroundStyle={valueColor}
        >{vm.monthFee.toFixed(2)}</Text>
        <Text font={11} fontWeight="semibold" foregroundStyle={labelColor}>元</Text>
      </HStack>
      <Spacer />
      <HStack spacing={3}>
        <Image systemName="clock" resizable scaleToFit frame={{ width: 11, height: 11 }} foregroundStyle={labelColor} />
        <Text font={11} fontWeight="semibold" foregroundStyle={labelColor} lineLimit={1}>{shortTime(vm.update)}</Text>
      </HStack>
    </VStack>
  )
}

function ThinLine({ color = sepGray, height = 0.5 }: { color?: ShapeStyle | DynamicShapeStyle; height?: number }) {
  return <Rectangle fill={color} frame={{ height }} />
}

function RightPanel({ vm }: { vm: BillViewModel }) {
  return (
    <VStack alignment="leading" spacing={0} padding={{ leading: 14, trailing: 16, vertical: 22 }}>
      {/* 第一栏：今日用电 + 日用电图表 */}
      <HStack alignment="bottom" spacing={0} frame={{ maxWidth: 'infinity' }}>
        <VStack alignment="leading"><DayFeeMetric vm={vm} /></VStack>
        <Spacer />
        <VStack alignment="trailing"><DayChart data={vm.dayElePq} /></VStack>
      </HStack>

      <Spacer /><ThinLine /><Spacer />

      {/* 第二栏：本月电量 + 上月电量 */}
      <HStack alignment="firstTextBaseline" spacing={0} frame={{ maxWidth: 'infinity' }}>
        <VStack alignment="leading">
          <Metric label="本月电量" value={formatKwh(vm.currentMonthEle)} unit="度" />
        </VStack>
        <Spacer />
        <VStack alignment="trailing">
          <Metric label="上月电量" value={formatKwh(vm.monthUsage)} unit="度" align="trailing" />
        </VStack>
      </HStack>

      <Spacer /><ThinLine /><Spacer />

      {/* 第三栏：年度电量 + 年度电费 */}
      <HStack alignment="firstTextBaseline" spacing={0} frame={{ maxWidth: 'infinity' }}>
        <VStack alignment="leading">
          <Metric label="年度电量" value={formatKwh(vm.yearUsage)} unit="度" />
        </VStack>
        <Spacer />
        <VStack alignment="trailing">
          <Metric label="年度电费" value={vm.yearFee.toFixed(2)} unit="元" align="trailing" />
        </VStack>
      </HStack>
    </VStack>
  )
}

function WidgetView({ vm, logoImage }: { vm: BillViewModel; logoImage?: UIImage | null }) {
  return (
    <HStack spacing={0} widgetBackground={panelBg}>
      <VStack spacing={0} frame={{ width: PANEL_WIDTH }} background={bg}>
        <LeftPanel vm={vm} logoImage={logoImage} />
      </VStack>
      <RightPanel vm={vm} />
    </HStack>
  )
}

function ErrorView({ message }: { message: string }) {
  return (
    <VStack spacing={6} padding={{ horizontal: 20, vertical: 16 }} widgetBackground={bg}>
      <Image systemName="exclamationmark.triangle.fill" resizable scaleToFit frame={{ width: 30, height: 30 }} foregroundStyle="#FF9500" />
      <Text font={13} fontWeight="semibold" foregroundStyle={valueColor}>数据加载失败</Text>
      <Text font={10} foregroundStyle={labelColor} multilineTextAlignment="center" lineLimit={2}>{message}</Text>
      <Text font={9} foregroundStyle={labelColor}>请检查 Home Assistant 配置与网络</Text>
    </VStack>
  )
}

function demoViewModel(): BillViewModel {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const days = Array.from({ length: 10 }, (_, i) => ({
    label: `${y}${m}${String(i + 12).padStart(2, '0')}`,
    elePq: Number((6 + Math.sin(i * 1.1) * 4 + i * 0.35).toFixed(2)),
  }))
  return {
    consNo: 'sensor.demo',
    consName: '演示数据',
    yearFee: 968.4,
    yearUsage: 515,
    monthFee: 198.25,
    monthUsage: 305,
    currentMonthEle: 37.5,
    dayFee: days[days.length - 1].elePq,
    dayElePq: days,
    monthElePq: [
      { label: `${y}06`, elePq: 210, cost: 126.5 },
      { label: `${y}07`, elePq: 305, cost: 198.25 },
    ],
    update: '演示数据',
  }
}

async function main() {
  const param = (Widget.parameter ?? '').trim().toLowerCase()

  let logoImage: UIImage | null = null
  try {
    logoImage = await UIImage.fromURL(LOGO_URL)
  } catch (e) {
    console.log(`logo 加载失败：${e instanceof Error ? e.message : e}`)
  }

  if (param === 'demo') {
    Widget.present(<WidgetView vm={demoViewModel()} logoImage={logoImage} />, {
      policy: 'system',
    })
    return
  }

  try {
    const vm = await getBillData(settings)
    Widget.present(<WidgetView vm={vm} logoImage={logoImage} />, {
      policy: 'system',
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error(`小组件渲染失败：${message}`)
    Widget.present(<ErrorView message={message} />, {
      policy: 'system',
    })
  }
}

main()
