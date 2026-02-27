import Navigation from './Navigation';
import Footer from './Footer';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-porcelain text-ink flex flex-col">
      {!isHome && <Navigation />}
      <main className="flex-grow">{children}</main>
      {!isHome && <Footer />}
    </div>
  );
};

export default Layout;