import { useState } from 'react';

const Archive = () => {
  const [view, setView] = useState('chapters'); // 'chapters' or 'entries'

  // Dummy data for layout testing
  const chapters = [
    { id: '01', title: 'Silence as Luxury', entries: 3, time: '5 min' },
    { id: '02', title: 'The Weight of Fabric', entries: 3, time: '6 min' },
  ];

  return (
    <div className="min-h-screen pt-40 px-8 md:px-24 pb-24 max-w-5xl mx-auto">
      
      {/* Archive Header & Toggles */}
      <div className="flex justify-between items-end mb-24 border-b-[0.5px] border-stone-mist pb-8">
        <h1 className="font-serif text-4xl text-ink">The Archive</h1>
        
        <div className="flex gap-6">
          <button 
            onClick={() => setView('chapters')}
            className={`font-sans text-[10px] uppercase tracking-[0.2em] transition-colors duration-500 ${view === 'chapters' ? 'text-ink border-b-[0.5px] border-ink pb-1' : 'text-ink/40'}`}
          >
            Chapters
          </button>
          <button 
            onClick={() => setView('entries')}
            className={`font-sans text-[10px] uppercase tracking-[0.2em] transition-colors duration-500 ${view === 'entries' ? 'text-ink border-b-[0.5px] border-ink pb-1' : 'text-ink/40'}`}
          >
            All Entries
          </button>
        </div>
      </div>

      {/* Chapter View (Default) */}
      {view === 'chapters' && (
        <div className="flex flex-col gap-16">
          {chapters.map((chapter) => (
            <div key={chapter.id} className="group cursor-pointer">
              <p className="font-sans text-[9px] uppercase tracking-[0.2em] text-ink/50 mb-4">
                Chapter {chapter.id}
              </p>
              <div className="flex justify-between items-baseline">
                <h2 className="font-serif text-3xl text-ink group-hover:opacity-60 transition-opacity duration-500">
                  {chapter.title}
                </h2>
                <p className="font-sans text-[10px] uppercase tracking-widest text-ink/40">
                  {chapter.entries} entries · {chapter.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All Entries View */}
      {view === 'entries' && (
        <div className="animate-in fade-in duration-700">
          <p className="font-sans text-xs text-ink/50 italic">Directory filters and grid will load here...</p>
        </div>
      )}

    </div>
  );
};

export default Archive;