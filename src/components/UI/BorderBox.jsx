const BorderBox = ({ children, className = "" }) => {
  return (
    <div className={`p-4 md:p-8 bg-porcelain border-[0.5px] border-ink ${className}`}>
      {/* The inner content area */}
      <div className="w-full h-full flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default BorderBox;