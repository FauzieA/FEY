import FadeIn from '../components/UI/FadeIn';

const Materials = () => {
  const materials = [
    { name: "Heavy Silk Crepe", type: "Woven", use: "Drape & Asymmetry", description: "Matte finish. Absorbs light rather than reflecting it. Provides architectural weight to fluid silhouettes." },
    { name: "Wool Gabardine", type: "Tailoring", use: "Structure & Trousers", description: "Rigid yet breathable. Holds a sharp crease indefinitely. The foundation of our structured lower-half garments." },
    { name: "Raw Cotton Poplin", type: "Shirting", use: "Volume & Contrast", description: "Crisp and papery. Used to create stark, voluminous contrasts against heavier outerwear." }
  ];

  return (
    <FadeIn>
      <div className="pt-40 px-8 md:px-16 max-w-5xl mx-auto pb-24">
        <header className="mb-24 border-b-[0.5px] border-ink/10 pb-12">
          <h1 className="font-serif text-5xl text-ink mb-4">Materials Library</h1>
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink/40">
            The foundation of the silhouette.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {materials.map((mat, idx) => (
            <div key={idx} className="group cursor-default">
              {/* Full-bleed texture placeholder */}
              <div className="w-full aspect-[4/3] bg-ink/10 mb-6 flex items-center justify-center">
                <span className="font-sans text-[8px] uppercase tracking-widest text-ink/30">[ {mat.name} TEXTURE ]</span>
              </div>
              <h3 className="font-serif text-2xl text-ink mb-2">{mat.name}</h3>
              <div className="flex gap-4 mb-4 border-b-[0.5px] border-ink/10 pb-4">
                <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-ink/40">{mat.type}</span>
                <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-ink/40">/</span>
                <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-ink/40">{mat.use}</span>
              </div>
              <p className="font-sans text-[11px] leading-relaxed text-ink/70">
                {mat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </FadeIn>
  );
};

export default Materials;