import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }))

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((error) => {
  console.error("Erreur au démarrage de l'application", error);
  process.exit(1);
});
