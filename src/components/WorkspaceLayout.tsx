import React, { useRef, useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Upload, 
  Download, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Sparkles,
  FileImage,
  Layers
} from 'lucide-react';
import { formatBytes } from '../utils/canvasUtils';
import { SAMPLE_IMAGES, getSampleImageDataUrl } from '../utils/sampleImages';

interface WorkspaceLayoutProps {
  toolTitle: string;
  toolTagline: string;
  toolDescription: string;
  imageLoaded: boolean;
  imageName?: string;
  originalDimensions?: { width: number; height: number };
  originalSize?: number;
  processedDimensions?: { width: number; height: number };
  processedSize?: number;
  onUpload: (file: File) => void;
  onLoadSample: (sampleKey: keyof typeof SAMPLE_IMAGES) => void;
  onReset?: () => void;
  onDownload: () => void;
  isProcessing?: boolean;
  downloadLabel?: string;
  sidebarControls: React.ReactNode;
  children: React.ReactNode;
  navigate: (path: string) => void;
  sampleType?: keyof typeof SAMPLE_IMAGES;
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  toolTitle,
  toolTagline,
  toolDescription,
  imageLoaded,
  imageName = 'image.png',
  originalDimensions,
  originalSize,
  processedDimensions,
  processedSize,
  onUpload,
  onLoadSample,
  onReset,
  onDownload,
  isProcessing = false,
  downloadLabel = 'Download Image',
  sidebarControls,
  children,
  navigate,
  sampleType = 'product'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Set document title dynamically
  useEffect(() => {
    document.title = `${toolTitle} – ImgKit by MK Labs`;
  }, [toolTitle]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onUpload(file);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Workspace Sub-Header */}
      <div className="border-b border-slate-200 bg-white/95 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Return to Tools"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 font-heading">{toolTitle}</h1>
              <span className="text-xs text-slate-500 hidden sm:inline">· {toolTagline}</span>
            </div>
          </div>
        </div>

        {/* Global Toolbar actions */}
        <div className="flex items-center gap-2">
          {imageLoaded && (
            <>
              {/* Zoom Controls */}
              <div className="hidden sm:flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs text-slate-700">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(25, z - 25))}
                  className="p-1 hover:text-slate-950 hover:bg-white rounded transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-mono tabular-nums text-xs">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(300, z + 25))}
                  className="p-1 hover:text-slate-950 hover:bg-white rounded transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(100)}
                  className="p-1 hover:text-slate-950 hover:bg-white rounded border-l border-slate-200 transition-colors"
                  title="Reset Zoom to 100%"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Replace Image */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Change Image</span>
              </button>

              {/* Reset */}
              {onReset && (
                <button
                  onClick={onReset}
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Reset Changes"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}

              {/* Download */}
              <button
                onClick={onDownload}
                disabled={isProcessing}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloadLabel}</span>
              </button>
            </>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left / Main: Canvas Preview Area */}
        <div 
          className="flex-1 relative flex flex-col bg-slate-100 overflow-hidden"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragging && (
            <div className="absolute inset-0 z-50 bg-indigo-50/80 border-2 border-dashed border-indigo-600 flex items-center justify-center backdrop-blur-xs">
              <div className="text-center p-6 bg-white rounded-2xl border border-indigo-200 shadow-xl">
                <Upload className="w-10 h-10 text-indigo-600 mx-auto mb-2 animate-bounce" />
                <p className="text-base font-semibold text-slate-900">Drop your image here</p>
                <p className="text-xs text-slate-500 mt-1">Processed 100% locally in your browser</p>
              </div>
            </div>
          )}

          {!imageLoaded ? (
            /* Upload Empty State */
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
              <div className="max-w-md w-full text-center space-y-6">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-10 border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-white hover:bg-slate-50/70 rounded-2xl cursor-pointer transition-all group shadow-sm"
                >
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-xs">
                    <FileImage className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 font-heading">
                    Upload an Image to Begin
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
                    Drag and drop your file here, or click to browse. Supports PNG, JPEG, WebP, SVG, and GIF.
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 group-hover:bg-indigo-700 text-xs font-semibold text-white transition-colors shadow-xs">
                    <Upload className="w-4 h-4" />
                    <span>Choose Image File</span>
                  </div>
                </div>

                {/* Instant Try Sample Option */}
                <div className="pt-2 border-t border-slate-200">
                  <p className="text-xs text-slate-500 mb-3">No file handy? Test immediately:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      onClick={() => onLoadSample('product')}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs text-slate-700 hover:text-indigo-600 transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Studio Sneaker</span>
                    </button>
                    <button
                      onClick={() => onLoadSample('portrait')}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs text-slate-700 hover:text-emerald-600 transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Studio Portrait</span>
                    </button>
                    <button
                      onClick={() => onLoadSample('landscape')}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs text-slate-700 hover:text-sky-600 transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                      <span>Landscape Vista</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Populated Preview Viewport with Checkerboard */
            <div className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-8 checkerboard-pattern relative select-none">
              <div 
                style={{ 
                  transform: `scale(${zoomLevel / 100})`, 
                  transformOrigin: 'center center',
                  transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)' 
                }}
                className="max-w-full max-h-full flex items-center justify-center shadow-lg rounded-lg"
              >
                {children}
              </div>
            </div>
          )}

          {/* Bottom Bar: Image Telemetry / Metadata */}
          {imageLoaded && (
            <div className="border-t border-slate-200 bg-white px-4 py-2 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-800 truncate max-w-[200px]">{imageName}</span>
                {originalDimensions && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className="font-mono tabular-nums">{originalDimensions.width} &times; {originalDimensions.height} px</span>
                  </>
                )}
                {originalSize !== undefined && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className="font-mono tabular-nums">{formatBytes(originalSize)}</span>
                  </>
                )}
              </div>

              {processedDimensions && (
                <div className="flex items-center gap-3 text-slate-600">
                  <span>Output:</span>
                  <span className="font-mono tabular-nums text-slate-900 font-medium">
                    {processedDimensions.width} &times; {processedDimensions.height} px
                  </span>
                  {processedSize !== undefined && (
                    <span className="font-mono tabular-nums text-emerald-600 font-semibold">
                      ({formatBytes(processedSize)})
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right / Sidebar: Tool-Specific Controls */}
        <aside className="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-slate-200 bg-white p-5 overflow-y-auto space-y-6">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-900 font-heading">{toolTitle} Controls</h2>
            <p className="text-xs text-slate-500 leading-relaxed">{toolDescription}</p>
          </div>

          <div className="space-y-5">
            {sidebarControls}
          </div>

          {imageLoaded && (
            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={onDownload}
                disabled={isProcessing}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>{downloadLabel}</span>
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
