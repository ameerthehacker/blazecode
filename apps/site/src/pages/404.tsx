import { Link } from 'react-router-dom';

export default function _404Page() {
  return (
    <div className="h-screen flex flex-col justify-center items-center gap-4">
      <p className="text-9xl font-bold">404</p>
      <p>Well that is a wrong number!</p>
      <Link to="/" className="underline underline-offset-4 decoration-dotted">
        Take me home
      </Link>
    </div>
  );
}
