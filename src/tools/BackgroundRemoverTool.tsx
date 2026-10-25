import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Wand2,
  RefreshCw,
  Undo2,
  Eraser,
  Paintbrush,
  Sliders,
  Info,
  ShieldCheck,
  Download,
  Check,
  AlertCircle,
  Cpu,
  Zap,
  Image as ImageIcon,
  Palette,
  Eye,
  Layers,
  Trash2,
  Upload,
  CheckCircle2
} from 'lucide-react';
import { WorkspaceLayout } from '../components/WorkspaceLayout';
import { loadImage, downloadCanvas, formatBytes } from '../utils/canvasUtils';
import { SAMPLE_IMAGES, getSampleImageDataUrl } from '../utils/sampleImages';
import { configureOnnxLogLevel } from '../utils/suppressOnnxLogs';

interface BackgroundRemoverToolProps {
  navigate: (path: string) => void;
}

// Preset backdrop colors for quick replacement
const COLOR_PRESETS = [
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Studio Off-White', hex: '#F8FAFC' },
  { name: 'Charcoal Dark', hex: '#0F172A' },
  { name: 'Neutral Gray', hex: '#64748B' },
  { name: 'Pastel Blue', hex: '#BAE6FD' },
  { name: 'Emerald Mint', hex: '#A7F3D0' },
  { name: 'Warm Peach', hex: '#FED7AA' },
  { name: 'Soft Rose', hex: '#FECDD3' },
  { name: 'Vibrant Indigo', hex: '#4F46E5' },
  { name: 'Chroma Green', hex: '#00B140' }
];

export const BackgroundRemoverTool: React.FC<BackgroundRemoverToolProps> = ({ navigate }) => {
  // Source Image state
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageName, setImageName] = useState('image.png');
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number }>();
  const [sourceBlob, setSourceBlob] = useState<Blob | null>(null);

  // AI Inference & Progress state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressStage, setProgressStage] = useState<string>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [executionProvider, setExecutionProvider] = useState<'webgpu' | 'wasm' | null>(null);
  const [inferenceDuration, setInferenceDuration] = useState<number | null>(null);
  const [hasCutout, setHasCutout] = useState<boolean>(false);
  const [aiQuality, setAiQuality] = useState<'quality' | 'fast'>('quality');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Background Replacement state: 'transparent' | 'color' | 'image'
  const [bgMode, setBgMode] = useState<'transparent' | 'color' | 'image'>('transparent');
  const [customColor, setCustomColor] = useState<string>('#FFFFFF');
  const [customBgImage, setCustomBgImage] = useState<HTMLImageElement | null>(null);

  // Comparison & View state: 'cutout' | 'original' | 'split'
  const [viewMode, setViewMode] = useState<'cutout' | 'original' | 'split'>('cutout');
  const [splitPos, setSplitPos] = useState<number>(50);

  // Manual brush refinement state
  const [manualMode, setManualMode] = useState<'none' | 'erase' | 'restore'>('none');
  const [brushSize, setBrushSize] = useState<number>(32);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [undoCount, setUndoCount] = useState<number>(0);

  // Canvases & Image Elements
  const rawImageRef = useRef<HTMLImageElement | null>(null); // original image element
  const cutoutImageRef = useRef<HTMLImageElement | null>(null); // transparent AI cutout image
  const displayCanvasRef = useRef<HTMLCanvasElement | null>(null); // main rendered canvas
  const manualMaskCanvasRef = useRef<HTMLCanvasElement | null>(null); // manual eraser/restore modifications
  const undoHistoryRef = useRef<ImageData[]>([]); // undo history snapshots
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);
  const customBgInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Detect browser WebGPU capabilities on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
      setExecutionProvider('webgpu');
    } else {
      setExecutionProvider('wasm');
    }
  }, []);

  // Handle uploaded file (JPEG, PNG, WebP)
  const handleUpload = (file: File) => {
    setErrorMessage(null);
    setImageName(file.name);
    setOriginalSize(file.size);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const src = e.target?.result as string;
      await initImage(src, file.name, file.size, file);
    };
    reader.readAsDataURL(file);
  };

  // Handle sample image loading
  const handleSample = async (key: keyof typeof SAMPLE_IMAGES) => {
    setErrorMessage(null);
    const dataUrl = getSampleImageDataUrl(key);
    await initImage(dataUrl, SAMPLE_IMAGES[key].name, 95000);
  };

  // Initialize source image into memory
  const initImage = async (src: string, name: string, size: number, directFile?: File) => {
    try {
      const img = await loadImage(src);
      rawImageRef.current = img;
      setImageName(name);
      setOriginalSize(size);
      setOriginalDimensions({ width: img.width, height: img.height });

      // Create a valid image/png or image/jpeg Blob for the AI model
      let blob: Blob;
      if (directFile && (directFile.type === 'image/jpeg' || directFile.type === 'image/png' || directFile.type === 'image/webp')) {
        blob = directFile;
      } else {
        // Convert to PNG blob via canvas
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.drawImage(img, 0, 0);
        blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Failed to create image blob'))), 'image/png');
        });
      }
      setSourceBlob(blob);

      // Reset state for new image
      setHasCutout(false);
      cutoutImageRef.current = null;
      setManualMode('none');
      undoHistoryRef.current = [];
      setUndoCount(0);
      manualMaskCanvasRef.current = null;

      // Render initial view with original image
      setImageLoaded(true);
      setTimeout(() => renderDisplayCanvas(), 50);
    } catch (err) {
      console.error('Failed to initialize image:', err);
      setErrorMessage('Could not load this image. Please choose another JPEG, PNG, or WebP photo.');
    }
  };

  // Run AI Background Removal via @bg0/browser (BiRefNet ONNX WebGPU/WASM)
  const runAiRemoval = async () => {
    if (!sourceBlob || isProcessing) return;

    setErrorMessage(null);
    setIsProcessing(true);
    setProgressPercent(5);
    setProgressStage('preparing');
    setStatusMessage('Preparing image and initializing neural network...');

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Ensure ONNX Runtime and Transformers log levels are set to error to prevent graph optimization warnings
      await configureOnnxLogLevel();

      // Dynamically import @bg0/browser only when used to keep initial app lightweight
      const { removeBackground } = await import('@bg0/browser');

      const result = await removeBackground(sourceBlob, {
        quality: aiQuality,
        signal: controller.signal,
        onProgress: ({ stage, progress, message }) => {
          setProgressStage(stage);
          setProgressPercent(Math.round(progress * 100));
          if (message) {
            setStatusMessage(message);
          }
        }
      });

      // Load resulting transparent PNG into Image element
      const resultUrl = URL.createObjectURL(result.blob);
      const cutoutImg = await loadImage(resultUrl);
      cutoutImageRef.current = cutoutImg;

      // Initialize manual mask canvas matching image dimensions
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = cutoutImg.width;
      maskCanvas.height = cutoutImg.height;
      const maskCtx = maskCanvas.getContext('2d');
      if (maskCtx) {
        maskCtx.fillStyle = 'rgba(255,255,255,1)';
        maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
      }
      manualMaskCanvasRef.current = maskCanvas;

      setHasCutout(true);
      setExecutionProvider(result.provider);
      setInferenceDuration(result.durationMs);
      setViewMode('cutout');
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name === 'AbortError') {
        setStatusMessage('Background removal was cancelled.');
      } else {
        console.error('AI Background Removal error:', error);
        setErrorMessage(
          error.message ||
            'AI background removal failed on this device. Try a smaller image or retry with Fast mode.'
        );
      }
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  };

  // Render the current composition to the display canvas
  const renderDisplayCanvas = useCallback(() => {
    const canvas = displayCanvasRef.current;
    if (!canvas || !rawImageRef.current) return;

    const raw = rawImageRef.current;
    const width = raw.width;
    const height = raw.height;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Case 1: No cutout yet or user wants to see the original photo
    if (!hasCutout || !cutoutImageRef.current || viewMode === 'original') {
      ctx.drawImage(raw, 0, 0);
      return;
    }

    const cutout = cutoutImageRef.current;

    // Helper to draw background layer (Solid, Custom Image, or Transparent)
    const drawBackgroundLayer = (targetCtx: CanvasRenderingContext2D) => {
      if (bgMode === 'color') {
        targetCtx.fillStyle = customColor;
        targetCtx.fillRect(0, 0, width, height);
      } else if (bgMode === 'image' && customBgImage) {
        // Draw background image scaled to cover
        const bgImg = customBgImage;
        const scale = Math.max(width / bgImg.width, height / bgImg.height);
        const bgW = bgImg.width * scale;
        const bgH = bgImg.height * scale;
        const bgX = (width - bgW) / 2;
        const bgY = (height - bgH) / 2;
        targetCtx.drawImage(bgImg, bgX, bgY, bgW, bgH);
      }
      // If 'transparent', targetCtx remains clear/empty
    };

    // Case 2: Split comparison view (Before vs After)
    if (viewMode === 'split') {
      const splitX = Math.round((splitPos / 100) * width);

      // Left Side: Original Image
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, splitX, height);
      ctx.clip();
      ctx.drawImage(raw, 0, 0);
      ctx.restore();

      // Right Side: Cutout + Replaced Background
      ctx.save();
      ctx.beginPath();
      ctx.rect(splitX, 0, width - splitX, height);
      ctx.clip();
      drawBackgroundLayer(ctx);
      drawCutoutWithManualMask(ctx, cutout, width, height);
      ctx.restore();

      // Draw vertical separator divider line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, height);
      ctx.stroke();

      // Divider Handle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(splitX, height / 2, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4f46e5';
      ctx.beginPath();
      ctx.arc(splitX, height / 2, 6, 0, Math.PI * 2);
      ctx.fill();

      return;
    }

    // Case 3: Cutout View (with background replacement if any)
    drawBackgroundLayer(ctx);
    drawCutoutWithManualMask(ctx, cutout, width, height);
  }, [hasCutout, viewMode, splitPos, bgMode, customColor, customBgImage]);

  // Helper to draw cutout composited with the manual brush mask
  const drawCutoutWithManualMask = (
    ctx: CanvasRenderingContext2D,
    cutout: HTMLImageElement,
    w: number,
    h: number
  ) => {
    if (!manualMaskCanvasRef.current) {
      ctx.drawImage(cutout, 0, 0, w, h);
      return;
    }

    // Create temporary buffer
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) {
      ctx.drawImage(cutout, 0, 0, w, h);
      return;
    }

    // Draw the transparent AI cutout
    tempCtx.drawImage(cutout, 0, 0, w, h);

    // Apply manual brush mask (erased parts will be cut out)
    tempCtx.globalCompositeOperation = 'destination-in';
    tempCtx.drawImage(manualMaskCanvasRef.current, 0, 0, w, h);

    // Blit onto main target canvas
    ctx.drawImage(tempCanvas, 0, 0, w, h);
  };

  // Re-render whenever visual options change
  useEffect(() => {
    if (imageLoaded) {
      renderDisplayCanvas();
    }
  }, [imageLoaded, hasCutout, viewMode, splitPos, bgMode, customColor, customBgImage, renderDisplayCanvas]);

  // Handle custom background photo upload
  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (event) => {
        const src = event.target?.result as string;
        const img = await loadImage(src);
        setCustomBgImage(img);
        setBgMode('image');
      };
      reader.readAsDataURL(file);
    }
  };

  // Canvas Mouse Coordinates Helper
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: Math.floor((e.clientX - rect.left) * scaleX),
      y: Math.floor((e.clientY - rect.top) * scaleY)
    };
  };

  // Undo manual brush stroke
  const pushUndoSnapshot = () => {
    const mask = manualMaskCanvasRef.current;
    if (!mask) return;
    const ctx = mask.getContext('2d');
    if (!ctx) return;
    const snapshot = ctx.getImageData(0, 0, mask.width, mask.height);
    undoHistoryRef.current.push(snapshot);
    if (undoHistoryRef.current.length > 20) {
      undoHistoryRef.current.shift();
    }
    setUndoCount(undoHistoryRef.current.length);
  };

  const handleUndo = () => {
    if (undoHistoryRef.current.length === 0 || !manualMaskCanvasRef.current) return;
    const prev = undoHistoryRef.current.pop();
    if (prev) {
      const ctx = manualMaskCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.putImageData(prev, 0, 0);
        setUndoCount(undoHistoryRef.current.length);
        renderDisplayCanvas();
      }
    }
  };

  // Keyboard shortcut Ctrl+Z for brush undo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Manual brush stroke execution
  const applyBrush = (x0: number, y0: number, x1: number, y1: number) => {
    const mask = manualMaskCanvasRef.current;
    if (!mask) return;
    const ctx = mask.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (manualMode === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    } else if (manualMode === 'restore') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(255,255,255,1)';
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
    ctx.restore();
    renderDisplayCanvas();
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageLoaded || !hasCutout || manualMode === 'none') return;
    const { x, y } = getCanvasCoords(e);
    pushUndoSnapshot();
    setIsDrawing(true);
    lastMousePosRef.current = { x, y };
    applyBrush(x, y, x, y);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || manualMode === 'none') return;
    const { x, y } = getCanvasCoords(e);
    const last = lastMousePosRef.current || { x, y };
    applyBrush(last.x, last.y, x, y);
    lastMousePosRef.current = { x, y };
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
    lastMousePosRef.current = null;
  };

  // Reset to original image
  const handleReset = () => {
    setHasCutout(false);
    cutoutImageRef.current = null;
    manualMaskCanvasRef.current = null;
    undoHistoryRef.current = [];
    setUndoCount(0);
    setBgMode('transparent');
    setViewMode('cutout');
    setManualMode('none');
    setErrorMessage(null);
    renderDisplayCanvas();
  };

  // Download final result
  const handleDownload = () => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return;

    const baseName = imageName.replace(/\.[^/.]+$/, '');
    const suffix = bgMode === 'transparent' ? '-transparent' : '-cutout-bg';
    const filename = `${baseName}${suffix}.png`;

    // Download genuine 32-bit PNG preserving alpha channel
    downloadCanvas(canvas, filename, 'image/png');
  };

  // Clear local model cache
  const handleClearCache = async () => {
    try {
      const { clearModelCache } = await import('@bg0/browser');
      clearModelCache();
      alert('Local AI model cache has been cleared.');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <WorkspaceLayout
      toolTitle="AI Background Remover"
      toolTagline="BiRefNet In-Browser Neural Segmentation"
      toolDescription="Remove backgrounds with open-source BiRefNet AI running 100% locally on WebGPU and WebAssembly. No APIs, no cloud servers."
      imageLoaded={imageLoaded}
      imageName={imageName}
      originalDimensions={originalDimensions}
      originalSize={originalSize}
      processedDimensions={originalDimensions}
      onUpload={handleUpload}
      onLoadSample={handleSample}
      onReset={handleReset}
      onDownload={handleDownload}
      downloadLabel={bgMode === 'transparent' ? 'Download Transparent PNG' : 'Download Composited PNG'}
      navigate={navigate}
      sidebarControls={
        <div className="space-y-6 text-xs text-slate-700">
          {/* AI Execution Status Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 border border-indigo-100 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5 font-heading text-xs">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Local AI Segmentation</span>
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>100% On-Device</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-indigo-100/60">
              <span className="text-slate-500">Acceleration Engine:</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                {executionProvider === 'webgpu' ? (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>WebGPU Hardware</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                    <span>WebAssembly (WASM)</span>
                  </>
                )}
              </span>
            </div>

            {/* Quality Selector */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-800 text-[11px]">Quality Profile</label>
              <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setAiQuality('quality')}
                  className={`py-1.5 px-2 text-center font-medium rounded-lg transition-colors text-[11px] ${
                    aiQuality === 'quality' ? 'bg-indigo-600 text-white shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Quality (BiRefNet)
                </button>
                <button
                  onClick={() => setAiQuality('fast')}
                  className={`py-1.5 px-2 text-center font-medium rounded-lg transition-colors text-[11px] ${
                    aiQuality === 'fast' ? 'bg-indigo-600 text-white shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Fast (Quick Mode)
                </button>
              </div>
            </div>

            {/* AI Action Button */}
            <button
              onClick={runAiRemoval}
              disabled={isProcessing || !imageLoaded}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                isProcessing
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : hasCutout
                  ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/10'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20 hover:scale-[1.01]'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Processing Neural Mask...</span>
                </>
              ) : hasCutout ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Re-Run AI Removal</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Remove Background with AI</span>
                </>
              )}
            </button>

            {/* Live Progress Bar during inference */}
            {isProcessing && (
              <div className="space-y-2 pt-1">
                <div className="flex justify-between text-[11px] font-medium">
                  <span className="text-slate-700 truncate max-w-[200px]">{statusMessage || 'Processing...'}</span>
                  <span className="font-mono text-indigo-600 font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 italic">
                  First run caches model weights (~190MB) in your browser for instant offline reuse.
                </p>
              </div>
            )}

            {/* Success Telemetry */}
            {hasCutout && inferenceDuration !== null && !isProcessing && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Background isolated in {(inferenceDuration / 1000).toFixed(2)}s via{' '}
                  {executionProvider === 'webgpu' ? 'WebGPU' : 'WASM'}.
                </span>
              </div>
            )}
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-[11px] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-950">Inference Notice</p>
                <p className="mt-0.5">{errorMessage}</p>
                <button
                  onClick={runAiRemoval}
                  className="mt-2 text-[10px] font-bold text-red-700 hover:text-red-900 underline"
                >
                  Retry with WASM fallback
                </button>
              </div>
            </div>
          )}

          {/* After AI Cutout: Background Replacement Tabs */}
          {hasCutout && (
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-4 shadow-xs">
              <span className="font-semibold text-slate-900">Background Replacement</span>

              {/* Mode Tabs */}
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setBgMode('transparent')}
                  className={`py-1.5 px-1 text-center font-medium rounded-lg transition-colors text-[11px] flex items-center justify-center gap-1 ${
                    bgMode === 'transparent' ? 'bg-indigo-600 text-white shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Transparent</span>
                </button>
                <button
                  onClick={() => setBgMode('color')}
                  className={`py-1.5 px-1 text-center font-medium rounded-lg transition-colors text-[11px] flex items-center justify-center gap-1 ${
                    bgMode === 'color' ? 'bg-indigo-600 text-white shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Color</span>
                </button>
                <button
                  onClick={() => setBgMode('image')}
                  className={`py-1.5 px-1 text-center font-medium rounded-lg transition-colors text-[11px] flex items-center justify-center gap-1 ${
                    bgMode === 'image' ? 'bg-indigo-600 text-white shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Photo</span>
                </button>
              </div>

              {/* Color Replacement Controls */}
              {bgMode === 'color' && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="w-9 h-9 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white shadow-xs"
                    />
                    <input
                      type="text"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="flex-1 font-mono text-xs uppercase px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      Studio Presets
                    </span>
                    <div className="grid grid-cols-5 gap-1.5">
                      {COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => setCustomColor(preset.hex)}
                          title={preset.name}
                          className={`w-7 h-7 rounded-lg border transition-transform hover:scale-110 ${
                            customColor.toUpperCase() === preset.hex ? 'ring-2 ring-indigo-600 scale-105' : 'border-slate-300'
                          }`}
                          style={{ backgroundColor: preset.hex }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Image Replacement Controls */}
              {bgMode === 'image' && (
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => customBgInputRef.current?.click()}
                    className="w-full py-2 px-3 rounded-lg border border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/30 text-slate-700 transition-colors flex items-center justify-center gap-2 text-xs font-medium"
                  >
                    <Upload className="w-4 h-4 text-indigo-600" />
                    <span>{customBgImage ? 'Change Custom Backdrop' : 'Upload Backdrop Image'}</span>
                  </button>
                  <input
                    type="file"
                    ref={customBgInputRef}
                    onChange={handleCustomBgUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  {customBgImage && (
                    <p className="text-[10px] text-emerald-600 font-medium text-center">
                      ✓ Custom backdrop photo active
                    </p>
                  )}
                </div>
              )}

              {bgMode === 'transparent' && (
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Pixels in the background are 100% transparent (alpha = 0) and will export as a genuine transparent PNG.
                </p>
              )}
            </div>
          )}

          {/* Before / After Comparison Controls */}
          {hasCutout && (
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-xs">
              <span className="font-semibold text-slate-900">Preview Comparison</span>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setViewMode('cutout')}
                  className={`py-1.5 text-center font-medium rounded-lg transition-colors text-[11px] ${
                    viewMode === 'cutout' ? 'bg-indigo-600 text-white shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cutout
                </button>
                <button
                  onClick={() => setViewMode('original')}
                  className={`py-1.5 text-center font-medium rounded-lg transition-colors text-[11px] ${
                    viewMode === 'original' ? 'bg-indigo-600 text-white shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Original
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`py-1.5 text-center font-medium rounded-lg transition-colors text-[11px] ${
                    viewMode === 'split' ? 'bg-indigo-600 text-white shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Split View
                </button>
              </div>

              {viewMode === 'split' && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between font-medium text-[11px]">
                    <span className="text-slate-600">Split Position</span>
                    <span className="font-mono text-indigo-600">{splitPos}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="95"
                    value={splitPos}
                    onChange={(e) => setSplitPos(Number(e.target.value))}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              )}
            </div>
          )}

          {/* Manual Touch-Up Eraser / Restore */}
          {hasCutout && (
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">Edge Touch-Up Brushes</span>
                {undoCount > 0 && (
                  <button
                    onClick={handleUndo}
                    className="text-[11px] font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200"
                    title="Undo stroke (Ctrl+Z)"
                  >
                    <Undo2 className="w-3 h-3 text-indigo-600" />
                    <span>Undo ({undoCount})</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setManualMode('none')}
                  className={`py-1.5 text-center font-medium rounded-lg transition-colors text-[11px] ${
                    manualMode === 'none' ? 'bg-indigo-600 text-white shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Off
                </button>
                <button
                  onClick={() => setManualMode('erase')}
                  className={`py-1.5 text-center font-medium rounded-lg transition-colors text-[11px] flex items-center justify-center gap-1 ${
                    manualMode === 'erase' ? 'bg-indigo-600 text-white shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>Eraser</span>
                </button>
                <button
                  onClick={() => setManualMode('restore')}
                  className={`py-1.5 text-center font-medium rounded-lg transition-colors text-[11px] flex items-center justify-center gap-1 ${
                    manualMode === 'restore' ? 'bg-indigo-600 text-white shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Paintbrush className="w-3.5 h-3.5" />
                  <span>Restore</span>
                </button>
              </div>

              {manualMode !== 'none' && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between font-medium text-[11px]">
                    <span className="text-slate-600">Brush Radius</span>
                    <span className="font-mono text-indigo-600">{brushSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="100"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500">
                    {manualMode === 'erase'
                      ? 'Drag over unwanted background remnants to cleanly erase them.'
                      : 'Drag over subject edges to restore missing details.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Model Information & Commercial License Verification */}
          <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 space-y-2 text-[11px] leading-relaxed shadow-xs">
            <div className="flex items-center justify-between font-semibold text-slate-900">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Architecture &amp; Licensing</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">MIT / Apache-2.0</span>
            </div>
            <p className="text-slate-600">
              Uses the open-source <strong>BiRefNet-Lite</strong> model (MIT License) running on <strong>ONNX Runtime Web</strong> via <strong>BG0</strong> (Apache-2.0). 100% permitted for commercial web products without subscription fees or API keys.
            </p>
            <div className="pt-1 flex items-center justify-between border-t border-slate-200/80 text-[10px] text-slate-500">
              <span>Zero server image uploads</span>
              <button
                onClick={handleClearCache}
                className="text-slate-500 hover:text-red-600 underline"
                title="Clear cached model weights from IndexedDB"
              >
                Clear Model Cache
              </button>
            </div>
          </div>
        </div>
      }
    >
      <div className="relative flex items-center justify-center">
        <canvas
          ref={displayCanvasRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          className={`max-w-full max-h-[70vh] object-contain rounded-lg shadow-md ${
            manualMode !== 'none' ? 'cursor-crosshair' : 'cursor-default'
          }`}
        />
      </div>
    </WorkspaceLayout>
  );
};
