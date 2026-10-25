import React from 'react';
import { ArrowLeft, CheckCircle2, Shield, Layers, Zap } from 'lucide-react';
import { TOOLS_LIST } from '../data/toolsData';
import { ImgKitLogo } from '../components/ImgKitLogo';

interface AboutPageProps {
  navigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ navigate }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header bar */}
      <div className="border-b border-slate-200 bg-white py-8 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Tools</span>
          </button>
          <div className="flex items-center gap-3 mb-3">
            <ImgKitLogo size="lg" />
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-heading">
              About ImgKit &amp; MK Labs
            </h1>
          </div>
          <p className="text-base text-slate-600">
            A high-performance, privacy-focused online image manipulation toolkit built for the modern web.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* Core Identity & MK Labs section */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <img
              src="/assets/aistudio/MK_Labs_703312e1.jpg"
              alt="MK Labs logo"
              className="h-8 w-8 rounded-md object-contain shrink-0 border border-slate-200 shadow-xs"
            />
            <div>
              <span className="text-base font-bold text-slate-900 font-heading">MK Labs</span>
              <span className="text-xs text-slate-500 block">Digital Products &amp; Tools</span>
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-slate-900 font-heading">
            Our Purpose &amp; Mission
          </h2>
          
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
            <strong className="text-slate-950 font-semibold">MK Labs</strong> develops useful digital products and online tools designed to solve real daily computing challenges. 
          </p>

          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
            <strong className="text-slate-950 font-semibold">ImgKit</strong> is a digital product developed by MK Labs. It helps users edit, resize, compress, convert, and manage images through accessible, easy-to-use online tools directly in their web browser.
          </p>

          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
            ImgKit aims to make everyday image-related tasks easier and more convenient. By eliminating bloated software installs, costly monthly subscription models, and complex account sign-ups, ImgKit provides a swift, friction-free workspace whenever you need to prepare an image for the web, print, or social media.
          </p>
        </section>

        {/* 100% In-Browser Privacy & Technology Architecture */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 font-heading">
            Local Canvas Technology &amp; Absolute Privacy
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
              <Shield className="w-6 h-6 text-emerald-600" />
              <h3 className="font-semibold text-slate-900 text-base">Zero Server Uploads</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                All image processing runs client-side using native HTML5 Canvas APIs. Your original images and edited files are never transmitted to any external server or saved in a remote database.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
              <Zap className="w-6 h-6 text-amber-500" />
              <h3 className="font-semibold text-slate-900 text-base">Instant Performance</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Because operations take place right on your local CPU and GPU through the browser engine, tasks execute with zero network lag or queued server wait times.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
              <Layers className="w-6 h-6 text-indigo-600" />
              <h3 className="font-semibold text-slate-900 text-base">Deterministic Output</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                No unpredictable AI hallucinations. You maintain exact pixel-level control over colors, tolerances, brush strokes, aspect ratios, and compression parameters.
              </p>
            </div>
          </div>
        </section>

        {/* Active Tools directory */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 font-heading">
            What You Can Do on ImgKit
          </h2>
          <p className="text-sm text-slate-600">
            Every tool on ImgKit is fully functional and ready to use without an account:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TOOLS_LIST.map((tool) => (
              <div
                key={tool.id}
                onClick={() => navigate(tool.path)}
                className="group p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-indigo-400 transition-all cursor-pointer flex items-start gap-3 shadow-xs"
              >
                <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {tool.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {tool.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to action */}
        <section className="border-t border-slate-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Ready to begin editing?</p>
            <p className="text-xs text-slate-500">Select any tool to open the interactive canvas workspace.</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white transition-colors shadow-xs"
          >
            Explore Tools
          </button>
        </section>
      </main>
    </div>
  );
};
