import { SandpackLayout } from '@codesandbox/sandpack-react';

import { ResizableHandle } from './ui/resizable';

import { Card, CardContent } from './ui/card';

import { ResizablePanel } from './ui/resizable';

import { useYFilesSetup, useYFilesSync } from '@/hooks';
import { SandpackPreview } from '@codesandbox/sandpack-react';
import { useState } from 'react';

import { ResizablePanelGroup } from './ui/resizable';
import Editor from './editor';
import { SandpackProvider } from '@codesandbox/sandpack-react';
import { Spinner } from './ui/spinner';

export default function IDE({ sessionId }: { sessionId: string }) {
  const [isResizing, setIsResizing] = useState(false);
  const { getFiles } = useYFilesSync();
  const files = getFiles();
  const template = useYFilesSetup(sessionId);
  const filePaths = Object.keys(files)
    .filter((filePath) => template?.visibleFilePaths.includes(filePath))
    .sort();

  return (
    <div className="h-lvh w-full">
      {template && filePaths.length > 0 ? (
        <SandpackProvider
          files={Object.fromEntries(
            Object.entries(files).map(([path, content]) => [
              path,
              { code: content },
            ])
          )}
          customSetup={{
            entry: template.entry,
          }}
          className="h-full"
          theme="dark"
        >
          <div className="p-4 h-full">
            <ResizablePanelGroup className="gap-0.5" direction="horizontal">
              <ResizablePanel className="rounded-lg" defaultSize={70}>
                <Card className="w-full">
                  <CardContent className="p-0">
                    <Editor
                      filePaths={filePaths}
                      defaultSelectedFilePath={template.defaultSelectedFilePath}
                      sessionId={sessionId}
                      types={template.types}
                    />
                  </CardContent>
                </Card>
              </ResizablePanel>
              <ResizableHandle
                onDragging={(isDragging) => setIsResizing(isDragging)}
                className="bg-transparent"
              />
              <ResizablePanel maxSize={50} minSize={10}>
                <SandpackLayout className="h-full relative">
                  <SandpackPreview
                    showNavigator
                    showOpenInCodeSandbox={false}
                  />
                  {isResizing && (
                    <div className="absolute h-full w-full inset-0 z-50" />
                  )}
                </SandpackLayout>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </SandpackProvider>
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <Spinner
            delay={500}
            size="lg"
            text={<span className="text-sm text-gray-300">Syncing...</span>}
          />
        </div>
      )}
    </div>
  );
}
