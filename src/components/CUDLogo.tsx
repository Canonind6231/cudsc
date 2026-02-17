const CUDLogo = ({ className = "h-10" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="gradient-header rounded-lg p-2 flex items-center justify-center">
        <span className="text-white font-bold text-xl tracking-tight">CUD</span>
      </div>
      <div className="hidden sm:block">
        <p className="text-sm font-semibold text-white leading-tight">Satit Chula</p>
      </div>
    </div>
  );
};

export default CUDLogo;
