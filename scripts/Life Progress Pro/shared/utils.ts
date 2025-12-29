import { fetch, Widget, useObservable } from "scripting";
import { ProgressData, QuoteData, ProgressResult, QuoteApiResponse } from "./types";
import { STORAGE_KEYS, API, DEFAULT_CONFIG, COLORS, ICONS, PROGRESS_LABELS, PROGRESS_KEYS, ERROR_MESSAGES } from "./constants";

interface StorageInterface {
  get<T>(key: string, options?: { shared: boolean }): T | null;
  set<T>(key: string, value: T, options?: { shared: boolean }): boolean;
}
export function calculateProgress(birthday: Date | null, lifeExpectancy: number = DEFAULT_CONFIG.LIFE_EXPECTANCY): ProgressResult {
  const now = new Date();
  
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayProgress = (now.getTime() - startOfDay.getTime()) / DEFAULT_CONFIG.MILLISECONDS_PER_DAY;

  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const startOfWeek = new Date(now.getTime()); 
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);
  const weekProgress = (now.getTime() - startOfWeek.getTime()) / DEFAULT_CONFIG.MILLISECONDS_PER_WEEK;

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const monthProgress = (now.getTime() - startOfMonth.getTime()) / (endOfMonth.getTime() - startOfMonth.getTime());

  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
  const yearProgress = (now.getTime() - startOfYear.getTime()) / (endOfYear.getTime() - startOfYear.getTime());

  let lifeProgress = 0;
  if (birthday) {
    const endOfLife = new Date(birthday.getFullYear() + lifeExpectancy, birthday.getMonth(), birthday.getDate());
    lifeProgress = Math.min(Math.max((now.getTime() - birthday.getTime()) / (endOfLife.getTime() - birthday.getTime()), 0), 1);
  }

  return {
    day: dayProgress,
    week: weekProgress,
    month: monthProgress,
    year: yearProgress,
    life: lifeProgress
  };
}

export function getProgressData(birthday: Date | null = getStoredBirthday(), lifeExpectancy: number = DEFAULT_CONFIG.LIFE_EXPECTANCY): ProgressData[] {
  const progress = calculateProgress(birthday, lifeExpectancy);
  return [
    { 
      label: PROGRESS_LABELS.DAY, 
      value: progress.day, 
      color: COLORS.DAY, 
      key: PROGRESS_KEYS.DAY,
      icon: ICONS.SUN
    },
    { 
      label: PROGRESS_LABELS.WEEK, 
      value: progress.week, 
      color: COLORS.WEEK, 
      key: PROGRESS_KEYS.WEEK,
      icon: ICONS.CALENDAR_BADGE_CLOCK
    },
    { 
      label: PROGRESS_LABELS.MONTH, 
      value: progress.month, 
      color: COLORS.MONTH, 
      key: PROGRESS_KEYS.MONTH,
      icon: ICONS.CALENDAR
    },
    { 
      label: PROGRESS_LABELS.YEAR, 
      value: progress.year, 
      color: COLORS.YEAR, 
      key: PROGRESS_KEYS.YEAR,
      icon: ICONS.FLAG
    },
    { 
      label: PROGRESS_LABELS.LIFE, 
      value: progress.life, 
      color: COLORS.LIFE, 
      key: PROGRESS_KEYS.LIFE,
      icon: ICONS.HEART
    }
  ];
}

export function getStoredBirthday(): Date | null {
  try {
    const stored = (Storage as unknown as StorageInterface).get<string>(STORAGE_KEYS.BIRTHDAY, { shared: false });
    return stored ? new Date(stored) : null;
  } catch (error) {
    console.error("获取生日数据失败:", error);
    return null;
  }
}

export function setStoredBirthday(birthday: Date): boolean {
  try {
    return (Storage as unknown as StorageInterface).set(STORAGE_KEYS.BIRTHDAY, birthday.toISOString(), { shared: false });
  } catch (error) {
    console.error("保存生日数据失败:", error);
    return false;
  }
}

export function getStoredSmallWidgetDisplay(): string {
  try {
    return (Storage as unknown as StorageInterface).get<string>(STORAGE_KEYS.SMALL_WIDGET_DISPLAY, { shared: false }) || DEFAULT_CONFIG.SMALL_WIDGET_DISPLAY;
  } catch (error) {
    console.error("获取小组件显示设置失败:", error);
    return DEFAULT_CONFIG.SMALL_WIDGET_DISPLAY;
  }
}

export function setStoredSmallWidgetDisplay(value: string): boolean {
  try {
    return (Storage as unknown as StorageInterface).set(STORAGE_KEYS.SMALL_WIDGET_DISPLAY, value, { shared: false });
  } catch (error) {
    console.error("保存小组件显示设置失败:", error);
    return false;
  }
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatIntegerPercentage(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < API.CACHE_DURATION;
}

export function cacheProgressData(progress: ProgressData[]): void {
  try {
    const cacheData = {
      progress,
      timestamp: Date.now()
    };
    (Storage as unknown as StorageInterface).set(STORAGE_KEYS.PROGRESS_CACHE, cacheData, { shared: false });
  } catch (error) {
    console.error("缓存进度数据失败:", error);
  }
}

export function getCachedProgressData(): ProgressData[] | null {
  try {
    const cached = (Storage as unknown as StorageInterface).get<{ progress: ProgressData[]; timestamp: number }>(STORAGE_KEYS.PROGRESS_CACHE, { shared: false });
    if (cached && isCacheValid(cached.timestamp)) {
      return cached.progress;
    }
  } catch (error) {
    console.error("获取缓存进度数据失败:", error);
  }
  return null;
}

export function getWidgetDisplayOptions() {
  return [
    { label: `${PROGRESS_LABELS.DAY}进度`, value: PROGRESS_KEYS.DAY },
    { label: `${PROGRESS_LABELS.WEEK}进度`, value: PROGRESS_KEYS.WEEK },
    { label: `${PROGRESS_LABELS.MONTH}进度`, value: PROGRESS_KEYS.MONTH },
    { label: `${PROGRESS_LABELS.YEAR}进度`, value: PROGRESS_KEYS.YEAR },
    { label: `${PROGRESS_LABELS.LIFE}进度`, value: PROGRESS_KEYS.LIFE }
  ];
}

export function getProgressItemByKey(key: string, birthday: Date | null): ProgressData | null {
  const data = getProgressData(birthday);
  const item = data.find(item => item.key === key);
  if (item) {
    return item;
  }
  return data[3] || null;
}