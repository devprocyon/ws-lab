import { Socket } from 'socket.io';

export interface CasdoorUser {
  sub: string;
  name: string;
  email?: string;
  picture?: string;
  preferred_username?: string;
}

export interface SocketData {
  user: CasdoorUser;
  subscriptions: Set<string>;
}

export type AuthenticatedSocket = Socket & {
  data: SocketData;
};

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
  b: number; // Buyer order ID
  a: number; // Seller order ID
  T: number; // Trade time
  m: boolean; // Is buyer market maker
  M: boolean; // Ignore
}
