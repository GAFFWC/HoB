import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import Joi from 'joi';

@Module({
    imports: [
        TypeOrmModule.forFeature(),
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: process.env.NODE_ENV === 'prod' ? '.env.prod' : '.env.dev',
            validationSchema: Joi.object({
                REDIS_HOST: Joi.string().required(),
                REDIS_PORT: Joi.string().optional(),
                REDIS_PASSWORD: Joi.string().required(),
            }),
        }),
        ClientsModule.register([
            {
                name: 'redis',
                transport: Transport.REDIS,
                options: {
                    host: process.env.REDIS_HOST,
                    password: process.env.REDIS_PASSWORD,
                },
            },
        ]),
    ],
    providers: [],
})
export class RedisModule {}
