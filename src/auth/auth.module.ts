import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';
import { PrismaClientService } from '@/clients/prisma.client';

@Module({
  controllers: [AuthController],
  providers: [UserService, PrismaClientService],
  imports: [UserModule],
})
export class AuthModule {}
