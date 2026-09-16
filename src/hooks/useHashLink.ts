import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Resolves an in-page anchor (e.g. "#portals") so it works from any route:
 * smooth-scrolls in place when already on "/", otherwise navigates home
 * with the hash so Landing can pick up the scroll on mount.
 */
export function useHashLink() {
  const location = useLocation();
  const navigate = useNavigate();

  return (hash: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    if (location.pathname === '/') {
      document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
      window.history.replaceState(null, '', hash);
    } else {
      navigate('/' + hash);
    }
  };
}
