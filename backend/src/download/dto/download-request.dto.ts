import { IsOptional, IsString } from "class-validator";

export class DownloadRequestDto {
  @IsOptional()
  @IsString()
  password?: string;
}
