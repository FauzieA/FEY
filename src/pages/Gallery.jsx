const Gallery = () => {
  // Placeholder array
  const sketches = [1, 2, 3, 4, 5, 6];

  return (
    <div className="min-h-screen pt-40 px-8 md:px-12 pb-32 animate-in fade-in duration-700">
      
      <header className="flex justify-between items-end mb-16 border-b-[0.5px] border-ink/10 pb-8 max-w-7xl mx-auto">
        <h1 className="font-serif text-4xl text-ink">Archive Gallery</h1>
        <p className="font-sans text-[9px] uppercase tracking-[0.2em] text-ink/40 hidden md:block">
          Index of Silhouettes
        </p>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-16">
        {sketches.map((item) => (
          <div key={item} className="group cursor-pointer">
            {/* The Bordered Sketch Frame */}
            <div className="w-full aspect-[4/5] border-[0.5px] border-ink p-6 mb-4 flex items-center justify-center transition-all duration-700 group-hover:bg-ink/5">
              <span className="font-sans text-[9px] tracking-widest text-ink/20">ENTRY 00{item}</span>
            </div>
            {/* The Label */}
            <div className="flex justify-between items-center px-2">
              <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-ink/60">Entry 00{item}</span>
              <span className="font-serif text-sm italic text-ink opacity-0 group-hover:opacity-100 transition-opacity duration-500">View details</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Gallery;