import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./_prisma/prisma.module";
import { AuthModule } from './auth/auth.module';
import { FileModule } from './file/file.module';
import { StorageModule } from './storage/storage.module';
import { QueueModule } from './queue/queue.module';
import { DownloadModule } from './download/download.module';

@Module({
  imports: [PrismaModule, AuthModule, FileModule, StorageModule, QueueModule, DownloadModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
