import { useState, useEffect, useRef } from "react";

const HORROR_SUBGENRES = [
  "Psychological Horror",
  "Supernatural",
  "Slasher",
  "Found Footage",
  "Cosmic Horror",
  "Body Horror",
  "Gothic Horror",
  "Folk Horror",
  "Zombie",
  "Paranormal",
  "Demonic",
  "Survival Horror",
];

const TONES = [
  "Dread & Suspense",
  "Shock & Gore",
  "Eerie & Atmospheric",
  "Disturbing & Unsettling",
  "Dark & Nihilistic",
  "Cold & Analytical",
];

const CONTENT_TYPES = [
  "Movie Review",
  "Top List / Ranking",
  "Movie Explanation",
  "Hidden Gems",
  "Comparison",
  "Theory / Analysis",
  "Recap / Summary",
  "Recommendation",
];

const SILENCE_POSITIONS = [
  { value: "start", label: 'IN SILENCE: [Title]' },
  { value: "end", label: '[Title] — IN SILENCE' },
  { value: "mixed", label: 'AI decides best placement' },
];

function FlickerText({ text }) {
  const chars = useRef(
    text.split("").map(() => ({
      delay: Math.random() * 5,
      dur: 3 + Math.random() * 4,
    }))
  );
  return (
    <span className="flicker-text">
      {text.split("").map((char, i) => (
        <span key={i} style={{ animationDelay: `${chars.current[i].delay}s`, animationDuration: `${chars.current[i].dur}s` }}>
          {char}
        </span>
      ))}
    </span>
  );
}

function GlitchLine() {
  const [pos, setPos] = useState(Math.random() * 100);
  useEffect(() => {
    const iv = setInterval(() => setPos(Math.random() * 100), 3000 + Math.random() * 5000);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{ position: "absolute", top: `${pos}%`, left: 0, right: 0, height: "1px", background: "rgba(255,255,255,0.04)", pointerEvents: "none", transition: "top 0.05s", zIndex: 0 }} />
  );
}

function MaskIcon({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="52" rx="32" ry="38" fill="#1a1a1a" stroke="#3a3a3a" strokeWidth="1.5" />
      <ellipse cx="38" cy="44" rx="7" ry="5" fill="#0a0a0a" />
      <ellipse cx="62" cy="44" rx="7" ry="5" fill="#0a0a0a" />
      <path d="M42 64 Q50 70 58 64" stroke="#2a2a2a" strokeWidth="1.5" fill="none" />
      <ellipse cx="50" cy="52" rx="32" ry="38" fill="none" stroke="#4a4a4a" strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
}

export default function HorrorGenerator() {
  const [topic, setTopic] = useState("");
  const [subgenre, setSubgenre] = useState("Psychological Horror");
  const [tone, setTone] = useState("Dread & Suspense");
  const [contentType, setContentType] = useState("Movie Review");
  const [silencePos, setSilencePos] = useState("mixed");
  const [extraNotes, setExtraNotes] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState({});
  const resultsRef = useRef(null);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);

    const silenceRule =
      silencePos === "start"
        ? 'Every title MUST start with "IN SILENCE:" followed by the rest of the title.'
        : silencePos === "end"
        ? 'Every title MUST end with "— IN SILENCE" or "| IN SILENCE".'
        : 'Every title MUST contain the phrase "IN SILENCE" — either at the start (e.g. "IN SILENCE: ...") or the end (e.g. "... — IN SILENCE"). Choose whichever placement sounds most impactful for each title. Vary placement across the 3 titles.';

    const prompt = `You are a YouTube SEO and title-crafting expert for the channel "Face 2 Less" (@less2face) — a dark, serious, cinephile-focused horror movie YouTube channel. The channel has a faceless/mask aesthetic and a cold, atmospheric, contemplative tone. It treats horror as art, not just entertainment.

CRITICAL BRANDING RULE — "IN SILENCE" TRADEMARK:
${silenceRule}
This is the channel's signature. NEVER omit "IN SILENCE" from any title. It is non-negotiable.

Topic/Movie: ${topic}
Subgenre: ${subgenre}
Tone: ${tone}
Content Type: ${contentType}
${extraNotes ? `Additional Notes: ${extraNotes}` : ""}

Generate EXACTLY 3 title + description combos.

TITLE RULES:
- Must include "IN SILENCE" as described above
- Dark, cinephile tone — serious, not clickbaity trash
- Optimized for YouTube search/CTR
- Should feel like a title from a prestigious horror film channel, not a generic YouTuber
- Can use ellipsis, dashes, colons, pipes for dramatic effect
- Keep under 80 characters when possible

DESCRIPTION RULES:
- 3-5 sentences
- Written in the cold, contemplative voice of Face 2 Less
- Include relevant horror/movie keywords naturally
- Start with a haunting hook sentence
- End with a subtle call to action that fits the brand (no "SMASH THAT LIKE BUTTON" energy — think atmospheric invitations like "Subscribe if you dare to look deeper" or "Join the faceless.")
- Reference the channel name "Face 2 Less" naturally where appropriate

Respond ONLY with valid JSON, no markdown, no backticks:
[
  {
    "title": "...",
    "description": "..."
  },
  {
    "title": "...",
    "description": "..."
  },
  {
    "title": "...",
    "description": "..."
  }
]`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await response.json();
      const text = data.content.filter((b) => b.type === "text").map((b) => b.text).join("");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResults(parsed);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err) {
      setError("The void returned nothing... Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied((p) => ({ ...p, [key]: true }));
    setTimeout(() => setCopied((p) => ({ ...p, [key]: false })), 2000);
  };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Special+Elite&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Cinzel:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .flicker-text span { animation: flicker linear infinite; }
        @keyframes flicker {
          0%, 93%, 100% { opacity: 1; }
          94% { opacity: 0.3; }
          95% { opacity: 1; }
          96% { opacity: 0.15; }
          97% { opacity: 0.8; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(60,60,60,0.15), inset 0 0 20px rgba(0,0,0,0.3); }
          50% { box-shadow: 0 0 35px rgba(80,80,80,0.2), inset 0 0 30px rgba(0,0,0,0.5); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes loadingPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes silenceGlow {
          0%, 100% { text-shadow: 0 0 8px rgba(200,200,200,0.1); }
          50% { text-shadow: 0 0 20px rgba(200,200,200,0.25); }
        }
        .result-card { animation: fadeSlideUp 0.6s ease-out both; }
        .result-card:nth-child(2) { animation-delay: 0.15s; }
        .result-card:nth-child(3) { animation-delay: 0.3s; }

        .f2l-select {
          appearance: none; background-color: #0d0d0d; border: 1px solid #2a2a2a; color: #b0b0b0;
          padding: 12px 36px 12px 14px; border-radius: 2px; font-family: 'Cormorant Garamond', serif;
          font-size: 15px; width: 100%; cursor: pointer; transition: border-color 0.3s, box-shadow 0.3s;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M6 8L1 3h10z' fill='%23555'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 12px center;
        }
        .f2l-select:focus { outline: none; border-color: #555; box-shadow: 0 0 12px rgba(100,100,100,0.15); }
        .f2l-select option { background: #0d0d0d; color: #b0b0b0; }

        .f2l-input {
          background-color: #0d0d0d; border: 1px solid #2a2a2a; color: #b0b0b0;
          padding: 12px 14px; border-radius: 2px; font-family: 'Cormorant Garamond', serif;
          font-size: 15px; width: 100%; transition: border-color 0.3s, box-shadow 0.3s;
        }
        .f2l-input:focus { outline: none; border-color: #555; box-shadow: 0 0 12px rgba(100,100,100,0.15); }
        .f2l-input::placeholder { color: #3a3a3a; font-style: italic; }

        .f2l-textarea {
          background-color: #0d0d0d; border: 1px solid #2a2a2a; color: #b0b0b0;
          padding: 12px 14px; border-radius: 2px; font-family: 'Cormorant Garamond', serif;
          font-size: 15px; width: 100%; resize: vertical; min-height: 70px; transition: border-color 0.3s, box-shadow 0.3s;
        }
        .f2l-textarea:focus { outline: none; border-color: #555; box-shadow: 0 0 12px rgba(100,100,100,0.15); }
        .f2l-textarea::placeholder { color: #3a3a3a; font-style: italic; }

        .gen-btn {
          background: linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%); color: #c0c0c0;
          border: 1px solid #3a3a3a; padding: 16px 48px; font-family: 'Cinzel', serif;
          font-size: 16px; letter-spacing: 4px; cursor: pointer; border-radius: 2px;
          transition: all 0.3s; text-transform: uppercase; position: relative; overflow: hidden;
        }
        .gen-btn:hover:not(:disabled) { background: linear-gradient(180deg, #222 0%, #111 100%); box-shadow: 0 0 30px rgba(100,100,100,0.15); color: #fff; border-color: #555; }
        .gen-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .copy-btn {
          background: rgba(100,100,100,0.08); border: 1px solid #2a2a2a; color: #666;
          padding: 6px 14px; font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 1px;
          cursor: pointer; border-radius: 2px; transition: all 0.2s; white-space: nowrap; text-transform: uppercase;
        }
        .copy-btn:hover { background: rgba(100,100,100,0.15); color: #ccc; border-color: #555; }

        .loading-mask { animation: loadingPulse 2s ease-in-out infinite; display: inline-block; }
        .silence-badge { animation: silenceGlow 3s ease-in-out infinite; }
        .silence-in-title { color: #e0e0e0; font-weight: 700; letter-spacing: 2px; }
      `}</style>

      <div style={styles.scanlines} />
      <div style={styles.vignette} />
      <GlitchLine />
      <GlitchLine />

      <header style={styles.header}>
        <MaskIcon size={56} />
        <h1 style={styles.titleWrap}>
          <span style={styles.channelName}>FACE 2 LESS</span>
          <span style={styles.titleDivider} />
          <span style={styles.titleSub}>Title & Description</span>
          <span style={styles.titleAccent}><FlickerText text="GENERATOR" /></span>
        </h1>
        <p style={styles.subtitle}>Every title carries the silence. Every description invites the faceless.</p>
        <div style={styles.silenceBadge} className="silence-badge">IN SILENCE</div>
      </header>

      <div style={styles.formContainer}>
        <div style={styles.formInner}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Movie / Topic</label>
            <input className="f2l-input" placeholder="e.g. Hereditary, The Witch, Top 5 A24 Horror Films..." value={topic} onChange={(e) => setTopic(e.target.value)} onKeyDown={(e) => e.key === "Enter" && generate()} />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>"IN SILENCE" Placement <span style={styles.trademark}>— your trademark</span></label>
            <div style={styles.silenceOptions}>
              {SILENCE_POSITIONS.map((sp) => (
                <button key={sp.value} onClick={() => setSilencePos(sp.value)} style={{ ...styles.silenceOption, ...(silencePos === sp.value ? styles.silenceOptionActive : {}) }}>
                  {sp.label}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.fieldGroup, flex: 1 }}>
              <label style={styles.label}>Subgenre</label>
              <select className="f2l-select" value={subgenre} onChange={(e) => setSubgenre(e.target.value)}>
                {HORROR_SUBGENRES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ ...styles.fieldGroup, flex: 1 }}>
              <label style={styles.label}>Tone</label>
              <select className="f2l-select" value={tone} onChange={(e) => setTone(e.target.value)}>
                {TONES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Content Type</label>
            <div style={styles.chipRow}>
              {CONTENT_TYPES.map((ct) => (
                <button key={ct} onClick={() => setContentType(ct)} style={{ ...styles.chip, ...(contentType === ct ? styles.chipActive : {}) }}>
                  {ct}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Additional Notes <span style={styles.labelOptional}>(optional)</span></label>
            <textarea className="f2l-textarea" placeholder="Any specific angle, keywords, or style notes..." value={extraNotes} onChange={(e) => setExtraNotes(e.target.value)} />
          </div>

          <div style={styles.btnWrap}>
            <button className="gen-btn" onClick={generate} disabled={loading || !topic.trim()}>
              {loading ? "Summoning..." : "Generate In Silence"}
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div style={styles.loadingWrap}>
          <div className="loading-mask"><MaskIcon size={64} /></div>
          <p style={styles.loadingText}>The faceless are writing...</p>
        </div>
      )}

      {error && (
        <div style={styles.errorWrap}>
          <p style={styles.errorText}>{error}</p>
        </div>
      )}

      {results && (
        <div ref={resultsRef} style={styles.resultsSection}>
          <h2 style={styles.resultsHeading}>Your Titles</h2>
          <div style={styles.resultsGrid}>
            {results.map((r, i) => {
              const parts = r.title.split(/(IN SILENCE)/gi);
              return (
                <div key={i} className="result-card" style={styles.resultCard}>
                  <div style={styles.resultNumber}>{String(i + 1).padStart(2, "0")}</div>
                  <div>
                    <div style={styles.resultLabelRow}>
                      <span style={styles.resultLabel}>TITLE</span>
                      <button className="copy-btn" onClick={() => copyToClipboard(r.title, `t${i}`)}>
                        {copied[`t${i}`] ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <p style={styles.resultTitle}>
                      {parts.map((part, j) =>
                        part.toUpperCase() === "IN SILENCE" ? (
                          <span key={j} className="silence-in-title">{part}</span>
                        ) : (<span key={j}>{part}</span>)
                      )}
                    </p>
                  </div>
                  <div style={styles.divider} />
                  <div>
                    <div style={styles.resultLabelRow}>
                      <span style={styles.resultLabel}>DESCRIPTION</span>
                      <button className="copy-btn" onClick={() => copyToClipboard(r.description, `d${i}`)}>
                        {copied[`d${i}`] ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <p style={styles.resultDesc}>{r.description}</p>
                  </div>
                  <button className="copy-btn" style={{ marginTop: 14, width: "100%", padding: "10px" }} onClick={() => copyToClipboard(`${r.title}\n\n${r.description}`, `a${i}`)}>
                    {copied[`a${i}`] ? "Copied Both" : "Copy Title + Description"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <footer style={styles.footer}>
        <MaskIcon size={20} />
        <p style={styles.footerText}>Face 2 Less — Powered by silence & AI</p>
      </footer>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "radial-gradient(ellipse at 50% 0%, #111 0%, #080808 40%, #040404 100%)", color: "#999", fontFamily: "'Cormorant Garamond', serif", position: "relative", overflow: "hidden", padding: "0 16px 40px" },
  scanlines: { position: "fixed", inset: 0, background: "repeating-linear-gradient(0deg, transparent 0%, rgba(255,255,255,0.008) 50%, transparent 100%)", backgroundSize: "100% 3px", pointerEvents: "none", zIndex: 0 },
  vignette: { position: "fixed", inset: 0, background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)", pointerEvents: "none", zIndex: 0 },
  header: { textAlign: "center", padding: "50px 20px 24px", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" },
  titleWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" },
  channelName: { fontFamily: "'Cinzel', serif", fontSize: "42px", fontWeight: 700, color: "#e0e0e0", letterSpacing: "10px", textShadow: "0 0 40px rgba(200,200,200,0.1)" },
  titleDivider: { width: "60px", height: "1px", background: "linear-gradient(90deg, transparent, #444, transparent)", margin: "4px 0", display: "block" },
  titleSub: { fontFamily: "'Cinzel', serif", fontSize: "12px", color: "#555", letterSpacing: "6px", textTransform: "uppercase" },
  titleAccent: { fontFamily: "'Cinzel', serif", fontSize: "24px", color: "#777", letterSpacing: "8px", fontWeight: 400 },
  subtitle: { marginTop: "10px", color: "#4a4a4a", fontStyle: "italic", fontSize: "15px", letterSpacing: "0.5px" },
  silenceBadge: { marginTop: "12px", fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "6px", color: "#888", padding: "6px 20px", border: "1px solid #2a2a2a", borderRadius: "1px", textTransform: "uppercase" },
  formContainer: { maxWidth: "680px", margin: "30px auto 0", position: "relative", zIndex: 1 },
  formInner: { background: "rgba(10,10,10,0.85)", border: "1px solid #1e1e1e", borderRadius: "3px", padding: "32px 28px", animation: "pulse-glow 8s ease-in-out infinite" },
  fieldGroup: { marginBottom: "22px" },
  label: { display: "block", marginBottom: "8px", fontFamily: "'Cinzel', serif", fontSize: "11px", color: "#666", letterSpacing: "2px", textTransform: "uppercase" },
  trademark: { fontSize: "10px", color: "#444", letterSpacing: "1px", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", textTransform: "none" },
  labelOptional: { fontSize: "10px", color: "#3a3a3a", textTransform: "lowercase", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" },
  row: { display: "flex", gap: "16px" },
  silenceOptions: { display: "flex", flexDirection: "column", gap: "8px" },
  silenceOption: { background: "rgba(100,100,100,0.05)", border: "1px solid #1e1e1e", color: "#555", padding: "10px 16px", borderRadius: "2px", fontFamily: "'Cormorant Garamond', serif", fontSize: "14px", cursor: "pointer", transition: "all 0.2s", textAlign: "left", width: "100%" },
  silenceOptionActive: { background: "rgba(200,200,200,0.06)", borderColor: "#555", color: "#ccc", boxShadow: "0 0 12px rgba(100,100,100,0.08)" },
  chipRow: { display: "flex", flexWrap: "wrap", gap: "8px" },
  chip: { background: "rgba(100,100,100,0.05)", border: "1px solid #1e1e1e", color: "#555", padding: "8px 14px", borderRadius: "2px", fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "1px", cursor: "pointer", transition: "all 0.2s", textTransform: "uppercase" },
  chipActive: { background: "rgba(200,200,200,0.08)", borderColor: "#555", color: "#ccc", boxShadow: "0 0 10px rgba(100,100,100,0.1)" },
  btnWrap: { textAlign: "center", marginTop: "28px" },
  loadingWrap: { textAlign: "center", padding: "40px 20px", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" },
  loadingText: { color: "#4a4a4a", fontStyle: "italic", fontSize: "15px", letterSpacing: "1px" },
  errorWrap: { maxWidth: "680px", margin: "20px auto", textAlign: "center", position: "relative", zIndex: 1 },
  errorText: { color: "#aa4444", fontFamily: "'Cinzel', serif", fontSize: "13px", letterSpacing: "1px" },
  resultsSection: { maxWidth: "680px", margin: "40px auto 0", position: "relative", zIndex: 1 },
  resultsHeading: { textAlign: "center", fontFamily: "'Cinzel', serif", fontSize: "14px", color: "#555", marginBottom: "24px", letterSpacing: "6px", textTransform: "uppercase" },
  resultsGrid: { display: "flex", flexDirection: "column", gap: "20px" },
  resultCard: { background: "rgba(10,10,10,0.9)", border: "1px solid #1e1e1e", borderRadius: "3px", padding: "28px 24px 20px", position: "relative" },
  resultNumber: { position: "absolute", top: "-10px", left: "20px", background: "#111", border: "1px solid #2a2a2a", color: "#666", fontFamily: "'Cinzel', serif", fontSize: "11px", padding: "2px 12px", borderRadius: "2px", letterSpacing: "2px" },
  resultLabelRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
  resultLabel: { fontFamily: "'Cinzel', serif", fontSize: "10px", color: "#444", letterSpacing: "3px", textTransform: "uppercase" },
  resultTitle: { fontFamily: "'Cinzel', serif", fontSize: "20px", fontWeight: 600, color: "#c8c8c8", lineHeight: 1.4, letterSpacing: "1px" },
  divider: { height: "1px", background: "linear-gradient(90deg, transparent, #2a2a2a, transparent)", margin: "18px 0" },
  resultDesc: { fontSize: "15px", lineHeight: 1.8, color: "#888", fontStyle: "italic" },
  footer: { textAlign: "center", padding: "50px 20px 10px", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", opacity: 0.4 },
  footerText: { color: "#333", fontFamily: "'Cinzel', serif", fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase" },
};
