import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const ROOT = fileURLToPath(new URL('../', import.meta.url));
export const OUTPUT = resolve(ROOT, 'dist');
export const PUBLIC_FILES = ['index.html', 'styles.css', 'data.js', 'app.js'];
