import { z as zod } from 'zod';

export const uploadFileSchema = zod.object({
  name: zod.string(),
});

export const generateUploadUrlSchema = uploadFileSchema.extend({
  contentType: zod.string(),
});

export type UploadFileDto = zod.infer<typeof uploadFileSchema>;
export type GenerateUploadUrlDto = zod.infer<typeof generateUploadUrlSchema>;
