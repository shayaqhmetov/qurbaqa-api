import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

import { LoginDto } from '@/auth/dtos/auth.dto';
import { LogoutDto } from '@/auth/dtos/logout.dto';
import { RefreshDto } from '@/auth/dtos/refresh.dto';
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

  // TODO: Remove user endpoint need to be removed
  @Post('remove-user')
  @HttpCode(HttpStatus.OK)
  async removeUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.removeUser(createUserDto);
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

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() logoutDto: LogoutDto) {
    await this.keycloakService.logout(logoutDto.refresh_token);
    return { message: 'Successfully logged out' };
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshDto: RefreshDto) {
    return await this.keycloakService.refreshToken(refreshDto.refresh_token);
  }
}
