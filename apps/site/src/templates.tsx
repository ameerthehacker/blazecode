import react from '@/memfs/templates/react';
import { ProjectTemplate } from './common/types';

export type AvailableTemplates = 'react';

export const templates: { [key in AvailableTemplates]: ProjectTemplate } = {
  react: {
    name: 'React',
    files: react,
    defaultSelectedFilePath: '/App.tsx',
    visibleFilePaths: ['/App.tsx', '/App.css'],
    entry: '/index.tsx',
    types: ['@types/react', 'csstype'],
  },
} as const;
