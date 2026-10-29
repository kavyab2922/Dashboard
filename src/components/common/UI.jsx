import { useEffect, useId, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, ChevronDown, Search, Plus, ArrowUpRight, Sparkles } from 'lucide-react';

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
    <div className={`modal-backdrop ${className.includes('event-fullscreen-modal') ? 'event-fullscreen-backdrop' : className.includes('pro-form-modal') ? 'pro-form-backdrop' : className.includes('draft-list-fullscreen') ? 'draft-list-fullscreen-backdrop' : ''}`.trim()} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose?.(); }}>
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

/**
 * Styled dropdown used in place of the native <select>.
 * `options` are strings or { value, label }; `onChange` receives the option value.
 */
export function Select({ value, options, onChange, ariaLabel, id, disabled = false, className = '', placeholder = 'Select…' }) {
  const items = options.map((option) => (typeof option === 'object' ? option : { value: option, label: option }));
  const selectedIndex = items.findIndex((item) => item.value === value);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(Math.max(selectedIndex, 0));
  const [placement, setPlacement] = useState('down');
  const rootRef = useRef(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const bounds = rootRef.current.getBoundingClientRect();
    const menuHeight = Math.min(240, items.length * 42 + 12);
    setPlacement(bounds.bottom + menuHeight > window.innerHeight - 12 && bounds.top > menuHeight ? 'up' : 'down');
    const closeOutside = (event) => { if (!rootRef.current?.contains(event.target)) setOpen(false); };
    document.addEventListener('mousedown', closeOutside);
    return () => document.removeEventListener('mousedown', closeOutside);
  }, [open, items.length]);

  useEffect(() => {
    if (open) rootRef.current?.querySelector(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  const openMenu = () => { setActiveIndex(Math.max(selectedIndex, 0)); setOpen(true); };
  const choose = (index) => { const item = items[index]; if (item) onChange(item.value); setOpen(false); };
  const onKeyDown = (event) => {
    if (disabled) return;
    const keys = {
      ArrowDown: () => (open ? setActiveIndex((index) => Math.min(index + 1, items.length - 1)) : openMenu()),
      ArrowUp: () => (open ? setActiveIndex((index) => Math.max(index - 1, 0)) : openMenu()),
      Home: () => open && setActiveIndex(0),
      End: () => open && setActiveIndex(items.length - 1),
      Enter: () => (open ? choose(activeIndex) : openMenu()),
      ' ': () => (open ? choose(activeIndex) : openMenu()),
      Escape: () => setOpen(false),
      Tab: () => setOpen(false),
    };
    if (!keys[event.key]) return;
    if (event.key !== 'Tab') event.preventDefault();
    keys[event.key]();
  };

  return (
    <div ref={rootRef} className={`custom-select is-${placement} ${className}`.trim()}>
      <button
        type="button"
        id={id}
        className={`custom-select-trigger ${open ? 'is-open' : ''}`}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${activeIndex}` : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
      >
        <span className="custom-select-value">{items[selectedIndex]?.label ?? placeholder}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      {open && (
        <div className="custom-select-menu" role="listbox" id={listId} aria-label={ariaLabel}>
          {items.map((item, index) => (
            <div
              key={item.value}
              id={`${listId}-${index}`}
              data-index={index}
              role="option"
              aria-selected={index === selectedIndex}
              className={`custom-select-option ${index === selectedIndex ? 'is-selected' : ''} ${index === activeIndex ? 'is-active' : ''}`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(event) => event.preventDefault()}
              // preventDefault stops a wrapping <label> (FormField) from re-clicking the trigger.
              onClick={(event) => { event.preventDefault(); choose(index); }}
            >
              <span>{item.label}</span>
              {index === selectedIndex && <Check size={15} className="custom-select-check" aria-hidden="true" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
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
