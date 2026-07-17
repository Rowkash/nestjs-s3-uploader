import { z as zod } from 'zod';
import { registerAs } from '@nestjs/config';

export const AppConfigKey = 'appConfig';

export enum NodeEnvEnum {
  PRODUCTION = 'production',
  DEVELOPMENT = 'development',
  TEST = 'test',
}

const appConfigSchema = zod.object({
  NODE_ENV: zod.enum(NodeEnvEnum).default(NodeEnvEnum.DEVELOPMENT),
  APP_PORT: zod.coerce.number().default(3000),
});

export type TAppConfig = zod.infer<typeof appConfigSchema>;

export default registerAs(AppConfigKey, (): TAppConfig => {
  const result = appConfigSchema.safeParse(process.env);

  if (!result.success) {
    console.error('Invalid app configuration:');
    console.error(JSON.stringify(result.error.message, null, 2));
    throw new Error('App config environment validation failed');
  }

  return result.data;
});
