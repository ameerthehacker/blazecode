import react from '@/memfs/templates/react';
import html from '@/memfs/templates/html';
import { ProjectTemplate } from './common/types';
import ReactLogo from '@/components/logos/react.svg?react';
import HTMLLogo from '@/components/logos/html.svg?react';

export const templates: { [template: string]: ProjectTemplate } = {
  react: {
    name: 'React.js',
    files: react,
    defaultSelectedFilePath: '/App.tsx',
    visibleFilePaths: ['/App.tsx', '/App.css'],
    entry: '/index.tsx',
    types: ['@types/react', 'csstype'],
    logo: <ReactLogo />,
  },
  html: {
    name: 'HTML/CSS/JS',
    files: html,
    defaultSelectedFilePath: '/index.js',
    visibleFilePaths: ['/styles.css', '/index.html', '/index.js'],
    entry: '/index.js',
    types: [],
    logo: <HTMLLogo />,
  },
} as const;
