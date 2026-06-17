import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// URLs prefirmadas para lectura. La firma se calcula localmente (sigv4), no hay
// round-trip de red, pero getSignedUrl es async.
const SIGNED_URL_TTL_SECONDS = 3600;

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private client: S3Client;
  private bucket: string;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const endpoint = this.configService.get<string>('R2_ENDPOINT');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'R2_SECRET_ACCESS_KEY',
    );
    this.bucket = this.configService.get<string>('R2_BUCKET') ?? '';

    if (!endpoint || !accessKeyId || !secretAccessKey || !this.bucket) {
      this.logger.warn(
        'R2 no esta configurado por completo. Las operaciones de storage fallaran.',
      );
    }

    // forcePathStyle hace las URLs deterministas
    // (endpoint/bucket/key), lo que permite recuperar la key con keyFromUrl.
    this.client = new S3Client({
      region: 'auto',
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: accessKeyId ?? '',
        secretAccessKey: secretAccessKey ?? '',
      },
    });
  }

  buildKey(folder: string, originalName: string): string {
    const ext = extname(originalName).toLowerCase() || '.jpg';
    return `${folder}/${randomUUID()}${ext}`;
  }

  // Recupera la key de almacenamiento desde una URL prefirmada. Los clientes
  // solo conocen la URL firmada; al editar reenvian esas URLs y aqui las
  // volvemos a la key para compararlas con lo guardado en DB. Si recibe algo
  // que no es URL (ya es una key), lo devuelve tal cual.
  keyFromUrl(value: string): string {
    if (!/^https?:\/\//i.test(value)) return value;
    const { pathname } = new URL(value);
    const prefix = `/${this.bucket}/`;
    const path = pathname.startsWith(prefix)
      ? pathname.slice(prefix.length)
      : pathname.replace(/^\//, '');
    return decodeURIComponent(path);
  }

  async upload(key: string, body: Buffer, contentType: string): Promise<void> {
    this.logger.log(
      `Subiendo a R2: key=${key} contentType=${contentType} bytes=${body.length}`,
    );
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    this.logger.log(`Subida completada a R2: key=${key}`);
  }

  async delete(key: string): Promise<void> {
    this.logger.log(`Borrando de R2: key=${key}`);
    try {
      await this.client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
    } catch (error) {
      // el objeto ya no existe o no se pudo borrar; no es critico
      this.logger.warn(
        `No se pudo borrar de R2: key=${key} (${(error as Error).message})`,
      );
    }
  }

  async getSignedUrl(key: string): Promise<string> {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: SIGNED_URL_TTL_SECONDS },
    );
  }

  async signOrNull(key: string | null): Promise<string | null> {
    if (!key) return null;
    return this.getSignedUrl(key);
  }

  async signMany(keys: string[]): Promise<string[]> {
    return Promise.all(keys.map((key) => this.getSignedUrl(key)));
  }
}
