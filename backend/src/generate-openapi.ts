import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { writeFileSync } from "fs";
import { AppModule } from "./app.module";

async function generate() {
  const app = await NestFactory.create(AppModule, { logger: false });

  const config = new DocumentBuilder()
    .setTitle("DataShare API")
    .setDescription(
      "API de transfert de fichiers avec liens temporaires, protection par mot de passe et expiration automatique.",
    )
    .setVersion("1.0")
    .addBearerAuth(
      { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      "access-token",
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  writeFileSync("./openapi.json", JSON.stringify(document, null, 2));
  console.log("openapi.json généré avec succès.");

  await app.close();
}

generate().catch((error) => {
  console.error("Erreur lors de la génération d'openapi.json", error);
  process.exit(1);
});
