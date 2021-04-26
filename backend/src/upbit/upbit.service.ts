import { HttpService, Inject, Injectable, ParseIntPipe, UsePipes } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConnectedSocket } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { RedisExpression } from 'src/redis/constant/constant.enum';
import { RedisService } from 'src/redis/redis.service';
import { MoneyExpression } from './constant/constant.enum';
import { UpbitPriceDTO } from './dto/price.dto';
import { TokenizePipe } from './pipe/tokenize.pipe';
import * as ws from 'ws';
@Injectable()
export class UpbitService {
    constructor(@Inject(HttpService) private readonly http: HttpService, @Inject(RedisService) private readonly redisService: RedisService) {}

    private baseUrl = 'https://api.upbit.com/v1';

    async getSymbols(): Promise<string[]> {
        try {
            return await this.http
                .get(this.baseUrl + '/market/all')
                .toPromise()
                .then((r) => {
                    return r.data
                        .filter((c: any) => {
                            return String(c.market).startsWith(MoneyExpression.KRW);
                        })
                        .map((c: any) => {
                            return c.market;
                        });
                });
        } catch (err) {
            console.error(err);
        }
    }

    async getPrice(symbols: string[]): Promise<object> {
        try {
            return await this.http
                .get(this.baseUrl + `/ticker?markets=${symbols.join(',')}`)
                .toPromise()
                .then((r) => {
                    const newPriceInfo = {};
                    r.data.forEach((c) => {
                        const newPrice = new UpbitPriceDTO();

                        newPrice.market = c.market;
                        newPrice.open = c.opening_price;
                        newPrice.high = c.high_price;
                        newPrice.low = c.low_price;
                        newPrice.now = c.trade_price;
                        newPrice.yesterday = c.prev_closing_price;
                        newPrice.accTradePrice = c.acc_trade_price_24h;

                        newPriceInfo[`${newPrice.market}`] = newPrice;
                    });

                    return newPriceInfo;
                });
        } catch (err) {
            console.error(err.response.data);
        }
    }
}
