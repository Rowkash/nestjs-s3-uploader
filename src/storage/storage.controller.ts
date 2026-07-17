import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
  Headers,
  StreamableFile,
  Res,
} from '@nestjs/common';
import { type Response, type Request } from 'express';

import { GarageService } from '@/storage/garage.service';
import { FileValidationPipe } from '@/storage/validators/file.validation.pipe';
import { ApiBody, ApiConsumes, ApiHeader, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ZodValidationPipe } from '@/common/pipes/validation.pipe';
import {
  type GenerateUploadUrlDto,
  generateUploadUrlSchema,
  type UploadFileDto,
  uploadFileSchema,
} from '@/storage/dto/upload-file.dto';
import { BadRequestException } from '@nestjs/common';

@Controller('storage')
export class StorageController {
  constructor(private readonly garageService: GarageService) {}

  @ApiOperation({ summary: 'Upload file to storage' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        name: {
          type: 'string',
          example: 'name',
          description: 'Name of the file the will be key',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @Post('upload')
  async upload(
    @UploadedFile(new FileValidationPipe()) file: Express.Multer.File,
    @Body(new ZodValidationPipe(uploadFileSchema)) dto: UploadFileDto,
  ) {
    await this.garageService.uploadFile({ key: dto.name, file });
    return 'File was successfully uploaded';
  }

  @ApiOperation({
    summary: 'Stream file directly to storage',
    description:
      'Streams the raw binary data of the file directly in the request body to prevent server RAM spikes.',
  })
  @ApiConsumes('application/octet-stream')
  @ApiBody({
    description: 'The raw binary data of the file.',
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiHeader({
    name: 'x-file-name',
    description: 'The target file name (S3 Key)',
    required: true,
    schema: { type: 'string' },
    example: 'stream',
  })
  @ApiHeader({
    name: 'content-type',
    description: 'The MIME type of the file',
    required: true,
    schema: { type: 'string' },
    example: 'image/jpeg',
  })
  @Post('stream')
  async stream(
    @Req() req: Request,
    @Headers('x-file-name') fileName: string,
    @Headers('content-type') contentType: string,
  ) {
    if (!fileName) {
      throw new BadRequestException('Missing x-file-name header');
    }
    await this.garageService.uploadFileStream({
      key: fileName,
      stream: req,
      contentType,
    });
    return 'File was successfully streamed to S3';
  }

  @Post('presigned-url')
  async getUploadUrl(
    @Body(new ZodValidationPipe(generateUploadUrlSchema))
    dto: GenerateUploadUrlDto,
  ) {
    const uploadUrl = await this.garageService.generateUploadUrl(
      dto.name,
      dto.contentType,
    );

    return { uploadUrl };
  }

  @Get('stream/:key')
  async getFileFromBuffer(
    @Param('key') key: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const fileBuffer = await this.garageService.getFileBuffer(key);

    res.set({
      'Content-Type': 'image/jpeg',
      'Content-Disposition': 'inline',
    });

    return new StreamableFile(fileBuffer);
  }

  @Get(':key')
  async getPresignedUrl(@Param('key') key: string) {
    const expiresIn = 900;
    const url = await this.garageService.getReadPresignedUrl(key, expiresIn);

    return { url, expiresInSeconds: expiresIn };
  }
}
