declare module 'trianglify' {
  interface Options {
    width?: number;
    height?: number;
    cellSize?: number;
    variance?: number;
    seed?: string | number | null;
    xColors?: string | string[]; 
    yColors?: string | string[] | 'match';
    fill?: boolean;
    strokeWidth?: number; 
    points?: number[][];
  }

  interface Pattern {
    opts: Options;
    toSVG(options?: any): SVGElement;
    toCanvas(options?: any): HTMLCanvasElement;
  }

  function trianglify(options?: Options): Pattern;
  export default trianglify; 
}