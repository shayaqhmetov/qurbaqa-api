import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BaseApiResponse } from '@/dto';

export class CreateUserDto {
  @ApiProperty({ type: String })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  firstName: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  lastName: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;
}

export class UserDto {
  @ApiProperty({ type: String })
  @IsString()
  id: string;

  @ApiProperty({ type: String })
  @IsEmail()
  email: string;

  @ApiProperty({ type: String })
  @IsString()
  firstName: string;

  @ApiProperty({ type: String })
  @IsString()
  lastName: string;

  @ApiProperty({ type: String })
  @IsString()
  username: string;
}

export class UserResponseDto extends BaseApiResponse<UserDto> {
  @ApiProperty({ type: UserDto })
  data: UserDto;
}

export type AttachKeycloakUserToDatabaseDto = CreateUserDto & {
  keycloakId: string;
};
