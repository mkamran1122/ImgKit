import { ToolMeta } from '../types';

export const TOOLS_LIST: ToolMeta[] = [
  {
    id: 'background-remover',
    name: 'Background Remover',
    tagline: 'Remove solid & simple backdrops',
    description: 'Eliminate solid backgrounds with color tolerance, manual eraser, and restore brush. Export transparent PNGs.',
    path: '/tools/background-remover',
    category: 'editing'
  },
  {
    id: 'background-changer',
    name: 'Background Changer',
    tagline: 'Swap colors, gradients or custom photos',
    description: 'Place your subject on fresh solid studio colors, artistic mesh gradients, or upload custom background scenery.',
    path: '/tools/background-changer',
    category: 'editing'
  },
  {
    id: 'product-photo-maker',
    name: 'Product Photo Maker',
    tagline: 'Marketplace-ready product shots',
    description: 'Transform product cutouts with clean studio backdrops, centering, realistic contact shadows, and marketplace canvas sizes.',
    path: '/tools/product-photo-maker',
    category: 'production'
  },
  {
    id: 'image-cropper',
    name: 'Image Cropper',
    tagline: 'Interactive free & aspect-ratio crop',
    description: 'Crop images with interactive handles, common aspect presets (1:1, 4:3, 16:9, 9:16), 90° rotation, and flips.',
    path: '/tools/image-cropper',
    category: 'editing'
  },
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    tagline: 'Pixel precision & dimension presets',
    description: 'Resize by custom pixel width/height with aspect lock, percentage scaling, or popular social media dimensions.',
    path: '/tools/image-resizer',
    category: 'editing'
  },
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    tagline: 'Reduce file size with visual quality control',
    description: 'Compress JPEG, WebP, and PNG files in real-time. See live original vs compressed size comparison before downloading.',
    path: '/tools/image-compressor',
    category: 'conversion'
  },
  {
    id: 'image-converter',
    name: 'Image Converter',
    tagline: 'Convert JPEG, PNG, and WebP',
    description: 'Convert between popular formats with alpha channel awareness, transparency warnings, and background fill options.',
    path: '/tools/image-converter',
    category: 'conversion'
  },
  {
    id: 'passport-photo-maker',
    name: 'Passport Photo Maker',
    tagline: 'Official biometric photo standards',
    description: 'Crop and position portraits to official US, UK, Schengen, and global passport specs. Arrange on a printable 4x6" cut sheet.',
    path: '/tools/passport-photo-maker',
    category: 'production'
  },
  {
    id: 'batch-editor',
    name: 'Batch Image Editor',
    tagline: 'Bulk resize, convert, and compress',
    description: 'Process dozens of images at once in your browser. Download individually or package all output into a single ZIP file.',
    path: '/tools/batch-editor',
    category: 'batch'
  }
];
