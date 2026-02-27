import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  // Hide nav on the Home "Gate" page to keep it perfectly silent
  if (isHome) return null;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-8 py-8 flex justify-between items-start mix-blend-multiply">
      <Link to="/" className="font-serif text-2xl tracking-tighter text-ink hover:opacity-70 transition-opacity">
        F E Y
      </Link>
      
      <div className="flex gap-12">
        <div className="flex gap-8">
          {['Archive', 'Gallery', 'Materials', 'Notes'].map((item) => (
            <Link 
              key={item}
              to={`/${item.toLowerCase()}`}
              className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink/50 hover:text-ink transition-colors duration-500"
            >
              {item}
            </Link>
          ))}
        </div>
        <button className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink border-b-[0.5px] border-ink/30 pb-1 hover:border-ink transition-colors duration-500">
          Subscribe
        </button>
      </div>
    </nav>
  );
};

export default Navigation;