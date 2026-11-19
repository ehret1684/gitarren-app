// Im Web gibt es keine OTA-Updates (dort greift version.json); der Stub haelt expo-updates aus dem Web-Bundle.
export async function fetchOta(): Promise<boolean> {
  return false;
}
export const applyOta = async (): Promise<void> => {};
