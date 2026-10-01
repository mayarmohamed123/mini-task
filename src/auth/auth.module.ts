import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    /**
     * PassportModule registers Passport and sets 'jwt' as the default strategy.
     * This means AuthGuard('jwt') works without specifying the strategy name every time.
     */
    PassportModule.register({ defaultStrategy: 'jwt' }),

    /**
     * JwtModule.registerAsync() reads the secret and expiry from ConfigService
     * rather than hardcoding them.
     *
     * registerAsync is necessary here because ConfigService is only available
     * after the ConfigModule has been initialized (async dependency injection).
     */
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET')!,
        signOptions: {
          // ConfigService returns `string`, but @nestjs/jwt v12 expects the branded
          // `StringValue` type from the `ms` package. The cast is safe at runtime.
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '15m') as unknown as number,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtModule], // export so other modules can verify tokens if needed
})
export class AuthModule {}
