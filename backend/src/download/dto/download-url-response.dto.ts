export class DownloadUrlResponseDto {
  url!: string;
  expiresIn!: number;

  constructor(partial: Partial<DownloadUrlResponseDto>) {
    Object.assign(this, partial);
  }
}