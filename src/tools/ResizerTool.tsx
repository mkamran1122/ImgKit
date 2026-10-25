import React, { useState, useRef, useEffect } from 'react';
import { Scaling, Lock, Unlock, Sliders, Check } from 'lucide-react';
import { WorkspaceLayout } from '../components/WorkspaceLayout';
import { loadImage, downloadCanvas } from '../utils/canvasUtils';
import { SAMPLE_IMAGES, getSampleImageDataUrl } from '../utils/sampleImages';

interface ResizerToolProps {
  navigate: (path: string) => void;
}

const COMMON_DIMENSIONS = [
  { label: 'Full HD (1080p)', width: 1920, height: 1080 },
  { label: '4K Ultra HD', width: 3840, height: 2160 },
  { label: 'YouTube Thumbnail', width: 1280, height: 720 },
  { label: 'Twitter/X Header', width: 1500, height: 500 },
  { label: 'Instagram Square', width: 1080, height: 1080 },
  { label: 'Email Web Banner', width: 600, height: 300 }
];

export const ResizerTool: React.FC<ResizerToolProps> = ({ navigate }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageName, setImageName] = useState('image.png');
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number }>();
  const [originalSize, setOriginalSize] = useState<number>(0);

  // Resize settings
  const [targetWidth, setTargetWidth] = useState<number>(1200);
  const [targetHeight, setTargetHeight] = useState<number>(800);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [scalePercent, setScalePercent] = useState<number>(100);

  const rawImgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleUpload = (file: File) => {
    setImageName(file.name);
    setOriginalSize(file.size);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const src = e.target?.result as string;
      await initImage(src, file.name, file.size);
    };
    reader.readAsDataURL(file);
  };

  const handleSample = async (key: keyof typeof SAMPLE_IMAGES) => {
    const dataUrl = getSampleImageDataUrl(key);
    await initImage(dataUrl, SAMPLE_IMAGES[key].name, 92000);
  };

  const initImage = async (src: string, name: string, size: number) => {
    const img = await loadImage(src);
    rawImgRef.current = img;
    setImageName(name);
    setOriginalSize(size);
    setOriginalDimensions({ width: img.width, height: img.height });
    setTargetWidth(img.width);
    setTargetHeight(img.height);
    setScalePercent(100);
    setImageLoaded(true);
  };

  const handleWidthChange = (val: number) => {
    setTargetWidth(val);
    if (lockAspect && originalDimensions) {
      const ratio = originalDimensions.height / originalDimensions.width;
      setTargetHeight(Math.round(val * ratio));
      setScalePercent(Math.round((val / originalDimensions.width) * 100));
    }
  };

  const handleHeightChange = (val: number) => {
    setTargetHeight(val);
    if (lockAspect && originalDimensions) {
      const ratio = originalDimensions.width / originalDimensions.height;
      setTargetWidth(Math.round(val * ratio));
      setScalePercent(Math.round((val / originalDimensions.height) * 100));
    }
  };

  const handlePercentChange = (pct: number) => {
    setScalePercent(pct);
    if (originalDimensions) {
      setTargetWidth(Math.round((originalDimensions.width * pct) / 100));
      setTargetHeight(Math.round((originalDimensions.height * pct) / 100));
    }
  };

  const applyPreset = (w: number, h: number) => {
    setTargetWidth(w);
    setTargetHeight(h);
    if (originalDimensions) {
      setScalePercent(Math.round((w / originalDimensions.width) * 100));
    }
  };

  // Re-draw resized canvas
  useEffect(() => {
    if (!imageLoaded || !rawImgRef.current || !canvasRef.current) return;
    const img = rawImgRef.current;
    const canvas = canvasRef.current;
    canvas.width = Math.max(1, targetWidth);
    canvas.height = Math.max(1, targetHeight);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }, [imageLoaded, targetWidth, targetHeight]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const outName = `${imageName.replace(/\.[^/.]+$/, '')}-resized-${targetWidth}x${targetHeight}.png`;
    downloadCanvas(canvasRef.current, outName, 'image/png');
  };

  return (
    <WorkspaceLayout
      toolTitle="Image Resizer"
      toolTagline="Pixel Dimensions & Aspect Lock"
      toolDescription="Resize images to exact pixel dimensions, percentage scales, or popular social and web dimensions."
      imageLoaded={imageLoaded}
      imageName={imageName}
      originalDimensions={originalDimensions}
      originalSize={originalSize}
      processedDimensions={{ width: targetWidth, height: targetHeight }}
      onUpload={handleUpload}
      onLoadSample={handleSample}
      onDownload={handleDownload}
      downloadLabel={`Download Resized (${targetWidth}x${targetHeight})`}
      navigate={navigate}
      sidebarControls={
        <div className="space-y-6 text-xs">
          {/* Custom Dimension Inputs */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">Pixel Dimensions</span>
              <button
                onClick={() => setLockAspect(!lockAspect)}
                className={`p-1.5 rounded-lg border flex items-center gap-1.5 text-[11px] font-medium transition-colors shadow-xs ${
                  lockAspect ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600'
                }`}
                title={lockAspect ? 'Aspect ratio locked' : 'Aspect ratio free'}
              >
                {lockAspect ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>{lockAspect ? 'Locked' : 'Unlocked'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-600 text-[11px] font-medium">Width (px)</label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={targetWidth}
                  onChange={(e) => handleWidthChange(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono tabular-nums focus:outline-none focus:border-indigo-600 shadow-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 text-[11px] font-medium">Height (px)</label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={targetHeight}
                  onChange={(e) => handleHeightChange(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono tabular-nums focus:outline-none focus:border-indigo-600 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Scale Percentage Presets */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex justify-between font-medium">
              <span className="text-slate-800">Scale Percentage</span>
              <span className="font-mono text-indigo-600 font-semibold">{scalePercent}%</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[25, 50, 75, 150, 200].map((pct) => (
                <button
                  key={pct}
                  onClick={() => handlePercentChange(pct)}
                  className={`py-1.5 rounded-lg border text-center font-mono text-[11px] transition-colors shadow-xs ${
                    scalePercent === pct
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Social & Web Presets */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
              Web &amp; Social Presets
            </label>
            <div className="space-y-1.5">
              {COMMON_DIMENSIONS.map((dim) => (
                <button
                  key={dim.label}
                  onClick={() => applyPreset(dim.width, dim.height)}
                  className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left border transition-all ${
                    targetWidth === dim.width && targetHeight === dim.height
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-medium shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-semibold text-slate-900">{dim.label}</span>
                  <span className="font-mono text-[11px] text-slate-500">
                    {dim.width} &times; {dim.height}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
      />
    </WorkspaceLayout>
  );
};
