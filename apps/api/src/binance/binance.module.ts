import { Module } from '@nestjs/common';
import { BinanceService } from './binance.service';
import { BinanceGateway } from './binance.gateway';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [BinanceService, BinanceGateway],
})
export class BinanceModule {}
