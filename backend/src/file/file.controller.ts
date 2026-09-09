import { Controller, Post, UploadedFile, UseInterceptors, Request, Body } from '@nestjs/common';

import { FileInterceptor } from "@nestjs/platform-express";

import { FileService } from './file.service';
import { UploadFileDto } from "./dto/upload-file.dto";
import { FileResponseDto } from "./dto/file-response.dto";

import { JwtPayload } from 'src/auth/interface/jwt-payload.interface'

const MAX_FILE_SIZE_BYTES = 1024 * 1024 * 1024; 

@Controller('file')
export class FileController {
    constructor(private readonly fileService: FileService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileDto,
    @Request() req: {user: JwtPayload}
  ): Promise<FileResponseDto> {
    return this.fileService.upload(file, dto, req.user.id);
  }
}
