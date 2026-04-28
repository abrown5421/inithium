declare module 'trianglify' {
  interface Options {
    width?: number;
    height?: number;
    cell_size?: number;
    variance?: number;
    seed?: string | number | null;
    x_colors?: string | string[];
    y_colors?: string | string[] | 'match';
    fill?: boolean;
    stroke_width?: number;
    points?: number[][];
  }

  interface Pattern {
    opts: Options;
    toSVG(): SVGElement;
    toCanvas(): HTMLCanvasElement;
    toSVGDataUri(): string;
  }

  function trianglify(options?: Options): Pattern;
  export = trianglify;
}