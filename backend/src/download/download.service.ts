import {
  BadRequestException,
  GoneException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../_prisma/prisma.service";
import { StorageService } from "../storage/storage.service";
import { DownloadRequestDto } from "./dto/download-request.dto";
import { DownloadMetadataResponseDto } from "./dto/download-metadata-response.dto";
import { DownloadUrlResponseDto } from "./dto/download-url-response.dto";

const PRESIGNED_URL_TTL_SECONDS = 60 * 5; // 5 minutes

@Injectable()
export class DownloadService {
  private readonly logger = new Logger(DownloadService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async getMetadata(token: string): Promise<DownloadMetadataResponseDto> {
    const file = await this.findValidFileOrThrow(token);

    return new DownloadMetadataResponseDto({
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      expiresAt: file.expiresAt,
      isPasswordProtected: !!file.passwordHash,
    });
  }

  async getDownloadUrl(
    token: string,
    dto: DownloadRequestDto,
  ): Promise<DownloadUrlResponseDto> {
    const file = await this.findValidFileOrThrow(token);

    if (file.passwordHash) {
      if (!dto.password) {
        throw new BadRequestException("Mot de passe requis");
      }
      const isValid = await bcrypt.compare(dto.password, file.passwordHash);
      if (!isValid) {
        throw new UnauthorizedException("Mot de passe incorrect");
      }
    }

    const url = await this.storage.getPresignedDownloadUrl(
      file.objectKey,
      PRESIGNED_URL_TTL_SECONDS,
    );

    this.logger.log(`URL de téléchargement générée pour: ${file.id}`);

    return new DownloadUrlResponseDto({
      url,
      expiresIn: PRESIGNED_URL_TTL_SECONDS,
    });
  }

  private async findValidFileOrThrow(token: string) {
    const file = await this.prisma.file.findUnique({
      where: { downloadToken: token },
    });

    if (!file) {
      throw new NotFoundException("Lien invalide");
    }

    if (file.expiresAt < new Date()) {
      throw new GoneException("Ce lien a expiré");
    }

    return file;
  }
}