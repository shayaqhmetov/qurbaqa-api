import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import * as jwksRsa from 'jwks-rsa';
import { IS_PUBLIC_KEY } from '@/decorators/public.decorator';

@Injectable()
export class KeycloakGuard implements CanActivate {
  private jwksClient: jwksRsa.JwksClient;

  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) { }

  private async initializeJwksClient(): Promise<void> {
    const baseUrl = this.configService.get('authenticationServerUrl');
    const realmName = this.configService.get('realmName');
    this.jwksClient = jwksRsa({
      jwksUri: `${baseUrl}/realms/${realmName}/protocol/openid-connect/certs`,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await this.initializeJwksClient();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('You are not authorized');
    }

    try {
      const decoded: any = jwt.decode(token, { complete: true });
      if (!decoded || typeof decoded === 'string') {
        throw new UnauthorizedException('Invalid token');
      }

      const key = await this.getSigningKey(decoded.header.kid);

      const payload = jwt.verify(token, key) as any;

      request['user'] = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private getSigningKey(kid: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.jwksClient.getSigningKey(kid, (err, key) => {
        if (err) {
          return reject(new Error(err.message));
        }
        const signingKey = key.getPublicKey();
        resolve(signingKey);
      });
    });
  }
}
