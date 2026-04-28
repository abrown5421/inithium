import React, { useMemo } from 'react';
import trianglify from 'trianglify'; 
import { BannerProps } from '@inithium/types';

export const Banner: React.FC<BannerProps> = ({
  src,
  alt = 'Profile Banner',
  height = '250px',
  options,
  className = '',
}) => {
  const containerStyle: React.CSSProperties = {
    height,
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  };

  const renderTrianglify = useMemo(() => {
    if (src) return null;

    const pattern = trianglify({
      width: window.innerWidth,
      height: parseInt(height, 10) || 250,
      variance: options?.variance ?? 0.75,
      cell_size: options?.cell_size ?? 75,
      x_colors: options?.x_colors ?? 'Blues',
      y_colors: options?.y_colors,
    });

    return pattern.toSVGDataUri();
  }, [src, height, options]);

  return (
    <div 
      className={`inithium-banner-root ${className}`} 
      style={containerStyle}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: `url("${renderTrianglify}")`,
            backgroundSize: 'cover',
          }}
        />
      )}
    </div>
  );
};