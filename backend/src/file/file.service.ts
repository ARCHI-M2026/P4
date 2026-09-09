import { Injectable, Logger } from '@nestjs/common';

import { randomBytes } from "crypto";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../_prisma/prisma.service";
import { UploadFileDto } from "./dto/upload-file.dto";
import { FileResponseDto } from "./dto/file-response.dto";

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name)

  constructor(private readonly prisma: PrismaService){}

  async upload(
    file: Express.Multer.File,
    dto: UploadFileDto,
    userId: number
  ): Promise<FileResponseDto> {

    // File name in minIO
    const objectKey = `${userId}/${randomBytes(16).toString("hex")}-${file.originalname}`;

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
}
