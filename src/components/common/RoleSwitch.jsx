import { useState } from 'react';
import { ArrowLeftRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

/**
 * Role-based mode switch (replaces the old "Demo view" select).
 *
 * - Renders nothing unless the backend granted the account the HR Admin role.
 * - Switching keeps the current session (no re-login) and navigates to the
 *   dashboard for the selected mode.
 */
export default function RoleSwitch({ onSwitched }) {
  const { role, setRole, canUseHrAdmin, setToast } = useApp();
  const [switching, setSwitching] = useState(false);
  const navigate = useNavigate();

  if (!canUseHrAdmin) return null;

  const targetRole = role === 'HR Admin' ? 'Employee' : 'HR Admin';

  const handleSwitch = async () => {
    if (switching) return;
    setSwitching(true);
    try {
      // Brief loading feedback while the mode and route update.
      await new Promise((resolve) => setTimeout(resolve, 250));
      if (!setRole(targetRole)) {
        setToast('Your account is not authorized for HR Admin mode.');
        return;
      }
      setToast(`Switched to ${targetRole} mode.`);
      onSwitched?.();
      navigate(targetRole === 'HR Admin' ? '/admin' : '/');
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="role-switch">
      <label>Current mode — {role}</label>
      <button type="button" className="role-switch-button" onClick={handleSwitch} disabled={switching}>
        {switching ? <Loader2 size={14} className="role-switch-spin" /> : <ArrowLeftRight size={14} />}
        <span>{switching ? `Switching to ${targetRole}…` : `Switch to ${targetRole}`}</span>
      </button>
      <small className="demo-warning">Mode follows your account permissions.</small>
    </div>
  );
}
