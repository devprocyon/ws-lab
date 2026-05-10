import * as path from 'path';

export const WS_EVENTS = {
  PRICE_UPDATE: 'price_update',
  SUBSCRIBE: 'subscribe',
} as const;

export const PAIR_SYMBOLS = [
  'BTCUSDT',
  'ETHUSDT',
  'BNBUSDT',
  'SOLUSDT',
  'ADAUSDT',
  'XRPUSDT',
  'DOTUSDT',
  'LTCUSDT',
  'LINKUSDT',
  'MATICUSDT',
] as const;

export type PairSymbol = (typeof PAIR_SYMBOLS)[number];

export const getTradeStreamName = (symbol: string) =>
  `${symbol.toLowerCase()}@trade`;

export const TRADE_STREAMS = PAIR_SYMBOLS.map(getTradeStreamName);

export const PROTO_PATH = path.resolve(__dirname, '../../proto/ticker.proto');
