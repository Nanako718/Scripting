// 进度数据接口
export interface ProgressData {
  label: string;
  value: number;
  color: string;
  key: string;
  icon: string;
}

// 配置选项接口
export interface ConfigOptions {
  lifeExpectancy: number;
  smallWidgetDisplay: string;
  birthday: Date | null;
}

// 缓存数据接口
export interface CacheData {
  progress: ProgressData[];
  timestamp: number;
}

// 小组件显示选项接口
export interface WidgetDisplayOption {
  label: string;
  value: string;
}

// 用户设置接口
export interface UserSettings {
  birthday?: string;
  smallWidgetDisplay?: string;
  lifeExpectancy?: number;
}

// 计算结果接口
export interface ProgressResult {
  day: number;
  week: number;
  month: number;
  year: number;
  life: number;
}