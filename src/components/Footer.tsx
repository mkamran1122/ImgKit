import React from 'react';
import { ShieldCheck, Cpu, HardDriveDownload } from 'lucide-react';
import { TOOLS_LIST } from '../data/toolsData';
import { ImgKitLogo } from './ImgKitLogo';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      {/* Privacy guarantee bar */}
      <div className="border-b border-slate-100 bg-slate-50/80 py-5 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-6 text-sm">
            <div className="flex items-start sm:items-center gap-3 p-3 sm:p-0 rounded-xl sm:rounded-none bg-white/70 sm:bg-transparent border border-slate-200/50 sm:border-0 shadow-2xs sm:shadow-none">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0 border border-emerald-100 mt-0.5 sm:mt-0">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <p className="font-semibold text-slate-900 text-sm">100% Local Browser Processing</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Your photos never touch a cloud server or external database.</p>
              </div>
            </div>

            <div className="flex items-start sm:items-center gap-3 p-3 sm:p-0 rounded-xl sm:rounded-none bg-white/70 sm:bg-transparent border border-slate-200/50 sm:border-0 shadow-2xs sm:shadow-none">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0 border border-indigo-100 mt-0.5 sm:mt-0">
                <Cpu className="w-5 h-5" />
              </span>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Zero AI &amp; Zero Subscriptions</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Deterministic Canvas algorithms with no credits or sign-ups.</p>
              </div>
            </div>

            <div className="flex items-start sm:items-center gap-3 p-3 sm:p-0 rounded-xl sm:rounded-none bg-white/70 sm:bg-transparent border border-slate-200/50 sm:border-0 shadow-2xs sm:shadow-none">
              <span className="p-2 rounded-xl bg-sky-50 text-sky-600 shrink-0 border border-sky-100 mt-0.5 sm:mt-0">
                <HardDriveDownload className="w-5 h-5" />
              </span>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Instant Full-Resolution Export</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Export high-DPI PNG, JPEG, and WebP directly to your drive.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 sm:gap-8 md:gap-10">
          {/* Brand info - spans 2 columns on mobile for spacious presentation */}
          <div className="space-y-3 col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <ImgKitLogo size="sm" />
              <span className="text-lg font-bold text-slate-900 font-heading tracking-tight">
                Img<span className="text-indigo-600">Kit</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 max-w-sm md:max-w-none">
              The modern, privacy-first online toolkit for everyday image editing, resizing, batch conversion, and passport printing without servers or cloud uploads.
            </p>
          </div>

          {/* Tools column 1: Editing */}
          <div className="col-span-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-2.5 sm:mb-3">
              Editing Tools
            </h4>
            <ul className="space-y-1 sm:space-y-2 text-xs">
              {TOOLS_LIST.slice(0, 4).map((tool) => (
                <li key={tool.id}>
                  <button
                    onClick={() => navigate(tool.path)}
                    className="py-1.5 sm:py-0.5 text-slate-600 hover:text-indigo-600 active:text-indigo-700 transition-colors text-left flex items-center min-h-[36px] sm:min-h-0 w-full"
                  >
                    {tool.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools column 2: Production & Batch */}
          <div className="col-span-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-2.5 sm:mb-3">
              Production &amp; Batch
            </h4>
            <ul className="space-y-1 sm:space-y-2 text-xs">
              {TOOLS_LIST.slice(4).map((tool) => (
                <li key={tool.id}>
                  <button
                    onClick={() => navigate(tool.path)}
                    className="py-1.5 sm:py-0.5 text-slate-600 hover:text-indigo-600 active:text-indigo-700 transition-colors text-left flex items-center min-h-[36px] sm:min-h-0 w-full"
                  >
                    {tool.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & About */}
          <div className="col-span-2 sm:col-span-1 md:col-span-1 pt-2 sm:pt-0 border-t border-slate-100 sm:border-0">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-2.5 sm:mb-3">
              Information
            </h4>
            <ul className="space-y-1 sm:space-y-2 text-xs">
              <li>
                <button
                  onClick={() => navigate('/about')}
                  className="py-1.5 sm:py-0.5 hover:text-indigo-600 active:text-indigo-700 transition-colors text-left font-medium text-slate-700 flex items-center min-h-[36px] sm:min-h-0 w-full"
                >
                  About MK Labs &amp; ImgKit
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/')}
                  className="py-1.5 sm:py-0.5 text-slate-600 hover:text-indigo-600 active:text-indigo-700 transition-colors text-left flex items-center min-h-[36px] sm:min-h-0 w-full"
                >
                  Explore All 9 Tools
                </button>
              </li>
              <li className="pt-0.5">
                <span className="text-slate-400 py-1 inline-block">Free &amp; Open In-Browser Suite</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Ownership Bar: MK Labs Ownership Requirement */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 text-center sm:text-left">
          {/* MK Labs Logo associated strictly with MK Labs */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm font-medium text-slate-700">
            <span>ImgKit is a product by</span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-950">
              <img
                src="/assets/aistudio/MK_Labs_703312e1.jpg"
                alt="MK Labs logo"
                className="h-5 w-5 sm:h-6 sm:w-6 rounded-md object-contain shrink-0 border border-slate-200 shadow-2xs"
              />
              <span>MK Labs.</span>
            </span>
          </div>

          {/* Copyright and status - updated to 2026 ImgKit. All rights reserved. */}
          <div className="text-xs text-slate-400 flex flex-wrap items-center justify-center sm:justify-end gap-x-3 gap-y-1 text-center sm:text-right">
            <span>&copy; {new Date().getFullYear() || 2026} ImgKit. All rights reserved.</span>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <span>Client-Side Canvas Technology</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
