import { OmitType } from '@nestjs/mapped-types';
import { UpbitPriceDTO } from 'src/upbit/dto/price.dto';

export class BinancePriceDTO extends OmitType(UpbitPriceDTO, ['accTradePrice']) {}
