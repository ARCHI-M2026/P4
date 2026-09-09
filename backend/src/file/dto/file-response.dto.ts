export class FileResponseDto {
  id!: string;
  originalName!: string;
  mimeType!: string;
  size!: number;
  uploadedAt!: Date;
  expiresAt!: Date;
  downloadToken!: string;
  isPasswordProtected!: boolean;

  constructor(partial: Partial<FileResponseDto>) {
    Object.assign(this, partial);
  }
}
