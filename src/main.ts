import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as passport from 'passport';
import * as session from 'express-session';
import dataSource from '../db/data-source';

async function bootstrap() {
  await dataSource
    .initialize()
    .then(() => {
      console.log('Data Source has been initialized successfully.');
    })
    .catch((err) => {
      console.error('Error during Data Source initialization:', err);
    });

  const app = await NestFactory.create(AppModule);

  app.use(
    session({
      secret: 'sessionSecret',
      saveUninitialized: false,
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  app.useGlobalPipes(new ValidationPipe());

  const configService = app.get(ConfigService);
  const PORT = configService.get('PORT') || 5000;

  await app.listen(PORT, () => {
    Logger.log(`Server started on PORT ${PORT}`);
  });
}
bootstrap();
