import { Socket } from 'socket.io';
import { CasdoorUser } from 'src/auth/interfaces/casdoor.interfaces';

export interface SocketData {
  user: CasdoorUser;
  subscriptions: Set<string>;
}

export interface AuthSocket extends Socket {
  data: SocketData;
}

export interface TickerData {
  symbol: string;
  price: string;
  timestamp: number;
}

export interface BinanceTradeMessage {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  t: number; // Trade ID
  p: string; // Price
  q: string; // Quantity
  T: number; // Trade time
  m: boolean; // Is buyer market maker
  M: boolean; // Ignore
}
