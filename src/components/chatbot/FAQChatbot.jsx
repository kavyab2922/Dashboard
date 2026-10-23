import { useEffect, useMemo, useState } from 'react';
import { Bot, ChevronDown, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
const suggestions = ['Where can I review leave information?', 'How do I contact HR?', 'Where can I find my payslip?'];

export default function FAQChatbot() {
  const { faqs, currentEmployee } = useApp();
  const starterText = `Hi ${currentEmployee.name.split(' ')[0]}! I can help you navigate HR policies, benefits, leave, and contacts. What would you like to know?`;
  const suggestions = ['Where can I review leave information?', 'How do I contact HR?', 'Where can I find my payslip?'];
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ id: 'welcome', from: 'bot', text: starterText }]);
  const navigate = useNavigate();
  const allQuestions = useMemo(() => faqs.map((item) => ({ ...item, normalized: `${item.question} ${item.category} ${item.answer}`.toLowerCase() })), [faqs]);

  useEffect(() => {
    const openAssistant = () => setOpen(true);
    window.addEventListener('hrobit-open-chat', openAssistant);
    return () => window.removeEventListener('hrobit-open-chat', openAssistant);
  }, []);

  const sendMessage = (text) => {
    const message = text.trim();
    if (!message) return;
    const normalized = message.toLowerCase();
    const terms = normalized.split(/\W+/).filter((word) => word.length > 3);
    const found = allQuestions.map((faq) => ({ faq, score: terms.reduce((sum, term) => sum + (faq.normalized.includes(term) ? 1 : 0), 0) })).sort((a, b) => b.score - a.score)[0];
    const answer = found?.score ? found.faq.answer : 'I’m unable to find an approved answer for that question. Please contact the appropriate HR representative through Quick Connect.';
    setMessages((items) => [...items, { id: `u-${Date.now()}`, from: 'user', text: message }, { id: `b-${Date.now() + 1}`, from: 'bot', text: answer }]);
    setInput('');
  };

  return <><button className={`chatbot-launcher ${open ? 'is-open' : ''}`} aria-label={open ? 'Close HR FAQ assistant' : 'Open HR FAQ assistant'} onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <><MessageCircle size={21} /><span className="chat-launcher-spark"><Sparkles size={11} /></span></>}</button>{open && <section className="chatbot-panel" aria-label="HR FAQ assistant"><header className="chatbot-header"><div className="chatbot-avatar"><Bot size={21} /></div><div><strong>Orbit Assistant</strong><span><i /> Demo FAQ · Not AI-powered</span></div><button className="chatbot-close" aria-label="Minimize chat" onClick={() => setOpen(false)}><ChevronDown size={18} /></button></header><div className="chatbot-content"><div className="chatbot-intro"><span className="assistant-spark"><Sparkles size={14} /></span><strong>Your HR sidekick</strong><p>Ask a question or choose a suggested topic below.</p></div><div className="chat-messages">{messages.map((message) => <div className={`chat-message ${message.from}`} key={message.id}>{message.from === 'bot' && <span className="message-avatar"><Bot size={14} /></span>}<p>{message.text}</p></div>)}</div>{messages.length < 4 && <div className="chat-suggestions">{suggestions.map((suggestion) => <button key={suggestion} onClick={() => sendMessage(suggestion)}>{suggestion} <span>↗</span></button>)}</div>}<button className="chat-quick-connect" onClick={() => { navigate('/hr-contacts'); setOpen(false); }}>Browse HR contacts <span>→</span></button></div><form className="chatbot-compose" onSubmit={(event) => { event.preventDefault(); sendMessage(input); }}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask an HR question..." aria-label="Ask an HR question"/><button type="submit" disabled={!input.trim()} aria-label="Send message"><Send size={17} /></button></form><div className="chatbot-disclaimer">Sample answers only · Check official HR guidance</div></section>}</>;
}