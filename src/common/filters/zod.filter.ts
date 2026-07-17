import { ZodError, z as zod } from 'zod';
import { Response } from 'express';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';

@Catch(ZodError)
export class ZodFilter implements ExceptionFilter {
  catch(exception: ZodError<Record<string, any>>, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = HttpStatus.BAD_REQUEST;
    const errors = zod.treeifyError(exception);

    response.status(status).json({
      statusCode: status,
      message: 'Validation failed',
      errors: errors.properties ?? errors,
    });
  }
}
