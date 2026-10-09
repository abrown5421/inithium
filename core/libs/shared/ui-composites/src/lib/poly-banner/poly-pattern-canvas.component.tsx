import { useMemo } from 'react';
import type { PolyPattern } from '@inithium/shared-contracts';
import { polyFills, polyTriangles } from './poly-pattern.service';

export type PolyPatternCanvasProps = {
  pattern: PolyPattern;
  /** The size the pattern is drawn for, in px. The drawing scales to fill its box. */
  width: number;
  height: number;
  /** Names the image for screen readers; without it the pattern is hidden from them. */
  label?: string;
};

/** Draws a poly pattern as an SVG filling its positioned parent (internal to PolyBanner and its editor). */
export function PolyPatternCanvas({ pattern, width, height, label }: PolyPatternCanvasProps) {
  const { cellSize, variance, seed, xColors, yColors } = pattern;
  const triangles = useMemo(() => polyTriangles(width, height, { cellSize, variance, seed }), [width, height, cellSize, variance, seed]);
  const fills = useMemo(() => polyFills(triangles, width, height, xColors, yColors), [triangles, width, height, xColors, yColors]);

  return (
    <div className="ui-poly-canvas" {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}>
      {width > 0 && height > 0 && (
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" focusable="false">
          {triangles.map((triangle, index) => (
            <polygon key={index} points={triangle.points} style={{ fill: fills[index], stroke: fills[index] }} />
          ))}
        </svg>
      )}
    </div>
  );
}
