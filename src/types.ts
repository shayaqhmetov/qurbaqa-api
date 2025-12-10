export interface ApiResponseType<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  path: string;
  statusCode: number;
}
