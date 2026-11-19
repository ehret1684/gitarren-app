// Im Web nutzt mic.ts direkt getUserMedia; dieser Stub haelt die native Bibliothek aus dem Web-Bundle.
export const nativeMicAvailable = false;
export async function startNativePcm(_onChunk: (samples: Float32Array, sampleRate: number) => void): Promise<() => void> {
  throw new Error('nur nativ');
}
