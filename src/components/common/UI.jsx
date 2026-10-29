import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Plus, ArrowUpRight, Sparkles } from 'lucide-react';

export function PageTitle({ eyebrow, title, description, actions }) {
  return (
    <div className="page-title-row">
      <div>
        <div className="eyebrow">{eyebrow || 'EMPLOYEE HUB'}</div>
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {actions && <div className="page-title-actions">{actions}</div>}
    </div>
  );
}

export function Panel({ children, className = '', ...props }) {
  return <section className={`panel ${className}`} {...props}>{children}</section>;
}

export function PanelHeading({ title, subtitle, action }) {
  return (
    <div className="panel-heading">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Button({ children, variant = 'primary', size = '', className = '', ...props }) {
  return (
    <button className={`btn btn-${variant} ${size ? `btn-${size}` : ''} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Tag({ children, tone = 'slate' }) {
  return <span className={`tag tag-${tone}`}>{children}</span>;
}

export function Avatar({ name = 'Employee', initials, color = 'blue', size = '', src }) {
  const [imgError, setImgError] = useState(false);

  const resolvedSrc = src;
  const computed = initials || name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();

  if (resolvedSrc && !imgError) {
    return (
      <span className={`avatar avatar-has-img ${size ? `avatar-${size}` : ''}`} aria-label={name}>
        <img
          src={resolvedSrc}
          alt={name}
          className="avatar-img"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      </span>
    );
  }

  return (
    <span className={`avatar avatar-${color} ${size ? `avatar-${size}` : ''}`} aria-label={name}>
      {computed}
    </span>
  );
}

export function EmptyState({ icon: Icon = Search, title = 'Nothing here yet', description = 'Try changing your search or come back later.', action }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><Icon size={22} /></span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function Modal({ open, onClose, title, description, children, wide = false, className = '', headerActions = null, closeOnLeft = false, hideClose = false }) {
  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);

  if (!open) return null;
  return (
    <div className={`modal-backdrop ${className.includes('event-fullscreen-modal') ? 'event-fullscreen-backdrop' : className.includes('draft-list-fullscreen') ? 'draft-list-fullscreen-backdrop' : ''}`.trim()} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose?.(); }}>
      <motion.div
        className={`modal ${wide ? 'modal-wide' : ''} ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ opacity: 0, y: 14, scale: .98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: .18 }}
      >
        <div className={`modal-header ${closeOnLeft ? 'modal-header-close-left' : ''} ${hideClose ? 'modal-header-no-close' : ''}`}>
          {!hideClose && <button className="icon-button modal-close-button" aria-label="Close" title="Close" onClick={onClose}>
            <ArrowLeft size={19} />
          </button>}
          <div className="modal-header-copy">
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          {headerActions || <span className="modal-header-spacer" aria-hidden="true" />}
        </div>
        {children}
      </motion.div>
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search...' }) {
  return (
    <label className="search-input">
      <Search size={17} />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      <kbd>⌘ K</kbd>
    </label>
  );
}

export function LinkText({ children, onClick }) {
  return (
    <button className="text-link" onClick={onClick}>
      {children}
      <ArrowUpRight size={14} />
    </button>
  );
}

export function AccentIcon({ icon: Icon = Sparkles, tone = 'mint' }) {
  return <span className={`accent-icon accent-${tone}`}><Icon size={19} /></span>;
}

export function FormField({ label, children, hint, required = false }) {
  return (
    <label className="form-field">
      <span>{label}{required && <b className="required-mark" aria-hidden="true">*</b>}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

export function FloatingAdd({ onClick, label = 'Add item' }) {
  return (
    <Button onClick={onClick}>
      <Plus size={16} /> {label}
    </Button>
  );
}
