import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UseGuards, Logger, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as cookie from 'cookie';
import * as protobuf from 'protobufjs';
import * as path from 'path';
import { BinanceService } from './binance.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { TickerData, type AuthenticatedSocket } from './interfaces/binance.interfaces';

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
  private PriceUpdateProto: protobuf.Type | null = null;

  constructor(
    private readonly binanceService: BinanceService,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    try {
      const protoPath = path.join(__dirname, 'proto', 'ticker.proto');
      const root = await protobuf.load(protoPath);
      this.PriceUpdateProto = root.lookupType('ticker.PriceUpdate');
      this.logger.log('Protobuf schema loaded successfully');
      this.subscribeToBinanceUpdates();
    } catch (error) {
      this.logger.error('Failed to load Protobuf schema', error);
    }
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const rawCookies = client.handshake.headers.cookie ?? '';
      const cookies = cookie.parse(rawCookies);
      const token = cookies['access_token'];

      if (!token) {
        throw new Error('No access token found');
      }

      const payload = await this.jwtService.verifyAsync(token);

      client.data = {
        user: payload,
        subscriptions: new Set<string>(),
      };

      this.logger.log(`Client connected: ${payload.name} (${client.id})`);
    } catch (err) {
      this.logger.warn(`Connection refused: ${err}`);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { symbols: string[] },
  ) {
    const { symbols } = payload;

    symbols.forEach((symbol) => {
      const upperSymbol = symbol.toUpperCase();
      client.data.subscriptions.add(upperSymbol);
    });

    this.logger.log(`Client ${client.id} subscribed to: ${symbols.join(', ')}`);

    return {
      event: 'subscribed',
      current: Array.from(client.data.subscriptions),
    };
  }

  private subscribeToBinanceUpdates() {
    this.binanceService.tickerUpdates.subscribe((data: TickerData) => {
      if (!this.PriceUpdateProto || !this.server) return;

      const message = this.PriceUpdateProto.create({
        symbol: data.symbol,
        price: data.price,
        timestamp: data.timestamp.toString(),
      });

      const buffer = this.PriceUpdateProto.encode(message).finish();

      this.server.sockets.sockets.forEach((socket: AuthenticatedSocket) => {
        if (socket.data?.subscriptions?.has(data.symbol.toUpperCase())) {
          socket.emit('price_update', buffer);
        }
      });
    });
  }
}
