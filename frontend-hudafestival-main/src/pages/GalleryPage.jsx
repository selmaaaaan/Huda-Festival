import React, { useState } from 'react';
import ImageModal from '../components/ImageModal';

const GalleryPage = () => {
  const [selectedIndex, setSelectedIndex] = useState(null);

  // MOCK DATA: Replace with API call once gallery endpoint exists
  const images = [
    { id: 1, url: 'https://withr-2k25.vercel.app/assets/img226-IvMT2MNz.jpg', day: 'Day 1' },
    { id: 2, url: 'https://withr-2k25.vercel.app/assets/img224-CjeW7xUZ.jpg', day: 'Day 1' },
    { id: 3, url: 'https://withr-2k25.vercel.app/assets/img219-DNTC6DNy.jpg', day: 'Day 1' },
    { id: 4, url: 'https://withr-2k25.vercel.app/assets/img226-IvMT2MNz.jpg', day: 'Day 2' },
    { id: 5, url: 'https://withr-2k25.vercel.app/assets/img219-DNTC6DNy.jpg', day: 'Day 2' },
    { id: 6, url: 'https://withr-2k25.vercel.app/assets/img224-CjeW7xUZ.jpg', day: 'Day 2' },
    { id: 7, url: 'https://withr-2k25.vercel.app/assets/img224-CjeW7xUZ.jpg', day: 'Day 3' },
    { id: 8, url: 'https://withr-2k25.vercel.app/assets/img226-IvMT2MNz.jpg', day: 'Day 3' },
    { id: 9, url: 'https://withr-2k25.vercel.app/assets/img219-DNTC6DNy.jpg', day: 'Day 3' },
  ];

  const handleNavigate = (direction) => {
    if (direction === 'prev') {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    } else {
      setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-public-bg)] py-8 mt-16 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[var(--color-text-heading)]">Photo Gallery</h1>
          <p className="text-[var(--color-text-body)] mt-2">Moments and memories from the festival</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div 
              key={img.id} 
              className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-shadow bg-white"
              onClick={() => setSelectedIndex(index)}
            >
              <img 
                src={img.url} 
                alt={`Gallery thumbnail ${index + 1}`} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              
              {img.day && (
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[var(--color-text-heading)] text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                  {img.day}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <ImageModal 
        images={images}
        currentIndex={selectedIndex}
        onClose={() => setSelectedIndex(null)}
        onNavigate={handleNavigate}
      />
    </div>
  );
};

export default GalleryPage;
