import { Inject, Injectable } from "@nestjs/common";
import { PrismaClientService } from "@/clients/prisma.client";

import { CreateUserDto } from "./dtos/create-user.dto";

@Injectable()
export class UserService {
  constructor(@Inject(PrismaClientService) private readonly prisma: PrismaClientService) { }

  async createUser(createUserDto: CreateUserDto) {
      return this.prisma.user.create({
        data: {
          email: createUserDto.email,
        },
      });
  }
}