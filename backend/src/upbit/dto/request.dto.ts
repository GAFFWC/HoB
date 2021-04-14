import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class TokenizedRequest {
    @IsString()
    @IsNotEmpty()
    access_key: string;

    @IsString()
    @IsNotEmpty()
    nonce: string;

    @IsObject()
    @IsOptional()
    query_hash: string;

    @IsString()
    @IsOptional()
    query_hash_alg: string;
}
