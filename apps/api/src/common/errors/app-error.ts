export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  UNAUTHORIZED = 'UNAUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  STUDENT_NOT_FOUND = 'STUDENT_NOT_FOUND',
  STUDENT_INACTIVE = 'STUDENT_INACTIVE',
  ATTENDANCE_ALREADY_EXISTS = 'ATTENDANCE_ALREADY_EXISTS',
  ROUTE_NOT_FOUND = 'ROUTE_NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUMMARY_INVARIANT_VIOLATION = 'SUMMARY_INVARIANT_VIOLATION',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode: number,
    public readonly details: unknown = null,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationAppError extends AppError {
  constructor(message = 'Request validation failed.', details: unknown = null) {
    super(ErrorCode.VALIDATION_ERROR, message, 400, details);
  }
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super(ErrorCode.INVALID_CREDENTIALS, 'Invalid email or password.', 401);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication is required.') {
    super(ErrorCode.UNAUTHORIZED, message, 401);
  }
}

export class TokenExpiredError extends AppError {
  constructor() {
    super(ErrorCode.TOKEN_EXPIRED, 'Access token has expired.', 401);
  }
}

export class StudentNotFoundError extends AppError {
  constructor() {
    super(ErrorCode.STUDENT_NOT_FOUND, 'Student was not found.', 404);
  }
}

export class StudentInactiveError extends AppError {
  constructor() {
    super(ErrorCode.STUDENT_INACTIVE, 'Only active students may check in.', 422);
  }
}

export class AttendanceAlreadyExistsError extends AppError {
  constructor() {
    super(
      ErrorCode.ATTENDANCE_ALREADY_EXISTS,
      'This student has already checked in for the selected business date.',
      409,
    );
  }
}

export class RouteNotFoundError extends AppError {
  constructor() {
    super(ErrorCode.ROUTE_NOT_FOUND, 'The requested route was not found.', 404);
  }
}

export class RateLimitExceededError extends AppError {
  constructor() {
    super(ErrorCode.RATE_LIMIT_EXCEEDED, 'Too many login attempts. Please try again later.', 429);
  }
}

export class SummaryInvariantViolationError extends AppError {
  constructor() {
    super(ErrorCode.SUMMARY_INVARIANT_VIOLATION, 'Attendance summary invariant was violated.', 500);
  }
}
