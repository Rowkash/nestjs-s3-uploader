import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from '@/app.module';
import { initSwagger } from '@/swagger.config';
import { AppConfigKey, TAppConfig } from '@/configs/app.config';
import { ZodFilter } from '@/common/filters/zod.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  const appConfig = configService.get<TAppConfig>(AppConfigKey)!;
  const PORT = appConfig.APP_PORT;
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new ZodFilter());

  initSwagger(app);

  await app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

void bootstrap();
