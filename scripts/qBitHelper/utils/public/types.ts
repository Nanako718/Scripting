export interface ClientData {
  upload: number;
  download: number;
  seeds: number;
  uploadRate: number;
  downloadRate: number;
  version?: string;
  downloadingSeeds: number;
  uploadingSeeds: number;
}

export interface HistoryPoint {
  timestamp: number;
  uploadRate: number;
  downloadRate: number;
}

export type ClientType = 'qb' | 'tr';

export interface ClientConfig {
  url: string;
  username: string;
  password: string;
  alias?: string;
  visible?: boolean;
}

export interface MultiClientConfig {
  qb: (ClientConfig | null)[];
  tr: (ClientConfig | null)[];
  activeClient?: { type: ClientType; index: number };
}
