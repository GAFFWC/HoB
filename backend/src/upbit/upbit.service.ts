import { HttpService, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Tokenize } from './decorator/tokenize.decorator';

export class UpbitService {
    constructor(@Inject(HttpService) private readonly http: HttpService) {}

    private baseUrl = 'https://api.upbit.com/v1/';
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: 'Asia/Seoul' })
    async init() {}

    async getCoins(@Tokenize() payload: any) {
        
    }
}
