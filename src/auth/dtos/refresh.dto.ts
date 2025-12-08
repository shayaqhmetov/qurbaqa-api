import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}
