import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ImageModal from '../components/gallery/ImageModal';
import { SectionHeading, EmptyState } from '../components/ui';
import api from '../services/api';

const GalleryPage = () => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await api.get('/gallery');
        setImages(response.data);
      } catch (error) {
        console.error('Failed to fetch gallery:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const handleNavigate = (direction) => {
    if (direction === 'prev') {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    } else {
      setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    }
  };

  return (
    <div className="min-h-screen bg-[var(--festival-cream)] py-24 px-6 md:px-12">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 border-b-2 border-[var(--border)] pb-8">
          <SectionHeading subtitle="Moments & Memories" align="left">
             Photo <br/>
             <span className="text-[var(--festival-orange)]">Gallery</span>
          </SectionHeading>
          <p className="font-bold text-sm uppercase tracking-widest text-right hidden md:block">
             A visual diary <br/> of the festival
          </p>
        </div>

        {loading ? (
          <div className="min-h-[50vh] flex items-center justify-center font-display text-2xl uppercase font-black">Loading...</div>
        ) : images.length === 0 ? (
          <EmptyState icon="📸" title="No photos yet" message="Check back later for festival highlights." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((img, index) => (
              <motion.div 
                key={img._id} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (index % 8) * 0.05 }}
                className="relative aspect-square border-2 border-[var(--border)] bg-[var(--festival-cream)] cursor-pointer group shadow-[6px_6px_0px_0px_rgba(23,23,23,1)] hover:-translate-y-2 hover:shadow-[10px_10px_0px_0px_rgba(23,23,23,1)] transition-all overflow-hidden flex flex-col"
                onClick={() => setSelectedIndex(index)}
              >
                <div className="flex-1 overflow-hidden">
                  <img 
                    src={img.url} 
                    alt={img.caption || `Gallery thumbnail ${index + 1}`} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                
                {(img.caption || img.day) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-[var(--festival-black)] p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                     {img.day && <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--festival-orange)] block mb-1">{img.day}</span>}
                     {img.caption && <p className="text-white text-xs font-bold uppercase tracking-widest truncate">{img.caption}</p>}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
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
