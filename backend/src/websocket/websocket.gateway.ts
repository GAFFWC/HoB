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
import { UpbitPriceDTO } from 'src/upbit/dto/price.dto';
import { RedisService } from 'src/redis/redis.service';
import { RedisExpression } from 'src/redis/constant/constant.enum';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';
import { UpbitService } from 'src/upbit/upbit.service';
import { IntervalExpression, PriceCheckDTO, SymbolsDTO } from 'src/dto/websocket.dto';
import { BinanceService } from 'src/binance/binance.service';
import { BinanceModule } from 'src/binance/binance.module';

@WebSocketGateway(4000)
export class WebSocketIOGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    constructor(
        @Inject(UpbitService) private readonly upbitService: UpbitService,
        @Inject(BinanceService) private readonly binanceService: BinanceService,
    ) {}

    private upbitGetting = false;
    private binanceGetting = false;

    private symbols = new SymbolsDTO();
    private oldPrice = new PriceCheckDTO();

    private clients = 0;

    @WebSocketServer()
    server: Server;

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: 'Asia/Seoul' })
    async init() {
        this.symbols.upbit = await this.upbitService.getSymbols();
    }

    afterInit() {
        console.log('WebSocket Initialization Complete!');
        this.oldPrice = new PriceCheckDTO();
        this.symbols = new SymbolsDTO();

        this.symbols.upbit = [];
        this.oldPrice.upbit = {};
        this.oldPrice.binance = {};
    }

    async handleConnection(@ConnectedSocket() client: Socket) {
        this.clients++;
        console.log('New Connection!');
        return await this.init();
    }

    handleDisconnect() {
        this.clients--;
        console.log('Disconnected');
    }

    @Interval(IntervalExpression.UPBIT)
    async upbit() {
        try {
            if (!this.clients || this.upbitGetting) {
                return;
            }

            this.upbitGetting = true;

            if (!this.symbols.upbit.length) {
                await this.init();
            }

            const upbitPrice = await this.upbitService.getPrice(this.symbols.upbit);

            const newUpbitPrice = {};

            Object.keys(upbitPrice).forEach((market: string) => {
                if (!this.oldPrice.upbit[`${market}`] || this.oldPrice.upbit[`${market}`] != upbitPrice[`${market}`].now) {
                    this.oldPrice.upbit[`${market}`] = upbitPrice[`${market}`].now;
                    newUpbitPrice[`${market.split('-')[1]}`] = upbitPrice[`${market}`];
                }
            });

            // console.log(Object.keys(newUpbitPrice));
            this.server.clients().emit('upbit', newUpbitPrice);

            this.upbitGetting = false;
        } catch (err) {
            console.error(err);
        }
    }

    @Interval(IntervalExpression.BINANCE)
    async binance() {
        try {
            if (!this.clients || this.binanceGetting) {
                return;
            }

            if (!this.symbols.upbit.length) {
                await this.init();
            }

            this.binanceGetting = true;

            const binancePrice = await this.binanceService.getPrice();

            const newBinancePrice = {};

            Object.keys(binancePrice).forEach((market: string) => {
                if (!this.oldPrice.binance[`${market}`] || this.oldPrice.binance[`${market}`] != binancePrice[`${market}`].now) {
                    this.oldPrice.binance[`${market}`] = binancePrice[`${market}`].now;
                    newBinancePrice[`${market}`] = binancePrice[`${market}`];
                }
            });

            console.log(Object.keys(newBinancePrice).length);
            this.server.clients().emit('binance', newBinancePrice);

            this.binanceGetting = false;
        } catch (err) {
            console.error(err);
        }
    }
}
