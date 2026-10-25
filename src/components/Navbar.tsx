import React, { useState } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { ImgKitLogo } from './ImgKitLogo';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <a 
          href="/" 
          onClick={(e) => handleNavClick(e, '/')}
          className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 group"
        >
          <ImgKitLogo size="md" />
          <span className="font-heading tracking-tight font-extrabold text-slate-900">
            Img<span className="text-indigo-600">Kit</span>
          </span>
        </a>

        {/* Zone 2: Clean 4–5 single-line navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a
            href="/"
            onClick={(e) => handleNavClick(e, '/')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-indigo-600 ${currentPath === '/' ? 'text-indigo-600 font-semibold' : 'text-slate-600'}`}
          >
            All Tools
          </a>
          <a
            href="/tools/batch-editor"
            onClick={(e) => handleNavClick(e, '/tools/batch-editor')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-indigo-600 ${currentPath === '/tools/batch-editor' ? 'text-indigo-600 font-semibold' : 'text-slate-600'}`}
          >
            Batch Editor
          </a>
          <a
            href="/tools/passport-photo-maker"
            onClick={(e) => handleNavClick(e, '/tools/passport-photo-maker')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-indigo-600 ${currentPath === '/tools/passport-photo-maker' ? 'text-indigo-600 font-semibold' : 'text-slate-600'}`}
          >
            Passport Maker
          </a>
          <a
            href="/about"
            onClick={(e) => handleNavClick(e, '/about')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-indigo-600 ${currentPath === '/about' ? 'text-indigo-600 font-semibold' : 'text-slate-600'}`}
          >
            About
          </a>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/tools/background-remover')}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0"
          >
            <span>Start Editing</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 py-4 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-2 text-sm font-medium">
            <button
              onClick={(e) => handleNavClick(e, '/')}
              className="text-left py-2 px-3 rounded-md text-slate-700 hover:text-indigo-600 hover:bg-slate-50"
            >
              All Tools
            </button>
            <button
              onClick={(e) => handleNavClick(e, '/tools/batch-editor')}
              className="text-left py-2 px-3 rounded-md text-slate-700 hover:text-indigo-600 hover:bg-slate-50"
            >
              Batch Image Editor
            </button>
            <button
              onClick={(e) => handleNavClick(e, '/tools/passport-photo-maker')}
              className="text-left py-2 px-3 rounded-md text-slate-700 hover:text-indigo-600 hover:bg-slate-50"
            >
              Passport Photo Maker
            </button>
            <button
              onClick={(e) => handleNavClick(e, '/tools/product-photo-maker')}
              className="text-left py-2 px-3 rounded-md text-slate-700 hover:text-indigo-600 hover:bg-slate-50"
            >
              Product Photo Maker
            </button>
            <button
              onClick={(e) => handleNavClick(e, '/tools/background-remover')}
              className="text-left py-2 px-3 rounded-md text-slate-700 hover:text-indigo-600 hover:bg-slate-50"
            >
              Background Remover
            </button>
            <button
              onClick={(e) => handleNavClick(e, '/about')}
              className="text-left py-2 px-3 rounded-md text-slate-700 hover:text-indigo-600 hover:bg-slate-50"
            >
              About MK Labs & ImgKit
            </button>
          </div>
          <div className="pt-2">
            <button
              onClick={() => {
                navigate('/tools/background-remover');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              <span>Start Editing Free</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
