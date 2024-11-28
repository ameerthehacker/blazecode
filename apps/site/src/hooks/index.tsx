import { Files, YAwarness, YUSer as YUser } from '@/common/types';
import { getRandomColor, injectYMonacoCSS } from '@/common/utils';
import { useUser } from '@/contexts/user';
import { useY } from '@/contexts/y-doc';
import {
  needsTemplateHydration,
  setNeedsTemplateHydration,
} from '@/storage';
import { useEffect, useRef, useState } from 'react';

const FILES_MAP_KEY = 'files';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();

  return usePersistentCallback((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    const id = setTimeout(() => {
      callback(...args);
    }, delay);
    setTimeoutId(id);
  });
}

// force re-render
function useReRender() {
  const [, setValue] = useState(0);
  return usePersistentCallback(() => setValue((value) => value + 1));
}

export function useYFilesSetup(files: Files, sessionId: string) {
  const { doc } = useY();
  useEffect(() => {
    const yFilesMap = doc.getMap<boolean>(FILES_MAP_KEY);

    if (needsTemplateHydration(sessionId)) {
      for (const filePath in files) {
        if (!yFilesMap.has(filePath)) {
          yFilesMap.set(filePath, true);
          const yText = doc.getText(filePath);
          yText.insert(0, files[filePath]);
        }
      }
      setNeedsTemplateHydration(sessionId, false);
    }
  }, [doc, files, sessionId]);
}

export function useYFilesSync() {
  const { doc } = useY();
  const reRender = useReRender();
  const yFilesMap = doc.getMap<boolean>(FILES_MAP_KEY);

  useEffect(() => {
    yFilesMap.observe(reRender);
    return () => {
      yFilesMap.unobserve(reRender);
    };
  }, [reRender, yFilesMap]);

  const getFiles = usePersistentCallback(() => {
    const files: Files = {};
    yFilesMap.forEach((_, key) => {
      const yText = doc.getText(key);
      files[key] = yText.toString();
    });
    return files;
  });

  const getFileYText = usePersistentCallback((filePath: string) => {
    return doc.getText(filePath);
  });

  return { getFiles, getFileYText };
}

export function useAwarness() {
  const { webrtcProvider } = useY();
  const awarness = webrtcProvider?.awareness;
  const { name } = useUser();
  const user = (awarness?.getLocalState() as YAwarness | undefined)?.user;
  const rerender = useReRender();
  const patchUserState = usePersistentCallback((patch: Partial<YUser>) => {
    const localState = awarness?.getLocalState() as YAwarness;
    const newLocalState = {
      ...localState,
      user: { ...localState?.user, ...patch } as YUser,
    } as YAwarness;
    awarness?.setLocalState(newLocalState);
  });
  const setUserActive = usePersistentCallback((isActive: boolean) => {
    patchUserState({ isActive });
  });
  const setOpenFilePath = usePersistentCallback((filePath: string) => {
    patchUserState({ openFilePath: filePath });
  });
  const setCursor = usePersistentCallback(
    (cursor: { lineNumber: number; column: number }) => {
      patchUserState({ cursor });
    }
  );
  const getUsers = usePersistentCallback(() => {
    const users: YUser[] = [];
    awarness?.getStates().forEach((state) => {
      const user = (state as YAwarness | undefined)?.user;
      if (user) users.push(user);
    });

    return users;
  });

  useEffect(() => {
    const onChange = () => rerender();
    awarness?.on('change', onChange);
    return () => awarness?.off('change', onChange);
  }, [awarness, rerender]);

  // update a random accessible color for the user
  useEffect(() => {
    patchUserState({
      id: awarness?.clientID,
      name,
      color: getRandomColor(
        getUsers()
          .map((user) => user.color)
          .filter(Boolean)
      ),
    });
  }, [name, awarness, patchUserState, getUsers]);

  useEffect(() => {
    injectYMonacoCSS(getUsers());
  });

  return {
    user,
    participants: getUsers().filter((user) => user.id !== awarness?.clientID),
    setUserActive,
    setOpenFilePath,
    setCursor,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Callable = (...args: any[]) => any;

export function usePersistentCallback<T extends Callable>(cb: T) {
  const callbackRef = useRef<T>(cb);
  // keep the callback ref upto date
  callbackRef.current = cb;
  type Params = Parameters<T>;
  /**
   * initialize a persistent callback which never changes
   * through out the component lifecycle
   */
  const persistentCbRef = useRef(function (...args: Params) {
    return callbackRef.current(...args);
  } as T);

  return persistentCbRef.current;
}
