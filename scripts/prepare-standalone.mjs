import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const standalone = join('.next', 'standalone');

if (!existsSync(join(standalone, 'server.js'))) {
  throw new Error('No se ha generado el servidor standalone.');
}

mkdirSync(join(standalone, '.next'), { recursive: true });

if (existsSync('public')) {
  cpSync('public', join(standalone, 'public'), {
    recursive: true,
    force: true,
  });
}

cpSync(join('.next', 'static'), join(standalone, '.next', 'static'), {
  recursive: true,
  force: true,
});

// Los secretos se proporcionarán mediante variables de entorno.
for (const file of ['.env', '.env.production']) {
  rmSync(join(standalone, file), { force: true });
}

console.log('Standalone preparado correctamente.');
