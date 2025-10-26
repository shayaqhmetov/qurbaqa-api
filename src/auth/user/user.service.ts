import { Inject, Injectable, Logger } from "@nestjs/common";
import { PrismaClientService } from "@/clients/prisma.client";

import { CreateUserDto } from "./dtos/create-user.dto";

@Injectable()
export class UserService {
  protected readonly logger = new Logger(UserService.name);
  constructor(@Inject(PrismaClientService) private readonly prisma: PrismaClientService) { }

  async createUser(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
      },
    });
  }

  async getProfile() {
    const user = await this.prisma.user.findFirst({
      where: {

      },
    });
    if (!user) {
      throw new Error('User not found');
    }
    this.logger.log('Fetched user profile:', user);
    return user;
  }
}