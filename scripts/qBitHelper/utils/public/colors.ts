import { DynamicShapeStyle } from "scripting";

// 配色方案 - 支持浅色和深色模式（浅色模式模仿群晖监控）
export const Theme = {
  // 背景颜色
  Background: { light: "#EFF1F5", dark: "#24273a" } as DynamicShapeStyle, // Latte Base / Macchiato Base
  
  // 文本颜色
  Text: { light: "#4C4F69", dark: "#b7bdf8" } as DynamicShapeStyle, // Latte Text / Macchiato Lavender
  Subtext: { light: "#6E738D", dark: "#8087a2" } as DynamicShapeStyle, // Latte Subtext0 / Macchiato Overlay1
  
  // 表面颜色（用于卡片、按钮等）
  Surface0: { light: "#DCE0E8", dark: "#363a4f" } as DynamicShapeStyle, // Latte Surface0 / Macchiato Surface0
  Surface1: { light: "#DCE0E8", dark: "#494d64" } as DynamicShapeStyle, // Latte Surface0 / Macchiato Surface1
  
  // 强调色（支持浅色和深色模式）
  Green: { light: "#40A02B", dark: "#a6da95" } as DynamicShapeStyle,   // Latte Green / Macchiato Green (上传)
  Red: { light: "#D20F39", dark: "#ed8796" } as DynamicShapeStyle,     // Latte Red / Macchiato Red (下载)
  Blue: { light: "#1E66F5", dark: "#8aadf4" } as DynamicShapeStyle,   // Latte Blue / Macchiato Blue (种子/活跃)
} as const;

