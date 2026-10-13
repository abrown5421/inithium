// wawoff2 ships no types: it converts TTF/OTF fonts to WOFF2 with WebAssembly.
declare module 'wawoff2' {
  export function compress(buffer: Uint8Array): Promise<Uint8Array>;
  export function decompress(buffer: Uint8Array): Promise<Uint8Array>;
}
