import { useMemo } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/TiltMeterPage.module.css";
import { matchStore, calculateKda } from "../store/matchStore";
import type { Match } from "../types/match";

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

const getTiltLevel = (match: Match): "high" | "medium" | "low" => {
  // Simple tilt indicator based on match stats
  if (match.result === "Defeat" && match.deaths > 8) return "high";
  if (match.result === "Defeat" || (match.deaths > 5 && match.kills < 5))
    return "medium";
  return "low";
};

const getTiltColor = (level: "high" | "medium" | "low"): string => {
  if (level === "high") return "#ef4444";
  if (level === "medium") return "#f59e0b";
  return "#4ade80";
};

export default function TiltMeterPage() {
  const matches = useMemo(() => matchStore.getAll(), []);

  const stats = useMemo(() => {
    const victories = matches.filter((m) => m.result === "Victory").length;
    const defeats = matches.filter((m) => m.result === "Defeat").length;
    const winRate =
      matches.length > 0
        ? ((victories / matches.length) * 100).toFixed(1)
        : "0";

    const avgKda =
      matches.length > 0
        ? (
            matches.reduce((sum, m) => sum + (m.kills + m.assists), 0) /
            Math.max(
              1,
              matches.reduce((sum, m) => sum + m.deaths, 0),
            )
          ).toFixed(2)
        : "0";

    const avgCS =
      matches.length > 0
        ? (matches.reduce((sum, m) => sum + m.cs, 0) / matches.length).toFixed(
            0,
          )
        : "0";

    const avgVision =
      matches.length > 0
        ? (
            matches.reduce((sum, m) => sum + m.visionScore, 0) / matches.length
          ).toFixed(1)
        : "0";

    return { victories, defeats, winRate, avgKda, avgCS, avgVision };
  }, [matches]);

  return (
    <>
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>
              🧠 Tilt Meter{" "}
              <span className={styles.bazingaBadge}>⚡ Bazinga Feature</span>
            </h1>
            <p className={styles.subtitle}>
              Match history · Game analysis · Session health monitor
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className={styles.tiltSummary}>
          <div className={styles.tiltStat}>
            <div className={styles.tiltStatLabel}>Total Games</div>
            <div className={styles.tiltStatValue}>{matches.length}</div>
            <div className={styles.tiltStatSub}>matches tracked</div>
          </div>
          <div className={styles.tiltStat}>
            <div className={styles.tiltStatLabel}>Win Rate</div>
            <div className={styles.tiltStatValue}>{stats.winRate}%</div>
            <div className={styles.tiltStatSub}>
              {stats.victories}W {stats.defeats}L
            </div>
          </div>
          <div className={styles.tiltStat}>
            <div className={styles.tiltStatLabel}>Avg KDA</div>
            <div className={styles.tiltStatValue}>{stats.avgKda}</div>
            <div className={styles.tiltStatSub}>kills + assists / deaths</div>
          </div>
          <div className={styles.tiltStat}>
            <div className={styles.tiltStatLabel}>Avg CS/Min</div>
            <div className={styles.tiltStatValue}>
              {(parseInt(stats.avgCS as string) / 2).toFixed(1)}
            </div>
            <div className={styles.tiltStatSub}>average cs per minute</div>
          </div>
        </div>

        {/* Match Timeline */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Match History</div>
          <div className={styles.cardSub}>
            Recent matches · Click for details
          </div>

          <div className={styles.matchesList}>
            {matches.map((match, idx) => {
              const tiltLevel = getTiltLevel(match);
              const tiltColor = getTiltColor(tiltLevel);
              const kdaValue = calculateKda(
                match.kills,
                match.deaths,
                match.assists,
              );

              return (
                <Link
                  key={idx}
                  to={`/tilt-meter/${match.id}`}
                  className={styles.matchRow}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div className={styles.matchInfo}>
                    <div
                      className={styles.matchChampIcon}
                      style={{
                        background: `rgba(${
                          tiltColor === "#ef4444"
                            ? "239,68,68"
                            : tiltColor === "#f59e0b"
                              ? "245,158,11"
                              : "74,222,128"
                        },0.12)`,
                      }}
                    >
                      {championIcon(match.champion)}
                    </div>
                    <div>
                      <div className={styles.matchChampName}>
                        {match.champion} · {match.role}
                      </div>
                      <div className={styles.matchChampMeta}>
                        {match.result} · {match.duration} · {match.date}
                      </div>
                    </div>
                  </div>

                  <div className={styles.matchStats}>
                    <div className={styles.matchStat}>
                      <span className={styles.statLabel}>KDA</span>
                      <span
                        className={styles.statValue}
                        style={{ color: tiltColor }}
                      >
                        {kdaValue}
                      </span>
                    </div>
                    <div className={styles.matchStat}>
                      <span className={styles.statLabel}>CS</span>
                      <span className={styles.statValue}>{match.cs}</span>
                    </div>
                    <div className={styles.matchStat}>
                      <span className={styles.statLabel}>Vision</span>
                      <span className={styles.statValue}>
                        {match.visionScore}
                      </span>
                    </div>
                  </div>

                  <div
                    className={styles.tiltIndicator}
                    style={{
                      background:
                        tiltLevel === "high"
                          ? "rgba(239,68,68,0.15)"
                          : tiltLevel === "medium"
                            ? "rgba(245,158,11,0.15)"
                            : "rgba(74,222,128,0.15)",
                      borderColor: tiltColor,
                    }}
                  >
                    <span
                      style={{
                        color: tiltColor,
                        fontSize: "20px",
                        fontWeight: "700",
                      }}
                    >
                      {tiltLevel === "high"
                        ? "🤬"
                        : tiltLevel === "medium"
                          ? "😤"
                          : "😊"}
                    </span>
                    <span style={{ fontSize: "11px", color: tiltColor }}>
                      {tiltLevel.toUpperCase()}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Feature Preview */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>🎙️ Rage Detector</div>
          <div className={styles.cardSub}>
            Coming soon — voice analysis features
          </div>

          <div className={styles.recordSection}>
            <div className={styles.recordBtn}>🎙️</div>
            <div className={styles.recordInfo}>
              <strong>Enable Rage Detector for next game</strong>
              <p>
                Caietul will listen in the background during your game and
                automatically tag rage moments with timestamps synced to your
                match timeline.
              </p>
            </div>
            <div className={styles.recordStatus}>
              <div className={styles.statusPill}>Coming Soon</div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
