import { IsOptional, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class DownloadRequestDto {
  @ApiPropertyOptional({
    description: "Mot de passe requis si le fichier est protégé.",
    example: "secret123",
  })
  @IsOptional()
  @IsString()
  password?: string;
}
