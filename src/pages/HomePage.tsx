import React, { useRef, useState } from 'react';
import { 
  Scissors, 
  Sparkles, 
  ShoppingBag, 
  Crop, 
  Scaling, 
  Gauge, 
  ArrowLeftRight, 
  UserCheck, 
  Layers, 
  Upload, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  UserX, 
  HardDrive, 
  Check, 
  ChevronDown,
  Lock,
  Zap,
  Image as ImageIcon
} from 'lucide-react';
import { ToolCard } from '../components/ToolCard';
import { TOOLS_LIST } from '../data/toolsData';

interface HomePageProps {
  navigate: (path: string) => void;
  onQuickUpload: (file: File) => void;
}

const FAQS = [
  {
    q: 'How does ImgKit edit images without uploading them to a server?',
    a: 'ImgKit leverages modern HTML5 Canvas and JavaScript graphics APIs that execute directly inside your browser. All computations — pixel keying, resizing, compression, and format encoding — happen entirely on your computer or mobile device.'
  },
  {
    q: 'Are there any limits on file size or image counts?',
    a: 'Since processing is local, there are no artificial server paywalls or token limits. Your device’s memory is the only natural ceiling, so typical 20MB–50MB camera files and batch operations process smoothly.'
  },
  {
    q: 'Does ImgKit use AI or machine learning models?',
    a: 'No. ImgKit uses deterministic, precision algorithms (Euclidean color distance, bicubic interpolation, and standard image codecs). You have absolute, transparent control over every pixel with zero AI hallucinations.'
  },
  {
    q: 'What formats can I export?',
    a: 'You can export high-quality PNG (with full alpha transparency), JPEG (with custom quality compression), and modern WebP. The Batch Editor allows you to package all results into a single ZIP archive.'
  },
  {
    q: 'Is ImgKit free to use?',
    a: 'Yes, ImgKit is completely free with no subscriptions, watermark restrictions, or mandatory user accounts.'
  }
];

export const HomePage: React.FC<HomePageProps> = ({ navigate, onQuickUpload }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getToolIcon = (id: string) => {
    switch (id) {
      case 'background-remover':
        return <Scissors className="w-6 h-6" />;
      case 'background-changer':
        return <Sparkles className="w-6 h-6" />;
      case 'product-photo-maker':
        return <ShoppingBag className="w-6 h-6" />;
      case 'image-cropper':
        return <Crop className="w-6 h-6" />;
      case 'image-resizer':
        return <Scaling className="w-6 h-6" />;
      case 'image-compressor':
        return <Gauge className="w-6 h-6" />;
      case 'image-converter':
        return <ArrowLeftRight className="w-6 h-6" />;
      case 'passport-photo-maker':
        return <UserCheck className="w-6 h-6" />;
      case 'batch-editor':
        return <Layers className="w-6 h-6" />;
      default:
        return <ImageIcon className="w-6 h-6" />;
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onQuickUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* 1. Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50/50 to-slate-50 overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
          {/* Hero Header */}
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 font-heading" style={{ textWrap: 'balance' }}>
              Edit Your Images. <span className="text-indigo-600">Your Way.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Remove simple backgrounds, create product photos, resize images, and edit pictures online — free and without AI.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
              <button
                onClick={() => navigate('/tools/background-remover')}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-500/20 flex items-center gap-2"
              >
                <span>Start Editing</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#tools-section"
                className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 border border-slate-300 font-semibold text-sm transition-all shadow-xs"
              >
                Explore Tools
              </a>
            </div>
          </div>

          {/* Quick Drop Area / Interactive Workspace Dropzone */}
          <div className="max-w-4xl mx-auto">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all cursor-pointer text-center relative overflow-hidden group ${
                isDragging
                  ? 'border-indigo-600 bg-indigo-50/50'
                  : 'border-slate-300 hover:border-indigo-500 bg-white hover:bg-slate-50/60 shadow-sm'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-xs">
                <Upload className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-heading">
                Drop your image here to edit instantly
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto">
                No sign-up. 100% local browser execution. Your images never leave your device.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 group-hover:bg-indigo-700 text-xs font-semibold text-white transition-colors shadow-xs">
                <Upload className="w-4 h-4" />
                <span>Browse Local Photo</span>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => e.target.files && onQuickUpload(e.target.files[0])}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Popular Tools Section */}
      <section id="tools-section" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900 font-heading">
            Popular Image Tools
          </h2>
          <p className="text-sm text-slate-600">
            Every tool runs directly in your browser. Choose an operation to open its dedicated workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOOLS_LIST.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              icon={getToolIcon(tool.id)}
              onSelect={() => navigate(tool.path)}
            />
          ))}
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-y border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-900 font-heading">
              How It Works
            </h2>
            <p className="text-sm text-slate-600">
              Three simple steps to transform your graphics without friction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold font-mono text-base border border-indigo-100 shadow-xs">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">
                Upload your image
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Drag and drop your file or choose from your device. The image loads into browser memory immediately with zero network delay.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold font-mono text-base border border-indigo-100 shadow-xs">
                02
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">
                Edit with specialized tools
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Fine-tune tolerances, aspect crops, background colors, contact shadows, or batch parameters using native HTML5 Canvas controls.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold font-mono text-base border border-indigo-100 shadow-xs">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">
                Download your finished image
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Save full-resolution PNG, JPEG, WebP, or batch ZIP files right to your hard drive without watermarks or subscription barriers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Verified Privacy & Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900 font-heading">
            Privacy-First Architecture
          </h2>
          <p className="text-sm text-slate-600">
            Built from first principles for users who value data ownership and speed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
            <Cpu className="w-6 h-6 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900 font-heading">No AI Required</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Deterministic mathematical models ensure consistent, repeatable edits without robotic artifacts or hallucinated details.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
            <Zap className="w-6 h-6 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900 font-heading">Browser-Based Processing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Harness the full compute power of your own graphics hardware with zero queue wait times or server outages.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
            <UserX className="w-6 h-6 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900 font-heading">No Account Required</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Open the page and start editing instantly. No email verification, passwords, or marketing newsletters.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
            <Lock className="w-6 h-6 text-rose-500" />
            <h3 className="text-base font-bold text-slate-900 font-heading">Zero Server Uploads</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sensitive family portraits, company assets, and receipts stay strictly on your local disk.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
            <HardDrive className="w-6 h-6 text-sky-600" />
            <h3 className="text-base font-bold text-slate-900 font-heading">Multiple Formats Supported</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Seamlessly handle PNG with full alpha channel, JPEG with quality compression, modern WebP, and ZIP archives.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900 font-heading">Full Resolution Retention</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Export 2000px+ e-commerce banners or 300 DPI passport photos without arbitrary size down-scaling.
            </p>
          </div>
        </div>
      </section>

      {/* 5. FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200 bg-white">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-900 font-heading">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-600">
              Clear answers about technology, privacy, and file handling.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <div
                key={faq.q}
                className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/60"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-100/60 transition-colors"
                >
                  <span className="text-sm font-semibold text-slate-900 font-heading">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform ${openFaq === idx ? 'rotate-180 text-indigo-600' : ''}`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/60">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
