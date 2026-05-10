import { CasdoorUser } from '@ws-lab/shared';
import { Socket } from 'socket.io';

export interface SocketData {
  user: CasdoorUser;
  subscriptions: Set<string>;
}

export interface AuthSocket extends Socket {
  data: SocketData;
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
