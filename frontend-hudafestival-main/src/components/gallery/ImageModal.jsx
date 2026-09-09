import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';

const ImageModal = ({ images, currentIndex, onClose, onNavigate }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNavigate('prev');
      if (e.key === 'ArrowRight') onNavigate('next');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNavigate]);

  if (currentIndex === null || !images[currentIndex]) return null;

  const currentImage = images[currentIndex];

  const handleDownload = async () => {
    try {
      const response = await fetch(currentImage.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gallery-image-${currentIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--festival-black)]">
      <div className="absolute top-4 right-4 flex items-center gap-4 z-50">
        <button 
          onClick={handleDownload}
          className="p-2 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-none border-2 border-[var(--border)] transition"
          title="Download Image"
        >
          <Download size={24} />
        </button>
        <button 
          onClick={onClose}
          className="p-2 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-none border-2 border-[var(--border)] transition"
          title="Close"
        >
          <X size={28} />
        </button>
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onNavigate('prev'); }}
        className="absolute left-4 p-3 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-none border-2 border-[var(--border)] transition z-50"
      >
        <ChevronLeft size={32} />
      </button>

      <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center" onClick={onClose}>
        <img 
          src={currentImage.url} 
          alt={`Gallery image ${currentIndex + 1}`} 
          className="max-w-full max-h-[90vh] object-contain rounded-none border-4 border-white"
          onClick={(e) => e.stopPropagation()}
        />
        {currentImage.day && (
          <div className="absolute bottom-4 left-4 bg-black/60 text-white text-sm font-medium px-3 py-1.5 rounded-none border-2 border-[var(--border)] backdrop-blur-md">
            {currentImage.day}
          </div>
        )}
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onNavigate('next'); }}
        className="absolute right-4 p-3 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-none border-2 border-[var(--border)] transition z-50"
      >
        <ChevronRight size={32} />
      </button>
    </div>
  );
};

export default ImageModal;
