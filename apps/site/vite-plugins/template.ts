import { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

function generateTemplatesCode(templatesDir: string) {
  const templates: Record<string, Record<string, string>> = {};

  // Read all template directories
  const templateDirs = fs.readdirSync(templatesDir);

  for (const templateName of templateDirs) {
    const templatePath = path.join(templatesDir, templateName);
    if (!fs.statSync(templatePath).isDirectory()) continue;

    templates[templateName] = {};

    // Read all files in template directory
    const files = fs.readdirSync(templatePath);
    for (const file of files) {
      const filePath = path.join(templatePath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      templates[templateName][`/${file}`] = content;
    }
  }

  return `export default ${JSON.stringify(templates, null, 2)}`;
}

export default function templatesPlugin(): Plugin {
  return {
    name: 'templates-plugin',
    enforce: 'pre',
    buildStart() {
      this.addWatchFile('templates');
    },
    resolveId(id) {
      if (id.endsWith('/src/project-templates')) {
        return '\0virtual:templates';
      }
    },
    load(id) {
      if (id === '\0virtual:templates') {
        return generateTemplatesCode('templates');
      }
    },
  };
}
