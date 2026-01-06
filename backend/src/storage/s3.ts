import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../utils/env";
import type { StorageFile, StorageProvider, UploadOptions } from "./types";

export class S3StorageProvider implements StorageProvider {
  private client: S3Client;
  private bucket: string;
  private region: string;
  private endpoint?: string;

  constructor(options?: {
    bucket?: string;
    region?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    endpoint?: string;
  }) {
    this.region = options?.region || env.AWS_REGION || "us-east-1";
    this.bucket = options?.bucket || env.AWS_S3_BUCKET || "notionv2-uploads";
    this.endpoint = options?.endpoint || env.AWS_S3_ENDPOINT;

    this.client = new S3Client({
      region: this.region,
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: options?.accessKeyId || env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey:
          options?.secretAccessKey || env.AWS_SECRET_ACCESS_KEY || "",
      },
      forcePathStyle: !!this.endpoint, // Required for S3-compatible services
    });
  }

  private getObjectUrl(key: string): string {
    if (this.endpoint) {
      return `${this.endpoint}/${this.bucket}/${key}`;
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async upload(
    key: string,
    data: Buffer | Blob | ReadableStream,
    options?: UploadOptions
  ): Promise<StorageFile> {
    let body: Buffer;
    if (Buffer.isBuffer(data)) {
      body = data;
    } else if (data instanceof Blob) {
      body = Buffer.from(await data.arrayBuffer());
    } else {
      // ReadableStream
      const chunks: Uint8Array[] = [];
      const stream = data as ReadableStream<Uint8Array>;
      const reader = stream.getReader();
      let done = false;
      while (!done) {
        const result = await reader.read();
        done = result.done;
        if (result.value) {
          chunks.push(result.value);
        }
      }
      body = Buffer.concat(chunks);
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: body,
      ContentType: options?.contentType || "application/octet-stream",
      Metadata: options?.metadata,
      ACL: options?.isPublic ? "public-read" : "private",
    });

    await this.client.send(command);

    return {
      key,
      url: this.getObjectUrl(key),
      size: body.length,
      contentType: options?.contentType || "application/octet-stream",
      metadata: options?.metadata,
    };
  }

  async download(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.client.send(command);
    const stream = response.Body as ReadableStream;

    const chunks: Uint8Array[] = [];
    const reader = stream.getReader();
    let done = false;
    while (!done) {
      const result = await reader.read();
      done = result.done;
      if (result.value) {
        chunks.push(result.value);
      }
    }

    return Buffer.concat(chunks);
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }

  async exists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.client.send(command);
      return true;
    } catch {
      return false;
    }
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }

  async getMetadata(key: string): Promise<StorageFile | null> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.client.send(command);

      return {
        key,
        url: this.getObjectUrl(key),
        size: response.ContentLength || 0,
        contentType: response.ContentType || "application/octet-stream",
        metadata: response.Metadata,
      };
    } catch {
      return null;
    }
  }

  async list(prefix?: string): Promise<StorageFile[]> {
    const command = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: prefix,
    });

    const response = await this.client.send(command);
    const files: StorageFile[] = [];

    for (const object of response.Contents || []) {
      if (object.Key) {
        files.push({
          key: object.Key,
          url: this.getObjectUrl(object.Key),
          size: object.Size || 0,
          contentType: "application/octet-stream",
        });
      }
    }

    return files;
  }
}
