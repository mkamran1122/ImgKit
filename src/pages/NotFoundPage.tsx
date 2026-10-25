import React from 'react';
import { Home, ArrowLeft } from 'lucide-react';
import { TOOLS_LIST } from '../data/toolsData';

interface NotFoundPageProps {
  navigate: (path: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ navigate }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center px-4 py-16 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center mx-auto text-2xl font-bold font-mono shadow-xs">
          404
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-600">
            The tool or page you requested doesn't exist or has moved. Choose one of our popular tools below or return home.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white transition-colors shadow-xs"
          >
            <Home className="w-4 h-4" />
            <span>Go to Homepage</span>
          </button>
          <button
            onClick={() => navigate('/about')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors border border-slate-200 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>About ImgKit</span>
          </button>
        </div>

        <div className="pt-8 border-t border-slate-200 text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 text-center">
            Popular Image Tools
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {TOOLS_LIST.slice(0, 6).map((tool) => (
              <button
                key={tool.id}
                onClick={() => navigate(tool.path)}
                className="p-2 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700 hover:text-indigo-600 transition-colors text-left truncate shadow-xs"
              >
                {tool.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
