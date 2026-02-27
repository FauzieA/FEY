const FadeIn = ({ children, delay = "delay-0", duration = "duration-1000" }) => {
  return (
    <div className={`animate-in fade-in slide-in-from-bottom-4 ${delay} ${duration} fill-mode-both`}>
      {children}
    </div>
  );
};

export default FadeIn;