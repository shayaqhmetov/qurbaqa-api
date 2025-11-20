import { IsNotEmpty } from 'class-validator';

export class AttachModuleDto {
  @IsNotEmpty()
  moduleId: string;
}

export class DetachModuleDto {
  @IsNotEmpty()
  moduleId: string;
}
