import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * Global validation pipe.
   * - whitelist: true  → strips any properties from the request body that are
   *   NOT declared in the DTO. This prevents attackers from sending extra fields
   *   that might accidentally get persisted (e.g. `isAdmin: true`).
   * - transform: true  → automatically coerces incoming JSON values to the
   *   TypeScript types declared in the DTO (e.g. string → number).
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
