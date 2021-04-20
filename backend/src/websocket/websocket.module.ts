import { Module } from '@nestjs/common';
import { RedisModule } from 'src/redis/redis.module';
import { RedisService } from 'src/redis/redis.service';
import { UpbitModule } from 'src/upbit/upbit.module';
import { WebSocketIOGateway } from './websocket.gateway';
import { WebsocketService } from './websocket.service';

@Module({
    imports: [RedisModule, UpbitModule],
    providers: [WebSocketIOGateway, WebsocketService],
})
export class WebsocketModule {}
