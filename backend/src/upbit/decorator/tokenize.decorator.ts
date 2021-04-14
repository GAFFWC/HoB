import { createParamDecorator } from '@nestjs/common';

import * as crypto from 'crypto';
import * as querystring from 'querystring';
import * as jwt from 'jsonwebtoken';
import * as uuidv4 from 'uuidv4';

export const Tokenize = createParamDecorator((data: any) => {
    const payload = {
        access_key: process.env.UPBIT_ACCESS_KEY,
        nonce: uuidv4.uuid(),
    };

    const hash = crypto.createHash('sha512');

    if (data.params) {
        payload['query_hash'] = hash.update(querystring.encode(data.params), 'utf-8').digest('hex');
        payload['query_hash_alg'] = 'SHA512';
    }

    return {
        authorization: `Bearer ${jwt.sign(payload, process.env.UPBIT_SECRET_KEY)}`,
        ...payload,
    };
});
