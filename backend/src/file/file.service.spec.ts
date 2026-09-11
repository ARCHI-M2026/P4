import { Test, TestingModule } from "@nestjs/testing";
import { getQueueToken } from "@nestjs/bullmq";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { FileService } from "./file.service";
import { PrismaService } from "../_prisma/prisma.service";
import { StorageService } from "../storage/storage.service";

describe("FileService — ownership checks", () => {
  let service: FileService;
  let prisma: { file: { findUnique: jest.Mock; delete: jest.Mock } };
  let storage: { delete: jest.Mock };
  let queue: { getJob: jest.Mock };

  const OWNER_ID = "owner-1";
  const OTHER_USER_ID = "someone-else";

  const fakeFile = {
    id: "file-1",
    objectKey: "owner-1/abc-fichier.pdf",
    userId: OWNER_ID,
  };

  beforeEach(async () => {
    prisma = {
      file: {
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
    };
    storage = {
      delete: jest.fn(),
    };
    queue = {
      getJob: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: storage },
        { provide: getQueueToken("file-expiration"), useValue: queue },
      ],
    }).compile();

    service = module.get(FileService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("remove", () => {
    it("supprime le fichier quand l'utilisateur en est propriétaire", async () => {
      prisma.file.findUnique.mockResolvedValue(fakeFile);
      queue.getJob.mockResolvedValue(null);

      await service.remove("file-1", OWNER_ID);

      expect(storage.delete).toHaveBeenCalledWith(fakeFile.objectKey);
      expect(prisma.file.delete).toHaveBeenCalledWith({
        where: { id: "file-1" },
      });
    });

    it("rejette avec 403 si l'utilisateur n'est pas le propriétaire", async () => {
      prisma.file.findUnique.mockResolvedValue(fakeFile);

      await expect(service.remove("file-1", OTHER_USER_ID)).rejects.toThrow(
        ForbiddenException,
      );
      expect(storage.delete).not.toHaveBeenCalled();
      expect(prisma.file.delete).not.toHaveBeenCalled();
    });

    it("rejette avec 404 si le fichier n'existe pas", async () => {
      prisma.file.findUnique.mockResolvedValue(null);

      await expect(service.remove("inconnu", OWNER_ID)).rejects.toThrow(
        NotFoundException,
      );
      expect(storage.delete).not.toHaveBeenCalled();
    });
  });

  describe("forceExpire", () => {
    it("promeut le job quand l'utilisateur est propriétaire et le job existe", async () => {
      prisma.file.findUnique.mockResolvedValue(fakeFile);
      const promote = jest.fn();
      queue.getJob.mockResolvedValue({ promote });

      await service.forceExpire("file-1", OWNER_ID);

      expect(promote).toHaveBeenCalledTimes(1);
    });

    it("rejette avec 403 si l'utilisateur n'est pas le propriétaire", async () => {
      prisma.file.findUnique.mockResolvedValue(fakeFile);

      await expect(
        service.forceExpire("file-1", OTHER_USER_ID),
      ).rejects.toThrow(ForbiddenException);
      expect(queue.getJob).not.toHaveBeenCalled();
    });

    it("rejette avec 404 si le fichier n'existe pas", async () => {
      prisma.file.findUnique.mockResolvedValue(null);

      await expect(
        service.forceExpire("inconnu", OWNER_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it("rejette avec 404 si aucun job d'expiration n'est trouvé", async () => {
      prisma.file.findUnique.mockResolvedValue(fakeFile);
      queue.getJob.mockResolvedValue(null);

      await expect(
        service.forceExpire("file-1", OWNER_ID),
      ).rejects.toThrow(NotFoundException);
    });
  });
});