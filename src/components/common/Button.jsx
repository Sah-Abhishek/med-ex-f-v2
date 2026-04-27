const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  onClick,
  className = '',
  ...props
}) => {
  const base = 'inline-flex items-center justify-center font-semibold tracking-tight transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variants = {
    primary: 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] focus-visible:ring-[var(--color-accent)] shadow-[0_1px_2px_rgba(14,165,233,0.3)] hover:shadow-[0_2px_8px_rgba(14,165,233,0.3)]',
    secondary: 'bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)] focus-visible:ring-slate-400',
    danger: 'bg-[var(--color-danger)] text-white hover:bg-red-600 focus-visible:ring-red-500 shadow-[0_1px_2px_rgba(239,68,68,0.3)]',
    success: 'bg-[var(--color-success)] text-white hover:bg-emerald-600 focus-visible:ring-emerald-500 shadow-[0_1px_2px_rgba(16,185,129,0.3)]',
    outline: 'border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)] hover:border-[var(--color-text-tertiary)] focus-visible:ring-slate-400',
    ghost: 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)] focus-visible:ring-slate-400',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-[var(--radius-sm)] gap-1.5',
    md: 'px-4 py-2 text-sm rounded-[var(--radius-md)] gap-2',
    lg: 'px-5 py-2.5 text-sm rounded-[var(--radius-md)] gap-2',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
