import { useEffect, useState } from 'react';
import { HeartHandshake, Send, X } from 'lucide-react';
import { Modal, Button } from '../common/UI';
import { dataApi } from '../../services/api';

const SUPPORT_MESSAGES = [
  "You've got this! One step at a time 💛",
  "Just a reminder that you're valued and appreciated 🌻",
  "I'm here if you need someone to talk to 🤝",
  'Want to take a quick break or grab a coffee? ☕',
  "It's okay to have difficult days. Be kind to yourself 🌈",
];

export default function MoodMessageComposer({ mood, open, onClose, onSent, setToast }) {
  const support = mood?.isSupport;
  const [message, setMessage] = useState('');
  const [custom, setCustom] = useState(false);
  const [offerToChat, setOfferToChat] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return undefined;
    setMessage(''); setCustom(false); setOfferToChat(false); setError('');
    const handleKeyDown = (event) => { if (event.key === 'Escape' && !sending) onClose?.(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, mood?.id, onClose, sending]);

  const send = async () => {
    const value = message.trim();
    if (!value || sending) return;
    setSending(true); setError('');
    try {
      await dataApi.moods.sendMessage(mood.id, { kind: support ? 'support' : 'celebration', message: value, custom, offerToChat: support && offerToChat });
      setToast?.(support ? 'Your supportive message was delivered privately.' : 'Your celebration message was delivered.');
      onSent?.(); onClose?.();
    } catch (err) { setError(err.message || 'Unable to send this message.'); }
    finally { setSending(false); }
  };

  return <Modal open={open} onClose={onClose} title={support ? 'Send some sunshine 💛' : 'Send a celebration'} description={support ? 'Supportive messages are delivered privately by default.' : "Let's celebrate this moment together."}>
    <div className="mood-composer-body">
      <div className="mood-composer-recipient"><HeartHandshake size={18}/><span>To <strong>{mood?.employee?.name || 'a colleague'}</strong></span></div>
      {support && <div className="mood-message-presets">{SUPPORT_MESSAGES.map((preset) => <button type="button" className={`mood-message-preset ${message === preset ? 'selected' : ''}`} key={preset} onClick={() => { setMessage(preset); setCustom(false); }}>{preset}</button>)}</div>}
      {!support && <p className="mood-composer-prompt">Share a little appreciation with your teammate.</p>}
      <label className="mood-custom-toggle"><input type="checkbox" checked={custom} onChange={(event) => setCustom(event.target.checked)}/><span>Write a custom message</span></label>
      {(custom || !support) && <textarea className="mood-message-input" value={message} onChange={(event) => setMessage(event.target.value.slice(0, 500))} placeholder={support ? 'Write something kind...' : 'Add a cheerful note...'} maxLength={500} rows={4} autoFocus={custom}/>} 
      {support && <label className="mood-custom-toggle"><input type="checkbox" checked={offerToChat} onChange={(event) => setOfferToChat(event.target.checked)}/><span>Offer to chat</span></label>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="mood-composer-actions"><Button variant="ghost" onClick={onClose} disabled={sending}><X size={15}/> Cancel</Button><Button onClick={send} disabled={sending || !message.trim()}>{sending ? 'Sending…' : <><Send size={15}/> Send</>}</Button></div>
    </div>
  </Modal>;
}
