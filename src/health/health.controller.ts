import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

/**
 * HealthController — demonstrates @Public() in action.
 *
 * Even though the global JwtAuthGuard protects every route,
 * @Public() tells the guard to skip JWT validation for this endpoint.
 * This endpoint is always reachable, with or without a token.
 */
@Controller()
export class HealthController {
  @Public()
  @Get('health')
  check() {
    return { status: 'ok' };
  }
}
