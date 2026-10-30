import { useCallback, useEffect, useRef, useState } from 'react';
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
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { APP_SUGGESTIONS } from '../../data/appGuide';
import { buildAssistantReply, isKnowledgeQuestion } from '../../utils/appAssistant';
import { chatbotApi } from '../../services/api';

const MAX_MESSAGE_LENGTH = 500;
const MAX_APP_SUGGESTIONS = 3;
const MAX_HR_SUGGESTIONS = 3;
const REPLY_DELAY = 400;

const LABELS = {
  app: 'HROrbit guide',
  unavailable: 'HROrbit guide',
  clarify: 'HROrbit guide',
  capabilities: 'HROrbit guide',
  fallback: 'HROrbit guide',
};

function SuggestionGroup({ label, items, busy, disabled, onAsk }) {
  if (!items.length) return null;
  return (
    <div className="chat-suggestions" aria-label={label}>
      <span className="chat-section-label">{label}</span>
      {items.map((item) => (
        <button
          key={item.id ?? item.question}
          type="button"
          className="chat-suggestion"
          onClick={() => onAsk(item.question)}
          disabled={busy || disabled}
        >
          <span className="chat-suggestion-category">{item.category || 'HROrbit'}</span>
          <span className="chat-suggestion-text">{item.question}</span>
          <ArrowUpRight size={13} className="chat-suggestion-arrow" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

function Message({ message, onAsk, onContactHr, onNavigate }) {
  const isUser = message.role === 'user';
  const tag = message.role === 'bot' ? (message.category || LABELS[message.kind]) : null;
  const label = isUser ? 'You' : `Orbit Assistant${tag ? ` · ${tag}` : ''}`;
  const isCaveat = message.kind === 'unavailable' || message.kind === 'fallback';

  return (
    <div className={`chat-message-row ${isUser ? 'is-user' : 'is-bot'}`}>
      {!isUser && <span className="message-avatar" aria-hidden="true"><Bot size={14} /></span>}
      <div className={`chat-message ${isUser ? 'user' : 'bot'} ${isCaveat ? 'is-warning' : ''}`}>
        <span className="message-label">{label}</span>
        {message.title && <strong className="chat-message-title">{message.title}</strong>}
        {message.text && <p style={{ whiteSpace: 'pre-wrap' }}>{message.text}</p>}

        {message.steps?.length > 0 && (
          <ol className="chat-steps">
            {message.steps.map((step) => <li key={step}>{step}</li>)}
          </ol>
        )}

        {message.areas?.length > 0 && (
          <ul className="chat-areas">
            {message.areas.map((area) => <li key={area}>{area}</li>)}
          </ul>
        )}

        {message.note && <p className="chat-message-note">{message.note}</p>}

        {message.sources?.length > 0 && (
          <div className="chat-message-note">
            <strong>Sources:</strong> {message.sources.join(', ')}
          </div>
        )}

        {message.options?.length > 0 && (
          <div className="chat-options">
            {message.options.map((option) => (
              <button
                key={option.label}
                type="button"
                className="chat-option"
                onClick={() => (option.route ? onNavigate(option.route) : onAsk(option.question || option.label))}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {message.route && message.routeLabel && (
          <button type="button" className="chat-message-action" onClick={() => onNavigate(message.route)}>
            {message.routeLabel} <ArrowUpRight size={13} />
          </button>
        )}

        {message.kind === 'fallback' && (
          <button type="button" className="chat-contact-link" onClick={onContactHr}>
            <LifeBuoy size={12} aria-hidden="true" /> Talk to a person
          </button>
        )}
      </div>
      {isUser && <span className="message-avatar user-avatar" aria-hidden="true"><UserRound size={14} /></span>}
    </div>
  );
}

function WelcomeScreen({ firstName, appSuggestions, hrSuggestions, busy, kbState, onAsk }) {
  return (
    <div className="chat-welcome">
      <span className="chat-welcome-icon" aria-hidden="true"><Sparkles size={18} /></span>
      <span className="chat-welcome-eyebrow">Hi {firstName} · Orbit Assistant</span>
      <h2>How can I help you today?</h2>
      <p>
        Ask how to use HROrbit — your dashboard, profile, announcements, kudos, Quick Connect and more — or ask
        about HR policies like leave, payroll and benefits. Policy answers come from the HR knowledge base.
      </p>

      <SuggestionGroup
        label="Using HROrbit"
        items={appSuggestions}
        busy={busy}
        disabled={false}
        onAsk={onAsk}
      />

      <SuggestionGroup
        label="From the HR knowledge base"
        items={hrSuggestions}
        busy={busy}
        disabled={kbState === 'loading' || kbState === 'error'}
        onAsk={onAsk}
      />

      {hrSuggestions.length === 0 && (
        <p className="chat-welcome-note">
          {kbState === 'loading' && <><span className="chat-kb-spinner" aria-hidden="true" />Loading approved HR answers…</>}
          {kbState === 'error' && 'HR answers are unavailable until the knowledge base reconnects — app guides still work.'}
          {(kbState === 'empty' || kbState === 'ready') && 'No suggested HR questions yet — type your question below and I will search the knowledge base.'}
        </p>
      )}
    </div>
  );
}

export default function FAQChatbot() {
  const { faqs, faqsState, user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const threadRef = useRef(null);
  const inputRef = useRef(null);
  const launcherRef = useRef(null);
  const panelRef = useRef(null);
  const replyTimer = useRef(null);
  const processingRef = useRef(false);
  const sendRef = useRef(null);
  const idRef = useRef(0);

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState([]);

  const firstName = (user?.name || 'there').trim().split(/\s+/)[0];

  const appSuggestions = APP_SUGGESTIONS.slice(0, MAX_APP_SUGGESTIONS).map((question) => ({
    id: `app-${question}`,
    question,
    category: 'HROrbit guide',
  }));

  const hrSuggestions = faqs
    .filter((item) => item?.question)
    .slice(0, MAX_HR_SUGGESTIONS)
    .map((item) => ({ id: item.id, question: item.question, category: item.category || 'HR' }));

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

  // Every route change dismisses the assistant, however the navigation happened.
  useEffect(() => {
    // Only the pathname matters: query/hash updates should not close the chat.
    setOpen(false);
  }, [location.pathname]);

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

  // Pages (e.g. the HR FAQ assistant page) can open the chat and ask a question:
  // window.dispatchEvent(new CustomEvent('hrobit-open-chat', { detail: { question } }))
  useEffect(() => {
    const openAssistant = (event) => {
      setOpen(true);
      const question = event?.detail?.question;
      if (!question) return;
      window.setTimeout(() => sendRef.current?.(question), 80);
    };
    window.addEventListener('hrobit-open-chat', openAssistant);
    return () => window.removeEventListener('hrobit-open-chat', openAssistant);
  }, []);

  const sendMessage = async (rawText) => {
    const message = String(rawText || '').trim();
    if (!message || processingRef.current) return;

    processingRef.current = true;
    setIsProcessing(true);
    setInput('');
    const priorConversation = messages.slice(-6).map((item) => ({
      role: item.role === 'bot' ? 'assistant' : 'user',
      content: item.text || '',
    }));
    setMessages((items) => [...items, { id: `u-${++idRef.current}`, role: 'user', text: message }]);

    try {
      const result = await chatbotApi.ask(message, priorConversation);
      setMessages((items) => [...items, {
        id: `b-${++idRef.current}`,
        role: 'bot',
        kind: result.dataType === 'live' ? 'live' : result.intent === 'service_unavailable' ? 'unavailable' : 'faq',
        category: result.dataType === 'live'
          ? 'Live HROrbit data'
          : result.intent === 'leave_policy'
            ? 'Grounded leave policy'
            : result.intent === 'grounded_knowledge'
              ? 'Grounded HR answer'
              : 'HROrbit guide',
        text: result.answer,
        sources: result.sources || [],
      }]);
    } catch (error) {
      const reply = isKnowledgeQuestion(message)
        ? {
          kind: 'unavailable',
          title: 'HR knowledge temporarily unavailable',
          text: 'I could not retrieve the verified HR document right now. Please try again or contact HR.',
        }
        : buildAssistantReply(message, faqs, { firstName }) || {
          kind: 'fallback',
          title: 'Assistant unavailable',
          text: 'I could not reach the HR assistant. Please try again or contact HR.',
        };
      setMessages((items) => [...items, { id: `b-${++idRef.current}`, role: 'bot', ...reply }]);
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  };

  sendRef.current = sendMessage;

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

  const goTo = (route) => {
    if (!route) return;
    navigate(route);
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
                appSuggestions={appSuggestions}
                hrSuggestions={hrSuggestions}
                busy={isProcessing}
                kbState={kbState}
                onAsk={sendMessage}
              />
            ) : (
              <div className="chat-messages">
                {messages.map((message) => (
                  <Message
                    message={message}
                    key={message.id}
                    onAsk={sendMessage}
                    onContactHr={openContacts}
                    onNavigate={goTo}
                  />
                ))}
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
                placeholder="Ask about HROrbit or HR policies…"
                aria-label="Ask an HR question about HROrbit"
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
                {isProcessing ? 'Searching HROrbit help and HR answers…' : 'Press Enter to send'}
              </p>
            </div>
          </form>
        </section>
      )}
    </>
  );
}
