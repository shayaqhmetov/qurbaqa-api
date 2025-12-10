import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const SUPPORTED_LOCALES = ['en', 'ru', 'es', 'fr'];

@Injectable()
export class LocaleMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const q = typeof req.query.lang === 'string' ? req.query.lang : undefined;
    const c = (req as any).cookies?.lang;
    const header = req.headers['accept-language']?.toString();
    const pickFromHeader = header
      ? header.split(',')[0].split(';')[0]
      : undefined;

    const raw = q || c || pickFromHeader || 'en';
    const locale = String(raw).trim().split('-')[0].toLowerCase();
    (req as any).locale = SUPPORTED_LOCALES.includes(locale) ? locale : 'en';
    next();
  }
}
