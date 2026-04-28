export type AppErrorCode =
  | "VALIDATION_ERROR"
  | "RATE_NOT_AVAILABLE"
  | "EXCHANGE_RATE_PROVIDER_ERROR"
  | "INTERNAL_SERVER_ERROR";

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function toErrorResponse(error: unknown): {
  status: number;
  body: object;
} {
  if (error instanceof AppError) {
    const statusMap: Record<AppErrorCode, number> = {
      VALIDATION_ERROR: 400,
      RATE_NOT_AVAILABLE: 400,
      EXCHANGE_RATE_PROVIDER_ERROR: 502,
      INTERNAL_SERVER_ERROR: 500,
    };
    const publicMessageMap: Record<AppErrorCode, string> = {
      VALIDATION_ERROR: "Invalid conversion input",
      RATE_NOT_AVAILABLE: "Rate not available for requested currency pair",
      EXCHANGE_RATE_PROVIDER_ERROR: "Unable to fetch exchange rates",
      INTERNAL_SERVER_ERROR: "An unexpected error occurred",
    };

    return {
      status: statusMap[error.code],
      body: {
        error: error.code,
        message: publicMessageMap[error.code],
      },
    };
  }
  return {
    status: 500,
    body: { error: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred" },
  };
}
