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
import SocketIO, { Server, Socket } from 'socket.io';
import { map } from 'rxjs/operators';
import { Inject, Injectable } from '@nestjs/common';
import { WebsocketService } from './websocket.service';
import { PriceDTO } from 'src/upbit/dto/price.dto';
import { RedisService } from 'src/redis/redis.service';
import { RedisExpression } from 'src/redis/constant/constant.enum';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';
import { UpbitService } from 'src/upbit/upbit.service';

@WebSocketGateway(4000)
export class WebSocketIOGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    constructor(
        @Inject(UpbitService) private readonly upbitService: UpbitService,
        @Inject(RedisService) private readonly redisService: RedisService,
    ) {}

    private priceGetting = false;
    private symbols = [];
    private oldPrice = {};
    private clientsCnt = 0;

    @WebSocketServer()
    server: Server;

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: 'Asia/Seoul' })
    async init() {
        this.symbols = await this.upbitService.getSymbols();
        this.oldPrice = {};
    }

    afterInit() {
        console.log('WebSocket Initialization Complete!');
    }

    async handleConnection(@ConnectedSocket() client: Socket) {
        this.clientsCnt++;
        console.log('New Connection!');
        return await this.init();
    }

    handleDisconnect() {
        this.clientsCnt--;
        console.log('Disconnected');
    }

    @Interval(200)
    async price() {
        try {
            const start = new Date().getTime();

            if (!this.clientsCnt || this.priceGetting) {
                return;
            }

            this.priceGetting = true;

            if (!this.symbols.length) {
                await this.init();
            }

            const price = await this.upbitService.getPrice(this.symbols);

            const newPrice = price.filter((p) => {
                if (!this.oldPrice[`${p.market}`] || this.oldPrice[`${p.market}`] != p.now) {
                    this.oldPrice[`${p.market}`] = p.now;
                    return p;
                }
            });

            this.priceGetting = false;

            const end = new Date().getTime();

            console.log(`${newPrice.length} : ${end - start} ms`);

            this.server.clients().emit('price', newPrice);
            return;
        } catch (err) {
            console.error(err);
        }
    }
}
