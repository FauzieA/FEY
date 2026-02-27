const Notes = () => {
  const essays = [
    {
      title: "On Silence",
      body: "In an industry obsessed with noise, true luxury is found in restraint. F E Y is a quiet space. We do not shout for attention; we construct garments that demand presence through their absolute precision."
    },
    {
      title: "On Craft",
      body: "The sketch is not just an idea; it is the final authority. We leave the lines exposed to prove the human hand. Perfect symmetry is a machine's luxury; intentional asymmetry is the artisan's signature."
    },
    {
      title: "On Modesty",
      body: "To be covered is not to be hidden. It is to choose what the world is allowed to see. We believe in the architecture of the body, wrapping it in heavy drapes and sharp tailoring to create power without exposure."
    }
  ];

  return (
    <div className="min-h-screen pt-40 px-8 pb-32 animate-in fade-in duration-1000 flex flex-col items-center">
      
      <div className="w-full max-w-[500px]">
        <h1 className="font-serif text-4xl text-ink mb-24 text-center border-b-[0.5px] border-ink/10 pb-8">
          Studio Notes
        </h1>

        <div className="space-y-24">
          {essays.map((essay, index) => (
            <article key={index} className="flex flex-col gap-6">
              <h2 className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink/40">
                {essay.title}
              </h2>
              <p className="font-serif text-xl md:text-2xl leading-relaxed text-ink/90">
                {essay.body}
              </p>
            </article>
          ))}
        </div>
      </div>
      
    </div>
  );
};

export default Notes;