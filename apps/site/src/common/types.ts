export type Files = { [filePath: string]: string };
export type ProjectTemplate = {
  name: string;
  files: Files;
  defaultSelectedFilePath: string;
  visibleFilePaths: string[];
  entry: string;
};

export type YUSer = {
  id?: number;
  name?: string;
  color?: string;
  openFilePath?: string;
  isActive?: boolean;
  cursor?: {
    lineNumber: number;
    column: number;
  };
};

export type YAwarness = {
  user?: YUSer;
} | null;
