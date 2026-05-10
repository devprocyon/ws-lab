import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { BinanceTradeMessage } from './interfaces/binance.interfaces';
import { ConfigService } from '@nestjs/config';
import { Subject } from 'rxjs';
import { TickerData, TRADE_STREAMS } from '@ws-lab/shared';
import WebSocket from 'ws';

@Injectable()
export class BinanceService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BinanceService.name);
  private readonly wsUrl: string;
  private ws: WebSocket | null = null;

  public readonly tickerUpdates = new Subject<TickerData>();

  constructor(private readonly configService: ConfigService) {
    this.wsUrl = this.configService.getOrThrow('BINANCE_WS_URL');
  }

  onModuleInit() {
    this.connectToBinance();
  }

  onModuleDestroy() {
    this.tickerUpdates.complete();
    this.closeConnection();
  }

  private connectToBinance() {
    this.ws = new WebSocket(this.wsUrl);

    this.ws.on('open', () => {
      this.logger.log('Successfully connected to Binance WebSocket');
      this.subscribeToStreams();
    });

    this.ws.on('message', (data: WebSocket.RawData) => {
      this.handleIncomingMessage(data);
    });

    this.ws.on('error', (error) => {
      this.logger.error(`Binance WebSocket error: ${error.message}`);
    });

    this.ws.on('close', () => {
      this.logger.warn('Binance WebSocket connection closed');
    });
  }

  private subscribeToStreams() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const payload = {
      method: 'SUBSCRIBE',
      params: TRADE_STREAMS,
      id: 1,
    };

    this.ws.send(JSON.stringify(payload));
  }

  private handleIncomingMessage(rawData: WebSocket.RawData) {
    try {
      const data = (rawData as Buffer).toString('utf-8');

      const message = JSON.parse(data) as BinanceTradeMessage;

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
