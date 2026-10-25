import React, { useState, useRef } from 'react';
import { 
  FolderArchive, 
  Upload, 
  Download, 
  Trash2, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft,
  Sparkles,
  Sliders,
  FileImage,
  Layers
} from 'lucide-react';
import JSZip from 'jszip';
import { loadImage, canvasToBlob, downloadCanvas, formatBytes } from '../utils/canvasUtils';
import { SAMPLE_IMAGES, getSampleImageDataUrl } from '../utils/sampleImages';

interface BatchEditorToolProps {
  navigate: (path: string) => void;
}

interface BatchItem {
  id: string;
  name: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  sourceUrl: string;
  processedBlob?: Blob;
  processedUrl?: string;
  processedSize?: number;
  processedWidth?: number;
  processedHeight?: number;
  status: 'pending' | 'processing' | 'done' | 'error';
}

export const BatchEditorTool: React.FC<BatchEditorToolProps> = ({ navigate }) => {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);

  // Batch Options
  const [targetFormat, setTargetFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [quality, setQuality] = useState<number>(80);
  const [enableResize, setEnableResize] = useState<boolean>(true);
  const [maxDimension, setMaxDimension] = useState<number>(1600);
  const [nameSuffix, setNameSuffix] = useState<string>('-opt');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesUpload = async (files: FileList | File[]) => {
    const newItems: BatchItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const url = URL.createObjectURL(file);
      try {
        const img = await loadImage(url);
        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          originalSize: file.size,
          originalWidth: img.width,
          originalHeight: img.height,
          sourceUrl: url,
          status: 'pending'
        });
      } catch (e) {
        console.error(e);
      }
    }
    setItems((prev) => [...prev, ...newItems]);
  };

  const handleLoadSampleBatch = async () => {
    const keys: (keyof typeof SAMPLE_IMAGES)[] = ['product', 'portrait', 'landscape'];
    const newItems: BatchItem[] = [];

    for (const key of keys) {
      const sample = SAMPLE_IMAGES[key];
      const dataUrl = getSampleImageDataUrl(key);
      const img = await loadImage(dataUrl);
      newItems.push({
        id: Math.random().toString(36).substring(2, 9),
        name: sample.name,
        originalSize: 120000,
        originalWidth: img.width,
        originalHeight: img.height,
        sourceUrl: dataUrl,
        status: 'pending'
      });
    }

    setItems((prev) => [...prev, ...newItems]);
  };

  const processSingleItem = async (item: BatchItem): Promise<BatchItem> => {
    try {
      const img = await loadImage(item.sourceUrl);
      let outW = img.width;
      let outH = img.height;

      if (enableResize && (outW > maxDimension || outH > maxDimension)) {
        if (outW > outH) {
          outH = Math.round((outH * maxDimension) / outW);
          outW = maxDimension;
        } else {
          outW = Math.round((outW * maxDimension) / outH);
          outH = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No canvas 2D context');

      if (targetFormat === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, outW, outH);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, outW, outH);

      const blob = await canvasToBlob(canvas, targetFormat, quality / 100);
      const blobUrl = URL.createObjectURL(blob);

      return {
        ...item,
        processedBlob: blob,
        processedUrl: blobUrl,
        processedSize: blob.size,
        processedWidth: outW,
        processedHeight: outH,
        status: 'done'
      };
    } catch (err) {
      console.error(err);
      return { ...item, status: 'error' };
    }
  };

  const handleProcessAll = async () => {
    if (items.length === 0 || isProcessingAll) return;
    setIsProcessingAll(true);
    setOverallProgress(0);

    const updated = [...items];
    for (let i = 0; i < updated.length; i++) {
      updated[i] = { ...updated[i], status: 'processing' };
      setItems([...updated]);

      const doneItem = await processSingleItem(updated[i]);
      updated[i] = doneItem;
      setItems([...updated]);
      setOverallProgress(Math.round(((i + 1) / updated.length) * 100));
    }

    setIsProcessingAll(false);
  };

  const handleDownloadSingle = (item: BatchItem) => {
    if (!item.processedBlob) return;
    const ext = targetFormat === 'image/jpeg' ? 'jpg' : targetFormat === 'image/webp' ? 'webp' : 'png';
    const baseName = item.name.replace(/\.[^/.]+$/, '');
    const outName = `${baseName}${nameSuffix}.${ext}`;

    const link = document.createElement('a');
    link.href = item.processedUrl!;
    link.download = outName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadZip = async () => {
    const readyItems = items.filter((it) => it.status === 'done' && it.processedBlob);
    if (readyItems.length === 0) return;

    const zip = new JSZip();
    const ext = targetFormat === 'image/jpeg' ? 'jpg' : targetFormat === 'image/webp' ? 'webp' : 'png';

    readyItems.forEach((it) => {
      const baseName = it.name.replace(/\.[^/.]+$/, '');
      const outName = `${baseName}${nameSuffix}.${ext}`;
      zip.file(outName, it.processedBlob!);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `imgkit-batch-export-${Date.now()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleClearAll = () => {
    setItems([]);
    setOverallProgress(0);
  };

  const totalOrigSize = items.reduce((acc, it) => acc + it.originalSize, 0);
  const totalProcessedSize = items.reduce((acc, it) => acc + (it.processedSize || 0), 0);
  const doneCount = items.filter((it) => it.status === 'done').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Sub Header */}
      <div className="border-b border-slate-200 bg-white px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 font-heading">Batch Image Editor</h1>
              <span className="text-xs text-slate-500 hidden sm:inline">
                · Bulk Resize, Compress & Convert
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <>
              <button
                onClick={handleClearAll}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Clear All
              </button>
              {doneCount > 0 && (
                <button
                  onClick={handleDownloadZip}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <FolderArchive className="w-3.5 h-3.5" />
                  <span>Download All as ZIP ({doneCount})</span>
                </button>
              )}
            </>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Add Images</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleFilesUpload(e.target.files)}
            multiple
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Table / List View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {items.length === 0 ? (
            /* Empty State */
            <div className="h-full min-h-[400px] flex items-center justify-center p-6">
              <div className="max-w-md w-full text-center space-y-6">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-10 border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-white hover:bg-indigo-50/20 rounded-2xl cursor-pointer transition-all group shadow-xs"
                >
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform flex items-center justify-center mx-auto mb-4 border border-indigo-100">
                    <Layers className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 font-heading">
                    Drop Multiple Images Here
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
                    Select 5, 20, or 50+ photos to bulk compress, resize, and convert without uploading to a server.
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 group-hover:bg-indigo-700 text-xs font-semibold text-white transition-colors shadow-xs">
                    <Upload className="w-4 h-4" />
                    <span>Select Images from Computer</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <p className="text-xs text-slate-500 mb-3">Quick demo testing:</p>
                  <button
                    onClick={handleLoadSampleBatch}
                    className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-xs text-slate-700 hover:text-slate-900 transition-colors inline-flex items-center gap-2 shadow-xs"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Load 3 Sample Images</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Populated Table */
            <div className="space-y-4">
              {/* Batch Progress Bar */}
              {isProcessingAll && (
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700">Processing batch images in browser...</span>
                    <span className="font-mono text-indigo-600">{overallProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full transition-all duration-200"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Items Card List */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3 pl-4">Preview</th>
                      <th className="p-3">File Name</th>
                      <th className="p-3">Original</th>
                      <th className="p-3">Output Result</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 pr-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 pl-4">
                          <img
                            src={item.processedUrl || item.sourceUrl}
                            alt=""
                            className="w-10 h-10 rounded object-cover border border-slate-200"
                          />
                        </td>
                        <td className="p-3 font-sans font-medium text-slate-900 truncate max-w-[180px]">
                          {item.name}
                        </td>
                        <td className="p-3 text-slate-500">
                          <div>{item.originalWidth} &times; {item.originalHeight}</div>
                          <div className="text-[10px] text-slate-400">{formatBytes(item.originalSize)}</div>
                        </td>
                        <td className="p-3 text-emerald-600">
                          {item.status === 'done' ? (
                            <>
                              <div>{item.processedWidth} &times; {item.processedHeight}</div>
                              <div className="text-[10px] font-semibold">{formatBytes(item.processedSize || 0)}</div>
                            </>
                          ) : (
                            <span className="text-slate-400 font-sans">Pending</span>
                          )}
                        </td>
                        <td className="p-3 font-sans">
                          {item.status === 'done' && (
                            <span className="text-emerald-600 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Ready</span>
                            </span>
                          )}
                          {item.status === 'processing' && (
                            <span className="text-indigo-600 font-medium flex items-center gap-1">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Optimizing</span>
                            </span>
                          )}
                          {item.status === 'pending' && (
                            <span className="text-slate-500">Queued</span>
                          )}
                          {item.status === 'error' && (
                            <span className="text-red-500 font-medium">Failed</span>
                          )}
                        </td>
                        <td className="p-3 pr-4 text-right space-x-2 font-sans">
                          {item.status === 'done' && (
                            <button
                              onClick={() => handleDownloadSingle(item)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                              title="Download this file"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Batch Configuration */}
        <aside className="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-slate-200 bg-white p-5 overflow-y-auto space-y-6 text-xs text-slate-700">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-900 font-heading">Batch Settings</h2>
            <p className="text-xs text-slate-500">Apply uniform transforms across all uploaded items.</p>
          </div>

          {/* Target Format */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
              Output Format
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setTargetFormat('image/jpeg')}
                className={`py-2 px-1 text-center font-medium rounded-lg transition-colors ${
                  targetFormat === 'image/jpeg' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                JPEG
              </button>
              <button
                onClick={() => setTargetFormat('image/webp')}
                className={`py-2 px-1 text-center font-medium rounded-lg transition-colors ${
                  targetFormat === 'image/webp' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                WebP
              </button>
              <button
                onClick={() => setTargetFormat('image/png')}
                className={`py-2 px-1 text-center font-medium rounded-lg transition-colors ${
                  targetFormat === 'image/png' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                PNG
              </button>
            </div>
          </div>

          {/* Quality Slider */}
          {targetFormat !== 'image/png' && (
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-xs">
              <div className="flex justify-between font-medium">
                <span className="text-slate-700">Compression Quality</span>
                <span className="font-mono text-indigo-600">{quality}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="95"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          )}

          {/* Max Dimension Resize */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableResize}
                onChange={(e) => setEnableResize(e.target.checked)}
                className="rounded accent-indigo-600 text-indigo-600"
              />
              <span className="font-semibold text-slate-800">Scale Down Large Images</span>
            </label>

            {enableResize && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-600">Max Dimension</span>
                  <span className="font-mono text-indigo-600">{maxDimension}px</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[1200, 1600, 2048].map((px) => (
                    <button
                      key={px}
                      onClick={() => setMaxDimension(px)}
                      className={`py-1 rounded border font-mono text-[11px] transition-colors ${
                        maxDimension === px ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 font-medium' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {px}px
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Filename Suffix */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
            <label className="font-semibold text-slate-800">Filename Suffix</label>
            <input
              type="text"
              value={nameSuffix}
              onChange={(e) => setNameSuffix(e.target.value)}
              placeholder="-optimized"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Trigger button */}
          <div className="pt-2 space-y-2">
            <button
              onClick={handleProcessAll}
              disabled={items.length === 0 || isProcessingAll}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              {isProcessingAll ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing {items.length} Files...</span>
                </>
              ) : (
                <>
                  <Sliders className="w-4 h-4" />
                  <span>Run Batch Transformation ({items.length})</span>
                </>
              )}
            </button>

            {doneCount > 0 && (
              <button
                onClick={handleDownloadZip}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <FolderArchive className="w-4 h-4" />
                <span>Download All as ZIP Archive</span>
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
