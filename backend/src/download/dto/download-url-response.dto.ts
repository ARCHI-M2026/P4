import { ApiProperty } from "@nestjs/swagger";

export class DownloadUrlResponseDto {
  @ApiProperty({ description: "URL presignée MinIO pour télécharger le fichier directement." })
  url!: string;

  @ApiProperty({ description: "Durée de validité de l'URL, en secondes.", example: 300 })
  expiresIn!: number;

  constructor(partial: Partial<DownloadUrlResponseDto>) {
    Object.assign(this, partial);
  }
}