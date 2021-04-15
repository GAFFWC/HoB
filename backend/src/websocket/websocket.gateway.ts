import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { map } from 'rxjs/operators';
import { Inject, Injectable } from '@nestjs/common';
import { WebsocketService } from './websocket.service';

@WebSocketGateway(4000)
export class WebSocketIOGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer()
    server: Server;

    afterInit() {
        console.log('WebSocket Initialization Complete!');
    }

    handleConnection(@ConnectedSocket() client: Socket) {
        console.log('connect');
        console.log(client);
    }

    handleDisconnect() {
        console.log('disconnect');
    }

    @SubscribeMessage('open')
    get(@ConnectedSocket() client: Socket, @MessageBody() data: string): Observable<WsResponse<string>> {
        return from(['1', '2', '3']).pipe(map((item) => ({ event: 'UPBIT_ALL', data: item })));
    }

    @SubscribeMessage('events')
    connection(@ConnectedSocket() client: Socket): WsResponse<string> {
        console.log('hi');

        return {
            event: 'connection',
            data: 'Connected',
        };
    }
}
