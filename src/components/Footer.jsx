const Footer = () => {
  return (
    <footer className="w-full py-12 mt-32 border-t-[0.5px] border-ink/10 flex justify-center items-center">
      <p className="font-sans text-[9px] uppercase tracking-[0.4em] text-ink/30">
        Editorial fashion archive. Everyday couture. © {new Date().getFullYear()} F E Y
      </p>
    </footer>
  );
};

export default Footer;