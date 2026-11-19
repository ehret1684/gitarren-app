import { Platform } from 'react-native';

/** Build-Kennung: Web = Zeitstempel (von build-web.mjs in index.html geschrieben), APK = GitHub-Laufnummer (EXPO_PUBLIC_BUILD im Workflow). */
export const BUILD: string =
  Platform.OS === 'web' ? String((globalThis as any).__BUILD__ ?? '') : String(process.env.EXPO_PUBLIC_BUILD ?? '');

import { checkUpdate as check, UpdateInfo } from './logic/updateCheck';
export type { UpdateInfo };

export const checkUpdate = (): Promise<UpdateInfo | null> => check(fetch, BUILD, Platform.OS === 'web');
