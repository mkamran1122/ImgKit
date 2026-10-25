import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Box, Sun, Download, Sliders } from 'lucide-react';
import { WorkspaceLayout } from '../components/WorkspaceLayout';
import { loadImage, downloadCanvas, generateProductPhoto } from '../utils/canvasUtils';
import { SAMPLE_IMAGES, getSampleImageDataUrl } from '../utils/sampleImages';

interface ProductPhotoToolProps {
  navigate: (path: string) => void;
}

const MARKETPLACE_PRESETS = [
  { name: 'Amazon (1:1 High-Res)', width: 2000, height: 2000, badge: 'Amazon Standard' },
  { name: 'Shopify Square', width: 1024, height: 1024, badge: 'Shopify' },
  { name: 'Etsy Showcase (4:3)', width: 2000, height: 1500, badge: 'Etsy' },
  { name: 'eBay Product', width: 1600, height: 1600, badge: 'eBay' },
  { name: 'Instagram Post (1:1)', width: 1080, height: 1080, badge: 'Instagram' },
  { name: 'Instagram Story (9:16)', width: 1080, height: 1920, badge: 'Story' }
];

export const ProductPhotoTool: React.FC<ProductPhotoToolProps> = ({ navigate }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageName, setImageName] = useState('product.png');
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number }>();
  const [originalSize, setOriginalSize] = useState<number>(0);

  // Settings
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(0);
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [paddingPercent, setPaddingPercent] = useState<number>(15);
  const [shadowBlur, setShadowBlur] = useState<number>(20);
  const [shadowOffsetY, setShadowOffsetY] = useState<number>(10);
  const [shadowOpacity, setShadowOpacity] = useState<number>(0.25);

  const productImgRef = useRef<HTMLImageElement | null>(null);
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
    await initImage(dataUrl, SAMPLE_IMAGES[key].name, 95000);
  };

  const initImage = async (src: string, name: string, size: number) => {
    const img = await loadImage(src);
    productImgRef.current = img;
    setImageName(name);
    setOriginalSize(size);
    setOriginalDimensions({ width: img.width, height: img.height });
    setImageLoaded(true);
  };

  // Re-generate canvas when settings change
  useEffect(() => {
    if (!imageLoaded || !productImgRef.current || !canvasRef.current) return;
    const preset = MARKETPLACE_PRESETS[selectedPresetIdx];
    const generated = generateProductPhoto(productImgRef.current, {
      targetWidth: preset.width,
      targetHeight: preset.height,
      paddingPercent,
      bgColor,
      shadowBlur,
      shadowOffsetY,
      shadowOpacity
    });

    const displayCanvas = canvasRef.current;
    displayCanvas.width = generated.width;
    displayCanvas.height = generated.height;
    const ctx = displayCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(generated, 0, 0);
    }
  }, [imageLoaded, selectedPresetIdx, bgColor, paddingPercent, shadowBlur, shadowOffsetY, shadowOpacity]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const preset = MARKETPLACE_PRESETS[selectedPresetIdx];
    const outName = `${imageName.replace(/\.[^/.]+$/, '')}-${preset.width}x${preset.height}.png`;
    downloadCanvas(canvasRef.current, outName, 'image/png');
  };

  const currentPreset = MARKETPLACE_PRESETS[selectedPresetIdx];

  return (
    <WorkspaceLayout
      toolTitle="Product Photo Maker"
      toolTagline="E-Commerce & Marketplace Studio"
      toolDescription="Generate compliant product photos for Amazon, Shopify, Etsy and eBay with centering, studio background, and soft contact shadows."
      imageLoaded={imageLoaded}
      imageName={imageName}
      originalDimensions={originalDimensions}
      originalSize={originalSize}
      processedDimensions={{ width: currentPreset.width, height: currentPreset.height }}
      onUpload={handleUpload}
      onLoadSample={handleSample}
      onDownload={handleDownload}
      downloadLabel={`Download ${currentPreset.width}x${currentPreset.height} PNG`}
      navigate={navigate}
      sidebarControls={
        <div className="space-y-6 text-xs">
          {/* Marketplace Presets */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
              Marketplace Canvas Presets
            </label>
            <div className="space-y-1.5">
              {MARKETPLACE_PRESETS.map((preset, idx) => (
                <button
                  key={preset.name}
                  onClick={() => setSelectedPresetIdx(idx)}
                  className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left border transition-all ${
                    selectedPresetIdx === idx
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-medium shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-900">{preset.name}</div>
                    <div className="font-mono text-[11px] text-slate-500">
                      {preset.width} &times; {preset.height} px
                    </div>
                  </div>
                  <span className="text-[10px] text-indigo-600 font-mono font-medium">
                    {preset.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Padding Slider */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex justify-between font-medium">
              <span className="text-slate-800">Padding &amp; Centering</span>
              <span className="font-mono text-indigo-600 font-semibold">{paddingPercent}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              value={paddingPercent}
              onChange={(e) => setPaddingPercent(Number(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Adds breathing room around the product for compliance with marketplace photo requirements.
            </p>
          </div>

          {/* Studio Background Color */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="font-semibold text-slate-800">Canvas Background</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBgColor('#ffffff')}
                className={`flex-1 py-1.5 rounded-lg border text-center font-medium ${
                  bgColor === '#ffffff' ? 'border-indigo-600 bg-white text-indigo-950 shadow-xs' : 'border-slate-200 bg-white/60 text-slate-600'
                }`}
              >
                Pure White
              </button>
              <button
                onClick={() => setBgColor('#f8fafc')}
                className={`flex-1 py-1.5 rounded-lg border text-center font-medium ${
                  bgColor === '#f8fafc' ? 'border-indigo-600 bg-white text-indigo-950 shadow-xs' : 'border-slate-200 bg-white/60 text-slate-600'
                }`}
              >
                Off-White
              </button>
              <button
                onClick={() => setBgColor('#0f172a')}
                className={`flex-1 py-1.5 rounded-lg border text-center font-medium ${
                  bgColor === '#0f172a' ? 'border-indigo-600 bg-white text-indigo-950 shadow-xs' : 'border-slate-200 bg-white/60 text-slate-600'
                }`}
              >
                Dark Slate
              </button>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-7 h-7 rounded-md bg-transparent cursor-pointer border border-slate-300"
              />
              <span className="font-mono text-slate-700 uppercase font-semibold">{bgColor}</span>
            </div>
          </div>

          {/* Contact Drop Shadow */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <span className="font-semibold text-slate-800">Contact Ground Shadow</span>

            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-slate-700">Shadow Opacity</span>
                <span className="font-mono text-indigo-600 font-semibold">{Math.round(shadowOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.05"
                value={shadowOpacity}
                onChange={(e) => setShadowOpacity(Number(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-slate-700">Shadow Blur</span>
                <span className="font-mono text-indigo-600 font-semibold">{shadowBlur}px</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                value={shadowBlur}
                onChange={(e) => setShadowBlur(Number(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
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
