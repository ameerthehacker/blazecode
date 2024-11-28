// Load the files from /src/memfs as an in memory files object
import { Plugin } from 'vite';
import fs from 'fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MEMFS_PREFIX = 'memfs';
const MEMFS_SCHEME = `\0${MEMFS_PREFIX}:`;
const MEMFS_DIR_PATH = path.resolve(__dirname, `../${MEMFS_PREFIX}`);

const getFiles = (dirPath: string) =>
  fs.readdirSync(dirPath).map((dirname) => path.join(dirPath, dirname));

function generateMemFS(dirPath: string) {
  const files = getFiles(dirPath);
  const memfs = {};

  for (const file of files) {
    if (fs.statSync(file).isDirectory()) {
      files.push(...getFiles(file));
    } else {
      const memfsPath = `/${path.relative(dirPath, file)}`;
      const fileContent = fs.readFileSync(file, { encoding: 'utf-8' });
      memfs[memfsPath] = fileContent;
    }
  }

  return `export default ${JSON.stringify(memfs, null, 2)}`;
}

export default function memfsPlugin(): Plugin {
  return {
    name: 'memfs-plugin',
    enforce: 'pre',
    buildStart() {
      this.addWatchFile(MEMFS_PREFIX);
    },
    resolveId(id) {
      const MEMFS_VIRTUAL_PATH = `/src/${MEMFS_PREFIX}/`;
      if (id.includes(MEMFS_VIRTUAL_PATH)) {
        const [, dirPath] = id.split(MEMFS_VIRTUAL_PATH);
        return `${MEMFS_SCHEME}${dirPath}`;
      }
    },
    load(id) {
      if (id.startsWith(MEMFS_SCHEME)) {
        const targetDirPath = path.join(
          MEMFS_DIR_PATH,
          id.replace(MEMFS_SCHEME, '')
        );
        console.log(id, targetDirPath);
        return generateMemFS(targetDirPath);
      }
    },
  };
}
