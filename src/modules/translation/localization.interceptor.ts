import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslationService } from './translation.service';

@Injectable()
export class LocalizationInterceptor implements NestInterceptor {
  constructor(private translationService: TranslationService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const locale = req.locale || 'en';
    const entityType = req.entityType;

    // attach helper
    req.t = (key: string, params?: Record<string, any>) =>
      this.translationService.t(locale, key, entityType, params);

    // pass through — heavy localization of response should be explicit in services/controllers
    return next.handle().pipe(map((x) => x));
  }
}
