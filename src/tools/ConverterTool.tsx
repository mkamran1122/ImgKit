import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeftRight, AlertTriangle, Check, Sliders } from 'lucide-react';
import { WorkspaceLayout } from '../components/WorkspaceLayout';
import { loadImage, downloadCanvas, canvasToBlob, formatBytes } from '../utils/canvasUtils';
import { SAMPLE_IMAGES, getSampleImageDataUrl } from '../utils/sampleImages';

interface ConverterToolProps {
  navigate: (path: string) => void;
}

export const ConverterTool: React.FC<ConverterToolProps> = ({ navigate }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageName, setImageName] = useState('image.png');
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number }>();
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [detectedFormat, setDetectedFormat] = useState<string>('PNG');

  // Conversion settings
  const [targetFormat, setTargetFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [jpegFillColor, setJpegFillColor] = useState<string>('#ffffff');
  const [quality, setQuality] = useState<number>(90);
  const [hasTransparency, setHasTransparency] = useState<boolean>(false);
  const [convertedSize, setConvertedSize] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const rawImgRef = useRef<HTMLImageElement | null>(null);
  const convertedCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleUpload = (file: File) => {
    setImageName(file.name);
    setOriginalSize(file.size);
    if (file.type.includes('png')) setDetectedFormat('PNG');
    else if (file.type.includes('webp')) setDetectedFormat('WebP');
    else if (file.type.includes('jpeg') || file.type.includes('jpg')) setDetectedFormat('JPEG');
    else setDetectedFormat('IMAGE');

    const reader = new FileReader();
    reader.onload = async (e) => {
      const src = e.target?.result as string;
      await initImage(src, file.name, file.size);
    };
    reader.readAsDataURL(file);
  };

  const handleSample = async (key: keyof typeof SAMPLE_IMAGES) => {
    const dataUrl = getSampleImageDataUrl(key);
    await initImage(dataUrl, SAMPLE_IMAGES[key].name, 88000);
  };

  const initImage = async (src: string, name: string, size: number) => {
    const img = await loadImage(src);
    rawImgRef.current = img;
    setImageName(name);
    setOriginalSize(size);
    setOriginalDimensions({ width: img.width, height: img.height });

    // Check if image contains alpha transparency
    const testCanvas = document.createElement('canvas');
    testCanvas.width = img.width;
    testCanvas.height = img.height;
    const testCtx = testCanvas.getContext('2d');
    let alphaFound = false;
    if (testCtx) {
      testCtx.drawImage(img, 0, 0);
      const data = testCtx.getImageData(0, 0, Math.min(img.width, 200), Math.min(img.height, 200)).data;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 250) {
          alphaFound = true;
          break;
        }
      }
    }
    setHasTransparency(alphaFound);
    setImageLoaded(true);
  };

  // Re-generate converted canvas
  useEffect(() => {
    if (!imageLoaded || !rawImgRef.current) return;
    const img = rawImgRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (targetFormat === 'image/jpeg') {
      // JPEG requires a solid background color fill
      ctx.fillStyle = jpegFillColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(img, 0, 0);
    convertedCanvasRef.current = canvas;

    canvasToBlob(canvas, targetFormat, quality / 100).then((blob) => {
      setConvertedSize(blob.size);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(blob));
    });
  }, [imageLoaded, targetFormat, jpegFillColor, quality]);

  const handleDownload = () => {
    if (!convertedCanvasRef.current) return;
    const ext = targetFormat === 'image/jpeg' ? 'jpg' : targetFormat === 'image/webp' ? 'webp' : 'png';
    const outName = `${imageName.replace(/\.[^/.]+$/, '')}-converted.${ext}`;
    downloadCanvas(convertedCanvasRef.current, outName, targetFormat, quality / 100);
  };

  return (
    <WorkspaceLayout
      toolTitle="Image Converter"
      toolTagline="PNG, JPEG & WebP Transcoding"
      toolDescription="Convert between popular formats with transparency detection and background fill controls."
      imageLoaded={imageLoaded}
      imageName={imageName}
      originalDimensions={originalDimensions}
      originalSize={originalSize}
      processedDimensions={originalDimensions}
      processedSize={convertedSize}
      onUpload={handleUpload}
      onLoadSample={handleSample}
      onDownload={handleDownload}
      downloadLabel={`Download ${targetFormat === 'image/jpeg' ? 'JPEG' : targetFormat === 'image/webp' ? 'WebP' : 'PNG'}`}
      navigate={navigate}
      sidebarControls={
        <div className="space-y-6 text-xs">
          {/* Target Format */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
              Convert To Format
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setTargetFormat('image/png')}
                className={`py-2 px-1 text-center font-medium rounded-lg transition-colors flex flex-col items-center gap-1 ${
                  targetFormat === 'image/png' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="font-bold">PNG</span>
                <span className="text-[10px] text-slate-400">Lossless & Alpha</span>
              </button>
              <button
                onClick={() => setTargetFormat('image/jpeg')}
                className={`py-2 px-1 text-center font-medium rounded-lg transition-colors flex flex-col items-center gap-1 ${
                  targetFormat === 'image/jpeg' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="font-bold">JPEG</span>
                <span className="text-[10px] text-slate-400">Compact</span>
              </button>
              <button
                onClick={() => setTargetFormat('image/webp')}
                className={`py-2 px-1 text-center font-medium rounded-lg transition-colors flex flex-col items-center gap-1 ${
                  targetFormat === 'image/webp' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="font-bold">WebP</span>
                <span className="text-[10px] text-slate-400">Modern Web</span>
              </button>
            </div>
          </div>

          {/* Transparency Warning (per user prompt) */}
          {targetFormat === 'image/jpeg' && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
              <div className="flex items-start gap-2 text-amber-800">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-semibold text-amber-950">Notice:</span> The JPEG format does not support transparency. Any transparent areas in your photo will be filled with your selected solid background color.
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="text-slate-700 font-semibold text-[11px]">JPEG Background Fill</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setJpegFillColor('#ffffff')}
                    className={`flex-1 py-1 rounded-md border text-[11px] ${
                      jpegFillColor === '#ffffff' ? 'border-amber-500 bg-white text-slate-900 shadow-xs' : 'border-slate-200 bg-white/60 text-slate-600'
                    }`}
                  >
                    White
                  </button>
                  <button
                    onClick={() => setJpegFillColor('#000000')}
                    className={`flex-1 py-1 rounded-md border text-[11px] ${
                      jpegFillColor === '#000000' ? 'border-amber-500 bg-white text-slate-900 shadow-xs' : 'border-slate-200 bg-white/60 text-slate-600'
                    }`}
                  >
                    Black
                  </button>
                  <input
                    type="color"
                    value={jpegFillColor}
                    onChange={(e) => setJpegFillColor(e.target.value)}
                    className="w-7 h-7 rounded bg-transparent cursor-pointer border border-slate-300"
                    title="Custom color fill"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Quality slider for WebP and JPEG */}
          {targetFormat !== 'image/png' && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex justify-between font-medium">
                <span className="text-slate-800">Export Quality</span>
                <span className="font-mono text-indigo-600 font-semibold">{quality}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          )}

          {/* Conversion Details */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-semibold text-slate-800">Format Specs</span>
            <div className="space-y-1 text-slate-600 text-[11px]">
              <div className="flex justify-between">
                <span>Detected source:</span>
                <span className="text-slate-900 font-mono font-medium">{detectedFormat}</span>
              </div>
              <div className="flex justify-between">
                <span>Output size:</span>
                <span className="text-emerald-700 font-mono font-semibold">{formatBytes(convertedSize)}</span>
              </div>
              <div className="flex justify-between">
                <span>Alpha Transparency:</span>
                <span className={targetFormat !== 'image/jpeg' ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                  {targetFormat !== 'image/jpeg' ? 'Preserved' : 'Flattened to Fill'}
                </span>
              </div>
            </div>
          </div>
        </div>
      }
    >
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Converted preview"
          className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
        />
      )}
    </WorkspaceLayout>
  );
};
