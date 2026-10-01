import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * Data Transfer Object for POST /auth/login.
 * Same rules as SignupDto — intentionally reusing the same constraints
 * so validation is symmetric and predictable.
 */
export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  password: string;
}
