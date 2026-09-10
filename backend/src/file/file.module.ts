import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { StorageModule } from 'src/storage/storage.module';
import { PrismaModule } from 'src/_prisma/prisma.module';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [FileController],
  providers: [FileService]
})
export class FileModule {}
