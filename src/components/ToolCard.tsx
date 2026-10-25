import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ToolMeta } from '../types';

interface ToolCardProps {
  tool: ToolMeta;
  icon: React.ReactNode;
  onSelect: () => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, icon, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className="group relative flex flex-col justify-between p-6 rounded-2xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-50/50 transition-all duration-200 cursor-pointer shadow-xs"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-xl bg-slate-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all flex items-center justify-center border border-slate-200 group-hover:border-indigo-500 shadow-xs">
            {icon}
          </div>
          <span className="p-1.5 rounded-lg text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
            <ArrowUpRight className="w-5 h-5" />
          </span>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors font-heading">
            {tool.name}
          </h3>
          <p className="text-xs font-semibold text-indigo-600/90">
            {tool.tagline}
          </p>
          <p className="text-xs text-slate-600 leading-relaxed pt-1">
            {tool.description}
          </p>
        </div>
      </div>

      <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="capitalize">{tool.category}</span>
        <span className="text-indigo-600 font-semibold group-hover:underline">Open tool &rarr;</span>
      </div>
    </div>
  );
};
