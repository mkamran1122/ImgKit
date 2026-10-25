import React, { useState, useRef, useEffect } from 'react';
import { Crop, RotateCw, FlipHorizontal, FlipVertical, Sliders, Check } from 'lucide-react';
import { WorkspaceLayout } from '../components/WorkspaceLayout';
import { loadImage, downloadCanvas } from '../utils/canvasUtils';
import { SAMPLE_IMAGES, getSampleImageDataUrl } from '../utils/sampleImages';
import { CropRect } from '../types';

interface CropperToolProps {
  navigate: (path: string) => void;
}

const ASPECT_PRESETS: { name: string; ratio: number | null }[] = [
  { name: 'Free Form', ratio: null },
  { name: 'Square 1:1', ratio: 1 },
  { name: 'Landscape 16:9', ratio: 16 / 9 },
  { name: 'Landscape 4:3', ratio: 4 / 3 },
  { name: 'Landscape 3:2', ratio: 3 / 2 },
  { name: 'Portrait 9:16', ratio: 9 / 16 },
  { name: 'Portrait 3:4', ratio: 3 / 4 },
  { name: 'Portrait 2:3', ratio: 2 / 3 }
];

export const CropperTool: React.FC<CropperToolProps> = ({ navigate }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageName, setImageName] = useState('image.png');
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number }>();
  const [originalSize, setOriginalSize] = useState<number>(0);

  // Crop & Transform state
  const [selectedAspectIdx, setSelectedAspectIdx] = useState<number>(0);
  const [rotationDeg, setRotationDeg] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, width: 100, height: 100 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragAction, setDragAction] = useState<'move' | 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w' | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; crop: CropRect }>({ x: 0, y: 0, crop: { x: 0, y: 0, width: 0, height: 0 } });

  const rawImgRef = useRef<HTMLImageElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const transformedCanvasRef = useRef<HTMLCanvasElement | null>(null);

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

    // Initial crop to 80% centered box
    const initW = Math.round(img.width * 0.8);
    const initH = Math.round(img.height * 0.8);
    setCrop({
      x: Math.round((img.width - initW) / 2),
      y: Math.round((img.height - initH) / 2),
      width: initW,
      height: initH
    });

    setRotationDeg(0);
    setFlipH(false);
    setFlipV(false);
    setImageLoaded(true);
  };

  // Re-generate transformed base canvas whenever rotation or flips change
  useEffect(() => {
    if (!imageLoaded || !rawImgRef.current) return;
    const img = rawImgRef.current;

    // Calculate dimensions based on 90 / 270 degree rotation
    const isQuarterTurn = rotationDeg === 90 || rotationDeg === 270;
    const tWidth = isQuarterTurn ? img.height : img.width;
    const tHeight = isQuarterTurn ? img.width : img.height;

    const tCanvas = document.createElement('canvas');
    tCanvas.width = tWidth;
    tCanvas.height = tHeight;
    const ctx = tCanvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.translate(tWidth / 2, tHeight / 2);
    ctx.rotate((rotationDeg * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();

    transformedCanvasRef.current = tCanvas;

    // Clamp or adjust crop to fit within new transformed bounds
    setCrop((prev) => {
      const w = Math.min(prev.width, tWidth);
      const h = Math.min(prev.height, tHeight);
      return {
        x: Math.max(0, Math.min(prev.x, tWidth - w)),
        y: Math.max(0, Math.min(prev.y, tHeight - h)),
        width: w,
        height: h
      };
    });
  }, [imageLoaded, rotationDeg, flipH, flipV]);

  // Adjust crop when aspect ratio preset changes
  useEffect(() => {
    const ratio = ASPECT_PRESETS[selectedAspectIdx].ratio;
    if (!ratio || !transformedCanvasRef.current) return;
    const tCanvas = transformedCanvasRef.current;

    setCrop((prev) => {
      let newW = prev.width;
      let newH = Math.round(newW / ratio);
      if (newH > tCanvas.height) {
        newH = tCanvas.height;
        newW = Math.round(newH * ratio);
      }
      return {
        x: Math.max(0, Math.min(prev.x, tCanvas.width - newW)),
        y: Math.max(0, Math.min(prev.y, tCanvas.height - newH)),
        width: Math.min(newW, tCanvas.width),
        height: Math.min(newH, tCanvas.height)
      };
    });
  }, [selectedAspectIdx]);

  // Render preview canvas with darkened overlay and crop handles
  useEffect(() => {
    if (!imageLoaded || !transformedCanvasRef.current || !previewCanvasRef.current) return;
    const tCanvas = transformedCanvasRef.current;
    const canvas = previewCanvasRef.current;
    canvas.width = tCanvas.width;
    canvas.height = tCanvas.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Draw transformed image
    ctx.drawImage(tCanvas, 0, 0);

    // 2. Draw dark scrim outside crop rectangle
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    // Top
    ctx.fillRect(0, 0, canvas.width, crop.y);
    // Bottom
    ctx.fillRect(0, crop.y + crop.height, canvas.width, canvas.height - (crop.y + crop.height));
    // Left
    ctx.fillRect(0, crop.y, crop.x, crop.height);
    // Right
    ctx.fillRect(crop.x + crop.width, crop.y, canvas.width - (crop.x + crop.width), crop.height);

    // 3. Draw crop border & rule of thirds grid
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(crop.x, crop.y, crop.width, crop.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    // Third lines
    ctx.beginPath();
    ctx.moveTo(crop.x + crop.width / 3, crop.y);
    ctx.lineTo(crop.x + crop.width / 3, crop.y + crop.height);
    ctx.moveTo(crop.x + (crop.width * 2) / 3, crop.y);
    ctx.lineTo(crop.x + (crop.width * 2) / 3, crop.y + crop.height);
    ctx.moveTo(crop.x, crop.y + crop.height / 3);
    ctx.lineTo(crop.x + crop.width, crop.y + crop.height / 3);
    ctx.moveTo(crop.x, crop.y + (crop.height * 2) / 3);
    ctx.lineTo(crop.x + crop.width, crop.y + (crop.height * 2) / 3);
    ctx.stroke();

    // 4. Draw corner handles
    const handleSize = Math.max(12, Math.round(canvas.width / 80));
    ctx.fillStyle = '#6366f1';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

    const corners = [
      { x: crop.x, y: crop.y },
      { x: crop.x + crop.width, y: crop.y },
      { x: crop.x + crop.width, y: crop.y + crop.height },
      { x: crop.x, y: crop.y + crop.height }
    ];

    corners.forEach((c) => {
      ctx.beginPath();
      ctx.rect(c.x - handleSize / 2, c.y - handleSize / 2, handleSize, handleSize);
      ctx.fill();
      ctx.stroke();
    });

    ctx.restore();
  }, [imageLoaded, crop]);

  // Mouse drag handling for crop rect
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageLoaded) return;
    const { x, y } = getCanvasCoords(e);
    const handleRadius = Math.max(20, Math.round((previewCanvasRef.current?.width || 1000) / 40));

    // Check corners
    if (Math.abs(x - crop.x) < handleRadius && Math.abs(y - crop.y) < handleRadius) {
      setDragAction('nw');
    } else if (Math.abs(x - (crop.x + crop.width)) < handleRadius && Math.abs(y - crop.y) < handleRadius) {
      setDragAction('ne');
    } else if (Math.abs(x - (crop.x + crop.width)) < handleRadius && Math.abs(y - (crop.y + crop.height)) < handleRadius) {
      setDragAction('se');
    } else if (Math.abs(x - crop.x) < handleRadius && Math.abs(y - (crop.y + crop.height)) < handleRadius) {
      setDragAction('sw');
    } else if (x >= crop.x && x <= crop.x + crop.width && y >= crop.y && y <= crop.y + crop.height) {
      setDragAction('move');
    } else {
      // Start new crop box from click
      setCrop({ x: Math.round(x), y: Math.round(y), width: 10, height: 10 });
      setDragAction('se');
    }

    setIsDragging(true);
    setDragStart({ x, y, crop: { ...crop } });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragAction || !transformedCanvasRef.current) return;
    const { x, y } = getCanvasCoords(e);
    const dx = x - dragStart.x;
    const dy = y - dragStart.y;
    const tW = transformedCanvasRef.current.width;
    const tH = transformedCanvasRef.current.height;
    const ratio = ASPECT_PRESETS[selectedAspectIdx].ratio;

    if (dragAction === 'move') {
      const newX = Math.max(0, Math.min(dragStart.crop.x + dx, tW - dragStart.crop.width));
      const newY = Math.max(0, Math.min(dragStart.crop.y + dy, tH - dragStart.crop.height));
      setCrop((prev) => ({ ...prev, x: Math.round(newX), y: Math.round(newY) }));
    } else if (dragAction === 'se') {
      let newW = Math.max(40, Math.min(dragStart.crop.width + dx, tW - dragStart.crop.x));
      let newH = ratio ? Math.round(newW / ratio) : Math.max(40, Math.min(dragStart.crop.height + dy, tH - dragStart.crop.y));
      if (ratio && dragStart.crop.y + newH > tH) {
        newH = tH - dragStart.crop.y;
        newW = Math.round(newH * ratio);
      }
      setCrop((prev) => ({ ...prev, width: Math.round(newW), height: Math.round(newH) }));
    } else if (dragAction === 'nw') {
      const newX = Math.max(0, Math.min(dragStart.crop.x + dx, dragStart.crop.x + dragStart.crop.width - 40));
      const newY = Math.max(0, Math.min(dragStart.crop.y + dy, dragStart.crop.y + dragStart.crop.height - 40));
      const newW = dragStart.crop.width - (newX - dragStart.crop.x);
      const newH = ratio ? Math.round(newW / ratio) : dragStart.crop.height - (newY - dragStart.crop.y);
      setCrop({ x: Math.round(newX), y: Math.round(newY), width: Math.round(newW), height: Math.round(newH) });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragAction(null);
  };

  const rotate90 = () => {
    setRotationDeg((prev) => (prev + 90) % 360);
  };

  const handleDownload = () => {
    if (!transformedCanvasRef.current) return;
    const tCanvas = transformedCanvasRef.current;
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = crop.width;
    cropCanvas.height = crop.height;
    const ctx = cropCanvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(tCanvas, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
    const outName = `${imageName.replace(/\.[^/.]+$/, '')}-cropped-${crop.width}x${crop.height}.png`;
    downloadCanvas(cropCanvas, outName, 'image/png');
  };

  return (
    <WorkspaceLayout
      toolTitle="Image Cropper"
      toolTagline="Free & Aspect Ratio Presets"
      toolDescription="Crop photographs interactively with handles, common aspect ratios (1:1, 16:9, 4:3, 9:16), 90-degree rotations, and mirror flips."
      imageLoaded={imageLoaded}
      imageName={imageName}
      originalDimensions={originalDimensions}
      originalSize={originalSize}
      processedDimensions={{ width: crop.width, height: crop.height }}
      onUpload={handleUpload}
      onLoadSample={handleSample}
      onDownload={handleDownload}
      downloadLabel={`Download Crop (${crop.width}x${crop.height})`}
      navigate={navigate}
      sidebarControls={
        <div className="space-y-6 text-xs">
          {/* Aspect Presets */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
              Aspect Ratio Presets
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {ASPECT_PRESETS.map((preset, idx) => (
                <button
                  key={preset.name}
                  onClick={() => setSelectedAspectIdx(idx)}
                  className={`py-2 px-2.5 rounded-lg text-left border transition-all ${
                    selectedAspectIdx === idx
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Transformation Tools */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="font-semibold text-slate-800">Orientation &amp; Flips</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={rotate90}
                className="py-2 px-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 transition-colors flex flex-col items-center gap-1 shadow-xs"
              >
                <RotateCw className="w-4 h-4 text-indigo-600" />
                <span className="text-[10px]">Rotate 90&deg;</span>
              </button>
              <button
                onClick={() => setFlipH(!flipH)}
                className={`py-2 px-2 rounded-lg border transition-colors flex flex-col items-center gap-1 shadow-xs ${
                  flipH ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-medium' : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <FlipHorizontal className="w-4 h-4 text-indigo-600" />
                <span className="text-[10px]">Flip H</span>
              </button>
              <button
                onClick={() => setFlipV(!flipV)}
                className={`py-2 px-2 rounded-lg border transition-colors flex flex-col items-center gap-1 shadow-xs ${
                  flipV ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-medium' : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <FlipVertical className="w-4 h-4 text-indigo-600" />
                <span className="text-[10px]">Flip V</span>
              </button>
            </div>
          </div>

          {/* Current Crop Dimensions Display */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-semibold text-slate-800">Selected Crop Area</span>
            <div className="grid grid-cols-2 gap-2 text-slate-600 font-mono text-[11px]">
              <div>Width: <span className="text-slate-900 font-semibold">{crop.width}px</span></div>
              <div>Height: <span className="text-slate-900 font-semibold">{crop.height}px</span></div>
              <div>X: <span className="text-slate-900 font-semibold">{crop.x}px</span></div>
              <div>Y: <span className="text-slate-900 font-semibold">{crop.y}px</span></div>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              Drag corners to resize or drag inside the box to reposition.
            </p>
          </div>
        </div>
      }
    >
      <canvas
        ref={previewCanvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="max-w-full max-h-[70vh] object-contain rounded-lg cursor-crosshair shadow-2xl"
      />
    </WorkspaceLayout>
  );
};
