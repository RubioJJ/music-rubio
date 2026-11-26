import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'module.json'), 'utf8'));
const moduleId = manifest.id;
const labels = {
  musicas: 'Músicas', 'musica-ambiente': 'Música Ambiente', medieval: 'Medieval',
  urbano: 'Urbano', 'ficcao-cientifica': 'Ficção Científica', steampunk: 'Steampunk',
  terror: 'Terror', suspense: 'Suspense', combate: 'Combate', exploracao: 'Exploração',
  background: 'Background', misterio: 'Mistério', tavernas: 'Tavernas',
  'corte-bailes': 'Corte e Bailes', 'terror-necromancia': 'Terror e Necromancia',
  'magia-planos': 'Magia e Planos', florestas: 'Florestas', templos: 'Templos',
  laboratorios: 'Laboratórios', masmorras: 'Masmorras', 'cidades-vilas': 'Cidades e Vilas',
};
const label = key => labels[key] ?? key.replaceAll('-', ' ').replace(/^./u, c => c.toUpperCase());
const id = key => crypto.createHash('sha256').update(`${moduleId}:${key}`).digest('hex').slice(0, 16);
const extensions = /\.(mp3|ogg|opus|wav|flac|webm)$/i;
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;

export function scanAudio(projectRoot, { allowEmpty = false } = {}) {
  const audio = path.join(projectRoot, 'audio');
  const tracks = [];
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => compare(a.name, b.name))) {
      const full = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Link simbólico não permitido: ${full}`);
      if (entry.isDirectory()) { walk(full); continue; }
      if (!extensions.test(entry.name)) continue;
      const relative = path.relative(audio, full).split(path.sep).join('/');
      const segments = relative.split('/');
      const [type, category] = segments;
      if (!['musicas', 'musica-ambiente'].includes(type)
          || !category || segments.length !== (category === 'medieval' ? 4 : 3)) {
        throw new Error(`Pasta inválida: audio/${relative}. Somente medieval admite subcategoria.`);
      }
      const prefix = Buffer.alloc(128);
      const fd = fs.openSync(full, 'r');
      let bytes;
      try { bytes = fs.readSync(fd, prefix, 0, prefix.length, 0); }
      finally { fs.closeSync(fd); }
      if (prefix.subarray(0, bytes).toString().startsWith('version https://git-lfs.github.com/spec/v1')) {
        throw new Error(`Baixe o objeto LFS antes de compilar: audio/${relative}`);
      }
      tracks.push({ relative, type, category, group: segments.slice(0, -1).join('/') });
    }
  }
  walk(audio);
  if (!allowEmpty && !tracks.length) throw new Error('Nenhum áudio encontrado.');
  return tracks;
}

export function createPlaylistDocuments(tracks, version = manifest.version) {
  const folders = new Map();
  function folder(key, name, parent = null) {
    if (!folders.has(key)) {
      const folderId = id(`folder:${key}`);
      folders.set(key, { _id: folderId, _key: `!folders!${folderId}`, name, type: 'Playlist',
        folder: parent, sorting: 'a', sort: 0, color: null, description: '', flags: {} });
    }
    return folders.get(key)._id;
  }
  const groups = new Map();
  if (!tracks.length) {
    folder('musicas', label('musicas'));
    folder('musica-ambiente', label('musica-ambiente'));
  }
  for (const track of tracks) {
    if (!groups.has(track.group)) groups.set(track.group, []);
    groups.get(track.group).push(track);
  }
  const playlists = [...groups.entries()].sort(([a], [b]) => compare(a, b)).map(([group, entries], index) => {
    const playlistId = id(`playlist:${group}`);
    const ambient = entries[0].type === 'musica-ambiente';
    const channel = ambient ? 'environment' : 'music';
    let folderId = folder(entries[0].type, label(entries[0].type));
    if (entries[0].category === 'medieval') {
      folderId = folder(`${entries[0].type}/medieval`, 'Medieval', folderId);
    }
    return {
      _id: playlistId, _key: `!playlists!${playlistId}`,
      name: group.split('/').map(label).join(' / '),
      description: 'Gerada automaticamente a partir das pastas do Everest Kitchen Music Pack.',
      folder: folderId, channel, mode: ambient ? -1 : 0, playing: false,
      sorting: 'a', sort: (index + 1) * 100000, fade: 1000, seed: 0,
      ownership: { default: 0 }, flags: { [moduleId]: { sourcePlaylistId: playlistId, group, syncedVersion: version } },
      sounds: [...entries].sort((a, b) => compare(a.relative, b.relative)).map((track, soundIndex) => {
        const soundId = id(`sound:${track.relative}`);
        const fileName = track.relative.split('/').at(-1);
        // Escapa inclusive #, espaços e Unicode, preservando os separadores do caminho.
        const source = ['modules', moduleId, 'audio', ...track.relative.split('/')].map(encodeURIComponent).join('/');
        return {
          _id: soundId, _key: `!playlists.sounds!${playlistId}.${soundId}`,
          name: fileName.replace(extensions, ''), path: source, channel,
          volume: 0.5, repeat: ambient, playing: false, pausedTime: 0,
          fade: 1000, sort: (soundIndex + 1) * 100000, description: '',
          flags: { [moduleId]: { sourceSoundId: soundId, sourceName: fileName.replace(extensions, '') } },
        };
      }),
    };
  });
  return { playlists, folders: [...folders.values()] };
}

export async function generatePlaylists(projectRoot = root, { version, allowEmpty = false } = {}) {
  const tracks = scanAudio(projectRoot, { allowEmpty });
  const { compilePack } = await import('@foundryvtt/foundryvtt-cli');
  version ??= manifest.version;
  const { playlists, folders } = createPlaylistDocuments(tracks, version);
  const generated = path.join(projectRoot, '.generated');
  fs.mkdirSync(generated, { recursive: true });
  const source = fs.mkdtempSync(path.join(generated, 'playlists-'));
  for (const doc of [...folders, ...playlists]) {
    fs.writeFileSync(path.join(source, `${doc._id}.json`), JSON.stringify(doc, null, 2) + '\n');
  }
  const destination = path.join(projectRoot, 'packs', 'musicas');
  try {
    await compilePack(source, destination);
  } finally {
    fs.rmSync(source, { recursive: true, force: true });
  }
  console.log(`Compêndio gerado: ${playlists.length} playlists, ${tracks.length} faixas e ${folders.length} pastas.`);
  return { playlists, folders, tracks, destination };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await generatePlaylists(root, { allowEmpty: process.argv.includes('--allow-empty') });
}
