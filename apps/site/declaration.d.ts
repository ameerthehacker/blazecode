declare module '@/memfs/*' {
  const Files: {
    [filePath: string]: string;
  };
  export default Files;
}
