import { SetMetadata } from '@nestjs/common';

/**
 * The metadata key used to mark a route as public.
 * Exported so JwtAuthGuard can read it without a magic string.
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * @Public() decorator
 *
 * Attaches { isPublic: true } metadata to the route handler or controller.
 * JwtAuthGuard reads this metadata and skips JWT verification when it is present.
 *
 * Usage:
 *   @Public()
 *   @Get('/health')
 *   getHealth() { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
