// 存储键名常量
export const STORAGE_KEYS = {
  BIRTHDAY: "user_birthday",
  SMALL_WIDGET_DISPLAY: "small_widget_display", 
  LIFE_EXPECTANCY: "user_life_expectancy",
  PROGRESS_CACHE: "progress_cache",
  QUOTE_CACHE: "quote_cache"
} as const;

// API 相关常量
export const API = {
  QUOTE_URL: "https://v1.hitokoto.cn/?c=i&c=d&c=k",
  TIMEOUT: 3000,
  CACHE_DURATION: 86400000, // 24小时缓存
  RETRY_COUNT: 2
} as const;

// 默认配置常量
export const DEFAULT_CONFIG = {
  LIFE_EXPECTANCY: 90,
  SMALL_WIDGET_DISPLAY: "year",
  MILLISECONDS_PER_DAY: 86400000,
  MILLISECONDS_PER_WEEK: 604800000
} as const;

// Catppuccin 调色盘
const MOCHA = {
  PINK: "#f5c2e7",
  MAUVE: "#cba6f7",
  RED: "#f38ba8",
  PEACH: "#fab387",
  GREEN: "#a6e3a1",
  BLUE: "#89b4fa",
  SAPPHIRE: "#74c7ec",
  TEXT: "#cdd6f4",
  SUBTEXT1: "#bac2de",
  SUBTEXT0: "#a6adc8",
  OVERLAY1: "#7f849c",
  SURFACE2: "#585b70",
  SURFACE1: "#45475a",
  SURFACE0: "#313244",
  BASE: "#1e1e2e",
  MANTLE: "#181825",
  CRUST: "#11111b"
};

const LATTE = {
  PINK: "#ea76cb",
  MAUVE: "#8839ef",
  RED: "#d20f39",
  PEACH: "#fe640b",
  GREEN: "#40a02b",
  BLUE: "#1e66f5",
  SAPPHIRE: "#209fb5",
  TEXT: "#4c4f69",
  SUBTEXT1: "#5c5f77",
  SUBTEXT0: "#6c6f85",
  OVERLAY1: "#8c8fa1",
  SURFACE2: "#acb0be",
  SURFACE1: "#bcc0cc",
  SURFACE0: "#ccd0da",
  BASE: "#eff1f5",
  MANTLE: "#e6e9ef",
  CRUST: "#dce0e8"
};

// 动态色彩配置 (自动适配深浅模式)
export const CATPPUCCIN = {
  PINK: { light: LATTE.PINK, dark: MOCHA.PINK },
  MAUVE: { light: LATTE.MAUVE, dark: MOCHA.MAUVE },
  RED: { light: LATTE.RED, dark: MOCHA.RED },
  PEACH: { light: LATTE.PEACH, dark: MOCHA.PEACH },
  GREEN: { light: LATTE.GREEN, dark: MOCHA.GREEN },
  BLUE: { light: LATTE.BLUE, dark: MOCHA.BLUE },
  SAPPHIRE: { light: LATTE.SAPPHIRE, dark: MOCHA.SAPPHIRE },
  TEXT: { light: LATTE.TEXT, dark: MOCHA.TEXT },
  SUBTEXT1: { light: LATTE.SUBTEXT1, dark: MOCHA.SUBTEXT1 },
  SUBTEXT0: { light: LATTE.SUBTEXT0, dark: MOCHA.SUBTEXT0 },
  OVERLAY1: { light: LATTE.OVERLAY1, dark: MOCHA.OVERLAY1 },
  SURFACE2: { light: LATTE.SURFACE2, dark: MOCHA.SURFACE2 },
  SURFACE1: { light: LATTE.SURFACE1, dark: MOCHA.SURFACE1 },
  SURFACE0: { light: LATTE.SURFACE0, dark: MOCHA.SURFACE0 },
  BASE: { light: LATTE.BASE, dark: MOCHA.BASE },
  MANTLE: { light: LATTE.MANTLE, dark: MOCHA.MANTLE },
  CRUST: { light: LATTE.CRUST, dark: MOCHA.CRUST }
} as any;

// 进度维度专用色
export const COLORS = {
  DAY: CATPPUCCIN.PEACH,
  WEEK: CATPPUCCIN.GREEN,
  MONTH: CATPPUCCIN.BLUE,
  YEAR: CATPPUCCIN.MAUVE,
  LIFE: CATPPUCCIN.PINK
} as any;

// 图标常量
export const ICONS = {
  SUN: "sun.max.fill",
  CALENDAR_BADGE_CLOCK: "calendar.badge.clock",
  CALENDAR: "calendar",
  FLAG: "flag.fill",
  HEART: "heart.fill"
} as const;

// 进度类型标签常量
export const PROGRESS_LABELS = {
  DAY: "今日",
  WEEK: "本周",
  MONTH: "本月", 
  YEAR: "今年",
  LIFE: "人生"
} as const;

// 进度类型键值常量
export const PROGRESS_KEYS = {
  DAY: "day",
  WEEK: "week",
  MONTH: "month",
  YEAR: "year", 
  LIFE: "life"
} as const;

// 小组件尺寸常量
export const WIDGET_FAMILIES = {
  SMALL: "systemSmall",
  MEDIUM: "systemMedium",
  LARGE: "systemLarge"
} as const;

// 错误消息常量
export const ERROR_MESSAGES = {
  NETWORK_TIMEOUT: "网络请求超时",
  NETWORK_ERROR: "网络连接失败", 
  INVALID_DATE: "日期格式无效",
  CACHE_EXPIRED: "缓存已过期",
  LOAD_FAILED: "加载失败"
} as const;