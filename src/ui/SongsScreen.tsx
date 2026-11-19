import React, { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { Song, Status } from '../logic/practice';
import { guessTitle } from '../logic/song';
import { extractFromHtml, isHttpUrl } from '../logic/importer';
import { C, s } from './theme';
import { LibraryScreen } from './LibraryScreen';

export const STATUS_LABEL: Record<Status, string> = { neu: 'Neu', ueben: 'Ueben', kann: 'Kann ich' };
const STATUS_COLOR: Record<Status, string> = { neu: C.dim, ueben: C.accent, kann: C.ok };

export function SongsScreen({ songs, onOpen, onAdd }: { songs: Song[]; onOpen: (id: string) => void; onAdd: (s: Song) => void }) {
  const [adding, setAdding] = useState(false);
  const [lib, setLib] = useState(false);
  const [filter, setFilter] = useState<Status | 'alle'>('alle');
  const list = songs.filter((x) => filter === 'alle' || x.status === filter);

  return (
    <View style={s.screen}>
      <ScrollView contentContainerStyle={s.pad}>
        <Text style={s.h1}>Meine Lieder</Text>
        <View style={[s.row, { marginBottom: 12, flexWrap: 'wrap' }]}>
          {(['alle', 'neu', 'ueben', 'kann'] as const).map((f) => (
            <Pressable key={f} onPress={() => setFilter(f)} style={[s.btn2, { marginRight: 6, marginBottom: 6, borderColor: filter === f ? C.accent : C.line }]}>
              <Text style={s.btn2Txt}>{f === 'alle' ? 'Alle' : STATUS_LABEL[f]}</Text>
            </Pressable>
          ))}
        </View>
        {list.map((x) => (
          <Pressable key={x.id} onPress={() => onOpen(x.id)} style={s.card}>
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.h2}>{x.title}</Text>
                <Text style={s.dim}>{x.artist || 'Unbekannt'}</Text>
              </View>
              <Text style={{ color: STATUS_COLOR[x.status], fontWeight: '600' }}>{STATUS_LABEL[x.status]}</Text>
            </View>
          </Pressable>
        ))}
        {!list.length && <Text style={s.dim}>Keine Lieder in dieser Ansicht.</Text>}
        <Pressable style={[s.btn2, { marginTop: 8 }]} onPress={() => setLib(true)}>
          <Text style={s.btn2Txt}>Weihnachtslieder-Bibliothek</Text>
        </Pressable>
        <Pressable style={[s.btn, { marginTop: 8 }]} onPress={() => setAdding(true)}>
          <Text style={s.btnTxt}>+ Lied hinzufuegen</Text>
        </Pressable>
      </ScrollView>
      {lib && <LibraryScreen have={new Set(songs.map((x) => x.id))} onAdd={(a) => a.forEach(onAdd)} onClose={() => setLib(false)} />}
      {adding && <AddSong onClose={() => setAdding(false)} onAdd={(x) => { onAdd(x); setAdding(false); }} />}
    </View>
  );
}

function AddSong({ onClose, onAdd }: { onClose: () => void; onAdd: (s: Song) => void }) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [source, setSource] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  const fromUrl = async () => {
    if (!isHttpUrl(url)) return Alert.alert('Ungueltige Adresse', 'Bitte eine vollstaendige Adresse mit https:// eingeben.');
    setBusy(true);
    try {
      const r = await fetch(url.trim());
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const { title: t, text } = extractFromHtml(await r.text());
      if (!text) throw new Error('Kein Text gefunden');
      setBody(text);
      setSource(url.trim());
      if (!title && t) setTitle(t.slice(0, 80));
    } catch (e) {
      Alert.alert('Import fehlgeschlagen', `${(e as Error).message}\nSeite blockiert Apps/Browser (CORS) oder braucht JavaScript? Dann Text kopieren und unten einfuegen.`);
    } finally {
      setBusy(false);
    }
  };

  const fromFile = async () => {
    const r = await DocumentPicker.getDocumentAsync({ type: ['text/*', 'application/octet-stream'], copyToCacheDirectory: true });
    if (r.canceled || !r.assets[0]) return;
    const a = r.assets[0];
    const text = Platform.OS === "web" && a.file ? await a.file.text() : await new File(a.uri).text();
    setBody(text);
    const g = guessTitle(text);
    if (g.title) setTitle(g.title);
    if (g.artist) setArtist(g.artist);
    if (!g.title && !title) setTitle(r.assets[0].name.replace(/\.[^.]+$/, ''));
  };

  const save = () => {
    if (!body.trim()) return Alert.alert('Kein Text', 'Bitte Liedtext mit Akkorden einfuegen oder importieren.');
    const g = guessTitle(body);
    onAdd({
      id: String(Date.now()),
      title: title.trim() || g.title || 'Ohne Titel',
      artist: artist.trim() || g.artist || '',
      body,
      status: 'neu',
      bpm: 80,
      source,
    });
  };

  return (
    <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={s.pad} keyboardShouldPersistTaps="handled">
        <Text style={s.h1}>Lied hinzufuegen</Text>
        <TextInput style={s.input} placeholder="Titel" placeholderTextColor={C.dim} value={title} onChangeText={setTitle} />
        <TextInput style={s.input} placeholder="Interpret" placeholderTextColor={C.dim} value={artist} onChangeText={setArtist} />
        <Text style={s.h2}>Aus dem Netz holen</Text>
        <TextInput style={s.input} placeholder="https://..." placeholderTextColor={C.dim} autoCapitalize="none" autoCorrect={false} keyboardType="url" value={url} onChangeText={setUrl} />
        <Pressable style={[s.btn2, { marginBottom: 6 }]} onPress={fromUrl} disabled={busy}>
          <Text style={s.btn2Txt}>{busy ? 'Lade ...' : 'Seite abrufen'}</Text>
        </Pressable>
        <Text style={[s.dim, { marginBottom: 12 }]}>
          Nur fuer deinen privaten Gebrauch. Texte und Akkorde sind meist urheberrechtlich geschuetzt; die App speichert sie nur auf diesem Geraet.
        </Text>
        <Pressable style={[s.btn2, { marginBottom: 12 }]} onPress={fromFile}>
          <Text style={s.btn2Txt}>Datei waehlen (.txt, .cho, .pro)</Text>
        </Pressable>
        <Text style={s.h2}>Text mit Akkorden</Text>
        <TextInput
          style={[s.input, { height: 220, textAlignVertical: 'top', fontFamily: 'monospace' }]}
          multiline
          placeholder={'[C]Text mit [G]Akkorden in Klammern\noder Akkordzeile ueber dem Text'}
          placeholderTextColor={C.dim}
          value={body}
          onChangeText={setBody}
        />
        <Pressable style={s.btn} onPress={save}><Text style={s.btnTxt}>Speichern</Text></Pressable>
        <Pressable style={[s.btn2, { marginTop: 8 }]} onPress={onClose}><Text style={s.btn2Txt}>Abbrechen</Text></Pressable>
      </ScrollView>
    </View>
  );
}
