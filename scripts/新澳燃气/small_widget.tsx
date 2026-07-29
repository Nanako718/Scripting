import {
  HStack,
  Rectangle,
  Spacer,
  Text,
  VStack,
} from "scripting"

const PADDING = 14

function todayStr(): string {
  const d = new Date()
  const pad = (n: number) => n < 10 ? "0" + n : "" + n
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function formatDate(dateStr: string): string {
  const parts = dateStr.split("-")
  if (parts.length < 3) return dateStr
  return parseInt(parts[1]) + "月" + parseInt(parts[2]) + "日"
}

// ========== 柱形图 ==========

export function BarChart({ deltas, barHeight }: { deltas: number[]; barHeight: number }) {
  const max = Math.max(...deltas, 0.1)
  const lastIndex = deltas.length - 1
  return (
    <HStack alignment="bottom" spacing={2} frame={{ height: barHeight }}>
      {deltas.map((d, i) => {
        const ratio = d / max
        const h = Math.max(ratio * barHeight, 2)
        const isLast = i === lastIndex
        const color = isLast ? "rgba(255, 140, 56, 0.9)" : `rgba(160, 160, 170, ${0.2 + ratio * 0.35})`
        return (
          <Rectangle
            key={i}
            fill={color}
            frame={{ height: h, width: 10 }}
            clipShape={{ type: "rect", cornerRadius: 2, style: "continuous" }}
          />
        )
      })}
      <Spacer />
    </HStack>
  )
}

// ========== 小型组件 ==========

export function SmallWidget({ deltas, usage, avg }: { deltas: number[]; usage: number; avg: string }) {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 6 * 86400000)
  const startStr = `${weekAgo.getFullYear()}-${String(weekAgo.getMonth() + 1).padStart(2, "0")}-${String(weekAgo.getDate()).padStart(2, "0")}`
  const endStr = todayStr()

  return (
    <VStack padding={{ leading: PADDING, trailing: PADDING, bottom: PADDING, top: 8 }} alignment="leading" spacing={4}>
      <Text font="caption" foregroundStyle="secondaryLabel">用气量</Text>
      <Text font="title3" fontWeight="bold" foregroundStyle="label">{"平均 " + avg + " m³"}</Text>
      <Text font="caption2" foregroundStyle="tertiaryLabel">近7天用气趋势</Text>
      <Spacer />
      <VStack spacing={-16}>
        <BarChart deltas={deltas} barHeight={50} />
        <HStack frame={{ maxWidth: Infinity }}>
          <Text font="caption2" foregroundStyle="tertiaryLabel">{formatDate(startStr)}</Text>
          <Spacer />
          <Text font="caption2" foregroundStyle="#FF8C38">{formatDate(endStr)}</Text>
        </HStack>
      </VStack>
    </VStack>
  )
}
