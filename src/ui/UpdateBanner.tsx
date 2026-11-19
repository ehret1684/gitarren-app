import React, { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, Text, View } from 'react-native';
import { checkUpdate, UpdateInfo } from '../update';
import { C } from './theme';

export function UpdateBanner() {
  const [info, setInfo] = useState<UpdateInfo | null>(null);

  useEffect(() => {
    let alive = true;
    const run = () => checkUpdate().then((u) => alive && u && setInfo(u));
    run();
    const t = setInterval(run, 30 * 60 * 1000);
    const doc: any = Platform.OS === 'web' ? (globalThis as any).document : null;
    const vis = () => { if (doc?.visibilityState === 'visible') run(); };
    doc?.addEventListener?.('visibilitychange', vis);
    return () => {
      alive = false;
      clearInterval(t);
      doc?.removeEventListener?.('visibilitychange', vis);
    };
  }, []);

  if (!info) return null;
  const apply = () => {
    if (info.url) Linking.openURL(info.url).catch(() => {});
    else (globalThis as any).location?.reload();
  };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.accent, paddingVertical: 8, paddingHorizontal: 14 }}>
      <Text style={{ flex: 1, color: '#1a1208', fontWeight: '600' }}>{info.label}</Text>
      <Pressable onPress={apply} style={{ paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#1a1208', borderRadius: 8 }}>
        <Text style={{ color: C.accent, fontWeight: '700' }}>{info.url ? 'Herunterladen' : 'Aktualisieren'}</Text>
      </Pressable>
      <Pressable onPress={() => setInfo(null)} style={{ paddingLeft: 12 }}>
        <Text style={{ color: '#1a1208', fontSize: 18 }}>×</Text>
      </Pressable>
    </View>
  );
}
