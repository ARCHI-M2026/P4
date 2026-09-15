import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.ALLOW_ORIGIN ?? '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTION'],
    allowHeaders: ['Content-Type', 'Authorization']
  })

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }))

  if(process.env.NODE_ENV === 'development'){
    const config = new DocumentBuilder()
      .setTitle("DataShare API")
      .setDescription(
        "API de transfert de fichiers avec liens temporaires, protection par mot de passe et expiration automatique.",
      )
      .setVersion("1.0")
      .addBearerAuth(
        {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        "access-token",
      )
      .addServer(`http://localhost:${process.env.PORT ?? 3000}`, 'Local')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api-docs", app, document);

    new Logger("Bootstrap").warn(
      "Swagger UI est actif sur /api-docs.",
    );
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((error) => {
  console.error("Erreur au démarrage de l'application", error);
  process.exit(1);
});
