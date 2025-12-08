import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogoutDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}
