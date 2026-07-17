import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import appConfig from '@/configs/app.config';
import { StorageModule } from '@/storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
    }),
    StorageModule,
  ],
})
export class AppModule {}
