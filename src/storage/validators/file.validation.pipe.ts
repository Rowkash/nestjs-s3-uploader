import * as fs from 'fs';
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');

    if (file) {
      const fileType = file.mimetype;

      if (!fileType.startsWith('image/')) {
        fs.unlinkSync(file.path);
        throw new BadRequestException(
          'Invalid file type. Only images formats are allowed.',
        );
      }
      return file;
    }
    return;
  }
}
