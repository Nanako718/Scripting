import { ClientData, HistoryPoint, ClientType } from './types';

export const STORAGE_KEY = 'qbitConfig';
export const HISTORY_KEY = 'qbitHistory';
export const CLIENT_DATA_CACHE_KEY = 'qbitClientDataCache';
export const MAX_HISTORY_HOURS = 12; // 保存12个小时的数据
export const DEFAULT_REFRESH_MINUTES = 0.5;
export const CACHE_DURATION = 5 * 60 * 1000; // 5分钟

// 客户端数据缓存结构
export interface ClientDataCache {
  [key: string]: {
    data: ClientData;
    timestamp: number;
  };
}

// 生成缓存 key
export const getCacheKey = (type: ClientType, index: number) => `${type}_${index}`;

// 获取缓存的客户端数据
export const getCachedClientData = (type: ClientType, index: number): ClientData | null => {
  const cache = Storage.get<ClientDataCache>(CLIENT_DATA_CACHE_KEY);
  const cached = cache?.[getCacheKey(type, index)];
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

// 保存客户端数据到缓存
export const setCachedClientData = (type: ClientType, index: number, data: ClientData) => {
  const cache = Storage.get<ClientDataCache>(CLIENT_DATA_CACHE_KEY) || {};
  cache[getCacheKey(type, index)] = { data, timestamp: Date.now() };
  Storage.set(CLIENT_DATA_CACHE_KEY, cache);
};

// 获取小时时间戳（整点）
const getHourTimestamp = (timestamp: number): number => {
  const date = new Date(timestamp);
  date.setMinutes(0, 0, 0);
  return date.getTime();
};

// 按小时聚合历史数据
export const updateHistory = (data: ClientData): HistoryPoint[] => {
  const history = Storage.get<HistoryPoint[]>(HISTORY_KEY) || [];
  const now = Date.now();
  const currentHour = getHourTimestamp(now);
  
  // 找到当前小时的数据点
  const currentHourIndex = history.findIndex(p => getHourTimestamp(p.timestamp) === currentHour);
  
  let newHistory: HistoryPoint[];
  
  if (currentHourIndex >= 0) {
    // 如果当前小时已有数据，更新平均值
    const existingPoint = history[currentHourIndex];
    const count = existingPoint.count || 1;
    newHistory = [...history];
    newHistory[currentHourIndex] = {
      timestamp: currentHour,
      uploadRate: (existingPoint.uploadRate * count + data.uploadRate) / (count + 1),
      downloadRate: (existingPoint.downloadRate * count + data.downloadRate) / (count + 1),
      count: count + 1
    };
  } else {
    // 如果当前小时没有数据，添加新点
    newHistory = [
      ...history,
      {
        timestamp: currentHour,
        uploadRate: data.uploadRate,
        downloadRate: data.downloadRate,
        count: 1
      }
    ];
  }
  
  // 只保留最近12个小时的数据
  const cutoffTime = now - MAX_HISTORY_HOURS * 60 * 60 * 1000;
  newHistory = newHistory.filter(p => p.timestamp >= cutoffTime);
  
  // 按时间戳排序
  newHistory.sort((a, b) => a.timestamp - b.timestamp);
  
  Storage.set(HISTORY_KEY, newHistory);
  return newHistory;
};
