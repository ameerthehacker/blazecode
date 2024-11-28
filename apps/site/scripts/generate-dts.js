// This script is designed to copy .d.ts files to a target directory.
// The purpose of this is to facilitate the conversion of these files into in-memory files.
import { promises as fs } from 'fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const copyDtsFiles = async ({ sourceDir, targetDir }) => {
  await fs.mkdir(targetDir, { recursive: true });

  await processDirectory(sourceDir, targetDir, sourceDir);
};

const processDirectory = async (currentPath, targetDir, sourceRoot) => {
  const entries = await fs.readdir(currentPath, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(currentPath, entry.name);
    const relativePath = path.relative(sourceRoot, sourcePath);
    const targetPath = path.join(targetDir, relativePath);

    if (entry.isDirectory()) {
      await fs.mkdir(targetPath, { recursive: true });
      await processDirectory(sourcePath, targetDir, sourceRoot);
    } else if (entry.isFile() && entry.name.endsWith('.d.ts')) {
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.copyFile(sourcePath, targetPath);
    }
  }
};

const getCopyOptions = (packageName) => {
  const sourceDir = path.resolve(__dirname, `../node_modules/${packageName}`);
  const targetDir = path.resolve(
    __dirname,
    `../memfs/monaco-types/${packageName}`
  );

  return { sourceDir, targetDir };
};

// react types
copyDtsFiles(getCopyOptions('@types/react'));
copyDtsFiles(getCopyOptions('csstype'));
