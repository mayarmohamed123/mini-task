import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';

/**
 * JwtAuthGuard — extends Passport's built-in AuthGuard('jwt').
 *
 * This guard is registered GLOBALLY in AppModule, so every route is
 * JWT-protected by default.
 *
 * The only exception: routes decorated with @Public().
 *
 * Flow:
 *   Incoming request
 *        ↓
 *   canActivate() — check for @Public() metadata
 *        ↓ (not public)
 *   super.canActivate() — Passport validates the JWT
 *        ↓ (valid)
 *   JwtStrategy.validate() is called
 *        ↓
 *   request.user = { id, email }
 *        ↓
 *   Route handler executes
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Reflector is a NestJS helper that reads metadata attached by decorators
   * like @Public() (which uses SetMetadata under the hood).
   */
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    /**
     * reflector.getAllAndOverride() checks metadata on both the route handler
     * and its containing class, taking the most specific one (handler first).
     *
     * If IS_PUBLIC_KEY is true → skip JWT validation entirely.
     */
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // Public route — allow through without any token check
      return true;
    }

    // Protected route — delegate to Passport's JWT validation
    return super.canActivate(context);
  }
}
