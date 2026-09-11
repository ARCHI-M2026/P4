import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { DownloadService } from "./download.service";
import { DownloadRequestDto } from "./dto/download-request.dto";
import { DownloadMetadataResponseDto } from "./dto/download-metadata-response.dto";
import { DownloadUrlResponseDto } from "./dto/download-url-response.dto";

@Controller("download")
export class DownloadController {
  constructor(private readonly downloadService: DownloadService) {}

  @Get(":token")
  async getMetadata(
    @Param("token") token: string,
  ): Promise<DownloadMetadataResponseDto> {
    return this.downloadService.getMetadata(token);
  }

  @Post(":token")
  async download(
    @Param("token") token: string,
    @Body() dto: DownloadRequestDto,
  ): Promise<DownloadUrlResponseDto> {
    return this.downloadService.getDownloadUrl(token, dto);
  }
}