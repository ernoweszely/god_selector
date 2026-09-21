import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';
import { ROOT, PUBLIC_FILES } from './project.mjs';

const read = path => readFile(resolve(ROOT, path), 'utf8');
const scripts = (await readdir(resolve(ROOT, 'scripts'))).filter(name => name.endsWith('.mjs'));
for (const path of ['data.js', 'app.js', ...scripts.map(name => `scripts/${name}`)]) {
  const result = spawnSync(process.execPath, ['--check', resolve(ROOT, path)], { encoding: 'utf8' });
  assert.equal(result.status, 0, `Syntax error in ${path}: ${result.stderr || result.error || ''}`);
}

// Evaluate only our data definitions, without loading browser UI code.
const data = vm.runInNewContext(`${await read('data.js')}\n({ PANTHEONS, STATS, ACTIVE_COOLDOWN_HOURS, icons });`, {}, { timeout: 1000 });
async function listAssets(dir = 'assets') {
  const entries = await readdir(resolve(ROOT, dir), { withFileTypes: true });
  const paths = await Promise.all(entries.map(entry => {
    const path = `${dir}/${entry.name}`;
    return entry.isDirectory() ? listAssets(path) : [path];
  }));
  return paths.flat();
}
const assets = new Set(await listAssets());
const usedImages = new Set();
const pantheonIds = new Set();
const statIds = new Set(data.STATS.map(stat => stat.id));
assert.equal(statIds.size, data.STATS.length, 'Stat IDs must be unique');

function checkImage(path) {
  if (!path) return;
  assert(assets.has(path), `Missing image or filename case mismatch: ${path}`);
  usedImages.add(path);
}

for (const pantheon of data.PANTHEONS) {
  assert(!pantheonIds.has(pantheon.id), `Duplicate pantheon: ${pantheon.id}`);
  pantheonIds.add(pantheon.id);
  assert(data.icons[pantheon.icon], `Missing icon for ${pantheon.name}`);
  assert.equal(pantheon.rounds.length, 3, `${pantheon.name} needs three rounds`);
  checkImage(pantheon.image);
  const godNames = new Set();
  for (const round of pantheon.rounds) {
    assert.equal(round.length, 3, `${pantheon.name} needs three choices in each round`);
    for (const god of round) {
      assert(god.name && !godNames.has(god.name), `Missing or duplicate god in ${pantheon.name}`);
      godNames.add(god.name);
      assert(data.icons[god.icon], `Missing icon for ${god.name}`);
      checkImage(god.image);
      for (const [id, value] of Object.entries(god.stats)) {
        assert(statIds.has(id) && Number.isFinite(value), `Invalid stat ${id} for ${god.name}`);
      }
      if (god.active || pantheon.id === 'greek') {
        assert(god.role && god.active?.name && god.active?.description, `Incomplete active ability for ${god.name}`);
        assert(god.passive?.name && god.passive?.description && god.passive?.summary, `Incomplete passive for ${god.name}`);
        assert.equal(god.active.cooldownHours, 24, `${god.name} must have a 24h cooldown`);
        assert.equal(Object.keys(god.stats).length, 0, `${god.name} still has sample stats`);
        checkImage(god.active.icon);
        checkImage(god.passive.icon);
      }
    }
  }
}
assert.equal(data.ACTIVE_COOLDOWN_HOURS, 24);
for (const path of usedImages) {
  if (!path.endsWith('.png')) continue;
  const bytes = await readFile(resolve(ROOT, path));
  assert(bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), `Invalid PNG: ${path}`);
  if (!path.includes('/abilities/')) {
    assert.equal(bytes.readUInt32BE(20), bytes.readUInt32BE(16) * 2, `Banner must be 1:2: ${path}`);
  }
}

const html = await read('index.html');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(ids.length, new Set(ids).size, 'Duplicate HTML IDs');
for (const [, id] of (await read('app.js')).matchAll(/\$\('([^']+)'\)/g)) {
  assert(ids.includes(id), `UI element missing from index.html: ${id}`);
}
assert(html.indexOf('src="data.js"') < html.indexOf('src="app.js"'), 'Load data.js before app.js');
for (const [, path] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  if (/^(?:https?:|data:|#)/.test(path) || path === './') continue;
  assert(PUBLIC_FILES.includes(path) || assets.has(path), `Unknown public file: ${path}`);
  await readFile(resolve(ROOT, path));
}
console.log(`Checks passed: ${pantheonIds.size} pantheons, 27 gods, ${usedImages.size} images, JavaScript syntax and page references.`);
