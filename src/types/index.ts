export type ToolId = 
  | 'background-remover'
  | 'background-changer'
  | 'product-photo-maker'
  | 'image-cropper'
  | 'image-resizer'
  | 'image-compressor'
  | 'image-converter'
  | 'passport-photo-maker'
  | 'batch-editor';

export interface ToolMeta {
  id: ToolId;
  name: string;
  tagline: string;
  description: string;
  path: string;
  badge?: string;
  category: 'editing' | 'conversion' | 'production' | 'batch';
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ImageFileState {
  file?: File;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  width: number;
  height: number;
  aspectRatio: number;
}

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
