import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

/**
 * JWT payload shape — what we signed in AuthService.login().
 */
interface JwtPayload {
  sub: number;
  email: string;
  iat: number; // issued-at (added automatically by JwtService)
  exp: number; // expiry  (added automatically by JwtService)
}

/**
 * JwtStrategy — the Passport strategy for JWT authentication.
 *
 * How it fits in the flow:
 *   Request → JwtAuthGuard → (calls canActivate) → Passport → JwtStrategy.validate()
 *                                                              ↓
 *                                                        request.user = return value
 *
 * Passport does the heavy lifting:
 *   1. Extracts the token from the Authorization header.
 *   2. Verifies the signature using JWT_SECRET.
 *   3. Checks the `exp` claim — rejects expired tokens automatically.
 *   4. If valid, calls our validate() with the decoded payload.
 *
 * validate() is NOT called if the token is missing, malformed, or expired.
 * In those cases Passport throws 401 before validate() is even reached.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      // Tell Passport where to look for the token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Do NOT ignore expiration — always enforce it
      ignoreExpiration: false,

      // The same secret used to sign tokens in AuthService
      // Non-null assertion: JWT_SECRET is guaranteed by .env — app won't start without it
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  /**
   * Called by Passport after signature & expiry are verified.
   *
   * Whatever this method returns becomes `request.user` in the controller.
   * We return only id and email — no password, no sensitive data.
   *
   * We do NOT query the database here because the task explicitly wants
   * /auth/profile to demonstrate that user info can come straight from the token.
   */
  validate(payload: JwtPayload): { id: number; email: string } {
    return { id: payload.sub, email: payload.email };
  }
}
