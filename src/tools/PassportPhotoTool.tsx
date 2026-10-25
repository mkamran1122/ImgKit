import React, { useState, useRef, useEffect } from 'react';
import { UserCheck, Grid, Printer, Download, Eye, RotateCw } from 'lucide-react';
import { WorkspaceLayout } from '../components/WorkspaceLayout';
import { loadImage, downloadCanvas, generatePassportSheet } from '../utils/canvasUtils';
import { SAMPLE_IMAGES, getSampleImageDataUrl } from '../utils/sampleImages';

interface PassportPhotoToolProps {
  navigate: (path: string) => void;
}

const PASSPORT_STANDARDS = [
  { name: 'United States', dimensions: '2 x 2 inches', widthPx: 600, heightPx: 600, grid4x6: { cols: 3, rows: 2 } },
  { name: 'UK / EU / Schengen', dimensions: '35 x 45 mm', widthPx: 413, heightPx: 531, grid4x6: { cols: 4, rows: 2 } },
  { name: 'India', dimensions: '35 x 45 mm', widthPx: 413, heightPx: 531, grid4x6: { cols: 4, rows: 2 } },
  { name: 'Canada', dimensions: '50 x 70 mm', widthPx: 590, heightPx: 826, grid4x6: { cols: 3, rows: 1 } },
  { name: 'China', dimensions: '33 x 48 mm', widthPx: 390, heightPx: 567, grid4x6: { cols: 4, rows: 2 } }
];

const PASSPORT_BG_COLORS = [
  { name: 'Pure White (US / EU standard)', hex: '#ffffff' },
  { name: 'Light Blue', hex: '#dbeafe' },
  { name: 'Off-White / Cream', hex: '#f8fafc' },
  { name: 'Light Gray', hex: '#e2e8f0' }
];

export const PassportPhotoTool: React.FC<PassportPhotoToolProps> = ({ navigate }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageName, setImageName] = useState('portrait.jpg');
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number }>();
  const [originalSize, setOriginalSize] = useState<number>(0);

  // Settings
  const [selectedStandardIdx, setSelectedStandardIdx] = useState<number>(0);
  const [selectedBgColor, setSelectedBgColor] = useState<string>('#ffffff');
  const [showBiometricGuide, setShowBiometricGuide] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'single' | 'sheet'>('single');
  const [sheetType, setSheetType] = useState<'4x6' | 'A4'>('4x6');

  // Portrait positioning
  const [portraitScale, setPortraitScale] = useState<number>(100);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);

  const rawImgRef = useRef<HTMLImageElement | null>(null);
  const singleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sheetCanvasRef = useRef<HTMLCanvasElement | null>(null);

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
    rawImgRef.current = img;
    setImageName(name);
    setOriginalSize(size);
    setOriginalDimensions({ width: img.width, height: img.height });
    setPortraitScale(100);
    setPanX(0);
    setPanY(0);
    setImageLoaded(true);
  };

  const currentStandard = PASSPORT_STANDARDS[selectedStandardIdx];

  // Render single passport photo canvas
  useEffect(() => {
    if (!imageLoaded || !rawImgRef.current) return;
    const img = rawImgRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = currentStandard.widthPx;
    canvas.height = currentStandard.heightPx;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Draw solid passport background
    ctx.fillStyle = selectedBgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw portrait with scale & pan
    const baseScale = Math.max(canvas.width / img.width, canvas.height / img.height);
    const finalScale = baseScale * (portraitScale / 100);
    const drawW = img.width * finalScale;
    const drawH = img.height * finalScale;
    const drawX = (canvas.width - drawW) / 2 + (panX * canvas.width) / 100;
    const drawY = (canvas.height - drawH) / 2 + (panY * canvas.height) / 100;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    singleCanvasRef.current = canvas;

    // 3. Render print sheet
    const sheet = generatePassportSheet(canvas, {
      sheetType,
      gridCols: sheetType === '4x6' ? currentStandard.grid4x6.cols : 4,
      gridRows: sheetType === '4x6' ? currentStandard.grid4x6.rows : 6,
      marginMm: 5,
      showCutLines: true
    });
    sheetCanvasRef.current = sheet;
  }, [imageLoaded, selectedStandardIdx, selectedBgColor, portraitScale, panX, panY, sheetType]);

  const handleDownload = () => {
    if (viewMode === 'single') {
      if (!singleCanvasRef.current) return;
      const outName = `${imageName.replace(/\.[^/.]+$/, '')}-passport-${currentStandard.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      downloadCanvas(singleCanvasRef.current, outName, 'image/png');
    } else {
      if (!sheetCanvasRef.current) return;
      const outName = `${imageName.replace(/\.[^/.]+$/, '')}-passport-sheet-${sheetType}.png`;
      downloadCanvas(sheetCanvasRef.current, outName, 'image/png');
    }
  };

  return (
    <WorkspaceLayout
      toolTitle="Passport Photo Maker"
      toolTagline="Biometric Compliance & Print Sheets"
      toolDescription="Position and crop portraits for official US, UK, Schengen, and global passport specs. Generate printable 4x6 inch cut sheets."
      imageLoaded={imageLoaded}
      imageName={imageName}
      originalDimensions={originalDimensions}
      originalSize={originalSize}
      processedDimensions={{ width: currentStandard.widthPx, height: currentStandard.heightPx }}
      onUpload={handleUpload}
      onLoadSample={handleSample}
      onDownload={handleDownload}
      downloadLabel={viewMode === 'single' ? 'Download Single Photo' : `Download ${sheetType} Print Sheet`}
      navigate={navigate}
      sampleType="portrait"
      sidebarControls={
        <div className="space-y-6 text-xs text-slate-700">
          {/* View Mode Toggle */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
              Display Mode
            </label>
            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('single')}
                className={`py-2 px-1 text-center font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  viewMode === 'single' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Single Photo</span>
              </button>
              <button
                onClick={() => setViewMode('sheet')}
                className={`py-2 px-1 text-center font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  viewMode === 'sheet' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Grid className="w-4 h-4" />
                <span>Print Sheet</span>
              </button>
            </div>
          </div>

          {/* Passport Country Specs */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
              Country / Standard
            </label>
            <div className="space-y-1.5">
              {PASSPORT_STANDARDS.map((std, idx) => (
                <button
                  key={std.name}
                  onClick={() => setSelectedStandardIdx(idx)}
                  className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left border transition-all ${
                    selectedStandardIdx === idx
                      ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-medium ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-medium text-slate-900">{std.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{std.dimensions}</div>
                  </div>
                  <span className="text-[10px] text-indigo-600 font-mono font-medium">
                    {std.widthPx}&times;{std.heightPx}px
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Background Color Picker */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-xs">
            <span className="font-semibold text-slate-800">Required Background</span>
            <div className="grid grid-cols-2 gap-2">
              {PASSPORT_BG_COLORS.map((bg) => (
                <button
                  key={bg.name}
                  onClick={() => setSelectedBgColor(bg.hex)}
                  className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all ${
                    selectedBgColor === bg.hex ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-medium' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full border border-slate-300 shrink-0"
                    style={{ backgroundColor: bg.hex }}
                  />
                  <span className="text-[11px] truncate">{bg.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Portrait Pan & Zoom */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">Portrait Alignment</span>
              <button
                onClick={() => setShowBiometricGuide(!showBiometricGuide)}
                className={`text-[11px] flex items-center gap-1 font-medium ${showBiometricGuide ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showBiometricGuide ? 'Guides On' : 'Guides Off'}</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-slate-600">Zoom / Scale</span>
                <span className="font-mono text-indigo-600">{portraitScale}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="180"
                value={portraitScale}
                onChange={(e) => setPortraitScale(Number(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-slate-600">Vertical Offset</span>
                <span className="font-mono text-indigo-600">{panY}%</span>
              </div>
              <input
                type="range"
                min="-40"
                max="40"
                value={panY}
                onChange={(e) => setPanY(Number(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-slate-600">Horizontal Offset</span>
                <span className="font-mono text-indigo-600">{panX}%</span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                value={panX}
                onChange={(e) => setPanX(Number(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Sheet Format */}
          {viewMode === 'sheet' && (
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-xs">
              <span className="font-semibold text-slate-800">Paper Sheet Size</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSheetType('4x6')}
                  className={`py-2 px-3 rounded-lg border text-center font-medium ${
                    sheetType === '4x6' ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  4 x 6 inches (Standard)
                </button>
                <button
                  onClick={() => setSheetType('A4')}
                  className={`py-2 px-3 rounded-lg border text-center font-medium ${
                    sheetType === 'A4' ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  A4 Document Paper
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Sheets include dashed trim cut-lines for clean scissor trimming after printing.
              </p>
            </div>
          )}
        </div>
      }
    >
      <div className="relative flex items-center justify-center">
        {viewMode === 'single' ? (
          <div className="relative">
            <canvas
              ref={(c) => {
                if (c && singleCanvasRef.current) {
                  c.width = singleCanvasRef.current.width;
                  c.height = singleCanvasRef.current.height;
                  const ctx = c.getContext('2d');
                  if (ctx) ctx.drawImage(singleCanvasRef.current, 0, 0);
                }
              }}
              className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
            />
            {/* Biometric Head/Chin Oval Overlay */}
            {showBiometricGuide && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[60%] h-[70%] border-2 border-indigo-400/80 rounded-[50%/60%] relative flex flex-col justify-between items-center py-2 shadow-xs">
                  <div className="w-full border-t border-dashed border-indigo-300/50 mt-[20%]" title="Eye level line" />
                  <div className="w-full border-t border-dashed border-indigo-300/50 mb-[15%]" title="Chin line" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <canvas
            ref={(c) => {
              if (c && sheetCanvasRef.current) {
                c.width = sheetCanvasRef.current.width;
                c.height = sheetCanvasRef.current.height;
                const ctx = c.getContext('2d');
                if (ctx) ctx.drawImage(sheetCanvasRef.current, 0, 0);
              }
            }}
            className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl bg-white"
          />
        )}
      </div>
    </WorkspaceLayout>
  );
};
