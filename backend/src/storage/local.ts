import fs from "fs/promises";
import path from "path";
import { env } from "../utils/env";
import type { StorageFile, StorageProvider, UploadOptions } from "./types";

export class LocalStorageProvider implements StorageProvider {
  private basePath: string;
  private baseUrl: string;

  constructor(basePath?: string, baseUrl?: string) {
    this.basePath = basePath || env.STORAGE_LOCAL_PATH || "./uploads";
    this.baseUrl = baseUrl || `http://localhost:${env.PORT || 3001}/uploads`;
  }

  private getFilePath(key: string): string {
    return path.join(this.basePath, key);
  }

  private async ensureDirectory(filePath: string): Promise<void> {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
  }

  async upload(
    key: string,
    data: Buffer | Blob | ReadableStream,
    options?: UploadOptions
  ): Promise<StorageFile> {
    const filePath = this.getFilePath(key);
    await this.ensureDirectory(filePath);

    let buffer: Buffer;
    if (Buffer.isBuffer(data)) {
      buffer = data;
    } else if (data instanceof Blob) {
      buffer = Buffer.from(await data.arrayBuffer());
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
      buffer = Buffer.concat(chunks);
    }

    await fs.writeFile(filePath, buffer);

    // Store metadata if provided
    if (options?.metadata) {
      const metaPath = `${filePath}.meta.json`;
      await fs.writeFile(metaPath, JSON.stringify(options.metadata));
    }

    return {
      key,
      url: `${this.baseUrl}/${key}`,
      size: buffer.length,
      contentType: options?.contentType || "application/octet-stream",
      metadata: options?.metadata,
    };
  }

  async download(key: string): Promise<Buffer> {
    const filePath = this.getFilePath(key);
    return fs.readFile(filePath);
  }

  async delete(key: string): Promise<void> {
    const filePath = this.getFilePath(key);
    await fs.unlink(filePath).catch(() => {
      // Ignore if file doesn't exist
    });

    // Also delete metadata if exists
    const metaPath = `${filePath}.meta.json`;
    await fs.unlink(metaPath).catch(() => {
      // Ignore if metadata doesn't exist
    });
  }

  async exists(key: string): Promise<boolean> {
    const filePath = this.getFilePath(key);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async getSignedUrl(key: string, _expiresIn?: number): Promise<string> {
    // Local storage doesn't support signed URLs, return direct URL
    return `${this.baseUrl}/${key}`;
  }

  async getMetadata(key: string): Promise<StorageFile | null> {
    const filePath = this.getFilePath(key);
    try {
      const stats = await fs.stat(filePath);
      let metadata: Record<string, string> | undefined;

      const metaPath = `${filePath}.meta.json`;
      try {
        const metaContent = await fs.readFile(metaPath, "utf-8");
        metadata = JSON.parse(metaContent);
      } catch {
        // No metadata file
      }

      return {
        key,
        url: `${this.baseUrl}/${key}`,
        size: stats.size,
        contentType: "application/octet-stream",
        metadata,
      };
    } catch {
      return null;
    }
  }

  async list(prefix?: string): Promise<StorageFile[]> {
    const searchPath = prefix
      ? path.join(this.basePath, prefix)
      : this.basePath;

    try {
      const entries = await fs.readdir(searchPath, { withFileTypes: true });
      const files: StorageFile[] = [];

      for (const entry of entries) {
        if (entry.isFile() && !entry.name.endsWith(".meta.json")) {
          const key = prefix ? `${prefix}/${entry.name}` : entry.name;
          const metadata = await this.getMetadata(key);
          if (metadata) {
            files.push(metadata);
          }
        }
      }

      return files;
    } catch {
      return [];
    }
  }
}
