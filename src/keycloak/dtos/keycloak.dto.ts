import { ApiProperty } from '@nestjs/swagger';

export class KeycloakSignUpDTO {
  @ApiProperty({ type: String })
  username: string;

  @ApiProperty({ type: String })
  email: string;

  @ApiProperty({ type: String })
  firstName: string;

  @ApiProperty({ type: String })
  lastName: string;

  @ApiProperty({ type: String })
  password: string;
}
