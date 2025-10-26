import { Public, Roles } from 'nest-keycloak-connect';
import { Body, Controller, Get, Post } from '@nestjs/common';

import { UserService } from './user/user.service';
import { CreateUserDto } from './user/dtos/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  // @Public()
  // @Roles({roles:['admin']})
  async getUsers() {
    return this.userService.getProfile();
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }
}
