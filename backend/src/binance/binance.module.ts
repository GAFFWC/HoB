import { HttpModule, Module } from '@nestjs/common';
import { UpbitModule } from 'src/upbit/upbit.module';
import { BinanceService } from './binance.service';

@Module({
    imports: [HttpModule, UpbitModule],
    exports: [BinanceModule, BinanceService],
    providers: [BinanceService],
})
export class BinanceModule {}
