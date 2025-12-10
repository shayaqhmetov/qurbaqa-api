import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ApiResponseType } from './types';

@Injectable()
export default class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponseType<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponseType<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        const statusCode = response.statusCode;

        // Extract custom message if provided in response data
        let message = this.getDefaultMessage(request.method, statusCode);
        let responseData = data;

        // If data has a custom message, extract it
        if (data && typeof data === 'object' && 'message' in data) {
          message = data.message;
          responseData = data.data || data;
          delete responseData.message;
        }

        return {
          success: statusCode < 400,
          message,
          data: responseData,
          timestamp: new Date().toISOString(),
          path: request.url,
          statusCode,
        };
      }),
    );
  }

  private getDefaultMessage(method: string, statusCode: number): string {
    if (statusCode >= 400) {
      return 'Operation failed';
    }

    switch (method) {
      case 'GET':
        return 'Data retrieved successfully';
      case 'POST':
        return statusCode === 201
          ? 'Resource created successfully'
          : 'Operation completed successfully';
      case 'PUT':
      case 'PATCH':
        return 'Resource updated successfully';
      case 'DELETE':
        return 'Resource deleted successfully';
      default:
        return 'Operation completed successfully';
    }
  }
}