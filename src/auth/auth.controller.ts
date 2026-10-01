import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';

/**
 * AuthController handles all authentication-related HTTP endpoints.
 *
 * All routes are protected by the global JwtAuthGuard EXCEPT those
 * explicitly marked with @Public().
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ─── POST /auth/signup ────────────────────────────────────────────────────

  /**
   * Creates a new user account.
   *
   * @Public() allows unauthenticated access — the user has no token yet.
   * The ValidationPipe (registered globally in main.ts) validates the
   * request body against SignupDto automatically.
   * If validation fails → 400 Bad Request, this handler is never called.
   */
  @Public()
  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  // ─── POST /auth/login ─────────────────────────────────────────────────────

  /**
   * Authenticates a user and returns a signed JWT access token.
   * Also public — the user doesn't have a token yet.
   */
  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // ─── GET /auth/profile ───────────────────────────────────────────────────

  /**
   * Returns the authenticated user's profile.
   *
   * NOT marked @Public() → the global JwtAuthGuard enforces a valid JWT.
   *
   * After Passport verifies the token, JwtStrategy.validate() runs and
   * returns { id, email }. NestJS attaches that return value to request.user.
   * We read it here — no additional database call required.
   */
  @Get('profile')
  getProfile(@Request() req: { user: { id: number; email: string } }) {
    return req.user; // populated by JwtStrategy.validate()
  }
}
