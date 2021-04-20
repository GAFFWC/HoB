export class PriceDTO {
    market: string;
    open: number;
    high: number;
    low: number;
    now: number;
    yesterday: number;
    accTradePrice: number;
}

export class PriceSetDTO {
    krw: PriceDTO[];
    btc: PriceDTO[];
}
