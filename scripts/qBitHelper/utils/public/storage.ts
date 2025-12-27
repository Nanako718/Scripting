import { ClientData, HistoryPoint, ClientType } from './types';

export const STORAGE_KEY = 'qbitConfig';
export const HISTORY_KEY = 'qbitHistory';
export const CLIENT_DATA_CACHE_KEY = 'qbitClientDataCache';
export const MAX_HISTORY_POINTS = 10;
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

export const updateHistory = (data: ClientData): HistoryPoint[] => {
  const history = Storage.get<HistoryPoint[]>(HISTORY_KEY) || [];
  const newHistory = [
    ...history,
    {
      timestamp: Date.now(),
      uploadRate: data.uploadRate,
      downloadRate: data.downloadRate
    }
  ].slice(-MAX_HISTORY_POINTS);
  
  Storage.set(HISTORY_KEY, newHistory);
  return newHistory;
};
