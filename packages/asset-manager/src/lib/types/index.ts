export type FileCategory =
  | 'images'
  | 'fonts'
  | 'videos'
  | 'audio'
  | 'documents'
  | 'misc';

export type StorageKey = string;

export interface UploadIntent {
  uploadId: string;
  storageKey: StorageKey;
  presignedPath: string;
  expiresAt: number;
}

export interface UploadToken {
  uploadId: string;
  storageKey: StorageKey;
  mimeType: string;
  originalName: string;
  expiresAt: number;
}

export interface FileMetadata {
  storageKey: StorageKey;
  category: FileCategory;
  mimeType: string;
  originalName: string;
  sizeBytes: number;
  absolutePath: string;
}

export interface AdapterResult<T> {
  ok: true;
  data: T;
}

export interface AdapterError {
  ok: false;
  error: string;
  code: string;
}

export type AdapterOutcome<T> = AdapterResult<T> | AdapterError;

export interface ProxyTarget {
  absolutePath: string;
  mimeType: string;
  storageKey: StorageKey;
}
