import projectTemplates from '@/project-templates';
import { ProjectTemplate } from './common/types';

export type AvailableTemplates = 'react';

export const templates: { [key in AvailableTemplates]: ProjectTemplate } = {
  react: {
    name: 'React',
    files: projectTemplates.react,
    defaultSelectedFilePath: '/App.jsx',
    visibleFilePaths: ['/App.jsx', '/App.css'],
    entry: '/index.jsx',
  },
} as const;
