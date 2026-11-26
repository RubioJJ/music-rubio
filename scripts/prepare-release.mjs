import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(readFileSync(path.join(root, 'module.json'), 'utf8'));
const { SERVER_URL, REPOSITORY, RELEASE_NUMBER } = process.env;
if (!SERVER_URL || !REPOSITORY || !/^[1-9]\d*$/.test(RELEASE_NUMBER ?? '')) {
  throw new Error('Informe SERVER_URL, REPOSITORY e RELEASE_NUMBER.');
}

const version = `1.0.${RELEASE_NUMBER}`;
const url = `${SERVER_URL}/${REPOSITORY}`;
const archive = `${manifest.id}.module.zip`;
const published = {
  ...manifest,
  version,
  url,
  manifest: `${url}/releases/latest/download/module.json`,
  download: `${url}/releases/download/v${version}/${archive}`,
};

const dist = path.join(root, 'dist');
const destination = path.join(dist, manifest.id);
mkdirSync(destination, { recursive: true });
cpSync(path.join(root, 'audio'), path.join(destination, 'audio'), { recursive: true });
cpSync(path.join(root, 'packs'), path.join(destination, 'packs'), { recursive: true });
const json = JSON.stringify(published, null, 2) + '\n';
writeFileSync(path.join(destination, 'module.json'), json);
writeFileSync(path.join(dist, 'module.json'), json);
console.log(manifest.id);
