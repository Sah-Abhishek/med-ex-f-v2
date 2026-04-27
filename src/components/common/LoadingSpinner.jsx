const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4 border-[2px]',
    md: 'h-8 w-8 border-[2.5px]',
    lg: 'h-12 w-12 border-[3px]',
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`rounded-full border-slate-200 border-t-[var(--color-accent)] ${sizes[size]}`}
        style={{ animation: 'spin-smooth 0.7s linear infinite' }}
      />
    </div>
  );
};

export default LoadingSpinner;
