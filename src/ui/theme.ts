import { StyleSheet } from 'react-native';

export const C = {
  bg: '#14110f',
  card: '#221d19',
  line: '#3a312a',
  text: '#f3ece4',
  dim: '#a39688',
  accent: '#f2a03d',
  chord: '#7fd1a0',
  ok: '#7fd1a0',
  warn: '#e5645a',
};

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  pad: { padding: 16 },
  h1: { color: C.text, fontSize: 24, fontWeight: '700', marginBottom: 12 },
  h2: { color: C.text, fontSize: 17, fontWeight: '600', marginBottom: 6 },
  text: { color: C.text, fontSize: 16 },
  dim: { color: C.dim, fontSize: 14 },
  card: { backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.line },
  row: { flexDirection: 'row', alignItems: 'center' },
  btn: { backgroundColor: C.accent, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center', minHeight: 44, justifyContent: 'center' },
  btnTxt: { color: '#1a1208', fontWeight: '700', fontSize: 16 },
  btn2: { backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, alignItems: 'center', minHeight: 44, justifyContent: 'center' },
  btn2Txt: { color: C.text, fontSize: 15 },
  input: { backgroundColor: C.card, color: C.text, borderRadius: 10, borderWidth: 1, borderColor: C.line, padding: 12, fontSize: 16, marginBottom: 10 },
});
