import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class LogoutDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}

export class RefreshDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}
