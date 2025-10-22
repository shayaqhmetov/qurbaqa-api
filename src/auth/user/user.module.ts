import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaClientService } from '@/clients/prisma.client';

@Module({
  controllers: [],
  imports: [],
  providers: [UserService, PrismaClientService],
})
export class UserModule { }