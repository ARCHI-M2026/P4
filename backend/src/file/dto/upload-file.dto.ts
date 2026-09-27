import { IsInt, IsOptional, IsString, Max, Min, MinLength } from "class-validator";
import { Transform, Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UploadFileDto{
  @ApiPropertyOptional({
    description: "Durée d'expiration du fichier en jours (1 à 7). Défaut : 7 jours.",
    minimum: 1,
    maximum: 7,
    example: 7,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(7)
  expiresInDays?: number;

  @ApiPropertyOptional({
    description: "Mot de passe optionnel pour protéger le téléchargement (min. 6 caractères).",
    minLength: 6,
    example: "secret123",
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === "" || value === null ? undefined : value,
  )
  @IsString()
  @MinLength(6)
  password?: string;
}