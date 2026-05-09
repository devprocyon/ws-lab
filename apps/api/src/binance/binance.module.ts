import { Module } from '@nestjs/common';
import { BinanceService } from './binance.service';
import { BinanceGateway } from './binance.gateway';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule],
  providers: [BinanceService, BinanceGateway],
})
export class BinanceModule {}
