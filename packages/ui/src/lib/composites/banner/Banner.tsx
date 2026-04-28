import React, { useMemo } from 'react';
import trianglify from 'trianglify';
import { BannerProps } from '@inithium/types';

const VIRTUAL_WIDTH = 1920;

const createPattern = (h: number, options?: BannerProps['options']) =>
  trianglify({
    width: VIRTUAL_WIDTH,
    height: h,
    cellSize: options?.cell_size ?? 75,
    variance: options?.variance ?? 0.75,
    xColors: options?.x_colors ?? 'Blues',
    yColors: options?.y_colors,
  });

const formatSvg = (pattern: any, w: number, h: number): string => {
  const svg = pattern.toSVG();
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  return svg.outerHTML;
};

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

  const patternHtml = useMemo(() => {
    if (src) return null;

    try {
      const h = parseInt(height, 10) || 250;
      return formatSvg(createPattern(h, options), VIRTUAL_WIDTH, h);
    } catch {
      return '';
    }
  }, [src, height, options]);

  return (
    <div className={`inithium-banner-root ${className}`} style={containerStyle}>
      {src ? (
        <img
          src={src}
          alt={alt}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div
          style={{ width: '100%', height: '100%' }}
          dangerouslySetInnerHTML={{ __html: patternHtml || '' }}
        />
      )}
    </div>
  );
};