import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Plus, ArrowUpRight, Sparkles } from 'lucide-react';
import { employees as fallbackEmployees } from '../../data/employees';
import { useApp } from '../../context/AppContext';

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

export function Avatar({ name = 'Demo User', initials, color = 'blue', size = '', src }) {
  const [imgError, setImgError] = useState(false);

  const { employees: directory = [] } = useApp();
  const people = directory.length ? directory : fallbackEmployees;
  const match = people.find((e) => e.name === name || (initials && e.initials === initials));
  const resolvedSrc = src || match?.avatar;
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

export function Modal({ open, onClose, title, description, children, wide = false }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose?.(); }}>
      <motion.div
        className={`modal ${wide ? 'modal-wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ opacity: 0, y: 14, scale: .98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: .18 }}
      >
        <div className="modal-header">
          <div>
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button className="icon-button" aria-label="Close dialog" onClick={onClose}>
            <X size={19} />
          </button>
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

export function FormField({ label, children, hint }) {
  return (
    <label className="form-field">
      <span>{label}</span>
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
