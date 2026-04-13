import { CSSProperties } from 'react';

interface VariantProps {
  color: string;
  sizePx: number;
}

export function SpinnerVariant({ color, sizePx }: VariantProps) {
  const stroke = Math.max(2, Math.round(sizePx * 0.1));
  const r = (sizePx - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;

  return (
    <svg
      width={sizePx}
      height={sizePx}
      viewBox={`0 0 ${sizePx} ${sizePx}`}
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <circle
        cx={sizePx / 2}
        cy={sizePx / 2}
        r={r}
        stroke={color}
        strokeWidth={stroke}
        strokeOpacity={0.2}
      />
      <circle
        cx={sizePx / 2}
        cy={sizePx / 2}
        r={r}
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * 0.75}
        style={{
          transformOrigin: 'center',
          animation: 'loader-spin 0.8s linear infinite',
        }}
      />
    </svg>
  );
}

export function DotsVariant({ color, sizePx }: VariantProps) {
  const dotSize = sizePx * 0.32;
  const gap = sizePx * 0.12;

  return (
    <div
      aria-hidden="true"
      style={{ display: 'flex', alignItems: 'center', gap }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            display: 'block',
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            backgroundColor: color,
            animation: `loader-bounce-dot 1.2s ease-in-out ${i * 0.16}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export function BarsVariant({ color, sizePx }: VariantProps) {
  const barCount = 5;
  const barWidth = sizePx * 0.14;
  const barHeight = sizePx * 0.8;
  const gap = sizePx * 0.08;

  return (
    <div
      aria-hidden="true"
      style={{ display: 'flex', alignItems: 'center', gap }}
    >
      {Array.from({ length: barCount }).map((_, i) => (
        <span
          key={i}
          style={{
            display: 'block',
            width: barWidth,
            height: barHeight,
            borderRadius: barWidth / 2,
            backgroundColor: color,
            transformOrigin: 'center bottom',
            animation: `loader-bar-scale 1.2s ease-in-out ${i * 0.1}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export function PulseVariant({ color, sizePx }: VariantProps) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'block',
        width: sizePx * 0.9,
        height: sizePx * 0.9,
        borderRadius: '50%',
        backgroundColor: color,
        animation: 'loader-pulse 1.4s ease-in-out infinite',
        flexShrink: 0,
      }}
    />
  );
}

export function RingVariant({ color, sizePx }: VariantProps) {
  const stroke = Math.max(3, Math.round(sizePx * 0.1));
  const r = (sizePx - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;

  return (
    <svg
      width={sizePx}
      height={sizePx}
      viewBox={`0 0 ${sizePx} ${sizePx}`}
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <circle
        cx={sizePx / 2}
        cy={sizePx / 2}
        r={r}
        stroke={color}
        strokeWidth={stroke}
        strokeOpacity={0.15}
      />
      <circle
        cx={sizePx / 2}
        cy={sizePx / 2}
        r={r}
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        style={{
          transformOrigin: 'center',
          animation:
            'loader-ring-spin 1.6s linear infinite, loader-ring-arc 1.6s ease-in-out infinite',
        }}
      />
    </svg>
  );
}

export function WaveVariant({ color, sizePx }: VariantProps) {
  const barCount = 5;
  const barWidth = sizePx * 0.14;
  const barHeight = sizePx * 0.85;
  const gap = sizePx * 0.07;

  return (
    <div
      aria-hidden="true"
      style={{ display: 'flex', alignItems: 'center', gap }}
    >
      {Array.from({ length: barCount }).map((_, i) => (
        <span
          key={i}
          style={{
            display: 'block',
            width: barWidth,
            height: barHeight,
            borderRadius: barWidth / 2,
            backgroundColor: color,
            transformOrigin: 'center center',
            animation: `loader-wave 1s ease-in-out ${((i - 2) * 0.1).toFixed(1)}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export function BounceVariant({ color, sizePx }: VariantProps) {
  const dotSize = sizePx * 0.35;
  const gap = sizePx * 0.1;

  return (
    <div
      aria-hidden="true"
      style={{ display: 'flex', alignItems: 'flex-end', gap }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            display: 'block',
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            backgroundColor: color,
            animation: `loader-bounce-dot 1s ease-in-out ${i * 0.15}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export function OrbitVariant({ color, sizePx }: VariantProps) {
  const centerDot = sizePx * 0.2;
  const orbitDot = sizePx * 0.15;
  const orbitRadius = sizePx * 0.3;

  return (
    <div
      aria-hidden="true"
      style={{ position: 'relative', width: sizePx, height: sizePx, flexShrink: 0 }}
    >
      <span
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: centerDot,
          height: centerDot,
          borderRadius: '50%',
          backgroundColor: color,
          opacity: 0.5,
          transform: 'translate(-50%, -50%)',
        }}
      />
      <span
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: orbitRadius * 2,
          height: orbitRadius * 2,
          marginTop: -orbitRadius,
          marginLeft: -orbitRadius,
          animation: 'loader-orbit 1s linear infinite',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            marginLeft: -(orbitDot / 2),
            marginTop: -(orbitDot / 2),
            width: orbitDot,
            height: orbitDot,
            borderRadius: '50%',
            backgroundColor: color,
          }}
        />
      </span>
    </div>
  );
}

export function RippleVariant({ color, sizePx }: VariantProps) {
  const ringStyle = (delay: string): CSSProperties => ({
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    border: `${Math.max(2, sizePx * 0.07)}px solid ${color}`,
    animation: `loader-ripple 1.4s cubic-bezier(0.2,0.6,0.4,1) ${delay} infinite`,
  });

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'relative',
        width: sizePx,
        height: sizePx,
        flexShrink: 0,
      }}
    >
      <span style={ringStyle('0s')} />
      <span style={ringStyle('0.5s')} />
    </div>
  );
}