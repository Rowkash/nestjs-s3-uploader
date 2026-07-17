import { PipeTransform } from '@nestjs/common';

import { ZodObject } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodObject) {}

  transform(value: unknown) {
    return this.schema.parse(value);
  }
}
