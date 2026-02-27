import { useEffect } from 'react';

const Chapter = () => {
  // Scroll to top on load for that fresh "page turn" feel
  useEffect(() => window.scrollTo(0, 0), []);

  return (
    <div className="min-h-screen pt-40 px-8 md:px-16 pb-32 max-w-7xl mx-auto flex flex-col md:flex-row gap-16 animate-in fade-in duration-1000">
      
      {/* Left Sidebar: Sticky Chapter Nav */}
      <aside className="hidden md:block w-1/4 sticky top-40 h-fit">
        <p className="font-sans text-[9px] uppercase tracking-[0.3em] text-ink/40 mb-4">
          Chapter 01
        </p>
        <h1 className="font-serif text-3xl text-ink mb-12">Silence as Luxury</h1>
        
        <nav className="flex flex-col gap-4 border-l-[0.5px] border-ink/20 pl-4">
          <a href="#philosophy" className="font-sans text-[10px] uppercase tracking-widest text-ink/40 hover:text-ink transition-colors">Philosophy</a>
          <a href="#entry" className="font-sans text-[10px] uppercase tracking-widest text-ink/40 hover:text-ink transition-colors">Entry 001</a>
          <a href="#material" className="font-sans text-[10px] uppercase tracking-widest text-ink/40 hover:text-ink transition-colors">Material Study</a>
        </nav>
      </aside>

      {/* Main Reading Column */}
      <main className="w-full md:w-3/4 max-w-[760px]">
        
        {/* Section 1: Philosophy */}
        <section id="philosophy" className="min-h-[70vh] flex flex-col justify-center border-b-[0.5px] border-ink/10 pb-24 mb-24">
          <div className="border-[0.5px] border-ink p-12 md:p-24 bg-ink text-porcelain">
            <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-8">
              "Thought in every line.<br/>Luxury in every silence."
            </h2>
            <p className="font-sans text-[10px] uppercase tracking-[0.2em] opacity-60">
              — F E Y
            </p>
          </div>
        </section>

        {/* Section 2: The Entry */}
        <section id="entry" className="min-h-screen flex flex-col justify-center border-b-[0.5px] border-ink/10 pb-24 mb-24">
          {/* Sketch Image Placeholder */}
          <div className="w-full aspect-square border-[0.5px] border-ink/20 bg-ink/5 mb-12 flex items-center justify-center">
             <span className="font-sans text-[10px] tracking-widest text-ink/30">[ ENTRY 001 SKETCH RENDER ]</span>
          </div>
          
          <div className="max-w-[500px] mx-auto text-center">
            <h3 className="font-serif text-3xl mb-6">Line & Drape</h3>
            <p className="font-sans text-xs leading-relaxed text-ink/80 mb-8">
              A study in controlled volume and asymmetric shadow. We do not design for the moment; we design for the movement. Every fold is intentional. Every silence is earned.
            </p>
            {/* The collapsible "fashion nerd" detail */}
            <details className="cursor-pointer group">
              <summary className="font-sans text-[9px] uppercase tracking-[0.2em] text-ink/50 group-hover:text-ink list-none flex items-center justify-center gap-2">
                <span className="text-lg font-light leading-none mb-1">+</span> Construction Notes
              </summary>
              <p className="font-sans text-[10px] leading-relaxed text-ink/60 mt-4 text-left border-l-[0.5px] border-ink/20 pl-4">
                Structured waistband constructed with rigid interfacing to support the weight of the asymmetric fluid drape. Blind hems throughout.
              </p>
            </details>
          </div>
        </section>

        {/* Section 3: Material Study */}
        <section id="material" className="min-h-[70vh] flex flex-col justify-center">
          {/* Full bleed material texture */}
          <div className="w-full h-64 md:h-96 bg-ink/10 mb-8 flex items-center justify-center overflow-hidden">
             <span className="font-sans text-[10px] tracking-widest text-ink/30">[ FULL BLEED SILK TEXTURE ]</span>
          </div>
          <div className="max-w-[500px]">
            <p className="font-sans text-[9px] uppercase tracking-[0.3em] text-ink/40 mb-2">Material Study 01</p>
            <h4 className="font-serif text-2xl mb-4">Heavy Silk Crepe</h4>
            <p className="font-sans text-xs leading-relaxed text-ink/70">
              Chosen for its architectural weight and matte finish. It does not reflect light; it absorbs it, allowing the silhouette to remain the absolute focus of the garment.
            </p>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Chapter;