import { IsEnum, IsNotEmpty } from 'class-validator';
import { ModuleType } from '../../../generated/prisma';
import { ApiProperty } from '@nestjs/swagger';


export class AttachModuleDto {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  moduleId: string;
}

export class DetachModuleDto {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  moduleId: string;
}

export class CreateModuleDto {
  @ApiProperty({ enum: ModuleType })
  @IsEnum(ModuleType)
  @IsNotEmpty()
  type: ModuleType;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsNotEmpty()
  description: string | null;
}
