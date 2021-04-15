import { Module } from '@nestjs/common';
import { WebSocketIOGateway } from './websocket.gateway';
import { WebsocketService } from './websocket.service';

@Module({
    providers: [WebSocketIOGateway, WebsocketService],
})
export class WebsocketModule {}
