import { HttpModule, HttpService, Module } from '@nestjs/common';
import { RedisModule } from 'src/redis/redis.module';
import { RedisService } from 'src/redis/redis.service';
import { UpbitService } from './upbit.service';

@Module({
    imports: [RedisModule, HttpModule],
    exports: [UpbitModule, UpbitService],
    providers: [UpbitService],
})
export class UpbitModule {}
