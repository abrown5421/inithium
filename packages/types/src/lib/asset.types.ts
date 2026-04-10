export type AssetCategory = 'image' | 'font' | 'audio' | 'document' | 'other';

export interface Asset {
  _id?: string;
  filename: string;
  original_name: string;
  mimetype: string;
  size: number;
  storage_key: string;
  category: AssetCategory;
  is_system_asset: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface AssetUploadIntent {
  original_name: string;
  mimetype: string;
  size: number;
  category: AssetCategory;
}

export interface AssetUploadResponse {
  asset_id: string;
  upload_url: string;
  storage_key: string;
}