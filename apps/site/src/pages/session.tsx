import { YProvider } from '@/contexts/y-doc';
import { useParams } from 'react-router-dom';
import IDE from '@/components/ide';
import { templates } from '@/templates';
import SessionForm from '@/components/session-form';
import { useUser } from '@/contexts/user';

export default function SessionPage() {
  const { id } = useParams();
  const sessionId = id as string;
  const { name, setName } = useUser();

  return (
    <YProvider sessionId={sessionId}>
      {name ? (
        <IDE template={templates.react} sessionId={sessionId} />
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
