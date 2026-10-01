import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [
    /**
     * ConfigModule.forRoot() reads the .env file and makes all environment
     * variables available via ConfigService throughout the app.
     * isGlobal: true means we don't need to re-import ConfigModule in every module.
     */
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    HealthModule,
  ],
  providers: [
    /**
     * Registering JwtAuthGuard as a global guard (APP_GUARD token) means
     * EVERY route in the application is protected by default.
     * Routes that should be publicly accessible must explicitly opt-out
     * using the @Public() decorator.
     *
     * This is the "secure by default" principle:
     *   Default → protected. Exception → @Public().
     */
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
