/**
 * Question understanding for the Orbit Assistant.
 *
 * No AI service is configured in this project, so matching is deterministic:
 * keywords + natural-language samples from the app guide are scored against the
 * employee's question, with light stemming and synonym expansion so common
 * rewordings ("how do I change my photo?" vs "update profile picture") match.
 *
 * `buildAssistantReply` also falls back to the HR FAQ rows loaded from the
 * database, so policy questions keep being answered by the approved content.
 */
import { APP_TOPICS, APP_SUGGESTIONS, APP_AREAS } from '../data/appGuide.js';

const MIN_SCORE = 4.5;
const AMBIGUITY_RATIO = 0.78;

const STOPWORDS = new Set([
  'a', 'an', 'the', 'i', 'im', 'me', 'my', 'we', 'us', 'our', 'you', 'your', 'it', 'its', 'is', 'are', 'am',
  'be', 'been', 'being', 'do', 'does', 'did', 'can', 'could', 'would', 'should', 'will', 'shall', 'may',
  'might', 'must', 'to', 'of', 'for', 'on', 'in', 'at', 'by', 'with', 'from', 'about', 'into', 'over',
  'and', 'or', 'but', 'if', 'so', 'than', 'then', 'that', 'this', 'these', 'those', 'there', 'here',
  'how', 'what', 'when', 'where', 'which', 'who', 'whom', 'why', 'please', 'help', 'need', 'want', 'get',
  'got', 'use', 'using', 'used', 'any', 'some', 'all', 'also', 'just', 'only', 'very', 'more', 'most',
  'much', 'many', 's', 't', 'dont', 'cant', 'shouldnt', 'im',
]);

const IRREGULAR = {
  leaves: 'leave',
  policies: 'policy',
  faqs: 'faq',
  people: 'person',
  photos: 'photo',
  info: 'information',
};

const SYNONYM_GROUPS = [
  ['update', 'edit', 'change', 'modify', 'set'],
  ['view', 'see', 'check', 'find', 'locate', 'show', 'access', 'open'],
  ['give', 'send', 'share', 'submit'],
  ['message', 'chat', 'dm', 'ping', 'reach', 'contact'],
  ['profile', 'bio', 'about'],
  ['kudos', 'appreciation', 'praise', 'recognition', 'recognise', 'recognize', 'compliment', 'shoutout'],
  ['announcement', 'news', 'notice', 'bulletin'],
  ['event', 'calendar', 'session', 'meetup', 'gathering'],
  ['holiday', 'vacation', 'pto'],
  ['course', 'training', 'learning', 'upskill'],
  ['document', 'file', 'certificate', 'letter'],
  ['payslip', 'salary', 'payroll', 'pay', 'compensation'],
  ['attendance', 'timesheet', 'checkin', 'punch', 'swipe'],
  ['game', 'puzzle', 'play'],
  ['settings', 'preference', 'configuration'],
  ['dashboard', 'home', 'homepage'],
  ['link', 'portal', 'resource', 'shortcut'],
  ['admin', 'administrator'],
  ['join', 'subscribe'],
];

const SYNONYMS = SYNONYM_GROUPS.reduce((map, group) => {
  group.forEach((word) => {
    map.set(word, new Set(group.map(stem).concat(stem(word))));
  });
  return map;
}, new Map());

export function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function stem(word) {
  const value = String(word || '').trim();
  if (!value) return '';
  if (IRREGULAR[value]) return IRREGULAR[value];
  if (value.length <= 3) return value;
  if (/(ss|us|is|ous)$/.test(value)) return value;
  if (/ies$/.test(value)) return `${value.slice(0, -3)}y`;
  if (/(ches|shes|sses|xes|zes|oes)$/.test(value)) return value.slice(0, -2);
  if (/ves$/.test(value)) return `${value.slice(0, -3)}f`;
  if (/s$/.test(value)) return value.slice(0, -1);
  return value;
}

function tokenize(text) {
  return normalize(text).split(' ').filter(Boolean).map((word) => IRREGULAR[word] || word);
}

function contentTokens(text) {
  return tokenize(text)
    .filter((word) => !STOPWORDS.has(word))
    .map(stem)
    .filter((word) => word.length > 1);
}

function expand(tokens) {
  const set = new Set();
  tokens.forEach((token) => {
    const key = IRREGULAR[token] || token;
    const variants = SYNONYMS.get(key) || SYNONYMS.get(stem(key));
    set.add(stem(key));
    if (variants) variants.forEach((variant) => set.add(stem(variant)));
  });
  return set;
}

function scoreTopic(topic, normalizedQuery, expanded) {
  const padded = ` ${normalizedQuery} `;
  let score = 0;

  topic.keywords.forEach(([phrase, weight]) => {
    const normalizedPhrase = normalize(phrase);
    if (!normalizedPhrase) return;
    if (normalizedPhrase.includes(' ')) {
      if (padded.includes(` ${normalizedPhrase} `)) {
        score += weight * 1.7;
        return;
      }
      const parts = normalizedPhrase.split(' ').map(stem).filter((word) => !STOPWORDS.has(word));
      // A single leftover word is too weak a signal (e.g. "check in" matching
      // "how do I check my profile"), so partial phrases need two content words.
      if (parts.length >= 2 && parts.every((word) => expanded.has(word))) score += weight * 0.8;
      return;
    }
    if (expanded.has(stem(normalizedPhrase))) score += weight;
  });

  // Similarity with the hand-written sample questions catches phrasings the
  // keyword list does not anticipate.
  const samples = topic.samples || [];
  let sampleScore = 0;
  samples.forEach((sample) => {
    const tokens = contentTokens(sample);
    if (!tokens.length) return;
    const shared = tokens.filter((token) => expanded.has(token)).length;
    sampleScore = Math.max(sampleScore, shared / tokens.length);
  });
  score += sampleScore * 7;

  return score;
}

export function rankTopics(question) {
  const normalizedQuery = normalize(question);
  const expanded = expand(tokenize(question));
  return APP_TOPICS
    .map((topic) => ({ topic, score: Number(scoreTopic(topic, normalizedQuery, expanded).toFixed(2)) }))
    .sort((a, b) => b.score - a.score);
}

/** Matches an approved HR FAQ row (database content) against the question. */
export function findFaqAnswer(question, faqs = []) {
  const terms = contentTokens(question).filter((term) => term.length > 2);
  if (!terms.length || !faqs.length) return null;

  let best = null;
  faqs.forEach((faq) => {
    const haystack = normalize(`${faq.question || ''} ${faq.answer || ''} ${faq.category || ''}`);
    const matched = [...new Set(terms)].filter((term) => haystack.includes(term.slice(0, Math.max(4, term.length - 1))));
    const questionTokens = contentTokens(faq.question || '');
    const questionOverlap = questionTokens.length
      ? questionTokens.filter((token) => terms.includes(token)).length / questionTokens.length
      : 0;
    const score = matched.length + questionOverlap * 2;
    if (!best || score > best.score) best = { faq, score, matched: matched.length, questionOverlap };
  });

  if (!best) return null;
  const uniqueTerms = [...new Set(terms)].length;
  const strong = best.matched >= Math.max(1, Math.ceil(uniqueTerms * 0.5)) && (best.matched > 1 || uniqueTerms === 1);
  return { ...best, strong };
}

function option(topic) {
  return { label: topic.title, question: (topic.samples && topic.samples[0]) || topic.title };
}

function appReply(topic) {
  return {
    kind: 'app',
    title: topic.title,
    steps: topic.steps,
    note: topic.note,
    route: topic.route || null,
    routeLabel: topic.routeLabel || null,
  };
}

function unavailableReply(topic) {
  return {
    kind: 'unavailable',
    title: topic.title,
    steps: topic.steps,
    note: topic.note,
    route: topic.route || null,
    routeLabel: topic.routeLabel || null,
  };
}

function faqReply(match) {
  return {
    kind: 'faq',
    category: match.faq.category || 'HR knowledge base',
    text: match.faq.answer,
  };
}

function clarifyReply(ranked, context = {}) {
  const candidates = ranked
    .filter((entry) => entry.score >= MIN_SCORE * 0.55)
    .slice(0, 3)
    .map((entry) => option(entry.topic));
  return {
    kind: 'clarify',
    title: 'A quick check',
    text: `${context.firstName ? `${context.firstName}, I` : 'I'} can help with a few different things here. Which one did you mean?`,
    options: candidates,
  };
}

function capabilitiesReply(context = {}) {
  return {
    kind: 'capabilities',
    title: 'What I can help with',
    text: `Hi${context.firstName ? ` ${context.firstName}` : ''} — I can walk you through how HROrbit works, step by step, and I can look up approved HR policy answers from the HR knowledge base.`,
    areas: APP_AREAS,
    options: APP_SUGGESTIONS.slice(0, 4).map((question) => ({ label: question, question })),
    note: 'If something is not part of HROrbit yet, I will say so and point you to the people who can help.',
  };
}

function fallbackReply(question) {
  return {
    kind: 'fallback',
    title: 'I could not match that',
    text: `I could not find an HROrbit feature or an approved HR answer for “${question}”. I only answer about areas I can verify in this app, so I would rather check than guess.`,
    options: APP_SUGGESTIONS.slice(0, 3).map((item) => ({ label: item, question: item })),
    note: 'You can also reach a person — Contact HR is at the bottom left of this chat.',
  };
}

const GREETING_RE = /^(hi|hey|hello|hai|yo|hola|namaste|greetings|good (morning|afternoon|evening)|hiya)\b/;
const THANKS_RE = /^(thanks|thank you|thx|ty|cheers|great thanks|perfect thanks)\b/;
const CAPABILITY_RE = /(what can (you|u|this|the assistant) (do|help)|what (do|can) you (do|help|know)|how can (you|u) help|what can i ask|what (types|kind) of questions|what are you|who are you|what do you help with|what is this (app|portal|platform|chat|assistant|bot)|what can this assistant|what does this (app|portal|assistant) do)/;
const SHORT_HELP_RE = /^(help|help me|i need help|assist|support|hey help|hi help)$/;

function detectSmallTalk(question, context) {
  const normalized = normalize(question);
  const words = normalized.split(' ');
  if (GREETING_RE.test(normalized) && words.length <= 6) {
    return {
      kind: 'greeting',
      text: `Hi${context.firstName ? ` ${context.firstName}` : ''}! I'm the Orbit Assistant. I can guide you through HROrbit screens step by step, or look up approved HR answers. What would you like to do?`,
      options: APP_SUGGESTIONS.slice(0, 3).map((item) => ({ label: item, question: item })),
    };
  }
  if (THANKS_RE.test(normalized) && words.length <= 6) {
    return {
      kind: 'greeting',
      text: 'Anytime. If you want to keep going, ask me about announcements, profiles, kudos or Quick Connect.',
      options: APP_SUGGESTIONS.slice(2, 5).map((item) => ({ label: item, question: item })),
    };
  }
  return null;
}

/**
 * Builds the assistant's reply for a free-text question.
 * Priority: greetings/capabilities → verified app features → approved HR FAQ
 * rows → honest "not available" answers → clarification → fallback.
 */
export function buildAssistantReply(question, faqs = [], context = {}) {
  const text = String(question || '').trim();
  if (!text) return null;

  const smallTalk = detectSmallTalk(text, context);
  if (smallTalk) return smallTalk;
  const normalizedText = normalize(text);
  if (CAPABILITY_RE.test(normalizedText) || SHORT_HELP_RE.test(normalizedText)) return capabilitiesReply(context);

  const ranked = rankTopics(text);
  const best = ranked[0];
  const second = ranked[1];
  const confident = Boolean(best) && best.score >= MIN_SCORE;
  const ambiguous = Boolean(confident && second)
    && second.topic.id !== best.topic.id
    && second.score >= best.score * AMBIGUITY_RATIO;

  if (confident && !ambiguous && best.topic.kind === 'app') return appReply(best.topic);

  // Features this build does not have must never be answered with stored HR
  // text that describes a screen the employee cannot find.
  if (confident && !ambiguous && best.topic.kind === 'unavailable' && best.topic.preferHrAnswer === false) {
    return unavailableReply(best.topic);
  }

  const faqMatch = findFaqAnswer(text, faqs);
  if (faqMatch && faqMatch.strong) return faqReply(faqMatch);

  if (confident && !ambiguous && best.topic.kind === 'unavailable') return unavailableReply(best.topic);
  if (confident && ambiguous) return clarifyReply(ranked, context);
  if (confident) return appReply(best.topic);

  return fallbackReply(text);
}
