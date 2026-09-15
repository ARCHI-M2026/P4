import { ApiProperty } from "@nestjs/swagger";

export class DownloadMetadataResponseDto {
  @ApiProperty({ example: "rapport.pdf" })
  originalName!: string;

  @ApiProperty({ example: "application/pdf" })
  mimeType!: string;

  @ApiProperty({ description: "Taille du fichier en octets", example: 102400 })
  size!: number;

  @ApiProperty()
  expiresAt!: Date;

  @ApiProperty({ example: false })
  isPasswordProtected!: boolean;

  constructor(partial: Partial<DownloadMetadataResponseDto>) {
    Object.assign(this, partial);
  }
}