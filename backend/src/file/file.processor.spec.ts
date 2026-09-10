import { Test, TestingModule } from "@nestjs/testing";
import { Job } from "bullmq";
import { FileProcessor } from "./file.processor";
import { DeleteFileJobData } from "./interface/delete-file-job-data.interface";
import { PrismaService } from "../_prisma/prisma.service";
import { StorageService } from "../storage/storage.service";

describe("FileProcessor", () => {
  let processor: FileProcessor;
  let prisma: { file: { findUnique: jest.Mock; delete: jest.Mock } };
  let storage: { delete: jest.Mock };

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileProcessor,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();

    processor = module.get(FileProcessor);
  });

  it("supprime le fichier dans MinIO et en base quand il existe encore", async () => {
    const fakeFile = {
      id: "file-1",
      objectKey: "user-1/abc-fichier.pdf",
    };
    prisma.file.findUnique.mockResolvedValue(fakeFile);

    const job = { data: { fileId: "file-1" } } as Job<DeleteFileJobData>;

    await processor.process(job);

    expect(prisma.file.findUnique).toHaveBeenCalledWith({
      where: { id: "file-1" },
    });
    expect(storage.delete).toHaveBeenCalledWith(fakeFile.objectKey);
    expect(prisma.file.delete).toHaveBeenCalledWith({
      where: { id: "file-1" },
    });
  });

  it("ne fait rien si le fichier a déjà été supprimé manuellement", async () => {
    prisma.file.findUnique.mockResolvedValue(null);

    const job = { data: { fileId: "file-already-gone" } } as Job<DeleteFileJobData>;

    await processor.process(job);

    expect(storage.delete).not.toHaveBeenCalled();
    expect(prisma.file.delete).not.toHaveBeenCalled();
  });
});