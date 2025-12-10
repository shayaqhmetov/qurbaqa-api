import {
  Get,
  Post,
  Body,
  Logger,
  HttpCode,
  Controller,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiBody,
} from '@nestjs/swagger';

import { CreateUserDto, UserResponseDto, UserDto } from './user/user.dto';
import { UserService } from './user/user.service';
import { LoginDto } from '@/modules/auth/auth.dto';
import { LogoutDto } from '@/modules/auth/auth.dto';
import { RefreshDto } from '@/modules/auth/auth.dto';
import { Public } from '@/decorators/public.decorator';
import {
  TokenDto,
  TokenResponseDto,
  KeycloakAdminService,
} from '@/keycloak/keycloak.service';
import { MessageDto, MessageResponseDto } from '@/dto';

@ApiTags('auth')
@Controller('auth')
@ApiBearerAuth('access_token')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private readonly userService: UserService,
    private readonly keycloakService: KeycloakAdminService,
  ) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiOkResponse({
    description: 'Profile information',
    type: UserResponseDto,
  })
  async getUsers(): Promise<UserDto> {
    return this.userService.getProfile();
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiOkResponse({ description: 'Created user', type: TokenResponseDto })
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto): Promise<TokenDto> {
    return this.userService.createUser(createUserDto);
  }

  // TODO: Remove user endpoint need to be removed
  @Post('remove-user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove user' })
  @ApiBody({ type: CreateUserDto })
  @ApiOkResponse({ description: 'Removed user', type: MessageResponseDto })
  async removeUser(@Body() createUserDto: CreateUserDto): Promise<MessageDto> {
    return this.userService.removeUser(createUserDto);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: CreateUserDto })
  @ApiOkResponse({ description: 'User logged in', type: TokenResponseDto })
  async login(@Body() body: LoginDto): Promise<TokenDto> {
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
  @ApiOperation({ summary: 'User logout' })
  @ApiBody({ type: LogoutDto })
  @ApiOkResponse({ description: 'User logged out', type: MessageResponseDto })
  async logout(@Body() logoutDto: LogoutDto): Promise<MessageDto> {
    await this.keycloakService.logout(logoutDto.refresh_token);
    return { message: 'Successfully logged out' };
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshDto })
  @ApiOkResponse({ description: 'Token refreshed', type: TokenResponseDto })
  async refresh(@Body() refreshDto: RefreshDto): Promise<TokenDto> {
    return await this.keycloakService.refreshToken(refreshDto.refresh_token);
  }
}
