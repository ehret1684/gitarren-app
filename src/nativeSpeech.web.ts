// Im Web laeuft die Spracheingabe ueber die Browser-API (SearchScreen); dieser Stub haelt das native Modul aus dem Web-Bundle.
export const nativeSpeechAvailable = false;
export async function startNativeSpeech(_h: { onText: (t: string) => void; onEnd: () => void; onError: (msg: string) => void }): Promise<() => void> {
  return () => {};
}
