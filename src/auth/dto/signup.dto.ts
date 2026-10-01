import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * Data Transfer Object for POST /auth/signup.
 *
 * class-validator decorators run at request time (via the global ValidationPipe).
 * If any rule fails, NestJS automatically returns a 400 Bad Request
 * with a descriptive error message — no manual error handling needed.
 */
export class SignupDto {
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  email: string;

  /**
   * Minimum 8 characters keeps the demo realistic without adding complexity.
   * In production you'd add more rules (uppercase, symbols, etc.).
   */
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  password: string;
}
