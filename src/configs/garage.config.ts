import { z as zod } from 'zod';
import { registerAs } from '@nestjs/config';

const garageConfigSchema = zod.object({
  GARAGE_DEFAULT_ACCESS_KEY: zod.string(),
  GARAGE_DEFAULT_SECRET_KEY: zod.string(),
  GARAGE_ENDPOINT: zod.url(),
  GARAGE_DEFAULT_BUCKET: zod.string(),
});

export type TGarageConfig = zod.infer<typeof garageConfigSchema>;

export const MinIOKey = 'garage';

export default registerAs(MinIOKey, (): TGarageConfig => {
  const result = garageConfigSchema.safeParse(process.env);
  if (!result.success) {
    const error = zod.treeifyError(result.error);
    console.error('Invalid Garage S3 configuration:');
    console.error(error.properties);
    throw new Error('Garage S3 environment validation failed');
  }
  return result.data;
});
