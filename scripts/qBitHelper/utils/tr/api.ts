import { fetch } from "scripting";
import { ConfigData } from '../../pages/SettingsPage';
import { ClientData } from '../public/types';

export const TR_SESSION_KEY = 'trSession';

const base64Encode = (str: string): string => Data.fromRawString(str)!.toBase64String();

interface TrSessionStats {
  activeTorrentCount: number;
  downloadSpeed: number;
  pausedTorrentCount: number;
  torrentCount: number;
  uploadSpeed: number;
  'cumulative-stats': {
    uploadedBytes: number;
    downloadedBytes: number;
  };
}

interface TrTorrent {
  id: number;
  status: number;
}

const TR_STATUS = {
  DOWNLOAD: 4,
  DOWNLOAD_WAIT: 3,
  SEED: 6,
  SEED_WAIT: 5,
} as const;

const isDownloading = (status: number) => status === TR_STATUS.DOWNLOAD || status === TR_STATUS.DOWNLOAD_WAIT;
const isUploading = (status: number) => status === TR_STATUS.SEED || status === TR_STATUS.SEED_WAIT;

const fetchTr = async (config: ConfigData, method: string, args?: Record<string, any>): Promise<any> => {
  const rpcUrl = `${config.url}/transmission/rpc`;
  const auth = base64Encode(`${config.username}:${config.password}`);
  let sessionId = Storage.get<string>(TR_SESSION_KEY) || '';

  const makeRequest = async (sid: string) => fetch(rpcUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`,
      'X-Transmission-Session-Id': sid,
    },
    body: JSON.stringify({ method, arguments: args }),
  });

  let response = await makeRequest(sessionId);

  if (response.status === 409) {
    const newSessionId = response.headers.get('X-Transmission-Session-Id') || 
                         response.headers.get('x-transmission-session-id') || '';
    if (newSessionId) {
      Storage.set(TR_SESSION_KEY, newSessionId);
      response = await makeRequest(newSessionId);
    }
  }

  if (!response.ok) throw new Error(`Transmission API error: ${response.status}`);

  const data = await response.json();
  if (data.result !== 'success') throw new Error(`Transmission error: ${data.result}`);

  return data.arguments;
};

export const fetchTrData = async (config: ConfigData): Promise<ClientData | null> => {
  try {
    const [sessionStats, torrentsResult, sessionInfo] = await Promise.all([
      fetchTr(config, 'session-stats'),
      fetchTr(config, 'torrent-get', { fields: ['id', 'status'] }),
      fetchTr(config, 'session-get'),
    ]);

    const stats: TrSessionStats = sessionStats;
    const torrents: TrTorrent[] = torrentsResult.torrents || [];

    return {
      upload: stats['cumulative-stats']?.uploadedBytes || 0,
      download: stats['cumulative-stats']?.downloadedBytes || 0,
      seeds: stats.torrentCount || torrents.length,
      uploadRate: stats.uploadSpeed || 0,
      downloadRate: stats.downloadSpeed || 0,
      version: sessionInfo.version || 'Unknown',
      downloadingSeeds: torrents.filter(t => isDownloading(t.status)).length,
      uploadingSeeds: torrents.filter(t => isUploading(t.status)).length,
    };
  } catch {
    return null;
  }
};

export const clearTrSession = () => Storage.remove(TR_SESSION_KEY);
