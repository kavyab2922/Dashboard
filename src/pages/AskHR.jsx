import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, RefreshCw, ChevronRight, Search } from 'lucide-react';

/* ── Knowledge Base ────────────────────────────────────────── */
const KB = [
  {
    keywords: ['leave', 'annual leave', 'vacation', 'days off', 'holiday', 'pto'],
    category: 'Leave',
    question: 'How many leaves do I get per year?',
    answer: `You're entitled to **18 days of Annual Leave** per year. Here's the breakdown:\n\n• 🏖️ **Annual Leave**: 18 days (can carry forward 10 days)\n• 🤒 **Sick Leave**: 12 days (no carry forward)\n• 🏠 **WFH**: Up to 3 days/week with manager approval\n• 🗓️ **Public Holidays**: 12 days per year\n\nLeave must be applied at least **3 days in advance** through the Leave Tracker. Sick leave beyond 3 consecutive days requires a medical certificate.`,
    followups: ['How do I apply for leave?', 'Can I carry forward unused leave?'],
  },
  {
    keywords: ['apply leave', 'request leave', 'submit leave', 'how to apply'],
    category: 'Leave',
    question: 'How do I apply for leave?',
    answer: `Applying for leave is simple!\n\n1. Go to the **Leave Tracker** page in OfficeVerse\n2. Click **"Apply Leave"** button\n3. Select leave type, dates, and add a reason\n4. Submit — your manager gets an instant notification\n\n⏳ **Approval timeline**: 1–2 business days\n✅ **You'll be notified** once approved or rejected\n\nFor urgent leaves, call or message your manager directly.`,
    followups: ['How many leaves do I get?', 'What types of leave are available?'],
  },
  {
    keywords: ['salary', 'pay', 'payslip', 'payroll', 'ctc', 'hike', 'increment', 'bonus'],
    category: 'Payroll',
    question: 'When is salary credited?',
    answer: `Salary details at a glance:\n\n💰 **Credit Date**: Last working day of every month\n📄 **Payslip**: Available by 1st of next month in your email\n🏦 **Bank Transfer**: Direct credit to registered account\n\n**Salary Revision**: Happens annually in April, post performance review cycle (December).\n\n**Tax**: Form 16 issued in June every year. Investment declarations due in January.\n\nFor payslip access or discrepancies, contact **payroll@officeverse.com**.`,
    followups: ['How does performance review work?', 'What are the benefits?'],
  },
  {
    keywords: ['health', 'insurance', 'medical', 'hospital', 'coverage', 'claim'],
    category: 'Benefits',
    question: 'What does health insurance cover?',
    answer: `Your health coverage is comprehensive:\n\n🏥 **Coverage Amount**: ₹5,00,000 per annum\n👨‍👩‍👧 **Covers**: Self + Spouse + 2 Children\n👴 **Parents**: Can be added at 20% subsidized premium\n\n**What's included**:\n• ✅ Hospitalization (cashless + reimbursement)\n• ✅ Day-care procedures\n• ✅ Pre & post hospitalization (60 days)\n• ✅ Annual health check-up (mandatory + fully covered)\n\n**Starting April 2026**: Coverage upgraded to ₹7.5L with dental, vision & mental health benefits.\n\nFor claims, contact **benefits@officeverse.com** or call the insurer helpline.`,
    followups: ['What other benefits do I have?', 'How do I claim insurance?'],
  },
  {
    keywords: ['benefits', 'perks', 'wellness', 'gym', 'allowance', 'perk'],
    category: 'Benefits',
    question: 'What are all my benefits?',
    answer: `Here's everything you get at OfficeVerse:\n\n**💰 Financial**\n• Health Insurance: ₹5L (→₹7.5L from April 2026)\n• L&D Budget: ₹50,000/year\n• Wellness Allowance: ₹2,000/month\n\n**🌱 Growth**\n• Course & certification reimbursement\n• Mentorship program\n• Internal mobility program\n\n**🏠 Flexibility**\n• WFH up to 3 days/week\n• Flexible start time: 8–11 AM (new from March 2026)\n• Core hours: 11 AM–4 PM\n\n**🎯 Recognition**\n• Peer-to-peer kudos + points\n• Quarterly awards\n• Annual innovation grants`,
    followups: ['How do I use my L&D budget?', 'Tell me about the wellness allowance'],
  },
  {
    keywords: ['learning', 'training', 'course', 'certification', 'upskill', 'development', 'l&d', 'budget'],
    category: 'Learning',
    question: 'How do I use my Learning & Development budget?',
    answer: `You have **₹50,000/year** to invest in your growth! Here's how:\n\n**Eligible expenses:**\n• 📚 Online courses (Udemy, Coursera, LinkedIn Learning)\n• 🎓 Certification exams (AWS, PMP, CFA, etc.)\n• 📖 Books & learning materials\n• 🎤 Industry conferences\n\n**Process:**\n1. Submit request to your manager (2 weeks in advance)\n2. Manager approves\n3. HR processes reimbursement within 7 working days\n\n**Certification reimbursement:**\n• 100% for role-relevant certifications\n• 75% for general certifications (must pass)\n• Bond: 1 year of service after reimbursement\n\n⚠️ **Unused budget does NOT carry forward. Resets April 1st!**`,
    followups: ['When does L&D budget reset?', 'What certifications are covered?'],
  },
  {
    keywords: ['performance', 'review', 'appraisal', 'rating', 'goal', 'okr', 'kpi', 'feedback'],
    category: 'Performance',
    question: 'How does the performance review work?',
    answer: `Performance reviews happen **twice a year**:\n\n📅 **Mid-Year Review**: June\n• Focus: Progress check, course correction\n• Duration: 45-min conversation with manager\n\n📅 **Year-End Review**: December\n• Determines: Rating, compensation revision, promotions\n• Includes: Self-assessment + manager assessment + peer feedback\n\n**Rating Scale (1–5):**\n• 5️⃣ Exceeds Expectations\n• 4️⃣ Meets All Expectations\n• 3️⃣ Meets Most Expectations\n• 2️⃣ Needs Improvement\n• 1️⃣ Unsatisfactory\n\n**Goal Setting**: Using OKR framework. Goals set at the start of each half, must be SMART and aligned to team/company objectives.\n\nFor any concerns about your review, speak to your HRBP (Meera Nair).`,
    followups: ['When do salary hikes happen?', 'How do I set goals?'],
  },
  {
    keywords: ['wfh', 'work from home', 'remote', 'hybrid', 'flexible', 'flex hours'],
    category: 'Work Policy',
    question: 'What is the WFH and flexible hours policy?',
    answer: `We support flexibility because we trust our people.\n\n**🏠 Work From Home:**\n• Up to **3 days/week** with manager approval\n• Submit WFH requests **24 hours in advance**\n• Core hours must be maintained: **11 AM – 4 PM IST**\n\n**⏰ Flexible Hours (New from March 2026!):**\n• Choose your start time: **8 AM – 11 AM**\n• Work 8 hours daily\n• Core collaboration hours: **11 AM – 4 PM** (mandatory)\n\n**Tips:**\n• Always update your status on the Who's In? board\n• Ensure reliable internet and a quiet workspace\n• Camera-on for all team meetings is expected`,
    followups: ['How do I apply for WFH?', 'What are core hours?'],
  },
  {
    keywords: ['resignation', 'notice', 'quit', 'leaving', 'exit', 'relieve'],
    category: 'Exit Process',
    question: 'What is the notice period and exit process?',
    answer: `We wish you well on your next adventure! Here's what to know:\n\n**📋 Notice Period:**\n• 0–1 year: 1 month\n• 1–3 years: 2 months\n• 3+ years: 3 months\n\n**Exit Process:**\n1. Submit resignation letter to manager + HR\n2. HR schedules exit interview\n3. Knowledge transfer period (last 2 weeks)\n4. IT asset return (laptop, access cards)\n5. Final settlement within 45 days of last working day\n\n**Final Settlement includes:**\n• Pending salary\n• Leave encashment (up to 30 days)\n• PF settlement\n\nFor any exit queries, reach Meera Nair (meera.nair@officeverse.com).`,
    followups: ['What documents do I need to submit?', 'When is full and final settlement?'],
  },
  {
    keywords: ['harassment', 'posh', 'complaint', 'safety', 'bullying', 'misconduct', 'reporting'],
    category: 'Compliance',
    question: 'How do I report harassment or misconduct?',
    answer: `Your safety and dignity are our highest priority.\n\n**Reporting Options:**\n1. 📧 Email the Internal Committee: **ic@officeverse.com**\n2. 💬 Speak directly to HR (Meera Nair)\n3. 🔒 Anonymous reporting portal (link in Policies)\n\n**What happens next:**\n• Acknowledgement within 24 hours\n• Confidential investigation begins within 7 days\n• Resolution within 90 days\n• Zero retaliation policy — strictly enforced\n\n**Remember:**\n• All complaints are treated with strict confidentiality\n• You can bring a support person to any meetings\n• Retaliating against a complainant is a terminable offense\n\nYou are safe here. Please speak up.`,
    followups: ['What is the POSH policy?', 'Who is on the Internal Committee?'],
  },
  {
    keywords: ['onboarding', 'new joiner', 'joining', 'first day', 'induction', 'buddy'],
    category: 'Onboarding',
    question: 'What does onboarding look like at OfficeVerse?',
    answer: `Welcome to the family! Here's your first week:\n\n**Day 1:**\n🗂️ Documentation & system access setup\n👋 Team introductions & office tour\n🎁 Welcome kit (swag, equipment)\n\n**Week 1:**\n📚 Product & company overview sessions\n👥 Meet your buddy (assigned peer mentor)\n🎯 Set up 30-60-90 day goals with manager\n\n**Your Buddy Program:**\n• A buddy is assigned before you join\n• Available to answer "silly questions" without judgment\n• Weekly check-ins for your first month\n\n**Useful logins to set up:**\nSlack, Jira, GitHub, OfficeVerse portal, email, VPN\n\nFor onboarding support: **onboarding@officeverse.com**`,
    followups: ['Who do I contact if I have issues?', 'How are goals set?'],
  },
  {
    keywords: ['hi', 'hello', 'hey', 'help', 'what can you do', 'assist', 'support'],
    category: 'General',
    question: 'What can Ask HR help with?',
    answer: `👋 Hello! I'm your **Ask HR Assistant** — your friendly guide to all things HR at OfficeVerse.\n\nI can instantly answer questions about:\n\n• 🏖️ **Leave & Attendance** — types, limits, how to apply\n• 💰 **Payroll & Salary** — credit dates, payslips, taxes\n• 🏥 **Benefits & Insurance** — coverage, claims, wellness\n• 📚 **Learning & Development** — budget, certifications\n• 📊 **Performance Reviews** — OKRs, ratings, timelines\n• 🏠 **WFH & Flex Hours** — policies, how to apply\n• 🤝 **Policies** — POSH, code of conduct, travel\n• 🚪 **Exit Process** — notice periods, full & final\n\nJust type your question naturally and I'll do my best to help! For sensitive or complex matters, I'll connect you with Meera Nair (your HRBP).`,
    followups: ['How many leaves do I get?', 'What are my benefits?', 'How does WFH work?'],
  },
];

/* ── Smart matcher ─────────────────────────────────────────── */
function findAnswer(query) {
  const q = query.toLowerCase().trim();
  let best = null, bestScore = 0;

  for (const item of KB) {
    let score = 0;
    for (const kw of item.keywords) {
      if (q === kw) score += 10;
      else if (q.includes(kw)) score += 5;
      else if (kw.includes(q)) score += 3;
      else {
        const qWords = q.split(' ');
        const kwWords = kw.split(' ');
        for (const w of qWords) {
          if (w.length > 2 && kwWords.some(kw => kw.includes(w))) score += 1;
        }
      }
    }
    if (score > bestScore) { bestScore = score; best = item; }
  }

  if (bestScore === 0) return null;
  return best;
}

/* ── Markdown renderer (basic) ─────────────────────────────── */
function renderMarkdown(text) {
  return text
    .split('\n')
    .map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-black text-white/80 mt-3 mb-1 text-sm" style={{ color: 'var(--text-primary)' }}>{line.replace(/\*\*/g, '')}</p>;
      }
      if (line.startsWith('• ')) {
        const content = line.slice(2).replace(/\*\*(.*?)\*\*/g, (_, m) => `<strong>${m}</strong>`);
        return <p key={i} className="text-sm flex items-start gap-1.5 my-0.5" style={{ color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: `<span class="mt-1 flex-shrink-0">•</span><span>${content}</span>` }} />;
      }
      if (/^\d+\./.test(line)) {
        const content = line.replace(/\*\*(.*?)\*\*/g, (_, m) => `<strong>${m}</strong>`);
        return <p key={i} className="text-sm my-0.5" style={{ color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: content }} />;
      }
      const content = line.replace(/\*\*(.*?)\*\*/g, `<strong style="color:var(--text-primary);font-weight:700">$1</strong>`);
      return line ? <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: content }} /> : <div key={i} className="h-1" />;
    });
}

/* ── Message bubble ────────────────────────────────────────── */
function Message({ msg }) {
  const isBot = msg.role === 'bot';
  return (
    <div className={`flex gap-3 ${isBot ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${isBot ? 'mt-1' : 'mt-1'}`}
        style={isBot
          ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 12px rgba(99,102,241,0.4)' }
          : { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }
        }>
        {isBot ? <Bot size={15} className="text-white" /> : <User size={15} className="text-white/60" />}
      </div>

      <div className={`max-w-[82%] ${isBot ? '' : 'items-end flex flex-col'}`}>
        {/* Bubble */}
        <div className={`rounded-2xl px-4 py-3 ${isBot ? 'askhr-bot-bubble' : 'askhr-user-bubble'}`}
          style={isBot
            ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }
            : { background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))', border: '1px solid rgba(99,102,241,0.25)' }
          }>
          {isBot ? (
            <div className="space-y-0.5">{renderMarkdown(msg.text)}</div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{msg.text}</p>
          )}
        </div>

        {/* Category badge */}
        {isBot && msg.category && (
          <span className="mt-1 ml-1 badge text-[10px]" style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.15)' }}>
            {msg.category}
          </span>
        )}

        {/* Follow-up suggestions */}
        {isBot && msg.followups?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {msg.followups.map(q => (
              <button key={q} onClick={() => msg.onFollowup?.(q)}
                className="askhr-followup-btn flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; e.currentTarget.style.color = '#a5b4fc'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
              >
                {q} <ChevronRight size={10} />
              </button>
            ))}
          </div>
        )}

        <p className="text-white/20 text-[10px] mt-1 px-1" style={{ color: 'var(--text-faint)' }}>{msg.time}</p>
      </div>
    </div>
  );
}

/* ── Typing Indicator ──────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
        <Bot size={15} className="text-white" />
      </div>
      <div className="askhr-typing-bubble px-4 py-3 rounded-2xl flex items-center gap-1"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full bg-white/40"
            style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
      <style>{`@keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }`}</style>
    </div>
  );
}

/* ── Suggested Questions ───────────────────────────────────── */
const SUGGESTIONS = [
  { q: 'How many leaves do I get?',        icon: '🏖️' },
  { q: 'What are my health benefits?',     icon: '🏥' },
  { q: 'How does WFH policy work?',        icon: '🏠' },
  { q: 'Tell me about L&D budget',         icon: '📚' },
  { q: 'How does performance review work?',icon: '📊' },
  { q: 'What is the notice period?',       icon: '🚪' },
];

/* ── Main Page ─────────────────────────────────────────────── */
export default function AskHR() {
  const [messages, setMessages] = useState([
    {
      id: 1, role: 'bot',
      text: `👋 Hi there! I'm your **Ask HR Assistant**.\n\nI can answer your HR questions instantly — leave policies, benefits, payroll, performance reviews, and much more.\n\nWhat would you like to know today?`,
      time: 'Just now', category: null, followups: ['How many leaves do I get?', 'What are my benefits?', 'How does WFH work?'],
    }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const nextId = useRef(2);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const q = text.trim();
    setInput('');

    const userMsg = {
      id: nextId.current++, role: 'user', text: q,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    const delay = 600 + Math.random() * 800;
    setTimeout(() => {
      const match = findAnswer(q);
      const id = nextId.current++;
      const botMsg = {
        id, role: 'bot',
        text: match
          ? match.answer
          : `I couldn't find a specific answer for that. Here's what I suggest:\n\n• Browse the **Policy Hub** for detailed documents\n• Reach out to **Meera Nair** (meera.nair@officeverse.com)\n• Check the **Announcements** page for recent updates\n\nWould you like to try rephrasing your question?`,
        category: match?.category || 'General',
        followups: match?.followups || ['How many leaves do I get?', 'What are my benefits?'],
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        onFollowup: sendMessage,
      };
      setTyping(false);
      setMessages(prev => prev.map(m => // attach onFollowup to new msg
        m.id === id ? m : m
      ).concat(botMsg));
    }, delay);

    inputRef.current?.focus();
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const clearChat = () => {
    setMessages([{
      id: nextId.current++, role: 'bot',
      text: `Chat cleared! How can I help you today?`,
      time: 'Just now', category: null, followups: ['How many leaves do I get?', 'What are my benefits?'],
    }]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-3xl mx-auto animate-fade-in gap-0">

      {/* Header */}
      <div className="glass-card p-5 mb-4 flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.06))', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}>
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-black text-lg leading-tight">Ask HR</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Instant answers · Always available</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
              <Sparkles size={11} /> {KB.length} topics covered
            </div>
            <button onClick={clearChat}
              className="p-2 rounded-xl text-white/30 hover:text-white transition-all hover:bg-white/5">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Suggested Questions (shown when only 1 message) */}
      {messages.length === 1 && (
        <div className="flex-shrink-0 mb-4">
          <p className="text-xs font-bold uppercase tracking-wider mb-2 px-1" style={{ color: 'var(--text-muted)' }}>Suggested questions</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SUGGESTIONS.map(({ q, icon }) => (
              <button key={q} onClick={() => sendMessage(q)}
                className="askhr-suggestion-btn flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-left transition-all"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.12)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)'; e.currentTarget.style.color = '#a5b4fc'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
              >
                <span className="text-base flex-shrink-0">{icon}</span>
                <span className="text-xs leading-snug">{q}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-5 px-1 pb-4">
        {messages.map(msg => (
          <Message key={msg.id} msg={{ ...msg, onFollowup: sendMessage }} />
        ))}
        {typing && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 mt-3">
        <div className="flex gap-3 items-end glass-card askhr-input-area p-3"
          style={{ border: '1px solid rgba(99,102,241,0.2)' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything about leave, salary, benefits, WFH…"
            rows={1}
            className="flex-1 bg-transparent text-sm outline-none resize-none"
            style={{ color: 'var(--text-primary)', maxHeight: 100 }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || typing}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
            style={input.trim()
              ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }
              : { background: 'rgba(255,255,255,0.05)' }
            }
          >
            <Send size={15} className={input.trim() ? 'text-white' : 'text-white/20'} />
          </button>
        </div>
        <p className="text-xs text-center mt-2" style={{ color: 'var(--text-faint)' }}>
          Press Enter to send · For urgent matters, contact Meera Nair directly
        </p>
      </div>
    </div>
  );
}
