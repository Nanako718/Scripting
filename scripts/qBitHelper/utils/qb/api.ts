import { fetch } from "scripting";
import { ConfigData } from '../../pages/SettingsPage';
import { ClientData } from '../public/types';

export const QB_SESSION_KEY = 'qbitSession';

interface QbTransferInfo {
  dl_info_speed: number;
  dl_info_data: number;
  up_info_speed: number;
  up_info_data: number;
}

interface QbTorrentInfo {
  state: string;
}

const extractSID = (setCookie: string | null): string | null =>
  setCookie?.match(/SID=([^;]+)/)?.[1] ?? null;

const loginQb = async (config: ConfigData): Promise<string | null> => {
  try {
    const response = await fetch(`${config.url}/api/v2/auth/login`, {
      method: 'POST',
      body: `username=${encodeURIComponent(config.username)}&password=${encodeURIComponent(config.password)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    
    if ((await response.text()) !== 'Ok.') return null;
    return extractSID(response.headers.get('set-cookie') || response.headers.get('Set-Cookie'));
  } catch {
    return null;
  }
};

const getOrRefreshSession = async (config: ConfigData): Promise<string | null> => {
  let sid = Storage.get<string>(QB_SESSION_KEY);
  if (!sid) {
    sid = await loginQb(config);
    if (sid) Storage.set(QB_SESSION_KEY, sid);
  }
  return sid;
};

const fetchWithAuth = async (config: ConfigData, url: string) => {
  let sid = await getOrRefreshSession(config);
  if (!sid) throw new Error('登录失败');

  let response = await fetch(url, { headers: { 'Cookie': `SID=${sid}` } });

  if (response.status === 403) {
    Storage.remove(QB_SESSION_KEY);
    sid = await loginQb(config);
    if (!sid) throw new Error('重新登录失败');
    Storage.set(QB_SESSION_KEY, sid);
    response = await fetch(url, { headers: { 'Cookie': `SID=${sid}` } });
    if (!response.ok) throw new Error('获取数据失败');
  }

  return response;
};

const isDownloading = (state: string) => state.includes('downloading') || state === 'stalledDL';
const isUploading = (state: string) => state.includes('uploading') || state === 'stalledUP' || state.includes('seeding');

export const fetchQbData = async (config: ConfigData): Promise<ClientData | null> => {
  try {
    const [transferRes, torrentsRes, versionRes] = await Promise.all([
      fetchWithAuth(config, `${config.url}/api/v2/transfer/info`),
      fetchWithAuth(config, `${config.url}/api/v2/torrents/info`),
      fetchWithAuth(config, `${config.url}/api/v2/app/version`),
    ]);

    const [transfer, torrents, version]: [QbTransferInfo, QbTorrentInfo[], string] = await Promise.all([
      transferRes.json(),
      torrentsRes.json(),
      versionRes.text(),
    ]);

    return {
      upload: transfer.up_info_data || 0,
      download: transfer.dl_info_data || 0,
      seeds: torrents.length,
      uploadRate: transfer.up_info_speed || 0,
      downloadRate: transfer.dl_info_speed || 0,
      version: version || 'Unknown',
      downloadingSeeds: torrents.filter(t => isDownloading(t.state)).length,
      uploadingSeeds: torrents.filter(t => isUploading(t.state)).length,
    };
  } catch {
    return null;
  }
};

export const clearQbSession = () => Storage.remove(QB_SESSION_KEY);
