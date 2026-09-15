import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { createTestApp } from "./utils/create-test-app";
import { cleanDatabase } from "./utils/clean-database";
import { PrismaService } from "../src/_prisma/prisma.service";

function buildFakeExeBuffer(): Buffer {
  // Construction d'un en-tête PE (Windows executable) minimal mais valide
  // du point de vue de la détection par magic number : signature 'MZ' au
  // début, offset vers l'en-tête PE, puis signature 'PE\0\0' à cet offset.
  const buf = Buffer.alloc(68, 0);
  buf.write("MZ", 0, "ascii");
  buf.writeUInt32LE(64, 60);
  buf.write("PE\0\0", 64, "ascii");
  return buf;
}

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

describe("File (e2e)", () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let tokenOwner: string;
  let tokenOtherUser: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    tokenOwner = await registerAndLogin(app, "file-owner@example.com");
    tokenOtherUser = await registerAndLogin(app, "file-other@example.com");
  });

  afterEach(async () => {
    await cleanDatabase(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /file", () => {
    it("upload un fichier avec des identifiants valides", async () => {
      const response = await request(app.getHttpServer())
        .post("/file")
        .set("Authorization", `Bearer ${tokenOwner}`)
        .field("expiresInDays", "1")
        .attach("file", Buffer.from("contenu de test"), "test.txt")
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.downloadToken).toBeDefined();
      expect(response.body.originalName).toBe("test.txt");
      expect(response.body.isPasswordProtected).toBe(false);
    });

    it("upload un fichier protégé par mot de passe", async () => {
      const response = await request(app.getHttpServer())
        .post("/file")
        .set("Authorization", `Bearer ${tokenOwner}`)
        .field("password", "secret123")
        .attach("file", Buffer.from("contenu protégé"), "protected.txt")
        .expect(201);

      expect(response.body.isPasswordProtected).toBe(true);
    });

    it("rejette l'upload sans authentification", async () => {
      await request(app.getHttpServer())
        .post("/file")
        .attach("file", Buffer.from("contenu"), "test.txt")
        .expect(401);
    });

    it("rejette un fichier détecté comme exécutable dangereux", async () => {
      await request(app.getHttpServer())
        .post("/file")
        .set("Authorization", `Bearer ${tokenOwner}`)
        .attach("file", buildFakeExeBuffer(), "programme.exe")
        .expect(400);
    });

    it("rejette une expiration supérieure à 7 jours", async () => {
      await request(app.getHttpServer())
        .post("/file")
        .set("Authorization", `Bearer ${tokenOwner}`)
        .field("expiresInDays", "10")
        .attach("file", Buffer.from("contenu"), "test.txt")
        .expect(400);
    });

    it("rejette un mot de passe trop court", async () => {
      await request(app.getHttpServer())
        .post("/file")
        .set("Authorization", `Bearer ${tokenOwner}`)
        .field("password", "ab")
        .attach("file", Buffer.from("contenu"), "test.txt")
        .expect(400);
    });
  });

  describe("GET /file", () => {
    it("retourne uniquement les fichiers de l'utilisateur connecté", async () => {
      const uploadOwner = await request(app.getHttpServer())
        .post("/file")
        .set("Authorization", `Bearer ${tokenOwner}`)
        .attach("file", Buffer.from("fichier owner"), "owner.txt")
        .expect(201);

      await request(app.getHttpServer())
        .post("/file")
        .set("Authorization", `Bearer ${tokenOtherUser}`)
        .attach("file", Buffer.from("fichier other"), "other.txt")
        .expect(201);

      const response = await request(app.getHttpServer())
        .get("/file")
        .set("Authorization", `Bearer ${tokenOwner}`)
        .expect(200);

      const ids = response.body.map((f: { id: string }) => f.id);
      expect(ids).toContain(uploadOwner.body.id);
      expect(response.body).toHaveLength(1);
    });

    it("rejette la requête sans authentification", async () => {
      await request(app.getHttpServer()).get("/file").expect(401);
    });
  });

  describe("DELETE /file/:id", () => {
    it("supprime le fichier quand l'utilisateur en est propriétaire", async () => {
      const upload = await request(app.getHttpServer())
        .post("/file")
        .set("Authorization", `Bearer ${tokenOwner}`)
        .attach("file", Buffer.from("à supprimer"), "delete-me.txt")
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/file/${upload.body.id}`)
        .set("Authorization", `Bearer ${tokenOwner}`)
        .expect(204);
    });

    it("rejette la suppression par un autre utilisateur", async () => {
      const upload = await request(app.getHttpServer())
        .post("/file")
        .set("Authorization", `Bearer ${tokenOwner}`)
        .attach("file", Buffer.from("protégé"), "not-yours.txt")
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/file/${upload.body.id}`)
        .set("Authorization", `Bearer ${tokenOtherUser}`)
        .expect(403);
    });

    it("retourne 404 pour un fichier déjà supprimé", async () => {
      const upload = await request(app.getHttpServer())
        .post("/file")
        .set("Authorization", `Bearer ${tokenOwner}`)
        .attach("file", Buffer.from("éphémère"), "temp.txt")
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/file/${upload.body.id}`)
        .set("Authorization", `Bearer ${tokenOwner}`)
        .expect(204);

      await request(app.getHttpServer())
        .delete(`/file/${upload.body.id}`)
        .set("Authorization", `Bearer ${tokenOwner}`)
        .expect(404);
    });
  });

  describe("POST /file/:id/force-expire", () => {
    it("expire immédiatement le fichier quand l'utilisateur en est propriétaire", async () => {
      const upload = await request(app.getHttpServer())
        .post("/file")
        .set("Authorization", `Bearer ${tokenOwner}`)
        .attach("file", Buffer.from("à expirer"), "expire-me.txt")
        .expect(201);

      await request(app.getHttpServer())
        .post(`/file/${upload.body.id}/force-expire`)
        .set("Authorization", `Bearer ${tokenOwner}`)
        .expect(204);

      // Laisse le temps au processor BullMQ de traiter le job.
      await new Promise((resolve) => setTimeout(resolve, 500));

      const history = await request(app.getHttpServer())
        .get("/file")
        .set("Authorization", `Bearer ${tokenOwner}`)
        .expect(200);

      const ids = history.body.map((f: { id: string }) => f.id);
      expect(ids).not.toContain(upload.body.id);
    });

    it("rejette la requête par un autre utilisateur", async () => {
      const upload = await request(app.getHttpServer())
        .post("/file")
        .set("Authorization", `Bearer ${tokenOwner}`)
        .attach("file", Buffer.from("protégé"), "not-yours.txt")
        .expect(201);

      await request(app.getHttpServer())
        .post(`/file/${upload.body.id}/force-expire`)
        .set("Authorization", `Bearer ${tokenOtherUser}`)
        .expect(403);
    });

    it("retourne 404 pour un fichier inexistant", async () => {
      await request(app.getHttpServer())
        .post("/file/00000000-0000-0000-0000-000000000000/force-expire")
        .set("Authorization", `Bearer ${tokenOwner}`)
        .expect(404);
    });
  });
});
