const Card = ({ children, className = '', title, subtitle, action }) => {
  return (
    <div
      className={`bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-card)] ${className}`}
    >
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-light)]">
          <div>
            {title && (
              <h3 className="text-[15px] font-semibold text-[var(--color-text)] tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;
