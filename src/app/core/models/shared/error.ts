export interface Error {
  code: string;
  message: string;
  target?: string;
  details?: Error[];
}

export interface ErrorResponse {
  traceId: string;
  statusCode: number;
  errors: Error[];
}
