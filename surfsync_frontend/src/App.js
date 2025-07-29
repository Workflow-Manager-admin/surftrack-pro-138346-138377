import React, { useState, useEffect } from 'react';
import './App.css';

// -- Theme Colors
const COLORS = {
  accent: "#20B2AA",
  primary: "#5DADEC",
  secondary: "#F4E2D8"
};
// -- Condition Icons --
const CONDITION_ICONS = {
  swell: "🌊",
  wind: "💨",
  tide: "🌑",
  sunny: "☀️",
  cloudy: "☁️",
  rainy: "🌧️"
};
// -- Mood Icons --
const MOODS = [
  { label: "Stoked", icon: "😃" },
  { label: "Mellow", icon: "🙂" },
  { label: "Tired", icon: "🥱" },
  { label: "Pumped", icon: "🤩" },
  { label: "Bummed", icon: "😕" },
];

// -- Sample Spots & Boards --
const SAMPLE_SPOTS = ["Sunset Beach", "Pipeline", "Malibu", "Rocky Point"];
const SAMPLE_BOARDS = ["Shortboard", "Longboard", "Fish", "Funboard"];

// -- Sample Data for Visualization --
const SAMPLE_SESSIONS = [
  {
    id: "1",
    date: "2024-06-06",
    spot: "Pipeline",
    board: "Shortboard",
    waves: 8,
    mood: "Stoked",
    notes: "Super fun barrels, crowded but worth it.",
    swell: "Head high",
    wind: "Offshore",
    tide: "Mid",
    conditions: { swell: "Head high", wind: "Offshore", tide: "Mid" },
  },
  {
    id: "2",
    date: "2024-06-04",
    spot: "Malibu",
    board: "Longboard",
    waves: 20,
    mood: "Mellow",
    notes: "Small and clean, cruisy vibes.",
    swell: "Waist high",
    wind: "Calm",
    tide: "High",
    conditions: { swell: "Waist high", wind: "Calm", tide: "High" },
  },
  {
    id: "3",
    date: "2024-06-01",
    spot: "Sunset Beach",
    board: "Fish",
    waves: 12,
    mood: "Pumped",
    notes: "Fast lefts, fun crowd!",
    swell: "Shoulder high",
    wind: "Light onshore",
    tide: "Low",
    conditions: { swell: "Shoulder high", wind: "Onshore", tide: "Low" },
  },
];

// -- Utility: Get Mood Icon --
function getMoodIcon(moodLabel) {
  const moodObj = MOODS.find((m) => m.label === moodLabel);
  return moodObj ? moodObj.icon : "🙂";
}

/**
 * PUBLIC_INTERFACE
 * Main App component that wires the SurfSync dashboard, session log, detail views, filters, and stats.
 */
function App() {
  // --- Theme ---
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // --- Surf Sessions State (mocked for now) ---
  const [sessions, setSessions] = useState(SAMPLE_SESSIONS);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [filters, setFilters] = useState({ spot: "All", board: "All", mood: "All" });
  const [showStats, setShowStats] = useState(false);

  // --- Notification Effect: remind if no session today ---
  useEffect(() => {
    // PUBLIC_INTERFACE
    // Shows a browser notification if no session was logged today
    function showDailyReminder() {
      if (!("Notification" in window)) return;
      if (Notification.permission === "granted") {
        const today = new Date().toISOString().slice(0, 10);
        const surfedToday = sessions.some((s) => s.date === today);
        if (!surfedToday) {
          new Notification("SurfSync: Did you surf today?", {
            body: "Log your session to keep your streak!",
            icon: "/favicon.ico"
          });
        }
      }
    }
    if (Notification.permission === "default") {
      Notification.requestPermission();
    } else {
      showDailyReminder();
    }
    // Only run on initial load.
    // eslint-disable-next-line
  }, []);

  // --- Derived/Filtered Sessions ---
  const visibleSessions = sessions.filter((s) => {
    const spotOk = filters.spot === "All" || s.spot === filters.spot;
    const boardOk = filters.board === "All" || s.board === filters.board;
    const moodOk = filters.mood === "All" || s.mood === filters.mood;
    return spotOk && boardOk && moodOk;
  }).sort((a, b) => b.date.localeCompare(a.date));

  // --- CRUD Handlers ---
  // PUBLIC_INTERFACE
  function handleLogSession(newSession) {
    setSessions([...sessions, { ...newSession, id: (Math.random() * 100000).toFixed(0) }]);
    setShowLogModal(false);
  }
  // PUBLIC_INTERFACE
  function handleUpdateSession(updated) {
    setSessions(sessions.map(s => (s.id === updated.id ? updated : s)));
    setSelectedSession(updated);
  }
  // PUBLIC_INTERFACE
  function handleDeleteSession(id) {
    setSessions(sessions.filter(s => s.id !== id));
    setSelectedSession(null);
  }
  // PUBLIC_INTERFACE
  function triggerNotification(msg) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("SurfSync", { body: msg, icon: "/favicon.ico" });
    }
  }

  // ------ Rendering ------
  return (
    <div className="App surf-app-bg" style={{ minHeight: "100vh" }}>
      {/* Theme Toggle & Topbar */}
      <header className="App-header" style={{ background: "linear-gradient(120deg,#5DADEC 30%, #20B2AA 100%)", padding: 0, minHeight: "0", marginBottom: 0 }}>
        <nav style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "1.2rem 2.2rem 1.2rem 1.2rem"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: 900, color: COLORS.secondary }}>
            🏄‍♂️ SurfSync
          </div>
          <div>
            <button className="theme-toggle" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
              {theme === "light" ? "🌙 Dark" : "☀️ Light"}
            </button>
            <button
              style={{
                background: COLORS.accent,
                color: "#fff",
                borderRadius: 18,
                border: "none",
                fontWeight: 600,
                fontSize: "1.05rem",
                marginLeft: "1rem",
                padding: "0.6rem 1.4rem",
                boxShadow: "0 2px 8px rgba(20,40,60,0.08)",
                cursor: "pointer"
              }}
              onClick={() => setShowLogModal(true)}
            >
              + Log Session
            </button>
            <button
              style={{
                background: "transparent",
                border: "1.2px solid " + COLORS.accent,
                color: COLORS.accent,
                borderRadius: 16,
                fontWeight: 600,
                fontSize: "1.05rem",
                marginLeft: "0.8rem",
                padding: "0.6rem 1.0rem",
                cursor: "pointer"
              }}
              onClick={() => setShowStats(s => !s)}
              title="Dashboard"
            >📊 Stats</button>
          </div>
        </nav>
      </header>
      <main style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        maxWidth: 1200,
        margin: "0 auto",
        padding: "2.2rem 1.8rem 2.2rem 2.2rem"
      }}>
        {/* Sidebar Filters */}
        <aside style={{
          minWidth: 210, marginRight: 24, background: "#fff8", borderRadius: 16, boxShadow: "0 1px 10px 0 #5dadec22",
          padding: "1.2rem"
        }}>
          <FilterBar
            spots={["All", ...SAMPLE_SPOTS]}
            boards={["All", ...SAMPLE_BOARDS]}
            moods={["All", ...MOODS.map(m => m.label)]}
            filters={filters}
            setFilters={setFilters}
          />
        </aside>
        {/* Content: List or Detail/Card/Stats */}
        <section style={{ flex: 1 }}>
          {/* Stats Dashboard */}
          {showStats ? (
            <StatsDashboard sessions={sessions} />
          ) : selectedSession ? (
            <SessionDetailCard
              session={selectedSession}
              onEdit={handleUpdateSession}
              onDelete={handleDeleteSession}
              onBack={() => setSelectedSession(null)}
            />
          ) : (
            <SessionList
              sessions={visibleSessions}
              onSelect={setSelectedSession}
            />
          )}
        </section>
      </main>
      {/* Log Session Modal */}
      {showLogModal && (
        <Modal onClose={() => setShowLogModal(false)}>
          <SessionLogForm
            spots={SAMPLE_SPOTS}
            boards={SAMPLE_BOARDS}
            onSubmit={handleLogSession}
          />
        </Modal>
      )}
    </div>
  );
}

// -- Sidebar Filter Component --
function FilterBar({ spots, boards, moods, filters, setFilters }) {
  return (
    <div>
      <h2 style={{ color: COLORS.primary, margin: "0 0 18px 0", fontWeight: 800 }}>Filters</h2>
      <Dropdown label="Spot" options={spots} value={filters.spot} onChange={(v) => setFilters(f => ({ ...f, spot: v }))} />
      <Dropdown label="Board" options={boards} value={filters.board} onChange={(v) => setFilters(f => ({ ...f, board: v }))} />
      <Dropdown label="Mood" options={moods} value={filters.mood} onChange={(v) => setFilters(f => ({ ...f, mood: v }))} />
    </div>
  );
}

// -- Dropdown (Reusable/Minimal) --
function Dropdown({ label, options, value, onChange }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontWeight: 600, color: COLORS.accent, marginBottom: 5 }}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          fontSize: "1rem",
          borderRadius: 8,
          border: "1.5px solid #76dfe4",
          width: "100%",
          padding: "0.45rem 0.6rem",
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

// -- Session Cards List --
function SessionList({ sessions, onSelect }) {
  if (!sessions.length) {
    return <div style={{ padding: "2rem 1rem", color: COLORS.primary, textAlign: 'center' }}>No sessions found.</div>;
  }
  return (
    <div>
      <h2 style={{ color: COLORS.accent, fontWeight: 700, marginBottom: 18 }}>Past Sessions</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {sessions.map(s => (
          <SessionCard key={s.id} session={s} onClick={() => onSelect(s)} />
        ))}
      </div>
    </div>
  );
}

// -- Session Card (summary preview) --
function SessionCard({ session, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: COLORS.secondary,
        borderRadius: 14,
        padding: "1.0rem 1.5rem",
        boxShadow: "0 1px 7px 0 rgba(32,178,170,0.06)",
        cursor: "pointer",
        transition: "transform 0.16s",
        display: "flex", flexDirection: "row", alignItems: "center", gap: 22
      }}
      className="session-card"
    >
      {/* Date column */}
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.primary }}>{session.date.slice(5)}</div>
        <div style={{ fontSize: 13, color: "#848" }}>{session.spot}</div>
      </div>
      {/* Board/Mood */}
      <div style={{ minWidth: 90, fontWeight: 600 }}>
        <span style={{ fontSize: 20 }}>{getMoodIcon(session.mood)}</span>{" "}
        {session.mood}
      </div>
      <div style={{ fontSize: 16 }}>
        <b style={{ color: COLORS.accent }}>{session.board}</b>{" "}
        <span style={{ color: "#444", fontSize: 13 }}>{session.waves} waves</span>
      </div>
      {/* Surf Conditions Icons */}
      <div>
        <span title={`Swell: ${session.swell}`}>{CONDITION_ICONS.swell}</span>{" "}
        <span title={`Wind: ${session.wind}`}>{CONDITION_ICONS.wind}</span>{" "}
        <span title={`Tide: ${session.tide}`}>{CONDITION_ICONS.tide}</span>
      </div>
      {/* Notes preview */}
      <div style={{
        fontSize: 13, color: "#268", fontStyle: "italic", marginLeft: 18, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
      }}>{session.notes}</div>
    </div>
  );
}

// -- Session Log Form (modal) --
function SessionLogForm({ spots, boards, onSubmit }) {
  // Form state
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    spot: spots[0],
    board: boards[0],
    waves: 0,
    mood: MOODS[0].label,
    notes: "",
    swell: "",
    wind: "",
    tide: "",
  });

  // PUBLIC_INTERFACE
  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }
  // Icon mood selector handler
  function handleMoodChange(moodLabel) {
    setForm(f => ({ ...f, mood: moodLabel }));
  }

  // Icon-based surf condition quick select
  // For oceanic UI, we use buttons for conditions (minimally) - advanced could use emoji pickers.
  function handleCondition(name, value) {
    setForm(f => ({ ...f, [name]: value }));
  }

  // PUBLIC_INTERFACE
  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} style={{ minWidth: 340 }}>
      <h2 style={{ color: COLORS.primary, fontWeight: 800 }}>Log Surf Session</h2>
      <div className="form-row">
        <label>Date</label>
        <input type="date" name="date" value={form.date} onChange={handleChange} required />
      </div>
      <div className="form-row">
        <label>Spot</label>
        <select name="spot" value={form.spot} onChange={handleChange}>
          {spots.map(spot => <option key={spot}>{spot}</option>)}
        </select>
      </div>
      <div className="form-row">
        <label>Board</label>
        <select name="board" value={form.board} onChange={handleChange}>
          {boards.map(board => <option key={board}>{board}</option>)}
        </select>
      </div>
      <div className="form-row">
        <label>Wave Count</label>
        <input
          type="number"
          min={0}
          name="waves"
          value={form.waves}
          onChange={handleChange}
          style={{ width: 80 }}
          required />
      </div>
      <div className="form-row mood-row">
        <label>Mood</label>
        <div>
          {MOODS.map(m =>
            <button
              type="button"
              key={m.label}
              onClick={() => handleMoodChange(m.label)}
              style={{
                fontSize: 20, padding: "7px 16px", background: form.mood === m.label ? COLORS.primary : "#eee",
                border: "1.4px solid #9ae2ea", borderRadius: 8, marginRight: 6, cursor: "pointer"
              }}
              aria-label={m.label}
            >{m.icon}</button>
          )}
        </div>
      </div>
      <div className="form-row">
        <label>Notes</label>
        <textarea
          name="notes"
          placeholder="Anything special? (optional)"
          value={form.notes}
          onChange={handleChange}
          rows={2}
        />
      </div>
      {/* Surf conditions: icon-based quick selection */}
      <div className="form-row">
        <label>Swell</label>
        <select name="swell" value={form.swell} onChange={handleChange}>
          <option value="">--select--</option>
          <option>Waist high</option>
          <option>Shoulder high</option>
          <option>Head high</option>
          <option>Overhead</option>
        </select>
        <span style={{ marginLeft: 8 }}>{CONDITION_ICONS.swell}</span>
      </div>
      <div className="form-row">
        <label>Wind</label>
        <select name="wind" value={form.wind} onChange={handleChange}>
          <option value="">--select--</option>
          <option>Calm</option>
          <option>Light onshore</option>
          <option>Offshore</option>
          <option>Strong</option>
        </select>
        <span style={{ marginLeft: 8 }}>{CONDITION_ICONS.wind}</span>
      </div>
      <div className="form-row">
        <label>Tide</label>
        <select name="tide" value={form.tide} onChange={handleChange}>
          <option value="">--select--</option>
          <option>Low</option>
          <option>Mid</option>
          <option>High</option>
        </select>
        <span style={{ marginLeft: 8 }}>{CONDITION_ICONS.tide}</span>
      </div>
      <div style={{ marginTop: 22, textAlign: 'right' }}>
        <button
          type="submit"
          style={{
            background: COLORS.accent,
            color: "#fff", borderRadius: 14, border: "none",
            fontWeight: 600, padding: "0.6em 1.5em", fontSize: 18, boxShadow: "0 2px 7px #5DADEC22", cursor: "pointer"
          }}>
          Save Session
        </button>
      </div>
    </form>
  );
}

// -- Modal overlay (minimal, styled) --
function Modal({ onClose, children }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(50,80,110,0.16)", zIndex: 1500,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{ background: "#fff", borderRadius: 18, minWidth: 340, padding: "2rem", boxShadow: "0 8px 30px #1113" }}>
        <button onClick={onClose} style={{
          position: "absolute", marginLeft: -16, marginTop: -8, background: "none", color: COLORS.primary,
          border: "none", fontWeight: 700, fontSize: 32, cursor: "pointer"
        }} aria-label="Close">&times;</button>
        {children}
      </div>
    </div>
  );
}

// -- Session Detail Card (view, edit, delete) --
function SessionDetailCard({ session, onEdit, onDelete, onBack }) {
  // Editable state (if edit clicked)
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...session });
  function handleEditChange(e) {
    const { name, value } = e.target;
    setEditForm(f => ({ ...f, [name]: value }));
  }
  function handleSave(e) {
    e.preventDefault();
    onEdit(editForm);
    setEditing(false);
  }

  return (
    <div style={{
      background: COLORS.secondary, borderRadius: 16, minWidth: 350, padding: "1.5rem 2.3rem",
      boxShadow: "0 2px 20px #5dadec19", position: "relative"
    }}>
      <button onClick={onBack} style={{
        position: "absolute", left: 10, top: 18, background: "none", border: "none", color: COLORS.accent, fontWeight: 800, fontSize: 22, cursor: "pointer"
      }}>←</button>
      {editing ? (
        <form onSubmit={handleSave}>
          {/* Only allow editing selected fields for simplicity */}
          <h2>Edit Session</h2>
          <div className="form-row">
            <label>Spot</label>
            <input name="spot" value={editForm.spot} onChange={handleEditChange} />
          </div>
          <div className="form-row">
            <label>Board</label>
            <input name="board" value={editForm.board} onChange={handleEditChange} />
          </div>
          <div className="form-row">
            <label>Waves</label>
            <input name="waves" type="number" min={0} value={editForm.waves} onChange={handleEditChange} />
          </div>
          <div className="form-row">
            <label>Mood</label>
            <select name="mood" value={editForm.mood} onChange={handleEditChange}>
              {MOODS.map(m => <option key={m.label}>{m.label}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>Notes</label>
            <textarea name="notes" value={editForm.notes} onChange={handleEditChange} />
          </div>
          <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between" }}>
            <button type="submit" style={{ background: COLORS.accent, color: "#fff", borderRadius: 10, border: "none", fontWeight: 600, padding: "0.5em 1.2em" }}>Save</button>
            <button type="button" style={{ color: COLORS.primary, background: "none", border: "none" }} onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <>
          <div style={{ marginBottom: "1.3rem" }}>
            <div style={{ fontWeight: 800, color: COLORS.primary, fontSize: 21 }}>{session.date} &middot; {session.spot}</div>
            <div style={{ fontSize: 15, color: "#468" }}>Board: <b>{session.board}</b> | Waves: {session.waves}</div>
          </div>
          <div>
            <span style={{ fontSize: 18 }}>{getMoodIcon(session.mood)}</span>
            <span style={{ marginLeft: 9, fontWeight: 700, color: COLORS.accent }}>{session.mood}</span>
          </div>
          <div style={{ margin: "12px 0", padding: "8px 0", color: "#267", fontStyle: "italic", letterSpacing: 0.2 }}>{session.notes}</div>
          <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
            {session.swell && <div><span>{CONDITION_ICONS.swell}</span> <span style={{ fontSize: 13 }}>{session.swell}</span></div>}
            {session.wind && <div><span>{CONDITION_ICONS.wind}</span> <span style={{ fontSize: 13 }}>{session.wind}</span></div>}
            {session.tide && <div><span>{CONDITION_ICONS.tide}</span> <span style={{ fontSize: 13 }}>{session.tide}</span></div>}
          </div>
          <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button
              onClick={() => setEditing(true)}
              style={{
                background: COLORS.primary, color: '#fff', border: "none", borderRadius: 10,
                fontWeight: 700, padding: "0.5em 1.3em", marginRight: 8, cursor: "pointer"
              }}>Edit</button>
            <button
              onClick={() => {
                if (window.confirm("Delete this session?")) onDelete(session.id);
              }}
              style={{
                background: "#c44", color: "#fff", border: "none", borderRadius: 10,
                fontWeight: 700, padding: "0.5em 1.3em", cursor: "pointer"
              }}>Delete</button>
          </div>
        </>
      )}
    </div>
  );
}

// -- Stats Dashboard (Charts with Sample Data) --
function StatsDashboard({ sessions }) {
  // Calculate: Most visited spot, Board usage, Mood trends
  const spotCounts = {};
  const boardCounts = {};
  const moodCounts = {};

  sessions.forEach(s => {
    spotCounts[s.spot] = (spotCounts[s.spot] || 0) + 1;
    boardCounts[s.board] = (boardCounts[s.board] || 0) + 1;
    moodCounts[s.mood] = (moodCounts[s.mood] || 0) + 1;
  });

  const maxSpot = Object.keys(spotCounts).reduce((a, b) => spotCounts[a] > spotCounts[b] ? a : b, "");
  const totalBoards = Object.values(boardCounts).reduce((a, b) => a + b, 0);

  // Get board usage %, mood trend bar
  const boardUsage = Object.entries(boardCounts).map(([board, count]) => ({
    board,
    percent: ((count / totalBoards) * 100).toFixed(1)
  }));

  const moodTrends = MOODS.map(m => ({
    label: m.label,
    count: moodCounts[m.label] || 0,
    icon: m.icon
  }));

  return (
    <div style={{ background: "#fff", borderRadius: 15, boxShadow: "0 2px 20px #5dadec1a", padding: "2.1rem 2.6rem", minWidth: 370 }}>
      <h2 style={{ color: COLORS.primary, fontWeight: 800 }}>Stats Dashboard</h2>
      <div style={{ marginTop: 20 }}>
        {/* Most visited spot */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700 }}>🏖️ Most Visited Spot:</div>
          <div style={{ fontSize: 19, color: COLORS.accent }}>{maxSpot || "—"}</div>
        </div>
        {/* Board Usage Chart - bar */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontWeight: 700 }}>🛹 Board Usage</div>
          <div style={{ display: "flex", gap: 8, flexDirection: "column", margin: "9px 0 0 4px" }}>
            {boardUsage.map(({ board, percent }) => (
              <div key={board} style={{ display: "flex", alignItems: "center" }}>
                <span style={{ minWidth: 90 }}>{board}</span>
                <div style={{
                  width: `${percent}px`, minWidth: 5, height: 16, background: COLORS.primary, borderRadius: 8, marginRight: 8,
                  boxShadow: "0 2px 6px #5dadcdeb"
                }} />
                <span style={{ color: "#468", fontSize: 13 }}>{percent}%</span>
              </div>
            ))}
          </div>
        </div>
        {/* Mood Trends */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontWeight: 700 }}>😊 Mood Trends</div>
          <div style={{ display: "flex", gap: 16, margin: "10px 0 0 4px" }}>
            {moodTrends.map((m) => (
              <div key={m.label} style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                background: "#f4e2d866", borderRadius: 8, padding: "10px 12px", minWidth: 60
              }}>
                <span style={{ fontSize: 24 }}>{m.icon}</span>
                <span style={{ fontWeight: 700 }}>{m.count}</span>
                <span style={{ fontSize: 12, color: "#666" }}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ color: "#999", fontSize: 13, marginTop: 24 }}>Charts are samples for visual cue; real charts/data connect on backend integration.</div>
      </div>
    </div>
  );
}

export default App;
