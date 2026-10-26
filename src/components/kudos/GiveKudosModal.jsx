import { useEffect, useState } from 'react';
import { Heart, Send } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import EmployeePicker from '../common/EmployeePicker';
import { Button, FormField, Modal } from '../common/UI';

const CATEGORIES = ['Teamwork', 'Ownership', 'Customer focus', 'Curiosity', 'Kindness', 'Creative thinking'];

export default function GiveKudosModal({ open, onClose }) {
  const { addKudos, user, setToast } = useApp();
  const [recipient, setRecipient] = useState(null);
  const [category, setCategory] = useState('Teamwork');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setRecipient(null);
    setCategory('Teamwork');
    setMessage('');
    setSubmitting(false);
    setError('');
  }, [open]);

  const canSubmit = Boolean(recipient) && message.trim().length >= 5 && !submitting;

  const submit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError('');
    try {
      await addKudos({
        from: user?.name || 'Employee',
        to: recipient.name,
        toEmployeeId: recipient.id,
        category,
        message: message.trim(),
        initials: user?.initials,
        color: user?.color || 'blue',
      });
      setToast('Kudos sent. Thank you for the appreciation!');
      onClose?.();
    } catch (err) {
      const messageText = err.message || 'Unable to send kudos.';
      setError(messageText);
      setToast(messageText);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Give someone Kudos"
      description="A few kind words can brighten someone's day."
      className="give-kudos-modal"
    >
      <form className="form-stack" onSubmit={submit}>
        <EmployeePicker
          selected={recipient}
          onSelect={setRecipient}
          excludeEmployeeId={user?.id}
          label="Give Kudos To"
        />

        <FormField label="Recognition theme">
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
          </select>
        </FormField>

        <FormField label="Your message">
          <textarea
            required
            minLength={5}
            maxLength={400}
            rows={4}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Tell them what you appreciated..."
          />
          <small>{message.length}/400 characters</small>
        </FormField>

        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="modal-actions">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={!canSubmit}>
            {submitting ? <><Send size={15} /> Sending...</> : <><Heart size={15} /> Send Kudos</>}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
