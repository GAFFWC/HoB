export class PriceCheckDTO {
    upbit: object;
    binance: object;
}

export class SymbolsDTO {
    upbit: string[];
    binance: string[];
}

export enum IntervalExpression {
    UPBIT = 200,
    BINANCE = 3000,
}
