import React, { useState, useRef, useEffect } from 'react';
import { Palette, Image as ImageIcon, Sparkles, Upload, RotateCcw } from 'lucide-react';
import { WorkspaceLayout } from '../components/WorkspaceLayout';
import { loadImage, downloadCanvas } from '../utils/canvasUtils';
import { SAMPLE_IMAGES, getSampleImageDataUrl } from '../utils/sampleImages';

interface BackgroundChangerToolProps {
  navigate: (path: string) => void;
}

const SOLID_PRESETS = [
  '#ffffff',
  '#f8fafc',
  '#0f172a',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4'
];

const GRADIENT_PRESETS = [
  { name: 'Studio Soft', stops: ['#f8fafc', '#e2e8f0'] },
  { name: 'Sunset Glow', stops: ['#f43f5e', '#fb923c'] },
  { name: 'Cyber Indigo', stops: ['#4f46e5', '#06b6d4'] },
  { name: 'Emerald Mint', stops: ['#059669', '#34d399'] },
  { name: 'Royal Dark', stops: ['#0f172a', '#312e81'] }
];

export const BackgroundChangerTool: React.FC<BackgroundChangerToolProps> = ({ navigate }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageName, setImageName] = useState('image.png');
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number }>();
  const [originalSize, setOriginalSize] = useState<number>(0);

  // Background state
  const [bgType, setBgType] = useState<'solid' | 'gradient' | 'image'>('solid');
  const [solidColor, setSolidColor] = useState<string>('#ffffff');
  const [selectedGradient, setSelectedGradient] = useState<number>(0);
  const [customBgImage, setCustomBgImage] = useState<HTMLImageElement | null>(null);
  
  // Foreground adjustments
  const [scalePercent, setScalePercent] = useState<number>(90);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [addShadow, setAddShadow] = useState<boolean>(true);

  const fgImageRef = useRef<HTMLImageElement | null>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);

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
    await initImage(dataUrl, SAMPLE_IMAGES[key].name, 90000);
  };

  const initImage = async (src: string, name: string, size: number) => {
    const img = await loadImage(src);
    fgImageRef.current = img;
    setImageName(name);
    setOriginalSize(size);
    setOriginalDimensions({ width: img.width, height: img.height });
    setImageLoaded(true);
  };

  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (event) => {
        const src = event.target?.result as string;
        const img = await loadImage(src);
        setCustomBgImage(img);
        setBgType('image');
      };
      reader.readAsDataURL(file);
    }
  };

  // Render combined composite to output canvas
  useEffect(() => {
    if (!imageLoaded || !fgImageRef.current || !outputCanvasRef.current) return;
    const fg = fgImageRef.current;
    const canvas = outputCanvasRef.current;
    canvas.width = fg.width;
    canvas.height = fg.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Draw Background
    if (bgType === 'solid') {
      ctx.fillStyle = solidColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (bgType === 'gradient') {
      const gradConfig = GRADIENT_PRESETS[selectedGradient];
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, gradConfig.stops[0]);
      grad.addColorStop(1, gradConfig.stops[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (bgType === 'image' && customBgImage) {
      // Draw background image cover-fit
      const bg = customBgImage;
      const hRatio = canvas.width / bg.width;
      const vRatio = canvas.height / bg.height;
      const ratio = Math.max(hRatio, vRatio);
      const bgW = bg.width * ratio;
      const bgH = bg.height * ratio;
      const bgX = (canvas.width - bgW) / 2;
      const bgY = (canvas.height - bgH) / 2;
      ctx.drawImage(bg, bgX, bgY, bgW, bgH);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 2. Draw Foreground Subject with scaling & optional shadow
    const scale = scalePercent / 100;
    const drawW = fg.width * scale;
    const drawH = fg.height * scale;
    const drawX = (canvas.width - drawW) / 2;
    const drawY = (canvas.height - drawH) / 2 + (offsetY * canvas.height) / 100;

    if (addShadow) {
      ctx.save();
      const shadowGrad = ctx.createRadialGradient(
        canvas.width / 2,
        drawY + drawH,
        5,
        canvas.width / 2,
        drawY + drawH,
        drawW * 0.4
      );
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.35)');
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(canvas.width / 2, drawY + drawH, drawW * 0.4, 25, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.drawImage(fg, drawX, drawY, drawW, drawH);
  }, [imageLoaded, bgType, solidColor, selectedGradient, customBgImage, scalePercent, offsetY, addShadow]);

  const handleDownload = () => {
    if (!outputCanvasRef.current) return;
    const outName = imageName.replace(/\.[^/.]+$/, '') + '-new-bg.png';
    downloadCanvas(outputCanvasRef.current, outName, 'image/png');
  };

  return (
    <WorkspaceLayout
      toolTitle="Background Changer"
      toolTagline="Solid Colors, Gradients & Custom Scenery"
      toolDescription="Change backgrounds to clean solid studio tones, modern gradients, or your own custom backdrop image."
      imageLoaded={imageLoaded}
      imageName={imageName}
      originalDimensions={originalDimensions}
      originalSize={originalSize}
      processedDimensions={originalDimensions}
      onUpload={handleUpload}
      onLoadSample={handleSample}
      onDownload={handleDownload}
      downloadLabel="Download New Photo"
      navigate={navigate}
      sidebarControls={
        <div className="space-y-6 text-xs">
          {/* Background Type selection */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
              Background Type
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setBgType('solid')}
                className={`py-2 px-1 text-center font-medium rounded-lg transition-colors flex flex-col items-center gap-1 ${
                  bgType === 'solid' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Palette className="w-4 h-4" />
                <span className="text-[10px]">Solid Color</span>
              </button>
              <button
                onClick={() => setBgType('gradient')}
                className={`py-2 px-1 text-center font-medium rounded-lg transition-colors flex flex-col items-center gap-1 ${
                  bgType === 'gradient' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px]">Gradients</span>
              </button>
              <button
                onClick={() => setBgType('image')}
                className={`py-2 px-1 text-center font-medium rounded-lg transition-colors flex flex-col items-center gap-1 ${
                  bgType === 'image' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span className="text-[10px]">Custom Image</span>
              </button>
            </div>
          </div>

          {/* Solid Color Options */}
          {bgType === 'solid' && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="font-semibold text-slate-800">Solid Color Palette</span>
              <div className="grid grid-cols-5 gap-2">
                {SOLID_PRESETS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSolidColor(color)}
                    style={{ backgroundColor: color }}
                    className={`h-8 rounded-lg border transition-all ${
                      solidColor === color ? 'border-indigo-600 ring-2 ring-indigo-500/30 scale-105' : 'border-slate-300'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                <input
                  type="color"
                  value={solidColor}
                  onChange={(e) => setSolidColor(e.target.value)}
                  className="w-8 h-8 rounded-md bg-transparent cursor-pointer border border-slate-300"
                />
                <span className="font-mono text-slate-700 uppercase font-semibold">{solidColor}</span>
              </div>
            </div>
          )}

          {/* Gradient Options */}
          {bgType === 'gradient' && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="font-semibold text-slate-800">Studio Gradients</span>
              <div className="space-y-2">
                {GRADIENT_PRESETS.map((g, idx) => (
                  <button
                    key={g.name}
                    onClick={() => setSelectedGradient(idx)}
                    className={`w-full p-2 rounded-lg flex items-center justify-between text-left border transition-all ${
                      selectedGradient === idx ? 'border-indigo-600 bg-white shadow-xs' : 'border-slate-200 bg-white/60 hover:bg-white'
                    }`}
                  >
                    <span className="font-medium text-slate-800">{g.name}</span>
                    <div
                      className="w-16 h-5 rounded-md border border-slate-300"
                      style={{ background: `linear-gradient(to right, ${g.stops[0]}, ${g.stops[1]})` }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Background Image */}
          {bgType === 'image' && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="font-semibold text-slate-800">Custom Backdrop Photo</span>
              <button
                onClick={() => bgFileInputRef.current?.click()}
                className="w-full py-3 px-4 border border-dashed border-slate-300 hover:border-indigo-500 rounded-xl bg-white text-center flex flex-col items-center gap-2 transition-colors shadow-xs"
              >
                <Upload className="w-5 h-5 text-indigo-600" />
                <span className="text-slate-700 font-medium">Choose Backdrop Image</span>
              </button>
              <input
                type="file"
                ref={bgFileInputRef}
                onChange={handleCustomBgUpload}
                accept="image/*"
                className="hidden"
              />
              {customBgImage && (
                <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  Backdrop loaded successfully!
                </p>
              )}
            </div>
          )}

          {/* Foreground Positioning & Shadow */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <span className="font-semibold text-slate-800">Foreground Alignment</span>

            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-slate-700">Subject Scale</span>
                <span className="font-mono text-indigo-600 font-semibold">{scalePercent}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="120"
                value={scalePercent}
                onChange={(e) => setScalePercent(Number(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-slate-700">Vertical Position</span>
                <span className="font-mono text-indigo-600 font-semibold">{offsetY}%</span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                value={offsetY}
                onChange={(e) => setOffsetY(Number(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer pt-2 border-t border-slate-200">
              <input
                type="checkbox"
                checked={addShadow}
                onChange={(e) => setAddShadow(e.target.checked)}
                className="rounded accent-indigo-600 text-indigo-600 focus:ring-0"
              />
              <span className="text-slate-700 font-medium">Add soft floor shadow</span>
            </label>
          </div>
        </div>
      }
    >
      <canvas
        ref={outputCanvasRef}
        className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-xl"
      />
    </WorkspaceLayout>
  );
};
