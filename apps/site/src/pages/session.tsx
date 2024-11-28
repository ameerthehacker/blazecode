import { YProvider } from '@/contexts/y-doc';
import { useParams } from 'react-router-dom';
import IDE from '@/components/ide';
import { templates } from '@/templates';
import SessionForm from '@/components/session-form';
import { useUser } from '@/contexts/user';
import { getTemplate } from '@/storage';

export default function SessionPage() {
  const { id } = useParams();
  const sessionId = id as string;
  const { name, setName } = useUser();
  const template = getTemplate(sessionId);

  return (
    <YProvider sessionId={sessionId}>
      {name ? (
        <IDE template={templates[template]} sessionId={sessionId} />
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <SessionForm
            title="Join Session"
            onSubmit={({ name }) => setName(name)}
          />
        </div>
      )}
    </YProvider>
  );
}
