// 中型组件 UI 样式开关（供 index.ts 导出；index.tsx / widget.tsx 为降低运行时依赖已内联同款读写）
// version: 2026-09-21-2210

export type WidgetUiStyle = 'classic' | 'magotan'

export const WIDGET_UI_STYLE_STORAGE_KEY = 'yqdz_widget_ui_style'

const isWidgetUiStyle = (value: unknown): value is WidgetUiStyle => {
  return value === 'classic' || value === 'magotan'
}

export const getWidgetUiStyle = (): WidgetUiStyle => {
  const stored = Storage.get<WidgetUiStyle>(WIDGET_UI_STYLE_STORAGE_KEY)
  return isWidgetUiStyle(stored) ? stored : 'classic'
}

export const setWidgetUiStyle = (style: WidgetUiStyle): void => {
  if (!isWidgetUiStyle(style)) {
    return
  }
  Storage.set(WIDGET_UI_STYLE_STORAGE_KEY, style)
}

export const WIDGET_UI_STYLE_OPTIONS: { label: string; value: WidgetUiStyle }[] = [
  { label: '第一套·经典', value: 'classic' },
  { label: '第二套·MAGOTAN', value: 'magotan' },
]
