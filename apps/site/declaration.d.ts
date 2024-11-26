declare module '@/project-templates' {
  type Files = {
    [filePath: string]: string;
  };
  const templates: {
    react: Files;
  };
  export default templates;
}
