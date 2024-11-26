import { Github, LogOut, Zap } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const isSessionPage = useLocation().pathname.includes('/session/');

  return (
    <header className="bg-background fixed top-0 left-0 w-full flex justify-between text-white">
      <Link to="/" className="text-2xl font-bold px-8 py-4">
        <div className="flex gap-2 items-center">
          <Zap size={24} />
          Blazecode
        </div>
      </Link>
      <div className="flex items-center gap-4 justify-end px-8 py-4">
        <nav>
          <ul className="flex items-center gap-4">
            {isSessionPage && (
              <li>
                <Link
                  to="/"
                  className="flex items-center gap-2 hover:underline text-red-500"
                >
                  <LogOut size={20} />
                  <span>Exit</span>
                </Link>
              </li>
            )}
            <li>
              <Link
                to="https://github.com/ameerthehacker/blazecode"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:underline"
              >
                <Github size={20} />
                <span>GitHub</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
