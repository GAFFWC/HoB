import { Inject, Injectable, Scope } from '@nestjs/common';
import { ClientRedis } from '@nestjs/microservices';
import { IsString } from 'class-validator';
import { Subject } from 'rxjs';
import { promisify } from 'util';
@Injectable()
export class RedisService {
    constructor(@Inject('redis') private readonly redis: ClientRedis) {}

    private readonly client = this.redis.createClient(new Subject<Error>());

    async ping() {
        const pingAsync = promisify(this.client.ping).bind(this.client);
        return await pingAsync();
    }

    async get(key: string): Promise<string> {
        const getAsync = promisify(this.client.get).bind(this.client);

        try {
            const value = await getAsync(key);
            return JSON.parse(value);
        } catch (err) {
            console.error(err);
        }
    }

    async set(key: string, value: any): Promise<boolean> {
        const setAsync = promisify(this.client.set).bind(this.client);

        try {
            await setAsync(key, JSON.stringify(value));
            return true;
        } catch (err) {
            console.error(err);
        }
    }

    async lset(key: string, values: any[]): Promise<boolean> {
        const lpushAsync = promisify(this.client.lpush).bind(this.client);

        try {
            for await (const value of values) {
                lpushAsync(key, JSON.stringify(value));
            }
            return true;
        } catch (err) {
            console.error(err);
        }
    }

    async lrange(key: string, start: number, end: number): Promise<any[]> {
        const lrangeAsync = promisify(this.client.lrange).bind(this.client);

        try {
            const list = await lrangeAsync(key, start, end);

            return list.map((value: string) => {
                return JSON.parse(value);
            });
        } catch (err) {
            console.error(err);
        }
    }

    async del(key: string): Promise<boolean> {
        const delAsync = promisify(this.client.del).bind(this.client);

        try {
            await delAsync(key);
            return true;
        } catch (err) {
            console.error(err);
        }
    }

    async llen(key: string): Promise<number> {
        const llenAsync = promisify(this.client.llen).bind(this.client);

        try {
            return await llenAsync(key);
        } catch (err) {
            console.error(err);
        }
    }
}
