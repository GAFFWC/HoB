import { Controller, Get, Inject } from '@nestjs/common';
import { UpbitService } from './upbit.service';

@Controller('/upbit')
export class UpbitController {
    constructor(@Inject(UpbitService) private readonly upbit: UpbitService) {}

    @Get()
    async get() {
        return await this.upbit.getCoins({});
    }
}
