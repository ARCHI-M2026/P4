export class DownloadMetadataResponseDto {
  originalName!: string;
  mimeType!: string;
  size!: number;
  expiresAt!: Date;
  isPasswordProtected!: boolean;

  constructor(partial: Partial<DownloadMetadataResponseDto>) {
    Object.assign(this, partial);
  }
}