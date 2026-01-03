import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseType } from './types';

export class BaseApiResponse<T> implements ApiResponseType<T> {
  @ApiProperty({ type: Boolean })
  success: boolean;
  @ApiProperty({ type: String })
  message: string;
  data: T;
  @ApiProperty({ type: String })
  timestamp: string;
  @ApiProperty({ type: String })
  path: string;
  @ApiProperty({ type: Number })
  statusCode: number;
  @ApiProperty({ type: [String], required: false })
  translatableFields?: string[];
  @ApiProperty({ type: String, required: false })
  entityType?: string;
}

export class MessageDto {
  @ApiProperty({ type: String })
  message: string;
}

export class MessageResponseDto extends BaseApiResponse<MessageDto> {
  @ApiProperty({ type: MessageDto })
  data: MessageDto;
}

export class TranslationQueryDto {
  @ApiProperty({ type: String })
  entityType: string;

  @ApiProperty({ type: String })
  lang: string;
}

export class QueryLangDto {
  @ApiProperty({ type: String, required: false })
  locale?: string;
  translate?: (items: any[], fields: string[]) => Promise<any[]>;
}
