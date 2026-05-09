import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Subject } from 'rxjs';
import WebSocket from 'ws';
import { BinanceTradeMessage, TickerData } from './interfaces/binance.interfaces';

@Injectable()
export class BinanceService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BinanceService.name);
  private ws: WebSocket | null = null;

  public readonly tickerUpdates = new Subject<TickerData>();

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.connectToBinance();
  }

  onModuleDestroy() {
    this.tickerUpdates.complete();
    this.closeConnection();
  }

  private connectToBinance() {
    const wsUrl = this.configService.getOrThrow<string>('BINANCE_WS_URL');
    this.ws = new WebSocket(wsUrl);

    this.ws.on('open', () => {
      this.logger.log('Successfully connected to Binance WebSocket');
      this.subscribeToStreams();
    });

    this.ws.on('message', (data: WebSocket.Data) => {
      this.handleIncomingMessage(data);
    });

    this.ws.on('error', (error) => {
      this.logger.error(`Binance WebSocket error: ${error.message}`);
    });

    this.ws.on('close', () => {
      this.logger.warn(
        'Binance WebSocket connection closed. Reconnecting in 5s...',
      );
    });
  }

  private subscribeToStreams() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const payload = {
      method: 'SUBSCRIBE',
      params: ['btcusdt@trade', 'ethusdt@trade'],
      id: 1,
    };

    this.ws.send(JSON.stringify(payload));
  }

  private handleIncomingMessage(data: WebSocket.Data) {
    try {
      let rawData: string;
      if (typeof data === 'string') {
        rawData = data;
      } else if (Buffer.isBuffer(data)) {
        rawData = data.toString('utf-8');
      } else if (data instanceof ArrayBuffer) {
        rawData = Buffer.from(data).toString('utf-8');
      } else {
        rawData = Buffer.concat(data).toString('utf-8');
      }

      const message = JSON.parse(rawData) as BinanceTradeMessage;

      if (message.e === 'trade') {
        const update: TickerData = {
          symbol: message.s,
          price: message.p,
          timestamp: message.T,
        };

        this.tickerUpdates.next(update);
      }
    } catch (error) {
      this.logger.error('Error parsing Binance message', error);
    }
  }

  private closeConnection() {
    if (this.ws) {
      this.ws.terminate();
      this.ws = null;
    }
  }
}
