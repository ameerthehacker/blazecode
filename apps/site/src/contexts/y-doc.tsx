import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { IndexeddbPersistence } from 'y-indexeddb';
import { usePersistentCallback } from '@/hooks';

type YContextValue = {
  doc: y.Doc;
  webrtcProvider?: WebrtcProvider;
  indexeddbProvider?: IndexeddbPersistence;
};
const doc = new y.Doc();
const YContext = createContext<YContextValue | null>(null);

function useStateRef<T>(initialValue?: T) {
  const [value, setValue] = useState(initialValue);
  const ref = useRef(value);

  const setRef = usePersistentCallback((value: T) => {
    ref.current = value;
    setValue(value);
  });

  return [ref, setRef] as const;
}

export function YProvider({
  children,
  sessionId,
}: {
  children: React.ReactNode;
  sessionId: string;
}) {
  const [webrtcProviderRef, setWebrtcProvider] = useStateRef<WebrtcProvider>();
  const [indexeddbProvider, setIndexeddbProvider] =
    useState<IndexeddbPersistence>();
  const value = useMemo(() => {
    return {
      doc,
      webrtcProvider: webrtcProviderRef.current,
      indexeddbProvider,
    };
  }, [webrtcProviderRef, indexeddbProvider]);

  useEffect(() => {
    setWebrtcProvider(
      new WebrtcProvider(sessionId, doc, {
        signaling: ['ws://localhost:4444'],
      })
    );

    setIndexeddbProvider(new IndexeddbPersistence(sessionId, doc));

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      webrtcProviderRef.current?.destroy();
    };
  }, [sessionId, setWebrtcProvider, webrtcProviderRef]);

  return <YContext.Provider value={value}>{children}</YContext.Provider>;
}

export function useY() {
  const context = useContext(YContext);

  if (!context) {
    throw new Error('useYDoc must be used within a YProvider');
  }

  return context;
}
