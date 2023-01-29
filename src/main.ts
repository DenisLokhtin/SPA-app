import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import {Logger, ValidationPipe} from "@nestjs/common";
import * as passport from 'passport';
import * as session from 'express-session';

async function bootstrap() {
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

  const options: SwaggerDocumentOptions = {
    deepScanRoutes: true,
  };

  const config = new DocumentBuilder()
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      })
      .setTitle("SPA app")
      .setDescription("SPA app Documentation")
      .build();
  const document = SwaggerModule.createDocument(app, config, options);

  SwaggerModule.setup("api", app, document);

  const configService = app.get(ConfigService);
  const PORT = configService.get("PORT") || 5000;

  await app.listen(PORT, () => {
    Logger.log(
        `Server started on PORT ${PORT}`,
        `http://localhost:${PORT}/api`,
    );
  });
}
bootstrap();
