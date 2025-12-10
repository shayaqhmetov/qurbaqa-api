import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserModule, Module, ModuleType } from 'generated/prisma';
import { ApiProperty } from '@nestjs/swagger';
import { BaseApiResponse } from '@/dto';

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

export class ModuleDto {
  @ApiProperty({ enum: ModuleType })
  @IsEnum(ModuleType)
  @IsNotEmpty()
  type: ModuleType;

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsNotEmpty()
  description: string | null;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsNotEmpty()
  icon: string | null;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  id: string;

  @ApiProperty({ type: Date })
  @IsNotEmpty()
  createdAt: Date;

  @ApiProperty({ type: Date })
  @IsNotEmpty()
  updatedAt: Date;
}

export class UserModuleDto {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  id: string;

  @ApiProperty({ type: Date })
  @IsNotEmpty()
  createdAt: Date;

  @ApiProperty({ type: Date })
  @IsNotEmpty()
  updatedAt: Date;
}

export class ModuleResponseDto extends BaseApiResponse<Module> {
  @ApiProperty({ type: ModuleDto, isArray: false })
  data: Module;
}

export class ModulesResponseDto extends BaseApiResponse<Module[]> {
  @ApiProperty({ type: ModuleDto, isArray: true })
  data: Module[];
}

export class UserModuleResponseDto extends BaseApiResponse<UserModule> {
  @ApiProperty({ type: ModuleDto, isArray: false })
  data: UserModule;
}

export class UserModulesResponseDto extends BaseApiResponse<UserModule[]> {
  @ApiProperty({ type: ModuleDto, isArray: true })
  data: UserModule[];
}
