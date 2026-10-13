// Keyword retrieval over the local knowledge base. Clearly a stand-in for the proposal's RAG assistant.
import { FAQ_KNOWLEDGE, KNOWLEDGE } from '../data/knowledge';
import type { KnowledgeEntry } from '../data/types';

const ALL = [...KNOWLEDGE, ...FAQ_KNOWLEDGE];

// Words that carry no topic on their own; matching them would pull in unrelated answers.
const STOP = new Set(
  (
    'what is the a an of to in on for if my me do does did how can could should when where who whom why which are was were be been with and or it its this that these those there ' +
    'about at from get got have has had will would any you your we our us they them by as not no yes so than then too very just also into out up down own same such ' +
    'কী কি কেন কীভাবে কিভাবে হলে করব করবো করবেন করতে আমি আমার আমাকে আমরা এর ও এবং যদি কোন কোনো হয় হবে হলো কে কার থেকে জন্য না নেই আছে এই সে তা একটি দিয়ে মনে কত কোথায় কখন তবে বা শুধু সব পারি পারব যায় যাবে কিছু তাহলে'
  ).split(' '),
);

function tokens(s: string) {
  return s
    .toLowerCase()
    .replace(/[?!।,.:;"'()]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w));
}

/** Scores entries by topic words only. An answer needs at least one exact topic match; otherwise the
 * assistant says it has no verified answer instead of guessing. */
export function askAssistant(query: string): { entry?: KnowledgeEntry; related: KnowledgeEntry[] } {
  const q = tokens(query);
  if (q.length === 0) return { related: [] };
  const scored = ALL.map((e) => {
    const keys = e.keywords.map((k) => k.toLowerCase()).filter((k) => !STOP.has(k));
    const words = [...tokens(e.question.bn), ...tokens(e.question.en)];
    let score = 0;
    let exact = false;
    for (const w of q) {
      if (keys.includes(w)) {
        score += 3;
        exact = true;
      } else if (words.includes(w)) {
        score += 2;
        exact = true;
      } else if (w.length >= 4 && [...keys, ...words].some((h) => h.length >= 4 && (h.includes(w) || w.includes(h)))) score += 1;
    }
    // Curated traffic-law entries win ties over general FAQs.
    if (!e.id.startsWith('faq-')) score += 0.5;
    return { e, score, exact };
  })
    .filter((x) => x.exact && x.score >= 2)
    .sort((a, b) => b.score - a.score);
  return { entry: scored[0]?.e, related: scored.slice(1, 4).map((x) => x.e) };
}

export const SUGGESTED_QUESTIONS = ['wrong-ai-case', 'fake-sms', 'sergeant-rights', 'minor-accident'];
export function knowledgeById(id: string) {
  return ALL.find((e) => e.id === id);
}
