import { useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import styles from "../styles/TiltMeterMatchPage.module.css";
import { matchStore } from "../store/matchStore";

const CHAMPION_ICONS: Record<string, string> = {
  yasuo: "⚔️",
  zed: "🗡️",
  ahri: "🦊",
  "lee sin": "🐉",
  jinx: "💥",
  maokai: "🌿",
  lissandra: "❄️",
};

const championIcon = (name: string): string =>
  CHAMPION_ICONS[name.trim().toLowerCase()] ?? "🎮";

// Hardcoded rage detection data for demo
const RAGE_MOMENTS = [
  {
    timestamp: "08:14",
    reason: "Ganked 1v2 — no flash, no escape",
    detail: "Death #1 · Enemy Kha'Zix + Syndra dive · Volume spike detected",
    level: "medium" as const,
    shame: 4,
  },
  {
    timestamp: "17:33",
    reason: "Missed Steel Tempest into wall — lost kill",
    detail:
      "Death #2 · Mechanical error · Loud rage detected — possible keyboard slam 🎹",
    level: "high" as const,
    shame: 8,
  },
  {
    timestamp: "24:15",
    reason: "Caught without vision — team lost fight",
    detail:
      "Death #3 · Poor map awareness · Sustained rage — multiple detections over 40s",
    level: "high" as const,
    shame: 7,
  },
];

interface ModalState {
  open: boolean;
  timestamp: string;
  reason: string;
  level: "high" | "medium";
  shame: number;
}

export default function TiltMeterMatchPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedRageIdx, setSelectedRageIdx] = useState(0);
  const [modal, setModal] = useState<ModalState>({
    open: false,
    timestamp: "",
    reason: "",
    level: "high",
    shame: 8,
  });

  const match = useMemo(() => {
    const allMatches = matchStore.getAll();
    return allMatches.find((m) => m.id.toString() === (id || "0"));
  }, [id]);

  if (!match) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#fff" }}>
        <p>Match not found</p>
        <Link to="/tilt-meter" style={{ color: "#a5b4fc" }}>
          Back to Tilt Meter
        </Link>
      </div>
    );
  }

  const openModal = (idx: number) => {
    const rage = RAGE_MOMENTS[idx];
    setSelectedRageIdx(idx);
    setModal({
      open: true,
      timestamp: rage.timestamp,
      reason: rage.reason,
      level: rage.level,
      shame: rage.shame,
    });
  };

  const closeModal = () => {
    setModal({ ...modal, open: false });
  };

  const nextRage = () => {
    const nextIdx = (selectedRageIdx + 1) % RAGE_MOMENTS.length;
    openModal(nextIdx);
  };

  const prevRage = () => {
    const prevIdx =
      (selectedRageIdx - 1 + RAGE_MOMENTS.length) % RAGE_MOMENTS.length;
    openModal(prevIdx);
  };

  return (
    <>
      <main className={styles.main}>
        <div className={styles.backButton}>
          <button
            onClick={() => navigate("/tilt-meter")}
            style={{
              background: "none",
              border: "none",
              color: "#a5b4fc",
              cursor: "pointer",
              fontSize: "14px",
              padding: "0",
            }}
          >
            ← Back to Tilt Meter
          </button>
        </div>

        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>
              {championIcon(match.champion)} {match.champion} · {match.role}
            </h1>
            <p className={styles.subtitle}>
              {match.result} · {match.duration} · {match.date}
            </p>
          </div>
        </div>

        {/* Cortisol Graph */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            Cortisol Level — Session Analysis
          </div>
          <div className={styles.cardSub}>
            Estimated stress index based on deaths, loss streaks, performance
            drops and detected rage moments
          </div>

          <div className={styles.cortisolWrap}>
            <svg
              viewBox="0 0 900 200"
              width="100%"
              style={{ overflow: "visible" }}
            >
              {/* Zone backgrounds */}
              <rect
                x="0"
                y="0"
                width="900"
                height="60"
                rx="0"
                fill="rgba(239,68,68,0.06)"
              />
              <rect
                x="0"
                y="60"
                width="900"
                height="70"
                rx="0"
                fill="rgba(245,158,11,0.04)"
              />
              <rect
                x="0"
                y="130"
                width="900"
                height="70"
                rx="0"
                fill="rgba(34,197,94,0.04)"
              />

              {/* Zone labels */}
              <text
                x="905"
                y="35"
                fill="rgba(239,68,68,0.5)"
                fontSize="9"
                fontWeight="600"
              >
                TILT
              </text>
              <text
                x="905"
                y="100"
                fill="rgba(245,158,11,0.5)"
                fontSize="9"
                fontWeight="600"
              >
                WARN
              </text>
              <text
                x="905"
                y="165"
                fill="rgba(34,197,94,0.5)"
                fontSize="9"
                fontWeight="600"
              >
                CALM
              </text>

              {/* Grid lines */}
              <line
                x1="0"
                y1="60"
                x2="900"
                y2="60"
                stroke="rgba(239,68,68,0.15)"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <line
                x1="0"
                y1="130"
                x2="900"
                y2="130"
                stroke="rgba(34,197,94,0.15)"
                strokeWidth="1"
                strokeDasharray="4,4"
              />

              {/* Gradient definitions */}
              <defs>
                <linearGradient id="cortGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#4ade80" />
                  <stop offset="50%" stopColor="#fbbf24" />
                  <stop offset="80%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>

              {/* Filled area under curve */}
              <path
                d="M45,170 C80,170 100,100 135,100 C170,100 190,160 225,150 C260,150 280,155 315,155 C350,155 370,95 405,95 C440,95 460,30 495,30 C530,30 550,40 585,40 C620,40 640,110 675,110 C710,110 730,90 765,90 L765,200 L45,200 Z"
                fill="url(#cortGrad)"
              />

              {/* The line itself */}
              <path
                d="M45,170 C80,170 100,100 135,100 C170,100 190,160 225,150 C260,150 280,155 315,155 C350,155 370,95 405,95 C440,95 460,30 495,30 C530,30 550,40 585,40 C620,40 640,110 675,110 C710,110 730,90 765,90"
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Data point dots */}
              <circle cx="45" cy="170" r="5" fill="#4ade80" />
              <circle cx="135" cy="100" r="5" fill="#fbbf24" />
              <circle cx="225" cy="150" r="5" fill="#4ade80" />
              <circle cx="315" cy="155" r="5" fill="#4ade80" />
              <circle cx="405" cy="95" r="5" fill="#fbbf24" />
              <circle
                cx="495"
                cy="30"
                r="7"
                fill="#ef4444"
                style={{ filter: "drop-shadow(0 0 6px #ef4444)" }}
              />
              <circle
                cx="585"
                cy="40"
                r="7"
                fill="#ef4444"
                style={{ filter: "drop-shadow(0 0 6px #ef4444)" }}
              />
              <circle cx="675" cy="110" r="5" fill="#fbbf24" />
              <circle cx="765" cy="90" r="5" fill="#fbbf24" />

              {/* Stop playing warning arrow */}
              <line
                x1="495"
                y1="30"
                x2="495"
                y2="-15"
                stroke="rgba(239,68,68,0.5)"
                strokeWidth="1.5"
                strokeDasharray="3,3"
              />
              <text
                x="495"
                y="-20"
                fill="#f87171"
                fontSize="10"
                textAnchor="middle"
                fontWeight="600"
              >
                ⛔ Should've stopped
              </text>
            </svg>

            <div className={styles.cortisolLabels}>
              <span className={styles.cortisolLabel}>
                00:00
                <br />
                Start
              </span>
              <span className={styles.cortisolLabel}>
                05:00
                <br />
                Early
              </span>
              <span className={styles.cortisolLabel}>
                10:00
                <br />
                Mid
              </span>
              <span className={styles.cortisolLabel}>
                15:00
                <br />
                Mid
              </span>
              <span className={styles.cortisolLabel}>
                20:00
                <br />
                Late
              </span>
              <span className={styles.cortisolLabel}>
                25:00
                <br />
                Late
              </span>
              <span className={styles.cortisolLabel}>
                {match.duration}
                <br />
                End
              </span>
            </div>
          </div>

          <div className={styles.breakBanner}>
            <div className={styles.breakIcon}>🛑</div>
            <div className={styles.breakText}>
              <strong>3 rage moments detected in this match</strong>
              <span>
                Your performance dropped significantly after the 2nd rage
                moment. Stress levels remained elevated for the rest of the
                match.
              </span>
            </div>
          </div>
        </div>

        {/* Rage Detector */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            🎙️ Rage Detector — Moment Timeline
          </div>
          <div className={styles.cardSub}>
            Click a rage spike to watch the clip with audio analysis
          </div>

          {/* Rage markers timeline */}
          <div className={styles.timelineSection}>
            <div className={styles.timelineHeader}>
              <div className={styles.gameInfo}>
                <div className={styles.gameChampIcon}>
                  {championIcon(match.champion)}
                </div>
                <div>
                  <div className={styles.gameChampName}>
                    {match.champion} · {match.role}
                  </div>
                  <div className={styles.gameChampMeta}>
                    {match.result} · {match.duration} · {match.date}
                  </div>
                </div>
              </div>
              <div className={styles.rageCount}>
                😤 {RAGE_MOMENTS.length} Rage Moments
              </div>
            </div>

            {/* Timeline bar with rage markers */}
            <div className={styles.timelineBarWrap}>
              <div className={styles.timelineTrack}>
                <div className={styles.timelineFill}></div>

                {RAGE_MOMENTS.map((rage, idx) => {
                  const percentage = idx * 20 + 15; // Distribute markers across timeline
                  return (
                    <div
                      key={idx}
                      className={styles.rageMarker}
                      style={{ left: `${percentage}%` }}
                      onClick={() => openModal(idx)}
                      role="button"
                      tabIndex={0}
                    >
                      <div
                        className={`${styles.rageMarkerInner} ${
                          rage.level === "high"
                            ? styles.rageHigh
                            : styles.rageMedium
                        }`}
                      >
                        {rage.level === "high" ? "🤬" : "😤"}
                      </div>
                      <div className={styles.rageMarkerLabel}>
                        {rage.timestamp}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={styles.timelineTimestamps}>
                <span>00:00</span>
                <span>07:00</span>
                <span>14:00</span>
                <span>21:00</span>
                <span>{match.duration}</span>
              </div>
            </div>

            {/* Rage clips list */}
            <div className={styles.rageClips}>
              {RAGE_MOMENTS.map((rage, idx) => (
                <div
                  key={idx}
                  className={`${styles.rageClip} ${
                    selectedRageIdx === idx ? styles.activeClip : ""
                  }`}
                  onClick={() => openModal(idx)}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.clipTimestamp}>{rage.timestamp}</div>
                  <div className={styles.clipWaveform}>
                    {[30, 50, 80, 60, 90, 70, 40, 55, 35, 25].map((h, i) => (
                      <div
                        key={i}
                        className={`${styles.waveBar} ${
                          idx === selectedRageIdx && h > 60 ? styles.spike : ""
                        }`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div className={styles.clipInfo}>
                    <div className={styles.clipReason}>{rage.reason}</div>
                    <div className={styles.clipDetail}>{rage.detail}</div>
                  </div>
                  <div className={styles.clipShame}>
                    <span style={{ fontSize: "10px" }}>Shame</span>
                    <div className={styles.shameBarWrap}>
                      <div
                        className={styles.shameBar}
                        style={{
                          width: `${rage.shame * 10}%`,
                          background: rage.shame > 7 ? "#ef4444" : "#fbbf24",
                        }}
                      />
                    </div>
                    <span>{rage.shame}/10</span>
                  </div>
                  <div className={styles.clipPlayBtn}>▶</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {modal.open && (
        <div
          className={styles.modalOverlay}
          onClick={closeModal}
          role="button"
          tabIndex={-1}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.modalTitle}>
                  {modal.level === "high" ? "🤬" : "😤"} Rage Clip —{" "}
                  {modal.timestamp}
                </div>
                <div className={styles.modalMeta}>
                  {match.champion} · {match.role} · {modal.reason}
                </div>
              </div>
              <button className={styles.modalClose} onClick={closeModal}>
                ✕
              </button>
            </div>

            {/* Gameplay preview */}
            <div className={styles.gameplayPreview}>
              <div className={styles.gameplayPlaceholder}>
                <div className={styles.bigIcon}>🎮</div>
                <p>
                  Gameplay recording · {match.champion} · {match.role} ·{" "}
                  {match.duration} match
                </p>
                <p style={{ fontSize: "11px", marginTop: "4px" }}>
                  Clip synced to match timestamp
                </p>
              </div>
              <div className={styles.timestampOverlay}>{modal.timestamp}</div>
              <div className={styles.rageOverlay}>
                {modal.level === "high" ? "🤬 HIGH RAGE" : "😤 MEDIUM RAGE"}
              </div>
              <div className={styles.minimapOverlay}>minimap</div>
            </div>

            {/* Playback controls */}
            <div className={styles.playbackControls}>
              <button className={styles.playBtn}>⏸</button>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} />
                <div className={styles.progressThumb} />
              </div>
              <div className={styles.timeDisplay}>00:12 / 00:30</div>
            </div>

            {/* Mic waveform */}
            <div className={styles.micSection}>
              <div className={styles.micHeader}>
                <div className={styles.micDot} />
                <div className={styles.micLabel}>
                  Mic Recording — Rage Audio
                </div>
                <div className={styles.micPeak}>Peak: 94 dB 🔊</div>
              </div>
              <div className={styles.micWaveform}>
                {[
                  5, 8, 12, 25, 40, 70, 95, 100, 98, 90, 85, 70, 60, 80, 95,
                  100, 92, 75, 50, 35, 20, 15, 10, 8, 12, 30, 55, 70, 60, 40,
                  25, 15, 8, 5, 3, 5, 8, 15, 30, 50, 70, 85, 95, 88, 70, 45, 25,
                  12, 6, 3,
                ].map((h, i) => (
                  <div
                    key={i}
                    className={`${styles.micWaveBar} ${
                      h > 60 ? styles.spike : ""
                    }`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className={styles.modalFooter}>
              <div className={styles.shameScore}>
                <span className={styles.shameEmoji}>😳</span>
                <span className={styles.shameLabel}>Shame Score:</span>
                <span className={styles.shameValue}>{modal.shame}/10</span>
                <span
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.2)",
                    marginLeft: "8px",
                  }}
                >
                  possible keyboard damage detected
                </span>
              </div>
              <div className={styles.navClips}>
                <button className={styles.navClipBtn} onClick={prevRage}>
                  ← Prev Rage
                </button>
                <button className={styles.navClipBtn} onClick={nextRage}>
                  Next Rage →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
