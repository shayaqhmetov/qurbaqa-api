import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { LoginDto } from '@/auth/dtos/auth.dto';
import { LogoutDto } from '@/auth/dtos/logout.dto';
import { RefreshDto } from '@/auth/dtos/refresh.dto';
import { UserService } from './user/user.service';
import { CreateUserDto } from './user/dtos/create-user.dto';
import { KeycloakAdminService } from '@/keycloak/keycloak.service';
import { Public } from '@/decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private readonly userService: UserService,
    private readonly keycloakService: KeycloakAdminService,
  ) { }

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  // @Public()
  // @Roles({roles:['admin']})
  async getUsers() {
    return this.userService.getProfile();
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
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
    const userInfo = await this.keycloakService.extractUserInfoFromToken(
      result.access_token,
    );
    const user = await this.userService.getUserByKeycloakId(userInfo.sub);
    if (!user) {
      this.logger.log('User not found in database, creating new user');
      await this.userService.attachKeycloakUserToDatabase({
        username: body.username,
        password: body.password,
        email: body.username,
        firstName: userInfo.given_name ?? '',
        lastName: userInfo.family_name ?? '',
        keycloakId: userInfo.sub,
      });
    }

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
