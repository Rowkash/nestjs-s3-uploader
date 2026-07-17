import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Readable } from 'node:stream';
import { type ConfigType } from '@nestjs/config';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import garageConfig from '@/configs/garage.config';
import { GARAGE_CLIENT } from '@/storage/garage.provider';

export interface IUploadFile {
  key: string;
  file: Express.Multer.File;
}

interface IUploadStream {
  key: string;
  stream: Readable;
  contentType: string;
}

@Injectable()
export class GarageService {
  constructor(
    @Inject(garageConfig.KEY)
    private config: ConfigType<typeof garageConfig>,
    @Inject(GARAGE_CLIENT)
    private readonly minioClient: S3Client,
  ) {}

  async uploadFile(data: IUploadFile) {
    const command = new PutObjectCommand({
      Bucket: this.getBucketName(),
      Key: data.key,
      Body: data.file.buffer,
      ContentType: data.file.mimetype,
    });
    try {
      await this.minioClient.send(command);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }

  async uploadFileStream(data: IUploadStream) {
    try {
      const parallelUploads3 = new Upload({
        client: this.minioClient,
        params: {
          Bucket: this.getBucketName(),
          Key: data.key,
          Body: data.stream,
          ContentType: data.contentType,
        },
        queueSize: 4,
        partSize: 1024 * 1024 * 5,
        leavePartsOnError: false,
      });

      parallelUploads3.on('httpUploadProgress', (progress) => {
        console.log(
          `Uploaded part ${progress.part} - Loaded: ${progress.loaded} bytes`,
        );
      });

      await parallelUploads3.done();
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }

  async getReadPresignedUrl(key: string, expiresInSec = 900) {
    const command = new GetObjectCommand({
      Bucket: this.getBucketName(),
      Key: key,
    });

    try {
      return await getSignedUrl(this.minioClient, command, {
        expiresIn: expiresInSec,
      });
    } catch (error) {
      console.error('Failed to generate presigned URL', error);
      throw error;
    }
  }

  async generateUploadUrl(key: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.getBucketName(),
      Key: key,
      ContentType: contentType,
    });

    try {
      return await getSignedUrl(this.minioClient, command, {
        expiresIn: 900, // 15min
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Could not generate presigned URL',
      );
    }
  }

  async getFileBuffer(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.getBucketName(),
      Key: key,
    });

    const { Body } = await this.minioClient.send(command);
    const chunks: Uint8Array[] = [];
    for await (const chunk of Body as Readable) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  async deleteFile(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.getBucketName(),
      Key: key,
    });
    await this.minioClient.send(command);
  }

  private getBucketName() {
    return this.config.GARAGE_DEFAULT_BUCKET;
  }
}
