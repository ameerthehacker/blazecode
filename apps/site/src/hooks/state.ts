import { create } from 'zustand';

type EditorState = {
  openFilePath?: string;
  initialEditorCursor?: {
    lineNumber: number;
    column: number;
  };
  setOpenEditorFilePath(filePath: string): void;
  setInitialEditorCursor(cursor: { lineNumber: number; column: number }): void;
  resetInitialEditorCursor(): void;
};

export const useEditorState = create<EditorState>((set) => ({
  setOpenEditorFilePath: (filePath: string) =>
    set(() => ({ openFilePath: filePath })),
  setInitialEditorCursor: (cursor: { lineNumber: number; column: number }) =>
    set(() => ({ initialEditorCursor: cursor })),
  resetInitialEditorCursor: () =>
    set(() => ({ initialEditorCursor: undefined })),
}));
