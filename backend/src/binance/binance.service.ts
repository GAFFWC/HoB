import { HttpService, Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';
import * as binance from 'node-binance-api';
import { reduce } from 'rxjs/operators';
import { UpbitModule } from 'src/upbit/upbit.module';
import { UpbitService } from 'src/upbit/upbit.service';
import { BinancePriceDTO } from './dto/price.dto';

@Injectable()
export class BinanceService {
    constructor(@Inject(HttpService) private readonly http: HttpService, @Inject(UpbitService) private readonly upbitService: UpbitService) {}

    private exchangeRateUrl = 'https://earthquake.kr:23490/query/USDKRW';
    private baseUrl = 'https://api.binance.com/api/v3';

    async getExchangeRate(): Promise<number> {
        try {
            return await this.http
                .get(this.exchangeRateUrl)
                .toPromise()
                .then((r) => {
                    return r.data['USDKRW'][0];
                });
        } catch (err) {
            console.error(err);
        }
    }

    async getPrice(): Promise<object> {
        try {
            const exchangeRate = await this.getExchangeRate();
            const binanceSymbols = {};
            (await this.upbitService.getSymbols()).forEach((s) => {
                binanceSymbols[`${s.split('-')[1]}USDT`] = true;
            });

            return await this.http
                .get(this.baseUrl + '/ticker/24hr')
                .toPromise()
                .then((r) => {
                    const newPriceInfo = {};
                    r.data
                        .filter((p) => {
                            return String(p.symbol).endsWith('USDT');
                        })
                        .filter((p) => {
                            return binanceSymbols[`${p.symbol}`];
                        })
                        .forEach((p) => {
                            const newPrice = new BinancePriceDTO();

                            newPrice.market = p.symbol;
                            newPrice.open = Math.floor(p.openPrice * exchangeRate);
                            newPrice.high = Math.floor(p.highPrice * exchangeRate);
                            newPrice.low = Math.floor(p.lowPrice * exchangeRate);
                            newPrice.now = Math.floor(p.lastPrice * exchangeRate);
                            newPrice.yesterday = Math.floor(p.prevClosePrice * exchangeRate);

                            newPriceInfo[`${p.symbol.split('USDT')[0]}`] = newPrice;
                        });

                    return newPriceInfo;
                });
        } catch (err) {
            console.error(err);
        }
    }
}
