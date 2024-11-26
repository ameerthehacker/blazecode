import { setNeedsTemplateHydration } from '@/storage';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/header';
import SessionForm, { FormData } from '@/components/session-form';
import { useUser } from '@/contexts/user';

export function SessionCreator() {
  const navigate = useNavigate();
  const { setName } = useUser();
  const onSubmit = ({ name }: FormData) => {
    const sessionId = uuidv4();
    setName(name);
    setNeedsTemplateHydration(sessionId, true);
    navigate(`/session/${sessionId}`);
  };

  return (
    <>
      <Header />
      <div className="flex items-center justify-center min-h-screen">
        <SessionForm title="Create Session" onSubmit={onSubmit} />
      </div>
    </>
  );
}
