import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger, OnModuleInit } from '@nestjs/common';
import { BinanceService } from './binance.service';
import { PROTO_PATH, WS_EVENTS } from '@ws-lab/shared';
import { TickerData, type AuthSocket } from './interfaces/binance.interfaces';
import { JwtService } from '@nestjs/jwt';
import { CasdoorUser } from 'src/auth/interfaces/casdoor.interfaces';
import * as protobuf from 'protobufjs';
import * as cookie from 'cookie';

@WebSocketGateway({
  cors: {
    origin: process.env.WEB_URL,
    credentials: true,
  },
})
export class BinanceGateway implements OnGatewayConnection, OnModuleInit {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(BinanceGateway.name);
  private priceUpdateProto: protobuf.Type | null = null;

  constructor(
    private readonly binanceService: BinanceService,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    try {
      const root = await protobuf.load(PROTO_PATH);
      this.priceUpdateProto = root.lookupType('ticker.PriceUpdate');
      this.logger.log('Protobuf schema loaded successfully');
      this.subscribeToBinanceUpdates();
    } catch (error) {
      this.logger.error('Failed to load Protobuf schema', error);
    }
  }

  async handleConnection(client: AuthSocket) {
    try {
      const cookieHeader = client.handshake.headers.cookie;

      if (!cookieHeader) {
        throw new WsException('Cookies not found');
      }

      const parsedCookies = cookie.parseCookie(cookieHeader);

      const authToken = parsedCookies['access_token'];

      if (!authToken) {
        this.logger.error('Casdoor access token missing in cookies');
        throw new WsException('Authorization token not found');
      }

      const user = await this.jwtService.verifyAsync<CasdoorUser>(authToken);

      client.data = {
        user: user,
        subscriptions: new Set<string>(),
      };

      this.logger.log(`Client connected: (${client.id})`);
    } catch (error) {
      this.logger.error(`Connection refused: ${error}`);
      client.disconnect();
    }
  }

  @SubscribeMessage(WS_EVENTS.SUBSCRIBE)
  handleSubscribe(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() payload: { symbols: string[] },
  ) {
    const { symbols } = payload;

    symbols.forEach((symbol) => {
      const upperSymbol = symbol.toUpperCase();
      client.data.subscriptions.add(upperSymbol);
    });

    this.logger.log(`Client ${client.id} subscribed to: ${symbols.join(', ')}`);

    return {
      event: WS_EVENTS.SUBSCRIBE,
      current: Array.from(client.data.subscriptions),
    };
  }

  private subscribeToBinanceUpdates() {
    this.binanceService.tickerUpdates.subscribe((data: TickerData) => {
      if (!this.priceUpdateProto || !this.server) return;

      const message = this.priceUpdateProto.create({
        symbol: data.symbol,
        price: data.price,
        timestamp: data.timestamp.toString(),
      });

      const buffer = this.priceUpdateProto.encode(message).finish();

      this.server.sockets.sockets.forEach((socket: AuthSocket) => {
        if (socket.data?.subscriptions?.has(data.symbol.toUpperCase())) {
          socket.emit(WS_EVENTS.PRICE_UPDATE, buffer);
        }
      });
    });
  }
}
