import { useState, useEffect, useRef, useContext } from "react";
import { ThemeContext } from "./context/ThemeContext";
import { FadeInAnimation } from "./animation";

function WelcomeSection({ name }) {
  const ref = useRef(null);

  useEffect(() => {
    const animation = new FadeInAnimation(ref.current);
    animation.start(1000);
    return () => animation.stop();
  }, []);

  return (
    <h1
      ref={ref}
      style={{
        opacity: 0,
        color: "white",
        padding: 50,
        textAlign: "center",
        fontSize: 50,
        backgroundImage:
          "radial-gradient(circle, rgba(63,94,251,1) 0%, rgba(252,70,107,1) 100%)",
      }}
    >
      {name && name.trim() !== "" ? `Welcome, ${name}` : "Welcome"}
    </h1>
  );
}

function App() {
  const [name, setName] = useState("");
  const [elapsed, setElapsed] = useState(0); // milliseconds already accumulated
  const [notes, setNotes] = useState([]);
  const [hasLoadedNotes, setHasLoadedNotes] = useState(false);
  const [input, setInput] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef(null);
  const { dark, toggleTheme } = useContext(ThemeContext);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showWelcome, setShowWelcome] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [startTime, setStartTime] = useState(null);
  const [now, setNow] = useState(null);
  const intervalRef = useRef(null);

  let secondsPassed = elapsed / 1000;
  if (startTime != null && now != null) {
    secondsPassed = (now - startTime) / 1000;
  }
  function handleStart() {
    if (startTime !== null) return; // already running

    const start = Date.now() - elapsed;
    setStartTime(start);
    setNow(Date.now());

    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setNow(Date.now());
    }, 10);
  }

  function handleStop() {
    clearInterval(intervalRef.current);
    intervalRef.current = null;

    if (startTime != null && now != null) {
      setElapsed(now - startTime);
    }

    setStartTime(null); // mark as paused, not running
  }
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);
  function handleReset() {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setStartTime(null);
    setNow(null);
    setElapsed(0);
  }
  // ✅ Load notes once on first mount
  useEffect(() => {
    const saved = localStorage.getItem("notes");
    if (saved) {
      setNotes(JSON.parse(saved));
    }
    setHasLoadedNotes(true);
  }, []);

  // ✅ Save notes (only after load so we don't overwrite on refresh)
  useEffect(() => {
    if (!hasLoadedNotes) return;

    setSaveStatus("saving");
    localStorage.setItem("notes", JSON.stringify(notes));

    const timer = setTimeout(() => {
      setSaveStatus("saved");
    }, 700);

    return () => clearTimeout(timer);
  }, [notes, hasLoadedNotes]);

  // ✅ Focus input
  useEffect(() => {
    inputRef.current.focus();
  }, []);

  function addNote() {
    if (input.trim() === "") return;
    setNotes([...notes, input]);
    setInput("");
  }
  function deleteNote(index) {
    const updated = notes.filter((_, i) => i !== index);
    setNotes(updated);
  }

  function startEdit(index) {
    setEditingIndex(index);
    setEditValue(notes[index]);
  }

  function saveEdit(index) {
    const updated = [...notes];
    updated[index] = editValue;
    setNotes(updated);
    setEditingIndex(null);
    setEditValue("");
  }
  const filteredNotes = notes.filter((note) => {
    const matchesSearch = note.toLowerCase().includes(search.toLowerCase());

    if (filter === "long") return matchesSearch && note.length > 10;
    if (filter === "short") return matchesSearch && note.length <= 10;
    return matchesSearch;
  });
  return (
    <div
      style={{
        background: dark ? "#222" : "#fff",
        color: dark ? "#fff" : "#000",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      {showWelcome && <WelcomeSection name={name} />}
      <button onClick={() => setShowWelcome(!showWelcome)}>
        {showWelcome ? "Hide Welcome" : "Show Welcome"}
      </button>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name..."
      />

      <h1>Testing react hooks</h1>
      <h2>Time passed: {secondsPassed.toFixed(3)}</h2>
      <button onClick={handleStart}>Start</button>
      <button onClick={handleStop}>Stop</button>
      <button onClick={handleReset}>Reset</button>
      <p
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "14px",
        }}
      >
        <span>{saveStatus === "saving" ? "⏳" : "✅"}</span>
        <span>{saveStatus === "saving" ? "Saving..." : "Saved"}</span>
      </p>

      <button onClick={toggleTheme}>
        Toggle {dark ? "Light" : "Dark"} Mode
      </button>
      <br />
      <br />
      <input
        placeholder="Search notes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <br />
      <br />
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") addNote();
        }}
        placeholder="Write a note..."
      />
      <button onClick={addNote}>Add</button>
      <br />

      <br />
      <br />
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="all">All</option>
        <option value="long">Long notes</option>
        <option value="short">Short notes</option>
      </select>
      <br />
      <br />
      <ul className="notes-list">
        {filteredNotes.map((note, index) => (
          <li key={index} className="note-card">
            {editingIndex === index ? (
              <>
                <input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
                <button onClick={() => saveEdit(index)}>Save</button>
              </>
            ) : (
              <>
                {note}
                <button onClick={() => startEdit(index)}>Edit</button>
              </>
            )}

            <button onClick={() => deleteNote(index)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
