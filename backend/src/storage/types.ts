export interface StorageFile {
  key: string;
  url: string;
  size: number;
  contentType: string;
  metadata?: Record<string, string>;
}

export interface UploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  isPublic?: boolean;
}

export interface StorageProvider {
  /**
   * Upload a file to storage
   */
  upload(
    key: string,
    data: Buffer | Blob | ReadableStream,
    options?: UploadOptions
  ): Promise<StorageFile>;

  /**
   * Download a file from storage
   */
  download(key: string): Promise<Buffer>;

  /**
   * Delete a file from storage
   */
  delete(key: string): Promise<void>;

  /**
   * Check if a file exists
   */
  exists(key: string): Promise<boolean>;

  /**
   * Get a signed URL for temporary access
   */
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;

  /**
   * Get file metadata
   */
  getMetadata(key: string): Promise<StorageFile | null>;

  /**
   * List files with prefix
   */
  list(prefix?: string): Promise<StorageFile[]>;
}
