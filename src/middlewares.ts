import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LocaleMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    req.locale = req.headers['accept-language'] ?? 'en';
    next();
  }
}
