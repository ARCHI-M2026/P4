import { ApiProperty } from "@nestjs/swagger";

export class FileResponseDto {
  @ApiProperty({ example: "30c479e1-7cff-4f1e-9784-db0c37da138b" })
  id!: string;

  @ApiProperty({ example: "rapport.pdf" })
  originalName!: string;

  @ApiProperty({ example: "application/pdf" })
  mimeType!: string;

  @ApiProperty({ description: "Taille du fichier en octets", example: 102400 })
  size!: number;

  @ApiProperty()
  uploadedAt!: Date;

  @ApiProperty()
  expiresAt!: Date;

  @ApiProperty({
    description: "Identifiant unique utilisé dans le lien de téléchargement public",
    example: "252edb8e-7ad3-492d-84db-ded2b9ec52a0",
  })
  downloadToken!: string;

  @ApiProperty({ example: false })
  isPasswordProtected!: boolean;

  constructor(partial: Partial<FileResponseDto>) {
    Object.assign(this, partial);
  }
}
