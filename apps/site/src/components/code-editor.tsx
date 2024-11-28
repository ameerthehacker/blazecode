import { Editor as MonacoEditor, useMonaco } from '@monaco-editor/react';
import { useEffect, useRef, useState } from 'react';
import type { editor } from 'monaco-editor';
import { useY } from '@/contexts/y-doc';
import { useAwarness, useDebounce, useYFilesSync } from '@/hooks';
import { MonacoBinding } from 'y-monaco';
import { assert } from '@/common/utils';
import { YText } from 'yjs/dist/src/types/YText';
import { useSandpack } from '@codesandbox/sandpack-react';
import { useEditorState } from '@/hooks/state';
import { Spinner } from './ui/spinner';
import monacoTypes from '@/memfs/monaco-types';

const darkTheme: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  // night owl dark theme
  rules: [
    { token: 'comment', foreground: '#6A9955' },
    { token: 'keyword', foreground: '#C586C0' },
    { token: 'string', foreground: '#CE9178' },
    { token: 'number', foreground: '#B5CEA8' },
    { token: 'regexp', foreground: '#D16969' },
    { token: 'type', foreground: '#4EC9B0' },
    { token: 'class', foreground: '#4EC9B0' },
    { token: 'function', foreground: '#DCDCAA' },
    { token: 'variable', foreground: '#9CDCFE' },
    { token: 'variable.predefined', foreground: '#4FC1FF' },
    { token: 'interface', foreground: '#4EC9B0' },
    { token: 'delimiter', foreground: '#CCCCCC' },
  ],
  colors: {
    'editor.background': '#0A0A0A',
    'editor.foreground': '#FAFAFA',
    'editor.lineHighlightBackground': '#0A0A0A',
    'editorCursor.foreground': '#FAFAFA',
    'editor.selectionBackground': '#262626',
    'editor.inactiveSelectionBackground': '#26262680',
    'editorLineNumber.foreground': '#A3A3A3',
    'editorBracketMatch.border': '#262626',
  },
};
const extLanguageMap = {
  jsx: 'javascript',
  tsx: 'typescript',
  ts: 'typescript',
  css: 'css',
  html: 'html',
};
const getExtension = (filePath: string) => {
  return filePath.split('.').pop() as string;
};
const getLanguage = (filePath: string) => {
  const extension = getExtension(filePath);
  return extLanguageMap[extension as keyof typeof extLanguageMap];
};
function useMonacoTypeDefinitions(types: string[]) {
  const monaco = useMonaco();

  useEffect(() => {
    if (!monaco) return;

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2016,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
    });
    const libs = Object.keys(monacoTypes)
      .filter((filePath) =>
        types.some((type) => filePath.startsWith(`/${type}`))
      )
      .map((filePath) => ({
        filePath: `file:///node_modules${filePath}`,
        content: monacoTypes[filePath],
      }));
    monaco.languages.typescript.typescriptDefaults.setExtraLibs(libs);
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });
  }, [monaco, types]);
}

export default function CodeEditor({
  filePath,
  types,
}: {
  filePath: string;
  types: string[];
}) {
  const models = useRef<{ [key: string]: editor.ITextModel | null }>({});
  const viewStates = useRef<{
    [key: string]: editor.ICodeEditorViewState | null;
  }>({});
  const { setUserActive, setCursor } = useAwarness();
  const { webrtcProvider } = useY();
  const { getFileYText } = useYFilesSync();
  const [editor, setEditor] = useState<editor.IStandaloneCodeEditor | null>(
    null
  );
  const { initialEditorCursor, resetInitialEditorCursor } = useEditorState();
  const userActiveTimerRef = useRef<NodeJS.Timeout>();
  const monaco = useMonaco();
  const { sandpack } = useSandpack();
  const updateSandpackFile = useDebounce(
    (filePath: string, content: string) => {
      sandpack.updateFile(filePath, content);
    },
    500
  );

  // fetch type defintions for external libs
  useMonacoTypeDefinitions(types);

  useEffect(() => {
    // if user does not do anything for 1s in editor then mark as inactive
    const userActiveTimeout = 1000;
    const disposable = editor?.onDidChangeCursorPosition((evt) => {
      setCursor(evt.position);
      if (userActiveTimerRef.current) clearTimeout(userActiveTimerRef.current);
      userActiveTimerRef.current = setTimeout(() => {
        setUserActive(false);
      }, userActiveTimeout);
      setUserActive(true);
    });
    return () => {
      disposable?.dispose();
      if (userActiveTimerRef.current) clearTimeout(userActiveTimerRef.current);
    };
  }, [editor, setCursor, setUserActive]);

  // prevent ctrl+s from saving the file
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!editor || !monaco) return;

    // save current view state
    const currentModel = editor.getModel();
    if (currentModel)
      viewStates.current[currentModel.uri.toString()] = editor.saveViewState();
    const fileUri = monaco.Uri.parse(`file://${filePath}`);

    if (!models.current[filePath]) {
      const model = monaco.editor.createModel(
        '',
        getLanguage(filePath),
        fileUri
      );
      models.current[filePath] = model;
      const yText = getFileYText(filePath);
      assert(!!yText, `YText for ${filePath} not found`);
      new MonacoBinding(
        yText as YText,
        model,
        new Set([editor]),
        webrtcProvider?.awareness
      );
    }
    assert(!!models.current[filePath], `Model for ${filePath} not found`);
    editor.setModel(models.current[filePath]);
    // restore view state
    const viewState = viewStates.current[fileUri.toString()];
    if (viewState) {
      editor.focus();
      editor.restoreViewState(viewState);
    }
  }, [filePath, editor, monaco, getFileYText, webrtcProvider?.awareness]);

  useEffect(() => {
    if (initialEditorCursor) {
      editor?.focus();
      editor?.setPosition(initialEditorCursor);
      resetInitialEditorCursor();
    }
  }, [editor, initialEditorCursor, resetInitialEditorCursor]);

  return (
    <div className="rounded-lg overflow-hidden">
      <MonacoEditor
        height="calc(100vh - 74px)"
        theme="bc-dark"
        options={{
          fontSize: 16,
          tabSize: 2,
          minimap: { enabled: false },
          fontFamily: 'IBM Plex Mono',
        }}
        loading={
          <Spinner
            size="lg"
            delay={500}
            text={<span className="text-sm text-gray-300">Loading...</span>}
          />
        }
        beforeMount={(monaco) =>
          monaco.editor.defineTheme('bc-dark', darkTheme)
        }
        onChange={(value) => updateSandpackFile(filePath, value ?? '')}
        onMount={(editor) => {
          setEditor(editor);
        }}
        saveViewState
      />
    </div>
  );
}
