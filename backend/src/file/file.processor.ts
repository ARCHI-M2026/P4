import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { PrismaService } from "../_prisma/prisma.service";
import { StorageService } from "../storage/storage.service";
import { DeleteFileJobData } from "./interface/delete-file-job-data.interface";


@Processor("file-expiration")
export class FileProcessor extends WorkerHost {
  private readonly logger = new Logger(FileProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {
    super();
  }

  async process(job: Job<DeleteFileJobData>): Promise<void> {
    const { fileId } = job.data;

    const file = await this.prisma.file.findUnique({ where: { id: fileId } });

    if (!file) {
      // Déjà supprimé manuellement (ou job orphelin)
      this.logger.warn(`File ${fileId} not found, job ignored`);
      return;
    }

    await this.storage.delete(file.objectKey);
    await this.prisma.file.delete({ where: { id: fileId } });

    this.logger.log(`Fichier expiré et supprimé automatiquement: ${fileId}`);
  }
}