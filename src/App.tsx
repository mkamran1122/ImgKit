/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { BackgroundRemoverTool } from './tools/BackgroundRemoverTool';
import { BackgroundChangerTool } from './tools/BackgroundChangerTool';
import { ProductPhotoTool } from './tools/ProductPhotoTool';
import { CropperTool } from './tools/CropperTool';
import { ResizerTool } from './tools/ResizerTool';
import { CompressorTool } from './tools/CompressorTool';
import { ConverterTool } from './tools/ConverterTool';
import { PassportPhotoTool } from './tools/PassportPhotoTool';
import { BatchEditorTool } from './tools/BatchEditorTool';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Custom client navigation
  const navigate = (path: string) => {
    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Quick upload handler from homepage hero
  const handleQuickUpload = (file: File) => {
    // Navigate to Background Remover or appropriate tool
    navigate('/tools/background-remover');
  };

  // Render appropriate view
  const renderRoute = () => {
    switch (currentPath) {
      case '/':
      case '':
        return <HomePage navigate={navigate} onQuickUpload={handleQuickUpload} />;

      case '/about':
        return <AboutPage navigate={navigate} />;

      case '/tools/background-remover':
        return <BackgroundRemoverTool navigate={navigate} />;

      case '/tools/background-changer':
        return <BackgroundChangerTool navigate={navigate} />;

      case '/tools/product-photo-maker':
        return <ProductPhotoTool navigate={navigate} />;

      case '/tools/image-cropper':
        return <CropperTool navigate={navigate} />;

      case '/tools/image-resizer':
        return <ResizerTool navigate={navigate} />;

      case '/tools/image-compressor':
        return <CompressorTool navigate={navigate} />;

      case '/tools/image-converter':
        return <ConverterTool navigate={navigate} />;

      case '/tools/passport-photo-maker':
        return <PassportPhotoTool navigate={navigate} />;

      case '/tools/batch-editor':
        return <BatchEditorTool navigate={navigate} />;

      default:
        return <NotFoundPage navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500/20 selection:text-indigo-900">
      <Navbar currentPath={currentPath} navigate={navigate} />
      <main className="flex-1 flex flex-col">
        {renderRoute()}
      </main>
      <Footer navigate={navigate} />
    </div>
  );
}
