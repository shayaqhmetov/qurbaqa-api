import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

import { LoginDto } from '@/auth/dtos/auth.dto';
import { UserService } from './user/user.service';
import { CreateUserDto } from './user/dtos/create-user.dto';
import { KeycloakAdminService } from '@/keycloak/keycloak.service';
import { Public } from '@/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly keycloakService: KeycloakAdminService,
  ) {}

  @Get('profile')
  // @Public()
  // @Roles({roles:['admin']})
  async getUsers() {
    return this.userService.getProfile();
  }

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto) {
    const result = await this.keycloakService.login({
      identifier: body.username,
      password: body.password,
    });

    return result;
  }
}
