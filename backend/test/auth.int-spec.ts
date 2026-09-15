import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { createTestApp } from "./utils/create-test-app";
import { cleanDatabase } from "./utils/clean-database";
import { PrismaService } from "../src/_prisma/prisma.service";

describe("Auth (int)", () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  afterEach(async () => {
    await cleanDatabase(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /auth/register", () => {
    it("crée un utilisateur avec des identifiants valides", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/register")
        .send({ email: "nouvel-utilisateur@example.com", password: "password123" })
        .expect(201);

      expect(response.body.email).toBe("nouvel-utilisateur@example.com");
      expect(response.body.password).toBeUndefined();
    });

    it("rejette un email déjà utilisé", async () => {
      await request(app.getHttpServer())
        .post("/auth/register")
        .send({ email: "doublon@example.com", password: "password123" })
        .expect(201);

      await request(app.getHttpServer())
        .post("/auth/register")
        .send({ email: "doublon@example.com", password: "autre-password" })
        .expect(401);
    });

    it("rejette un email au format invalide", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/register")
        .send({ email: "pas-un-email", password: "password123" })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it("rejette un mot de passe trop court", async () => {
      await request(app.getHttpServer())
        .post("/auth/register")
        .send({ email: "test-mdp-court@example.com", password: "court" })
        .expect(400);
    });

    it("rejette une requête sans mot de passe", async () => {
      await request(app.getHttpServer())
        .post("/auth/register")
        .send({ email: "sans-password@example.com" })
        .expect(400);
    });
  });

  describe("POST /auth/login", () => {
    const credentials = { email: "login-test@example.com", password: "password123" };

    beforeEach(async () => {
      await request(app.getHttpServer())
        .post("/auth/register")
        .send(credentials)
        .expect(201);
    });

    it("retourne un access_token avec les bons identifiants", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send(credentials)
        .expect(201);

      expect(typeof response.body.access_token).toBe("string");
      expect(response.body.access_token.length).toBeGreaterThan(0);
    });

    it("rejette un mot de passe incorrect", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: credentials.email, password: "mauvais-password" })
        .expect(401);
    });

    it("rejette un email inconnu", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: "inconnu@example.com", password: "password123" })
        .expect(401);
    });
  });
});
