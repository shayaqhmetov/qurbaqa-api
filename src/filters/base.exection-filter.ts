import { HttpAdapterHost } from "@nestjs/core";
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { } from "@nestjs/common/exceptions";

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  protected readonly logger = new Logger(CustomExceptionFilter.name);
  constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

  catch(exception: any, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    let message = "Internal server error";
    const ctx = host.switchToHttp();
    console.log( exception);

    if (exception.code === "P2002") {
      message = "User with this email already exists.";
    }

    if (exception.status) {
      message = exception.message;
    }

    const httpStatus = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    this.logger.error(`Status ${httpStatus} Error: ${message}`, exception.stack);
    
    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message: message || null,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}