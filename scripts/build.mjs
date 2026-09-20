import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import assert from 'node:assert/strict';
import { ROOT, OUTPUT, PUBLIC_FILES } from './project.mjs';
import './check.mjs';

// Delete only the fixed generated-output directory inside this project.
assert.equal(dirname(OUTPUT), resolve(ROOT));
assert.equal(OUTPUT, resolve(ROOT, 'dist'));
await rm(OUTPUT, { recursive: true, force: true });
await mkdir(OUTPUT, { recursive: true });
for (const path of [...PUBLIC_FILES, 'assets']) {
  await cp(resolve(ROOT, path), resolve(OUTPUT, path), { recursive: true });
}
await writeFile(resolve(OUTPUT, '.nojekyll'), '');
console.log('Built dist/ with public files only.');
