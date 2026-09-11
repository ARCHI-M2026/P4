import { Test, TestingModule } from "@nestjs/testing";
import {
  BadRequestException,
  GoneException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { DownloadService } from "./download.service";
import { PrismaService } from "../_prisma/prisma.service";
import { StorageService } from "../storage/storage.service";

describe("DownloadService", () => {
  let service: DownloadService;
  let prisma: { file: { findUnique: jest.Mock } };
  let storage: { getPresignedDownloadUrl: jest.Mock };

  const inOneHour = () => new Date(Date.now() + 60 * 60 * 1000);
  const oneHourAgo = () => new Date(Date.now() - 60 * 60 * 1000);

  beforeEach(async () => {
    prisma = {
      file: {
        findUnique: jest.fn(),
      },
    };
    storage = {
      getPresignedDownloadUrl: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DownloadService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();

    service = module.get(DownloadService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getMetadata", () => {
    it("retourne les métadonnées pour un lien valide", async () => {
      prisma.file.findUnique.mockResolvedValue({
        originalName: "rapport.pdf",
        mimeType: "application/pdf",
        size: 1024,
        expiresAt: inOneHour(),
        passwordHash: null,
      });

      const result = await service.getMetadata("token-valide");

      expect(result.originalName).toBe("rapport.pdf");
      expect(result.isPasswordProtected).toBe(false);
    });

    it("rejette avec 404 si le token n'existe pas", async () => {
      prisma.file.findUnique.mockResolvedValue(null);

      await expect(service.getMetadata("token-inconnu")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("rejette avec 410 (Gone) si le lien a expiré", async () => {
      prisma.file.findUnique.mockResolvedValue({
        originalName: "rapport.pdf",
        mimeType: "application/pdf",
        size: 1024,
        expiresAt: oneHourAgo(),
        passwordHash: null,
      });

      await expect(service.getMetadata("token-expire")).rejects.toThrow(
        GoneException,
      );
    });
  });

  describe("getDownloadUrl", () => {
    it("retourne l'URL quand le fichier n'est pas protégé", async () => {
      prisma.file.findUnique.mockResolvedValue({
        id: "file-1",
        objectKey: "user-1/abc-fichier.pdf",
        expiresAt: inOneHour(),
        passwordHash: null,
      });
      storage.getPresignedDownloadUrl.mockResolvedValue(
        "http://minio/fichier.pdf?signed",
      );

      const result = await service.getDownloadUrl("token-valide", {});

      expect(result.url).toBe("http://minio/fichier.pdf?signed");
    });

    it("rejette avec 400 si le fichier est protégé et qu'aucun mot de passe n'est fourni", async () => {
      prisma.file.findUnique.mockResolvedValue({
        id: "file-1",
        objectKey: "user-1/abc-fichier.pdf",
        expiresAt: inOneHour(),
        passwordHash: await bcrypt.hash("secret123", 10),
      });

      await expect(
        service.getDownloadUrl("token-valide", {}),
      ).rejects.toThrow(BadRequestException);
      expect(storage.getPresignedDownloadUrl).not.toHaveBeenCalled();
    });

    it("rejette avec 401 si le mot de passe fourni est incorrect", async () => {
      prisma.file.findUnique.mockResolvedValue({
        id: "file-1",
        objectKey: "user-1/abc-fichier.pdf",
        expiresAt: inOneHour(),
        passwordHash: await bcrypt.hash("secret123", 10),
      });

      await expect(
        service.getDownloadUrl("token-valide", { password: "mauvais" }),
      ).rejects.toThrow(UnauthorizedException);
      expect(storage.getPresignedDownloadUrl).not.toHaveBeenCalled();
    });

    it("retourne l'URL quand le bon mot de passe est fourni", async () => {
      prisma.file.findUnique.mockResolvedValue({
        id: "file-1",
        objectKey: "user-1/abc-fichier.pdf",
        expiresAt: inOneHour(),
        passwordHash: await bcrypt.hash("secret123", 10),
      });
      storage.getPresignedDownloadUrl.mockResolvedValue(
        "http://minio/fichier.pdf?signed",
      );

      const result = await service.getDownloadUrl("token-valide", {
        password: "secret123",
      });

      expect(result.url).toBe("http://minio/fichier.pdf?signed");
    });

    it("rejette avec 410 (Gone) si le lien a expiré", async () => {
      prisma.file.findUnique.mockResolvedValue({
        id: "file-1",
        objectKey: "user-1/abc-fichier.pdf",
        expiresAt: oneHourAgo(),
        passwordHash: null,
      });

      await expect(
        service.getDownloadUrl("token-expire", {}),
      ).rejects.toThrow(GoneException);
    });

    it("rejette avec 404 si le token n'existe pas", async () => {
      prisma.file.findUnique.mockResolvedValue(null);

      await expect(
        service.getDownloadUrl("token-inconnu", {}),
      ).rejects.toThrow(NotFoundException);
    });
  });
});