import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiGoneResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiParam,
} from "@nestjs/swagger";
import { DownloadService } from "./download.service";
import { DownloadRequestDto } from "./dto/download-request.dto";
import { DownloadMetadataResponseDto } from "./dto/download-metadata-response.dto";
import { DownloadUrlResponseDto } from "./dto/download-url-response.dto";

@ApiTags("download")
@Controller("download")
export class DownloadController {
  constructor(private readonly downloadService: DownloadService) {}

  @Get(":token")
  @ApiOperation({ summary: "Consulter les métadonnées d'un fichier avant téléchargement (accès public)" })
  @ApiParam({ name: "token", description: "Token de téléchargement (contenu dans le lien partagé)" })
  @ApiOkResponse({ type: DownloadMetadataResponseDto })
  @ApiNotFoundResponse({ description: "Lien invalide" })
  @ApiGoneResponse({ description: "Le lien a expiré" })
  async getMetadata(
    @Param("token") token: string,
  ): Promise<DownloadMetadataResponseDto> {
    return this.downloadService.getMetadata(token);
  }

  @Post(":token")
  @ApiOperation({ summary: "Obtenir l'URL de téléchargement (accès public, mot de passe si requis)" })
  @ApiParam({ name: "token", description: "Token de téléchargement (contenu dans le lien partagé)" })
  @ApiCreatedResponse({ type: DownloadUrlResponseDto })
  @ApiBadRequestResponse({ description: "Mot de passe requis mais non fourni" })
  @ApiUnauthorizedResponse({ description: "Mot de passe incorrect" })
  @ApiNotFoundResponse({ description: "Lien invalide" })
  @ApiGoneResponse({ description: "Le lien a expiré" })
  async download(
    @Param("token") token: string,
    @Body() dto: DownloadRequestDto,
  ): Promise<DownloadUrlResponseDto> {
    return this.downloadService.getDownloadUrl(token, dto);
  }
}