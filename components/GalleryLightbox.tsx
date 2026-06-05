'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';

interface GalleryImage {
  url_r2: string;
  alt: string;
}

interface GalleryLightboxProps {
  images: GalleryImage[];
}

export default function GalleryLightbox({ images }: GalleryLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [erroredImages, setErroredImages] = useState<Set<number>>(new Set());

  const isOpen = currentIndex !== null;

  const open = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const close = useCallback(() => {
    setCurrentIndex(null);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev !== null ? (prev + 1) % images.length : null));
  }, [images.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) =>
      prev !== null ? (prev - 1 + images.length) % images.length : null,
    );
  }, [images.length]);

  const handleImageError = useCallback((index: number) => {
    setErroredImages((prev) => new Set(prev).add(index));
  }, []);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        close();
      }
    },
    [close],
  );

  const hasMultiple = useMemo(() => images.length > 1, [images.length]);

  useEffect(() => {
    if (currentIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, close, goToNext, goToPrev]);

  useEffect(() => {
    if (currentIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [currentIndex]);

  const renderImage = (image: GalleryImage, index: number) => {
    if (erroredImages.has(index)) {
      return (
        <div className="w-full h-full bg-slate-900 flex items-center justify-center rounded-xl border border-slate-800">
          <div className="text-center text-slate-500">
            <svg
              className="w-10 h-10 mx-auto mb-2 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs font-medium">Imagen no disponible</span>
          </div>
        </div>
      );
    }

    return (
      <img
        src={image.url_r2}
        alt={image.alt}
        loading="lazy"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        onError={() => handleImageError(index)}
      />
    );
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className={`group overflow-hidden rounded-2xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-slate-100 cursor-pointer hover:border-indigo-500/50 transition-all duration-300 shadow-lg relative ${
              index === 0
                ? 'md:col-span-2 md:row-span-2 h-64 sm:h-80 md:h-96'
                : 'h-48 sm:h-56 md:h-40 lg:h-48'
            }`}
            onClick={() => open(index)}
          >
            {renderImage(image, index)}
          </div>
        ))}
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-sm"
          onClick={handleOverlayClick}
        >
          <button
            onClick={close}
            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Cerrar galería"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {hasMultiple && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-2 sm:left-4 z-10 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Imagen anterior"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 sm:right-4 z-10 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Siguiente imagen"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <div className="relative max-w-5xl w-full mx-4 sm:mx-8 max-h-[85vh] flex flex-col items-center">
            <div className="relative w-full h-full flex items-center justify-center">
              {erroredImages.has(currentIndex) ? (
                <div className="w-full aspect-video max-h-[75vh] bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center">
                  <div className="text-center text-slate-500">
                    <svg
                      className="w-16 h-16 mx-auto mb-3 opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm font-medium">Imagen no disponible</span>
                  </div>
                </div>
              ) : (
                <img
                  src={images[currentIndex].url_r2}
                  alt={images[currentIndex].alt}
                  className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
                  onError={() => handleImageError(currentIndex)}
                />
              )}
            </div>

            {hasMultiple && (
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                <span className="font-medium text-slate-300">
                  {currentIndex! + 1}
                </span>
                <span className="text-slate-600">/</span>
                <span>{images.length}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
