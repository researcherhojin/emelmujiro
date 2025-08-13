// Polyfills required for MSW in Node.js environment
import { TextEncoder, TextDecoder } from 'util';
import { TransformStream } from 'stream/web';

// Type augmentation for global object
declare global {
  var TextEncoder: typeof globalThis.TextEncoder;
  var TextDecoder: typeof globalThis.TextDecoder;
  var TransformStream: typeof globalThis.TransformStream;
}

// Set global TextEncoder and TextDecoder for MSW
if (typeof global !== 'undefined') {
  global.TextEncoder = TextEncoder as unknown as typeof globalThis.TextEncoder;
  global.TextDecoder = TextDecoder as unknown as typeof globalThis.TextDecoder;
  global.TransformStream =
    TransformStream as unknown as typeof globalThis.TransformStream;
}

export {};
