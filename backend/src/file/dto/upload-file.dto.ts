import { IsInt, IsOptional, IsString, Max, Min, MinLength } from "class-validator";
import { Type } from "class-transformer";

export class UploadFileDto{
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(7)
  expiresInDays?: number;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}