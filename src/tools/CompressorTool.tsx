import React, { useState, useRef, useEffect } from 'react';
import { Gauge, ArrowDownRight, Layers, FileCheck } from 'lucide-react';
import { WorkspaceLayout } from '../components/WorkspaceLayout';
import { loadImage, downloadCanvas, canvasToBlob, formatBytes } from '../utils/canvasUtils';
import { SAMPLE_IMAGES, getSampleImageDataUrl } from '../utils/sampleImages';

interface CompressorToolProps {
  navigate: (path: string) => void;
}

export const CompressorTool: React.FC<CompressorToolProps> = ({ navigate }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageName, setImageName] = useState('image.jpg');
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number }>();
  const [originalSize, setOriginalSize] = useState<number>(0);

  // Compression settings
  const [quality, setQuality] = useState<number>(75);
  const [format, setFormat] = useState<'image/jpeg' | 'image/webp' | 'image/png'>('image/jpeg');
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  const rawImgRef = useRef<HTMLImageElement | null>(null);
  const workingCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleUpload = (file: File) => {
    setImageName(file.name);
    setOriginalSize(file.size);
    if (file.type === 'image/webp') setFormat('image/webp');
    else if (file.type === 'image/png') setFormat('image/png');
    else setFormat('image/jpeg');

    const reader = new FileReader();
    reader.onload = async (e) => {
      const src = e.target?.result as string;
      await initImage(src, file.name, file.size);
    };
    reader.readAsDataURL(file);
  };

  const handleSample = async (key: keyof typeof SAMPLE_IMAGES) => {
    const dataUrl = getSampleImageDataUrl(key);
    await initImage(dataUrl, SAMPLE_IMAGES[key].name, 280000);
  };

  const initImage = async (src: string, name: string, size: number) => {
    const img = await loadImage(src);
    rawImgRef.current = img;
    setImageName(name);
    setOriginalSize(size);
    setOriginalDimensions({ width: img.width, height: img.height });

    // Build canvas
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0);
    }
    workingCanvasRef.current = canvas;

    setImageLoaded(true);
  };

  // Re-compress image on slider / format change
  useEffect(() => {
    if (!imageLoaded || !workingCanvasRef.current) return;
    setIsCompressing(true);

    const canvas = workingCanvasRef.current;
    const q = quality / 100;

    canvasToBlob(canvas, format, q)
      .then((blob) => {
        setCompressedSize(blob.size);
        if (previewBlobUrl) {
          URL.revokeObjectURL(previewBlobUrl);
        }
        setPreviewBlobUrl(URL.createObjectURL(blob));
        setIsCompressing(false);
      })
      .catch((err) => {
        console.error(err);
        setIsCompressing(false);
      });
  }, [imageLoaded, quality, format]);

  const handleDownload = () => {
    if (!workingCanvasRef.current) return;
    const ext = format === 'image/webp' ? 'webp' : format === 'image/png' ? 'png' : 'jpg';
    const outName = `${imageName.replace(/\.[^/.]+$/, '')}-compressed.${ext}`;
    downloadCanvas(workingCanvasRef.current, outName, format, quality / 100);
  };

  const savingsBytes = originalSize - compressedSize;
  const savingsPercent = originalSize > 0 ? Math.round((savingsBytes / originalSize) * 100) : 0;

  return (
    <WorkspaceLayout
      toolTitle="Image Compressor"
      toolTagline="Local Quality Slider & File Size Reduction"
      toolDescription="Compress JPEG, WebP, and PNG images right in your browser with real-time file size estimation."
      imageLoaded={imageLoaded}
      imageName={imageName}
      originalDimensions={originalDimensions}
      originalSize={originalSize}
      processedDimensions={originalDimensions}
      processedSize={compressedSize}
      onUpload={handleUpload}
      onLoadSample={handleSample}
      onDownload={handleDownload}
      downloadLabel={`Download (${formatBytes(compressedSize)})`}
      navigate={navigate}
      sidebarControls={
        <div className="space-y-6 text-xs">
          {/* Target Format */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
              Output Format
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setFormat('image/jpeg')}
                className={`py-2 px-1 text-center font-medium rounded-lg transition-colors ${
                  format === 'image/jpeg' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                JPEG
              </button>
              <button
                onClick={() => setFormat('image/webp')}
                className={`py-2 px-1 text-center font-medium rounded-lg transition-colors ${
                  format === 'image/webp' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                WebP
              </button>
              <button
                onClick={() => setFormat('image/png')}
                className={`py-2 px-1 text-center font-medium rounded-lg transition-colors ${
                  format === 'image/png' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                PNG
              </button>
            </div>
          </div>

          {/* Quality Slider (for JPEG & WebP) */}
          {format !== 'image/png' ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex justify-between font-medium">
                <span className="text-slate-800">Compression Quality</span>
                <span className="font-mono text-indigo-600 font-semibold">{quality}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="95"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                <span>Smaller File</span>
                <span>Balanced (75%)</span>
                <span>Best Quality</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
              PNG uses lossless compression. For significant file size savings, switch to JPEG or modern WebP format.
            </div>
          )}

          {/* Real-Time Savings Card */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Size Comparison</span>
              </span>
              {savingsPercent > 0 && (
                <span className="font-mono text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                  -{savingsPercent}%
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="space-y-0.5">
                <p className="text-slate-500 font-medium">Original:</p>
                <p className="font-mono text-slate-900 text-sm font-semibold">{formatBytes(originalSize)}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-slate-500 font-medium">Compressed:</p>
                <p className="font-mono text-emerald-700 text-sm font-bold">
                  {formatBytes(compressedSize)}
                </p>
              </div>
            </div>

            {savingsBytes > 0 && (
              <p className="text-[11px] text-emerald-700 pt-1 border-t border-emerald-200/60 font-medium">
                You saved {formatBytes(savingsBytes)} of bandwidth!
              </p>
            )}
          </div>
        </div>
      }
    >
      {previewBlobUrl && (
        <img
          src={previewBlobUrl}
          alt="Compressed preview"
          className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
        />
      )}
    </WorkspaceLayout>
  );
};
