import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { createTestApp } from "./utils/create-test-app";
import { cleanDatabase } from "./utils/clean-database";
import { PrismaService } from "../src/_prisma/prisma.service";

async function registerAndLogin(
  app: INestApplication<App>,
  email: string,
): Promise<string> {
  const password = "password123";
  await request(app.getHttpServer())
    .post("/auth/register")
    .send({ email, password })
    .expect(201);

  const loginResponse = await request(app.getHttpServer())
    .post("/auth/login")
    .send({ email, password })
    .expect(201);

  return loginResponse.body.access_token as string;
}

describe("Download (e2e)", () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let token: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    token = await registerAndLogin(app, "download-user@example.com");
  });

  afterEach(async () => {
    await cleanDatabase(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /download/:token", () => {
    it("retourne les métadonnées pour un lien valide sans mot de passe", async () => {
      const upload = await request(app.getHttpServer())
        .post("/file")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", Buffer.from("contenu public"), "public.txt")
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/download/${upload.body.downloadToken}`)
        .expect(200);

      expect(response.body.originalName).toBe("public.txt");
      expect(response.body.isPasswordProtected).toBe(false);
    });

    it("indique isPasswordProtected=true pour un fichier protégé", async () => {
      const upload = await request(app.getHttpServer())
        .post("/file")
        .set("Authorization", `Bearer ${token}`)
        .field("password", "secret123")
        .attach("file", Buffer.from("contenu privé"), "private.txt")
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/download/${upload.body.downloadToken}`)
        .expect(200);

      expect(response.body.isPasswordProtected).toBe(true);
    });

    it("retourne 404 pour un token invalide", async () => {
      await request(app.getHttpServer())
        .get("/download/token-qui-n-existe-pas")
        .expect(404);
    });

    it("retourne 410 pour un lien expiré", async () => {
      const upload = await request(app.getHttpServer())
        .post("/file")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", Buffer.from("contenu expiré"), "expired.txt")
        .expect(201);

      await prisma.file.update({
        where: { id: upload.body.id },
        data: { expiresAt: new Date(Date.now() - 1000) },
      });

      await request(app.getHttpServer())
        .get(`/download/${upload.body.downloadToken}`)
        .expect(410);
    });
  });

  describe("POST /download/:token", () => {
    it("retourne une URL de téléchargement quand aucun mot de passe n'est requis", async () => {
      const upload = await request(app.getHttpServer())
        .post("/file")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", Buffer.from("contenu public"), "public.txt")
        .expect(201);

      const response = await request(app.getHttpServer())
        .post(`/download/${upload.body.downloadToken}`)
        .send({})
        .expect(201);

      expect(typeof response.body.url).toBe("string");
      expect(response.body.expiresIn).toBeDefined();
    });

    it("retourne une URL quand le bon mot de passe est fourni", async () => {
      const upload = await request(app.getHttpServer())
        .post("/file")
        .set("Authorization", `Bearer ${token}`)
        .field("password", "secret123")
        .attach("file", Buffer.from("contenu privé"), "private.txt")
        .expect(201);

      const response = await request(app.getHttpServer())
        .post(`/download/${upload.body.downloadToken}`)
        .send({ password: "secret123" })
        .expect(201);

      expect(typeof response.body.url).toBe("string");
    });

    it("rejette avec 400 quand le mot de passe requis est manquant", async () => {
      const upload = await request(app.getHttpServer())
        .post("/file")
        .set("Authorization", `Bearer ${token}`)
        .field("password", "secret123")
        .attach("file", Buffer.from("contenu privé"), "private.txt")
        .expect(201);

      await request(app.getHttpServer())
        .post(`/download/${upload.body.downloadToken}`)
        .send({})
        .expect(400);
    });

    it("rejette avec 401 quand le mot de passe fourni est incorrect", async () => {
      const upload = await request(app.getHttpServer())
        .post("/file")
        .set("Authorization", `Bearer ${token}`)
        .field("password", "secret123")
        .attach("file", Buffer.from("contenu privé"), "private.txt")
        .expect(201);

      await request(app.getHttpServer())
        .post(`/download/${upload.body.downloadToken}`)
        .send({ password: "mauvais-mot-de-passe" })
        .expect(401);
    });

    it("retourne 404 pour un token invalide", async () => {
      await request(app.getHttpServer())
        .post("/download/token-qui-n-existe-pas")
        .send({})
        .expect(404);
    });

    it("retourne 410 pour un lien expiré", async () => {
      const upload = await request(app.getHttpServer())
        .post("/file")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", Buffer.from("contenu expiré"), "expired.txt")
        .expect(201);

      await prisma.file.update({
        where: { id: upload.body.id },
        data: { expiresAt: new Date(Date.now() - 1000) },
      });

      await request(app.getHttpServer())
        .post(`/download/${upload.body.downloadToken}`)
        .send({})
        .expect(410);
    });
  });
});
