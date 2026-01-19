
export type CoinType = 'BTC' | 'BCH' | 'DGB';

export interface Device {
  id: string;
  name: string;
  model: 'NerdAxe' | 'Supra 702' | 'Avalon Nano 3';
  nominalHashrate: number; // in GH/s
  currentHashrate: number;
  status: 'online' | 'offline' | 'error';
  shares: number;
}

export interface MiningState {
  isMining: boolean;
  isConnected: boolean;
  activeCoin: CoinType;
  isSolo: boolean;
  payoutAddress: string;
  totalHashRate: number; // GH/s
  acceptedShares: number;
  blocksFound: number;
  rejectedShares: number;
  currentDifficulty: number;
  lastShareTime: number | null;
  poolUrls: Record<CoinType, string>; // Mapping of coin type to stratum URL
  workerName: string;
  devices: Device[];
}

export interface MiningLog {
  id: string;
  timestamp: number;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning' | 'solo';
  deviceId?: string;
}

export interface HashStats {
  time: string;
  rate: number;
}

export enum StratumMethod {
  SUBSCRIBE = 'mining.subscribe',
  AUTHORIZE = 'mining.authorize',
  SET_DIFFICULTY = 'mining.set_difficulty',
  NOTIFY = 'mining.notify',
  SUBMIT = 'mining.submit'
}
