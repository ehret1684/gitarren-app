// Over-the-air-Update (nur native App): neuen JS-Stand im Hintergrund holen, per Neustart aktivieren. Web: otaUpdate.web.ts (Stub).
import * as Updates from 'expo-updates';

/** true, wenn ein neuer Stand geladen wurde und nur noch aktiviert werden muss. Fehler/offline/Entwicklung = false. */
export async function fetchOta(): Promise<boolean> {
  try {
    if (!Updates.isEnabled) return false;
    const r = await Updates.checkForUpdateAsync();
    if (!r.isAvailable) return false;
    await Updates.fetchUpdateAsync();
    return true;
  } catch {
    return false;
  }
}

export const applyOta = (): Promise<void> => Updates.reloadAsync();
