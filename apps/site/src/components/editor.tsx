import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CodeEditor from './code-editor';
import { Braces } from 'lucide-react';
import ReactLogo from './logos/react.svg?react';
import CSSLogo from './logos/css.svg?react';
import { getLastSelectedFilePath, setLastSelectedFilePath } from '@/storage';
import { useEffect } from 'react';
import { useAwarness } from '@/hooks';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { darkenHexColor, getInitials } from '@/common/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useEditorState } from '@/hooks/state';

const fileIconMap: {
  [extension: string]: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
} = {
  jsx: ReactLogo,
  css: CSSLogo,
};

const getFilename = (filePath: string) => {
  return filePath.split('/').pop() as string;
};

export default function Editor({
  sessionId,
  filePaths,
  defaultSelectedFilePath,
}: {
  sessionId: string;
  filePaths: string[];
  defaultSelectedFilePath: string;
}) {
  const { openFilePath, setInitialEditorCursor, setOpenEditorFilePath } =
    useEditorState();
  const awarness = useAwarness();

  useEffect(() => {
    if (!openFilePath)
      setOpenEditorFilePath(
        getLastSelectedFilePath(sessionId) || defaultSelectedFilePath
      );
  }, [defaultSelectedFilePath, openFilePath, sessionId, setOpenEditorFilePath]);

  useEffect(() => {
    if (openFilePath) {
      setLastSelectedFilePath(sessionId, openFilePath);
      awarness.setOpenFilePath(openFilePath);
    }
  }, [awarness, openFilePath, sessionId]);

  return (
    <>
      <Tabs
        onValueChange={(value) => setOpenEditorFilePath(value)}
        value={openFilePath}
      >
        <TabsList className="relative w-full justify-start">
          {filePaths.map((filePath) => {
            const filename = getFilename(filePath);
            const extension = filename.split('.').pop();
            const hasIcon = extension && fileIconMap[extension];
            const Icon = hasIcon ? fileIconMap[extension] : Braces;
            const icon = hasIcon ? (
              <Icon height={16} width={16} />
            ) : (
              <Icon size={16} />
            );

            return (
              <TabsTrigger key={filePath} value={filePath}>
                <div className="flex items-center gap-2">
                  {icon}
                  {filename}
                  <div className="flex items-center gap-1">
                    {awarness.participants
                      .filter(
                        (participant) => participant.openFilePath === filePath
                      )
                      .map((participant) => (
                        <Tooltip key={participant.id}>
                          <TooltipTrigger>
                            <span style={{ color: participant.color }}>
                              {getInitials(participant.name)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>{participant.name}</TooltipContent>
                        </Tooltip>
                      ))}
                  </div>
                </div>
              </TabsTrigger>
            );
          })}
          <div className="absolute right-0 pr-1 flex flex-row gap-1 justify-center align-center">
            {awarness.participants.map((participant) => (
              <Tooltip key={participant.id}>
                <TooltipTrigger>
                  <Avatar
                    className="w-8 h-8"
                    onClick={() => {
                      const { cursor, openFilePath } = participant;
                      if (openFilePath) setOpenEditorFilePath(openFilePath);
                      if (cursor) setInitialEditorCursor(cursor);
                    }}
                  >
                    <AvatarFallback
                      className="text-white"
                      style={{
                        background: participant.color,
                        border: `1.5px solid ${darkenHexColor(
                          participant.color,
                          0.2
                        )}`,
                      }}
                    >
                      {getInitials(participant.name)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent className="">{participant.name}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TabsList>
      </Tabs>
      {openFilePath && <CodeEditor filePath={openFilePath} />}
    </>
  );
}
