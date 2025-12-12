import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('REDIS_URL');
        console.log('Connecting to Redis at', url);
        const options: RedisOptions = {
          maxRetriesPerRequest: null, // unlimited retries
          enableReadyCheck: true,
          password: config.get<string>('REDIS_PASSWORD'),
          retryStrategy: (times) => {
            // Increase delay to avoid flooding errors
            const delay = Math.min(times * 1000, 30000); // 1s, 2s, ..., max 30s
            return delay;
          },
          connectTimeout: 10000,
          reconnectOnError: (err) => {
            const targetErrors = ['READONLY', 'ETIMEDOUT', 'ECONNREFUSED'];
            return targetErrors.some((e) => err.message.includes(e));
          },
          sentinelReconnectStrategy: (times) => {
            const delay = Math.min(times * 1000, 10000); // 1s, 2s, ..., max 10s
            return delay;
          },
        };

        const client = new Redis(url, options);

        client.on('connect', () => console.log('Redis connected'));
        client.on('error', (e) => console.error('Redis error', e));

        return client;
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
