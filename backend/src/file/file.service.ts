import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';

import { randomBytes } from "crypto";
import * as bcrypt from "bcrypt";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";

import { PrismaService } from "../_prisma/prisma.service";
import { UploadFileDto } from "./dto/upload-file.dto";
import { FileResponseDto } from "./dto/file-response.dto";

import { StorageService } from 'src/storage/storage.service';
import { DeleteFileJobData } from './interface/delete-file-job-data.interface';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    @InjectQueue("file-expiration")
    private readonly expirationQueue: Queue<DeleteFileJobData>,
  ){}

  async upload(
    file: Express.Multer.File,
    dto: UploadFileDto,
    userId: string
  ): Promise<FileResponseDto> {

    // TODO Validarion chiffre magique
    // File name in minIO
    const objectKey = `${userId}/${randomBytes(16).toString("hex")}-${file.originalname}`;

    await this.storage.upload(objectKey, file.buffer, file.mimetype);

    const expiresInDays = dto.expiresInDays ?? parseInt(process.env.DEFAULT_EXPIRATION_DAYS ?? "7");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // File password
    const passwordHash = dto.password
      ? await bcrypt.hash(dto.password, parseInt(process.env.BCRYPT_SALT_ROUND ?? '10'))
      : null;

    const created = await this.prisma.file.create({
      data: {
        objectKey,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        expiresAt,
        passwordHash,
        userId,
      },
    });

    this.logger.log(`File uploaded: ${created.id} (user: ${userId})`);

    return new FileResponseDto({
      id: created.id,
      originalName: created.originalName,
      mimeType: created.mimeType,
      size: created.size,
      uploadedAt: created.uploadedAt,
      expiresAt: created.expiresAt,
      downloadToken: created.downloadToken,
      isPasswordProtected: !!created.passwordHash,
    });
  }

  async remove(fileId: string, userId: string): Promise<void> {
    const file = await this.prisma.file.findUnique({ where: { id: fileId } });
 
    if (!file) {
      throw new NotFoundException("File not found");
    }
 
    if (file.userId !== userId) {
      throw new ForbiddenException("You are not the owner of this file");
    }
 
    await this.storage.delete(file.objectKey);
 
    await this.prisma.file.delete({ where: { id: fileId } });
 
    // Le fichier est déjà supprimé : on annule le job d'expiration s'il existe encore.
    const job = await this.expirationQueue.getJob(fileId);
    if (job) {
      await job.remove();
    }
 
    this.logger.log(`File deleted: ${fileId} (user: ${userId})`);
  }
}
