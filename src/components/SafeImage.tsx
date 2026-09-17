import { useState, useEffect } from 'react';

export interface SafeImageProps {
  src: string;
  fallbackSrc?: string;
  alt?: string;
  className?: string;
  onOpenLightbox?: () => void;
  showZoomBadge?: boolean;
}

export function SafeImage({
  src,
  fallbackSrc,
  alt = 'Imagem',
  className = '',
  onOpenLightbox,
  showZoomBadge = false,
}: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError && fallbackSrc && currentSrc !== fallbackSrc) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    }
  };

  return (
    <div className={`relative group ${onOpenLightbox ? 'cursor-pointer' : ''}`}>
      <img
        src={currentSrc}
        alt={alt}
        onError={handleError}
        referrerPolicy="no-referrer"
        className={className}
        onClick={onOpenLightbox}
      />
      {showZoomBadge && onOpenLightbox && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onOpenLightbox();
          }}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md text-white p-1.5 rounded-lg text-xs flex items-center gap-1 shadow-lg pointer-events-auto hover:bg-black/80"
          title="Ver imagem original e link direto"
        >
          <span>Link Direto</span>
        </div>
      )}
    </div>
  );
}
