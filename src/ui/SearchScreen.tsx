import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song } from '../logic/practice';
import { AiError, aiSearch, localSearch } from '../logic/aiSearch';
import { C, s } from './theme';

const K_KEY = 'gitarren.apikey.v1';

const speechCtor = (): any =>
  Platform.OS === 'web' ? (globalThis as any).SpeechRecognition || (globalThis as any).webkitSpeechRecognition : undefined;

export function SearchScreen({ have, onAdd, onClose }: { have: Set<string>; onAdd: (s: Song) => void; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [added, setAdded] = useState<Song[]>([]);
  const [rest, setRest] = useState<Song[]>([]);
  const [rec, setRec] = useState(false);
  const recRef = useRef<any>(null);
  const hasVoice = !!speechCtor();

  useEffect(() => {
    AsyncStorage.getItem(K_KEY).then((k) => { if (k) setKey(k); else setShowKey(true); }).catch(() => {});
    return () => recRef.current?.stop?.();
  }, []);

  const saveKey = (v: string) => {
    setKey(v);
    AsyncStorage.setItem(K_KEY, v.trim()).catch(() => {});
  };

  const run = async (query: string) => {
    const text = query.trim();
    if (!text) return;
    setBusy(true);
    setMsg('');
    setAdded([]);
    setRest([]);
    try {
      let found = localSearch(text);
      let via = 'eingebauter Bestand';
      if (!found.length || key) {
        if (!key) {
          setMsg('Nichts im eingebauten Bestand. Trage unten einen API-Schluessel ein, dann sucht die KI weiter.');
          setShowKey(true);
          return;
        }
        found = await aiSearch(text, key);
        via = 'KI';
      }
      if (!found.length) {
        setMsg('Kein passendes Lied gefunden. Formuliere es anders, z. B. mit Titel und Interpret.');
        return;
      }
      const fresh = found.filter((x) => !have.has(x.id));
      const [first, ...others] = fresh;
      const take = first ? [first] : [];
      take.forEach(onAdd);
      setAdded(take);
      setRest(others);
      setMsg(
        first
          ? `Gefunden per ${via} und in deine Lieder uebernommen.`
          : 'Alle Treffer sind schon in deinen Liedern.',
      );
    } catch (e) {
      setMsg(e instanceof AiError ? e.message : 'Keine Verbindung - die KI-Suche braucht Internet.');
    } finally {
      setBusy(false);
    }
  };

  const listen = () => {
    const R = speechCtor();
    if (!R) return;
    if (rec) {
      recRef.current?.stop?.();
      return;
    }
    const r = new R();
    r.lang = 'de-DE';
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onresult = (ev: any) => {
      const t: string = ev.results?.[0]?.[0]?.transcript ?? '';
      setQ(t);
      run(t);
    };
    r.onerror = (ev: any) => setMsg(ev.error === 'not-allowed' ? 'Mikrofon nicht erlaubt.' : 'Spracheingabe fehlgeschlagen.');
    r.onend = () => setRec(false);
    recRef.current = r;
    setRec(true);
    r.start();
  };

  return (
    <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={s.pad} keyboardShouldPersistTaps="handled">
        <Text style={s.h1}>Lied suchen</Text>
        <Text style={[s.dim, { marginBottom: 10 }]}>
          Titel, Textzeile oder Wunsch eingeben oder sprechen, z. B. „Lagerfeuerlied mit drei Akkorden“. Der beste Treffer kommt automatisch in deine Lieder.
        </Text>
        <TextInput
          style={s.input}
          value={q}
          onChangeText={setQ}
          placeholder="Was moechtest du spielen?"
          placeholderTextColor={C.dim}
          onSubmitEditing={() => run(q)}
          returnKeyType="search"
        />
        <View style={[s.row, { marginBottom: 10 }]}>
          <Pressable style={[s.btn, { flex: 1, opacity: busy ? 0.5 : 1 }]} disabled={busy} onPress={() => run(q)}>
            <Text style={s.btnTxt}>{busy ? 'Suche ...' : 'Suchen'}</Text>
          </Pressable>
          {hasVoice && (
            <Pressable style={[s.btn2, { marginLeft: 8, borderColor: rec ? C.warn : C.line }]} onPress={listen}>
              <Text style={s.btn2Txt}>{rec ? 'Hoere zu ...' : 'Sprechen'}</Text>
            </Pressable>
          )}
        </View>
        {!hasVoice && <Text style={[s.dim, { marginBottom: 8 }]}>Spracheingabe gibt es nur in der Web-App mit Chrome oder Safari.</Text>}
        {!!msg && <Text style={[s.text, { marginBottom: 10 }]}>{msg}</Text>}
        {added.map((x) => (
          <View key={x.id} style={[s.card, { borderColor: C.ok }]}>
            <Text style={s.h2}>✓ {x.title}</Text>
            <Text style={s.dim}>{x.artist}</Text>
          </View>
        ))}
        {rest.length > 0 && <Text style={[s.dim, { marginBottom: 6 }]}>Weitere Treffer:</Text>}
        {rest.map((x) => (
          <Pressable
            key={x.id}
            style={s.card}
            onPress={() => {
              onAdd(x);
              setAdded((a) => [...a, x]);
              setRest((r) => r.filter((y) => y.id !== x.id));
            }}
          >
            <Text style={s.h2}>+ {x.title}</Text>
            <Text style={s.dim}>{x.artist}</Text>
          </Pressable>
        ))}
        <Pressable onPress={() => setShowKey((v) => !v)} style={{ marginTop: 14 }}>
          <Text style={{ color: C.accent }}>{key ? 'KI aktiv - API-Schluessel aendern' : 'KI aktivieren (API-Schluessel)'}</Text>
        </Pressable>
        {showKey && (
          <View style={{ marginTop: 8 }}>
            <TextInput
              style={s.input}
              value={key}
              onChangeText={saveKey}
              placeholder="sk-ant-..."
              placeholderTextColor={C.dim}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={s.dim}>
              Der Schluessel wird nur auf diesem Geraet gespeichert und direkt an Anthropic geschickt. Schluessel unter console.anthropic.com erstellen und ein kleines Limit setzen. Bei geschuetzten Liedern liefert die KI nur die Akkordfolge, nicht den Text.
            </Text>
          </View>
        )}
        <Pressable style={[s.btn2, { marginTop: 16 }]} onPress={onClose}>
          <Text style={s.btn2Txt}>Fertig</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
