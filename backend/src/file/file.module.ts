import { Module } from '@nestjs/common';
import { BullModule } from "@nestjs/bullmq";

import { FileController } from './file.controller';
import { FileService } from './file.service';
import { FileProcessor } from "./file.processor";
import { StorageModule } from 'src/storage/storage.module';
import { PrismaModule } from 'src/_prisma/prisma.module';

@Module({
  imports: [PrismaModule, StorageModule, BullModule.registerQueue({ name: "file-expiration" }),],
  controllers: [FileController],
  providers: [FileService, FileProcessor]
})
export class FileModule {}
