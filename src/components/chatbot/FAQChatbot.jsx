import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  Bot,
  ChevronDown,
  LifeBuoy,
  MessageCircle,
  RotateCcw,
  Send,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const noAnswer = 'I could not find an approved answer for that question. Try rephrasing it, or reach an HR representative through Quick Connect.';
const MAX_MESSAGE_LENGTH = 500;
const MAX_SUGGESTIONS = 4;
const REPLY_DELAY = 400;

function Message({ message, onContactHr }) {
  const isUser = message.role === 'user';
  const label = isUser ? 'You' : message.category ? `Orbit Assistant · ${message.category}` : 'Orbit Assistant';

  return (
    <div className={`chat-message-row ${isUser ? 'is-user' : 'is-bot'}`}>
      {!isUser && <span className="message-avatar" aria-hidden="true"><Bot size={14} /></span>}
      <div className={`chat-message ${isUser ? 'user' : 'bot'} ${message.kind === 'no-answer' ? 'is-warning' : ''}`}>
        <span className="message-label">{label}</span>
        <p>{message.text}</p>
        {message.kind === 'no-answer' && (
          <button type="button" className="chat-message-action" onClick={onContactHr}>
            Contact HR <ArrowUpRight size={13} />
          </button>
        )}
      </div>
      {isUser && <span className="message-avatar user-avatar" aria-hidden="true"><UserRound size={14} /></span>}
    </div>
  );
}

function WelcomeScreen({ firstName, suggestions, busy, kbState, onAsk }) {
  return (
    <div className="chat-welcome">
      <span className="chat-welcome-icon" aria-hidden="true"><Sparkles size={18} /></span>
      <span className="chat-welcome-eyebrow">Hi {firstName} · HR FAQ assistant</span>
      <h2>How can I help you today?</h2>
      <p>
        Ask about HR policies, leave, attendance, payroll, benefits, company holidays, or any other HR topic.
        Every answer comes from the HR knowledge base maintained by HR.
      </p>
      {suggestions.length > 0 ? (
        <div className="chat-suggestions" aria-label="Suggested questions">
          <span className="chat-section-label">Suggested questions</span>
          {suggestions.map((item) => (
            <button
              key={item.id ?? item.question}
              type="button"
              className="chat-suggestion"
              onClick={() => onAsk(item.question)}
              disabled={busy || kbState !== 'ready'}
            >
              <span className="chat-suggestion-category">{item.category || 'HR'}</span>
              <span className="chat-suggestion-text">{item.question}</span>
              <ArrowUpRight size={13} className="chat-suggestion-arrow" aria-hidden="true" />
            </button>
          ))}
        </div>
      ) : (
        <p className="chat-welcome-note">
          {kbState === 'loading' && <><span className="chat-kb-spinner" aria-hidden="true" />Loading approved answers…</>}
          {kbState === 'error' && 'Suggested questions are unavailable until the knowledge base reconnects.'}
          {(kbState === 'empty' || kbState === 'ready') && 'No suggested questions yet — type your question below and I will search the knowledge base.'}
        </p>
      )}
    </div>
  );
}

export default function FAQChatbot() {
  const { faqs, faqsState, user } = useApp();
  const navigate = useNavigate();
  const threadRef = useRef(null);
  const inputRef = useRef(null);
  const launcherRef = useRef(null);
  const panelRef = useRef(null);
  const replyTimer = useRef(null);
  const processingRef = useRef(false);
  const idRef = useRef(0);

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState([]);

  const firstName = (user?.name || 'there').trim().split(/\s+/)[0];

  const allQuestions = useMemo(
    () => faqs.map((item) => ({
      ...item,
      normalized: `${item.question || ''} ${item.category || ''} ${item.answer || ''}`.toLowerCase(),
    })),
    [faqs],
  );

  const suggestions = useMemo(
    () => faqs
      .filter((item) => item?.question)
      .slice(0, MAX_SUGGESTIONS)
      .map((item) => ({ id: item.id, question: item.question, category: item.category })),
    [faqs],
  );

  const kbState = faqsState.loading ? 'loading' : faqsState.error ? 'error' : faqs.length ? 'ready' : 'empty';
  const kbLabel = kbState === 'loading'
    ? 'Loading approved answers…'
    : kbState === 'error'
      ? 'Knowledge base unavailable'
      : kbState === 'empty'
        ? 'No answers published yet'
        : `${faqs.length} approved answer${faqs.length === 1 ? '' : 's'}`;

  const scrollToLatest = useCallback(() => {
    const node = threadRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!open || messages.length === 0) return;
    scrollToLatest();
  }, [open, messages, isProcessing, scrollToLatest]);

  // Open/close lifecycle: focus the composer, and dismiss the assistant on
  // Escape or on any interaction outside the panel (click anywhere else).
  useEffect(() => {
    if (!open) return undefined;
    const focusTimer = window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 60);
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      launcherRef.current?.focus({ preventScroll: true });
    };
    const handleOutsideInteraction = (event) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      // Inside the panel: keep chatting. On the launcher: its own click toggles.
      if (panelRef.current?.contains(target)) return;
      if (launcherRef.current?.contains(target)) return;
      setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handleOutsideInteraction, true);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handleOutsideInteraction, true);
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(replyTimer.current), []);

  useEffect(() => {
    const openAssistant = () => setOpen(true);
    window.addEventListener('hrobit-open-chat', openAssistant);
    return () => window.removeEventListener('hrobit-open-chat', openAssistant);
  }, []);

  const sendMessage = (rawText) => {
    const message = rawText.trim();
    if (!message || processingRef.current) return;

    processingRef.current = true;
    setIsProcessing(true);
    setInput('');
    setMessages((items) => [...items, { id: `u-${++idRef.current}`, role: 'user', text: message }]);

    window.clearTimeout(replyTimer.current);
    replyTimer.current = window.setTimeout(() => {
      const terms = message.toLowerCase().split(/\W+/).filter((word) => word.length > 3);
      const found = allQuestions
        .map((faq) => ({ faq, score: terms.reduce((sum, term) => sum + (faq.normalized.includes(term) ? 1 : 0), 0) }))
        .sort((a, b) => b.score - a.score)[0];

      setMessages((items) => [...items, found?.score
        ? { id: `b-${++idRef.current}`, role: 'bot', text: found.faq.answer, category: found.faq.category }
        : { id: `b-${++idRef.current}`, role: 'bot', text: noAnswer, kind: 'no-answer' }]);
      processingRef.current = false;
      setIsProcessing(false);
    }, REPLY_DELAY);
  };

  const closeAssistant = () => {
    setOpen(false);
    launcherRef.current?.focus({ preventScroll: true });
  };

  const clearChat = () => {
    if (!messages.length) return;
    if (!window.confirm('Clear this conversation? This removes the current chat history.')) return;
    window.clearTimeout(replyTimer.current);
    processingRef.current = false;
    idRef.current = 0;
    setMessages([]);
    setInput('');
    setIsProcessing(false);
    inputRef.current?.focus({ preventScroll: true });
  };

  const openContacts = () => {
    navigate('/hr-contacts');
    setOpen(false);
  };

  const submit = (event) => {
    event.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      <button
        type="button"
        ref={launcherRef}
        className={`chatbot-launcher ${open ? 'is-open' : ''}`}
        aria-label={open ? 'Close HR FAQ assistant' : 'Open HR FAQ assistant'}
        aria-expanded={open}
        aria-controls="hr-assistant-panel"
        onClick={() => (open ? closeAssistant() : setOpen(true))}
      >
        {open ? <ChevronDown size={22} /> : <><MessageCircle size={21} /><span className="chat-launcher-spark"><Sparkles size={11} /></span></>}
      </button>

      {open && (
        <section id="hr-assistant-panel" ref={panelRef} className="chatbot-panel" role="dialog" aria-label="HR FAQ assistant">
          <header className="chatbot-header">
            <div className="chatbot-avatar" aria-hidden="true"><Bot size={20} /></div>
            <div className="chatbot-header-copy">
              <strong>Orbit Assistant</strong>
              <span className={`chatbot-status is-${kbState}`}>
                <i aria-hidden="true" />
                <span className="chatbot-status-text">{kbLabel}</span>
              </span>
            </div>
            <div className="chatbot-header-actions">
              <button
                type="button"
                className="chatbot-icon-button"
                onClick={clearChat}
                disabled={!messages.length}
                aria-label="Clear chat history"
                title="Clear chat history"
              >
                <RotateCcw size={15} />
              </button>
              <button type="button" className="chatbot-icon-button" onClick={closeAssistant} aria-label="Minimize chat" title="Minimize">
                <ChevronDown size={17} />
              </button>
            </div>
          </header>

          <div className="chatbot-thread" ref={threadRef} role="log" aria-live="polite" aria-label="Conversation">
            {kbState === 'error' && (
              <div className="chat-kb-notice" role="alert">
                <AlertCircle size={14} aria-hidden="true" />
                <p>{faqsState.error || 'The HR knowledge base could not be loaded.'}</p>
                <button type="button" onClick={() => faqsState.refresh()}>Retry</button>
              </div>
            )}

            {messages.length === 0 ? (
              <WelcomeScreen
                firstName={firstName}
                suggestions={suggestions}
                busy={isProcessing}
                kbState={kbState}
                onAsk={sendMessage}
              />
            ) : (
              <div className="chat-messages">
                {messages.map((message) => <Message message={message} key={message.id} onContactHr={openContacts} />)}
                {isProcessing && (
                  <div className="chat-message-row is-bot">
                    <span className="message-avatar" aria-hidden="true"><Bot size={14} /></span>
                    <div className="chat-message bot chat-loading" role="status" aria-label="Orbit Assistant is preparing an answer">
                      <span className="message-label">Orbit Assistant</span>
                      <span className="typing-dots" aria-hidden="true"><i /><i /><i /></span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <form className="chatbot-compose" onSubmit={submit}>
            <div className="chatbot-input-wrap">
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about leave, payroll, benefits…"
                aria-label="Ask an HR question"
                maxLength={MAX_MESSAGE_LENGTH}
                autoComplete="off"
              />
              <button
                type="submit"
                className={`chatbot-send ${isProcessing ? 'is-busy' : ''}`}
                disabled={!input.trim() || isProcessing}
                aria-label={isProcessing ? 'Waiting for the assistant' : 'Send message'}
              >
                {isProcessing ? <span className="chatbot-send-spinner" aria-hidden="true" /> : <Send size={16} />}
              </button>
            </div>
            <div className="chatbot-foot">
              <button
                type="button"
                className="chatbot-contact-hr"
                onClick={openContacts}
                title="Not resolved by the assistant? Reach a real HR representative."
              >
                <LifeBuoy size={13} aria-hidden="true" />
                <span>Contact HR</span>
              </button>
              <p className="chatbot-compose-hint">
                {isProcessing ? 'Searching the knowledge base…' : 'Press Enter to send'}
              </p>
            </div>
          </form>
        </section>
      )}
    </>
  );
}
