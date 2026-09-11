import { Controller, Post, UploadedFile, UseInterceptors, Request, Body, HttpCode, HttpStatus, Param, ForbiddenException, UseGuards } from '@nestjs/common';

import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from 'multer';

import { FileService } from './file.service';
import { UploadFileDto } from "./dto/upload-file.dto";
import { FileResponseDto } from "./dto/file-response.dto";

import { JwtAuthGuard } from 'src/auth/jwt-guard';
import { JwtPayload } from 'src/auth/interface/jwt-payload.interface'


const MAX_FILE_SIZE_BYTES = 1024 * 1024 * 1024;

@Controller('file')
@UseGuards(JwtAuthGuard)
export class FileController {
  constructor(private readonly fileService: FileService) { }

  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileDto,
    @Request() req: { user: JwtPayload }
  ): Promise<FileResponseDto> {
    return this.fileService.upload(file, dto, req.user.id);
  }

  @Post(":id/force-expire")
  @HttpCode(HttpStatus.NO_CONTENT)
  async forceExpire(
    @Param("id") id: string,
    @Request() req: { user: JwtPayload },
  ): Promise<void> {
    if (process.env.NODE_ENV === "production") {
      throw new ForbiddenException("Endpoint disponible uniquement en dev");
    }
    await this.fileService.forceExpire(id, req.user.id); 
  }
}
