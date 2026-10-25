import { useState } from 'react';
import { Check } from 'lucide-react';
import { Panel, PanelHeading } from '../common/UI';

const STORAGE_KEY = 'hrobit-mood-checkin';

const MOODS = [
  { id: 'amazing', emoji: '😄', label: 'Amazing' },
  { id: 'happy', emoji: '😊', label: 'Happy' },
  { id: 'calm', emoji: '😌', label: 'Calm' },
  { id: 'okay', emoji: '😐', label: 'Okay' },
  { id: 'sad', emoji: '😔', label: 'Sad' },
  { id: 'stressed', emoji: '😫', label: 'Stressed' },
];

const todayKey = () => new Date().toISOString().slice(0, 10);

/** Reads today's saved check-in from local storage (a backend call drops in here later). */
function readTodayMood() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved && saved.date === todayKey() ? saved.mood : null;
  } catch {
    return null;
  }
}

export default function MoodSection() {
  const [selected, setSelected] = useState(readTodayMood);

  const choose = (moodId) => {
    // One mood per day: overwriting simply replaces today's check-in.
    setSelected(moodId);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayKey(), mood: moodId }));
    } catch {
      /* storage unavailable — selection still applies for this session */
    }
  };

  const selectedMood = MOODS.find((mood) => mood.id === selected);

  return (
    <Panel className="mood-panel">
      <PanelHeading
        title="How are you feeling today?"
        subtitle="A quick, private daily check-in — pick one mood that fits your day."
        action={
          selectedMood ? (
            <span className="mood-checked-pill">
              <Check size={13} /> Checked in today
            </span>
          ) : null
        }
      />

      <div className="mood-options" role="group" aria-label="Daily mood options">
        {MOODS.map((mood) => (
          <button
            key={mood.id}
            type="button"
            className="mood-option"
            aria-pressed={selected === mood.id}
            aria-label={`I'm feeling ${mood.label}`}
            onClick={() => choose(mood.id)}
          >
            <span className="mood-emoji" aria-hidden="true">{mood.emoji}</span>
            <span className="mood-label">{mood.label}</span>
            {selected === mood.id && (
              <span className="mood-selected-badge" aria-hidden="true">
                <Check size={11} strokeWidth={3} />
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mood-footer" aria-live="polite">
        {selectedMood ? (
          <p className="mood-confirm" key={selectedMood.id}>
            <span>Thanks for checking in! 💙</span>
            <small>
              You're feeling {selectedMood.label.toLowerCase()} today — you can change it anytime.
            </small>
          </p>
        ) : (
          <p className="mood-hint">Pick the emoji that best matches your mood today.</p>
        )}
      </div>
    </Panel>
  );
}
