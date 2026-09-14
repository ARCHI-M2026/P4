import { Controller, Post, Get, Delete, UploadedFile, UseInterceptors, Request, Body, HttpCode, HttpStatus, Param, ForbiddenException, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiParam,
} from "@nestjs/swagger";

import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from 'multer';

import { FileService } from './file.service';
import { UploadFileDto } from "./dto/upload-file.dto";
import { FileResponseDto } from "./dto/file-response.dto";

import { JwtAuthGuard } from '../auth/jwt-guard';
import { JwtPayload } from '../auth/interface/jwt-payload.interface'


const MAX_FILE_SIZE_BYTES = 1024 * 1024 * 1024;

@ApiTags("file")
@ApiBearerAuth("access-token")
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
  @ApiOperation({ summary: "Uploader un fichier (max 1 Go)" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: { type: "string", format: "binary" },
        expiresInDays: { type: "integer", minimum: 1, maximum: 7, example: 7 },
        password: { type: "string", minLength: 6, example: "secret123" },
      },
      required: ["file"],
    },
  })
  @ApiCreatedResponse({ type: FileResponseDto, description: "Fichier uploadé avec succès" })
  @ApiUnauthorizedResponse({ description: "Token manquant ou invalide" })
  @ApiBadRequestResponse({ description: "Fichier de type dangereux, expiration ou mot de passe invalide" })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileDto,
    @Request() req: { user: JwtPayload }
  ): Promise<FileResponseDto> {
    return this.fileService.upload(file, dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: "Consulter l'historique des fichiers de l'utilisateur connecté" })
  @ApiOkResponse({ type: [FileResponseDto], description: "Liste des fichiers de l'utilisateur" })
  @ApiUnauthorizedResponse({ description: "Token manquant ou invalide" })
  async findAll(@Request() req: { user: JwtPayload }): Promise<FileResponseDto[]> {
    return this.fileService.findAllForUser(req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Supprimer manuellement un fichier" })
  @ApiParam({ name: "id", description: "Identifiant du fichier" })
  @ApiNoContentResponse({ description: "Fichier supprimé avec succès" })
  @ApiUnauthorizedResponse({ description: "Token manquant ou invalide" })
  @ApiForbiddenResponse({ description: "L'utilisateur n'est pas propriétaire du fichier" })
  @ApiNotFoundResponse({ description: "Fichier introuvable" })
  async remove(
    @Param('id') id: string,
    @Request() req: { user: JwtPayload },
  ): Promise<void> {
    await this.fileService.remove(id, req.user.id);
  }


  // TODO - partie dev pour tester une suppression de fichier via postman
  @Post(":id/force-expire")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "[DEV] Forcer l'expiration immédiate d'un fichier", description: "Indisponible en production." })
  @ApiParam({ name: "id", description: "Identifiant du fichier" })
  @ApiNoContentResponse({ description: "Expiration déclenchée avec succès" })
  @ApiUnauthorizedResponse({ description: "Token manquant ou invalide" })
  @ApiForbiddenResponse({ description: "Pas propriétaire, ou endpoint désactivé en production" })
  @ApiNotFoundResponse({ description: "Fichier ou job d'expiration introuvable" })
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
