import { Link } from 'react-router-dom';

const ArchiveCard = ({ chapter, title, entries, time, link }) => {
  return (
    <Link to={link} className="group block border-b-[0.5px] border-ink/10 pb-8 hover:border-ink/40 transition-colors">
      <p className="font-sans text-[9px] uppercase tracking-[0.3em] text-ink/40 mb-3 group-hover:text-ink/60 transition-colors">
        Chapter {chapter}
      </p>
      <div className="flex justify-between items-baseline">
        <h2 className="font-serif text-3xl md:text-4xl text-ink group-hover:opacity-70 transition-opacity">
          {title}
        </h2>
        <p className="font-sans text-[9px] uppercase tracking-widest text-ink/30 group-hover:text-ink/60 transition-colors">
          {entries} entries · {time}
        </p>
      </div>
    </Link>
  );
};

export default ArchiveCard;