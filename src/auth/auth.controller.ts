import { Body, Controller, Post } from '@nestjs/common';

import { UserService } from './user/user.service';
import { CreateUserDto } from './user/dtos/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }
}
