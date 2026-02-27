import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-1000">
      
      <div className="text-center mt-[-5%]">
        <h1 className="font-serif text-6xl md:text-8xl tracking-[0.15em] text-ink mb-8 select-none">
          F E Y
        </h1>
        
        <div className="space-y-3 mb-16">
          <p className="font-sans text-[10px] md:text-xs uppercase tracking-[0.3em] text-ink/70">
            Elegance, without noise.
          </p>
          <p className="font-sans text-[10px] md:text-xs uppercase tracking-[0.2em] text-ink/40">
            Thought in every line. Luxury in every silence.
          </p>
        </div>

        <Link to="/archive">
          <button className="group relative px-10 py-4 overflow-hidden border-[0.5px] border-ink/20 transition-all duration-700 hover:border-ink">
            <span className="relative z-10 font-sans text-[10px] uppercase tracking-[0.25em] text-ink">
              Enter the Archive
            </span>
            {/* Soft background fill on hover */}
            <div className="absolute inset-0 bg-ink/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out" />
          </button>
        </Link>
      </div>

      <div className="absolute bottom-12 w-full text-center">
        <p className="font-sans text-[9px] uppercase tracking-[0.4em] text-ink/30">
          Editorial fashion archive. Everyday couture.
        </p>
      </div>
    </div>
  );
};

export default Home;