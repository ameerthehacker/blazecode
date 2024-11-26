import { getUsername, setUsername } from '@/storage';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const UserContext = createContext<{
  name: string;
  setName: (name: string) => void;
} | null>(null);

export default function UserProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useState(getUsername());
  const value = useMemo(() => ({ name, setName }), [name, setName]);

  useEffect(() => {
    setUsername(name);
  }, [name]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const cxt = useContext(UserContext);

  if (!cxt) throw new Error('useUser must be wrapped in UserProvider');

  return cxt;
}
