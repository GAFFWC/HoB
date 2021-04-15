import { HttpService, Inject, Injectable, ParseIntPipe, UsePipes } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RedisExpression } from 'src/redis/constant/constant.enum';
import { RedisService } from 'src/redis/redis.service';
import { MoneyExpression } from './constant/constant.enum';
import { TokenizePipe } from './pipe/tokenize.pipe';

@Injectable()
export class UpbitService {
    constructor(
        @Inject(HttpService) private readonly http: HttpService,
        @Inject(RedisService) private readonly redisService: RedisService,
    ) {}

    private baseUrl = 'https://api.upbit.com/v1';

    @Cron(CronExpression.EVERY_SECOND)
    async init() {
        try {
            const symbols = await this.http
                .get(this.baseUrl + '/market/all', new TokenizePipe().transform({}))
                .toPromise()
                .then((r) => {
                    return r.data
                        .filter((c: any) => {
                            return !String(c.market).startsWith(MoneyExpression.USDT);
                        })
                        .map((c: any) => {
                            return c.market;
                        });
                });

            let krw = [];
            let btc = [];

            symbols.forEach((s: string) => {
                s.startsWith(MoneyExpression.KRW) ? krw.push(s) : btc.push(s);
            });

            await this.redisService.lset(RedisExpression.SYMBOLS_KRW, krw);
            await this.redisService.lset(RedisExpression.SYMBOLS_BTC, btc);

            console.log(await this.redisService.lrange(RedisExpression.SYMBOLS_KRW, 0, -1));
            console.log(await this.redisService.lrange(RedisExpression.SYMBOLS_BTC, 0, -1));
        } catch (err) {
            console.error(err);
        }
    }
}
