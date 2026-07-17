import { ConfigType } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';

import garageConfig from '@/configs/garage.config';

export const GARAGE_CLIENT = 'GARAGE_CLIENT';

export const GarageProvider = {
  provide: GARAGE_CLIENT,
  inject: [garageConfig.KEY],
  useFactory: (config: ConfigType<typeof garageConfig>) => {
    return new S3Client({
      endpoint: config.GARAGE_ENDPOINT,
      region: 'garage',
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.GARAGE_DEFAULT_ACCESS_KEY,
        secretAccessKey: config.GARAGE_DEFAULT_SECRET_KEY,
      },
    });
  },
};
