// Avoid importing from translation DTOs to prevent circular dependencies

export interface ApiResponseType<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  path: string;
  statusCode: number;
  translatableFields?: string[];
  entityType?: string;
}
