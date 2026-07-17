import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import garageConfig from '@/configs/garage.config';
import { GarageProvider } from '@/storage/garage.provider';
import { GarageService } from '@/storage/garage.service';
import { StorageController } from '@/storage/storage.controller';

@Module({
  imports: [ConfigModule.forFeature(garageConfig)],
  controllers: [StorageController],
  providers: [GarageProvider, GarageService],
})
export class StorageModule {}
