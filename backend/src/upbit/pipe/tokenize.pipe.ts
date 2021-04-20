import { createParamDecorator, PipeTransform } from '@nestjs/common';

import * as crypto from 'crypto';
import * as querystring from 'querystring';
import * as jwt from 'jsonwebtoken';
import { v4 } from 'uuid';

export class TokenizePipe implements PipeTransform {
    transform(data: any) {
        const payload = {
            access_key: process.env.UPBIT_ACCESS_KEY,
            nonce: v4(),
        };

        const hash = crypto.createHash('sha512');

        if (Object.keys(data).length) {
            const query = querystring.encode(data);
            payload['query_hash'] = hash.update(query, 'utf-8').digest('hex');
            payload['query_hash_alg'] = 'SHA512';
        }

        return {
            headers: {
                Authorization: `Bearer ${jwt.sign(payload, process.env.UPBIT_SECRET_KEY)}`,
            },
            query: payload,
        };
    }
}
