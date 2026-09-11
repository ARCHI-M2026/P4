import { Module } from "@nestjs/common";
import { DownloadController } from "./download.controller";
import { DownloadService } from "./download.service";
import { PrismaModule } from "../_prisma/prisma.module";
import { StorageModule } from "../storage/storage.module";

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [DownloadController],
  providers: [DownloadService],
})
export class DownloadModule {}