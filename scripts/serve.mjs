import { createServer } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { resolve, relative, isAbsolute, extname } from 'node:path';
import { parseArgs } from 'node:util';
import { ROOT, OUTPUT, PUBLIC_FILES } from './project.mjs';

const { values } = parseArgs({ options: {
  preview: { type: 'boolean', default: false },
  port: { type: 'string', default: process.env.PORT || '4173' },
  base: { type: 'string', default: '/' }
} });
const port = Number(values.port);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Port must be between 1 and 65535.');
// Accept a bare name so Git Bash does not rewrite it as a Windows filesystem path.
const baseName = values.base.replace(/^\/+|\/+$/g, '');
values.base = baseName ? `/${baseName}/` : '/';
if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(values.base)) throw new Error('Base must be / or a path such as /god_selector/.');
const root = await realpath(values.preview ? OUTPUT : ROOT).catch(() => {
  throw new Error('Build output is missing. Run npm run build before npm run preview.');
});
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml' };
const server = createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  try {
    const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (values.base !== '/' && path === values.base.slice(0, -1)) {
      response.writeHead(301, { Location: values.base }).end();
      return;
    }
    if (!path.startsWith(values.base)) { response.writeHead(404).end('Not found'); return; }
    const name = path.slice(values.base.length) || 'index.html';
    if (!PUBLIC_FILES.includes(name) && !/^assets\/[a-zA-Z0-9_.-]+\.(png|jpe?g|webp|avif|svg)$/.test(name)) {
      response.writeHead(404).end('Not found'); return;
    }
    const file = await realpath(resolve(root, name));
    const relativePath = relative(root, file);
    if (relativePath.startsWith('..') || isAbsolute(relativePath) || !(await stat(file)).isFile()) {
      response.writeHead(404).end('Not found'); return;
    }
    const bytes = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Content-Length': bytes.length, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    response.end(request.method === 'HEAD' ? undefined : bytes);
  } catch (error) {
    response.writeHead(error instanceof URIError ? 400 : 404).end('Not found');
  }
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`Divine Assembly: http://127.0.0.1:${port}${values.base}`));
