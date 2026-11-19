// Native Spracheingabe (Android/iOS) ueber expo-speech-recognition. Web: siehe nativeSpeech.web.ts.
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

export const nativeSpeechAvailable = true;

/** Hoert einmal zu und liefert den erkannten Satz. Gibt eine Stopp-Funktion zurueck. */
export async function startNativeSpeech(h: { onText: (t: string) => void; onEnd: () => void; onError: (msg: string) => void }): Promise<() => void> {
  const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
  if (!perm.granted) {
    h.onError('Mikrofon oder Spracherkennung nicht erlaubt.');
    h.onEnd();
    return () => {};
  }
  const subs = [
    ExpoSpeechRecognitionModule.addListener('result', (e: any) => {
      const t: string = e.results?.[0]?.transcript ?? '';
      if (t && e.isFinal) h.onText(t);
    }),
    ExpoSpeechRecognitionModule.addListener('error', (e: any) => h.onError(e.message || 'Spracheingabe fehlgeschlagen.')),
    ExpoSpeechRecognitionModule.addListener('end', () => {
      subs.forEach((s) => s.remove());
      h.onEnd();
    }),
  ];
  ExpoSpeechRecognitionModule.start({ lang: 'de-DE', interimResults: false, continuous: false });
  return () => ExpoSpeechRecognitionModule.stop();
}
