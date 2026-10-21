import { useEffect, useRef, useState } from 'react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import type { Chart as ChartJs, ChartConfiguration, ChartDataset } from 'chart.js';
import type { ColorValue } from '@inithium/shared-contracts';
import { Container } from '@inithium/shared-ui-components';
import { bodyFontFamily, readColors, rgbaCss, type Rgba } from './chart-colors.service';

/** One line or set of bars: its name, a value for each of the chart's labels, and its colour. */
export type ChartSeries = {
  label: string;
  data: number[];
  /** Default: the theme's brand colours in turn, from primary. */
  color?: ColorValue;
};

export type ChartProps = {
  /** Names the chart for screen readers, and captions its table, e.g. 'Members over the past month'. */
  label: string;
  /** The x axis: one label per value, e.g. dates. */
  labels: string[];
  series: ChartSeries[];
  /** Default 'line'. */
  type?: 'line' | 'bar';
  /** Height in px, or 'full' to fill a parent that has a height. Default 240. */
  height?: number | 'full';
  /** Fills the area under each line. */
  area?: boolean;
  /** Shows each series' name above the chart. Default: when there's more than one. */
  legend?: boolean;
  /** How values are written on the y axis, in tooltips and in the table. Default: the viewer's number format. */
  formatValue?: (value: number) => string;
};

const SERIES_COLORS: ColorValue[] = ['primary', 'secondary', 'tertiary', 'quaternary', 'accent'];

// Chart.js is loaded the first time a chart draws, so pages without charts never download it.
let chartJs: Promise<typeof import('chart.js')> | undefined;
function loadChartJs() {
  return (chartJs ??= import('chart.js').then((module) => {
    const { Chart, LineController, LineElement, PointElement, BarController, BarElement, CategoryScale, LinearScale, Filler, Tooltip, Legend } = module;
    Chart.register(LineController, LineElement, PointElement, BarController, BarElement, CategoryScale, LinearScale, Filler, Tooltip, Legend);
    return module;
  }));
}

/** Changes whenever the colours may have: the colour scheme switches or the theme's stylesheet changes. */
function useThemeVersion(): number {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const bump = () => setVersion((current) => current + 1);
    const observer = new MutationObserver(bump);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'style', 'class'] });
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);
  return version;
}

const defaultFormat = (value: number) => value.toLocaleString();

function buildConfig(host: HTMLElement, props: Required<Pick<ChartProps, 'type' | 'labels' | 'series' | 'area' | 'formatValue'>> & { legend: boolean }): ChartConfiguration<'line' | 'bar'> {
  const { type, labels, series, area, legend, formatValue } = props;
  const theme = readColors(host, {
    text: { color: 'surface', intensity: 700 },
    grid: { color: 'surface', intensity: 500, opacity: 25 },
    tooltip: { color: 'surface', intensity: 900 },
    tooltipText: { color: 'surface', intensity: 100 },
  });
  const seriesColors: Rgba[] = Object.values(
    readColors(host, Object.fromEntries(series.map((entry, index) => [index, entry.color ?? SERIES_COLORS[index % SERIES_COLORS.length] ?? 'primary']))),
  );
  const font = { family: bodyFontFamily(host), size: 12 };
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  const datasets = series.map((entry, index): ChartDataset<'line' | 'bar'> => {
    const color = seriesColors[index] ?? theme.text;
    return {
      label: entry.label,
      data: entry.data,
      borderColor: rgbaCss(color),
      backgroundColor: type === 'bar' ? rgbaCss(color) : rgbaCss(color, 0.15),
      borderWidth: 2,
      ...(type === 'line'
        ? { fill: area, tension: 0.3, pointRadius: entry.data.length > 40 ? 0 : 3, pointHoverRadius: 5, pointBackgroundColor: rgbaCss(color) }
        : { borderRadius: 4, borderWidth: 0 }),
    } as ChartDataset<'line' | 'bar'>;
  });

  return {
    type,
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: reducedMotion ? false : { duration: 300 },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: legend, labels: { color: rgbaCss(theme.text), font, boxWidth: 12 } },
        tooltip: {
          backgroundColor: rgbaCss(theme.tooltip),
          titleColor: rgbaCss(theme.tooltipText),
          bodyColor: rgbaCss(theme.tooltipText),
          titleFont: { ...font, weight: 'bold' },
          bodyFont: font,
          padding: 8,
          cornerRadius: 6,
          callbacks: { label: (item) => `${item.dataset.label ?? ''}: ${formatValue(Number(item.raw))}` },
        },
      },
      scales: {
        x: { grid: { display: false }, border: { color: rgbaCss(theme.grid) }, ticks: { color: rgbaCss(theme.text), font, maxRotation: 0, autoSkip: true, autoSkipPadding: 12 } },
        y: {
          beginAtZero: true,
          grid: { color: rgbaCss(theme.grid) },
          border: { display: false },
          ticks: { color: rgbaCss(theme.text), font, precision: 0, callback: (value) => formatValue(Number(value)) },
        },
      },
    },
  };
}

/**
 * A line or bar chart (decision 0120): Chart.js, loaded on demand and drawn in the theme's colours, redrawn when the
 * colour scheme or theme changes. The canvas is hidden from screen readers, which read a table of the same values
 * instead. Never use Chart.js directly; extend this.
 */
export function Chart({ label, labels, series, type = 'line', height = 240, area = false, legend, formatValue = defaultFormat }: ChartProps) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const chart = useRef<ChartJs<'line' | 'bar'> | null>(null);
  const [ready, setReady] = useState(0);
  const themeVersion = useThemeVersion();
  const showLegend = legend ?? series.length > 1;

  // A new chart when the type changes; Chart.js can't switch an existing one.
  useEffect(() => {
    let cancelled = false;
    void loadChartJs().then(({ Chart: ChartJsClass }) => {
      if (cancelled || !canvas.current || !host.current) return;
      chart.current = new ChartJsClass(canvas.current, buildConfig(host.current, { type, labels: [], series: [], area, legend: showLegend, formatValue }));
      setReady((count) => count + 1);
    });
    return () => {
      cancelled = true;
      chart.current?.destroy();
      chart.current = null;
    };
    // The data is drawn by the effect below, once the chart exists.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  useEffect(() => {
    if (!chart.current || !host.current) return;
    const next = buildConfig(host.current, { type, labels, series, area, legend: showLegend, formatValue });
    chart.current.data = next.data;
    chart.current.options = next.options ?? {};
    chart.current.update();
  }, [ready, type, labels, series, area, showLegend, formatValue, themeVersion]);

  return (
    <Container ref={host} position={{ type: 'relative' }} width="full" height={height === 'full' ? 'full' : height} minHeight={0}>
      {/* Plain canvas: Chart.js draws into it (decision 0092 allows elements no component can express). */}
      <canvas ref={canvas} aria-hidden="true" />
      <VisuallyHidden.Root asChild>
        {/* Plain table: read by screen readers only, never drawn. */}
        <table>
          <caption>{label}</caption>
          <thead>
            <tr>
              <th scope="col" />
              {series.map((entry) => (
                <th key={entry.label} scope="col">
                  {entry.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {labels.map((row, index) => (
              <tr key={`${row}-${index}`}>
                <th scope="row">{row}</th>
                {series.map((entry) => (
                  <td key={entry.label}>{entry.data[index] === undefined ? '' : formatValue(entry.data[index])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </VisuallyHidden.Root>
    </Container>
  );
}
