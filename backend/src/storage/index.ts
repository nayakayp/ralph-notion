import { env } from "../utils/env";
import { LocalStorageProvider } from "./local";
import { S3StorageProvider } from "./s3";
import type { StorageProvider } from "./types";

export * from "./types";
export { LocalStorageProvider } from "./local";
export { S3StorageProvider } from "./s3";

let storageInstance: StorageProvider | null = null;

/**
 * Get the configured storage provider instance
 */
export function getStorage(): StorageProvider {
  if (storageInstance) {
    return storageInstance;
  }

  switch (env.STORAGE_PROVIDER) {
    case "s3":
      storageInstance = new S3StorageProvider();
      break;
    case "local":
    default:
      storageInstance = new LocalStorageProvider();
      break;
  }

  return storageInstance;
}

/**
 * Set a custom storage provider
 */
export function setStorage(provider: StorageProvider): void {
  storageInstance = provider;
}
