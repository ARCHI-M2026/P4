import { Injectable, Logger } from "@nestjs/common";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    this.bucket = process.env.MINIO_BUCKET_NAME ?? "file-transfer";

    this.client = new S3Client({
      endpoint: `http://${process.env.MINIO_ENDPOINT ?? "localhost"}:${process.env.MINIO_PORT ?? "9000"}`,
      region: "us-east-1", // SDK requirement
      credentials: {
        accessKeyId: process.env.MINIO_ROOT_USER ?? "minioadmin",
        secretAccessKey: process.env.MINIO_ROOT_PASSWORD ?? "minioadmin",
      },
      forcePathStyle: true, // For MinIO
    });
  }

  async upload(
    objectKey: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
        Body: buffer,
        ContentType: mimeType,
      }),
    );
    this.logger.log(`Objet inside of MinIO: ${objectKey}`);
  }

  async delete(objectKey: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
      }),
    );
    this.logger.log(`Objet outside of MinIO: ${objectKey}`);
  }

  async getPresignedDownloadUrl(
    objectKey: string,
    expiresInSeconds: number,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: objectKey,
    });

    const url = await getSignedUrl(this.client, command, {
      expiresIn: expiresInSeconds,
    });

    this.logger.log(`Slug generated for: ${objectKey}`);
    return url;
  }
}