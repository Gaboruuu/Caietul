import { Link, useParams } from "react-router-dom";
import styles from "../styles/MatchDetailPage.module.css";
import { calculateKda, formatDuration, matchStore } from "../store/matchStore";

const clampToPercent = (value: number, max: number): string => {
  if (max <= 0) {
    return "0%";
  }

  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return `${pct}%`;
};

const getResultTone = (result: string): string => {
  if (result === "Victory") {
    return "Strong performance and stable execution.";
  }

  if (result === "Defeat") {
    return "Tough game with clear improvement points.";
  }

  return "Short match with limited data points.";
};

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const match = matchStore.getById(id || "");

  if (!match) {
    return (
      <div className={styles.page}>
        <nav className={styles.nav}>
          <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}>C</div>
            <span className={styles.logoText}>Caietul</span>
          </Link>
        </nav>
        <main className={styles.main}>
          <p>Match not found</p>
          <Link to="/matches">Back to matches</Link>
        </main>
      </div>
    );
  }

  const kdaValue = calculateKda(match.kills, match.deaths, match.assists);
  const csPerMin = (match.cs / Math.max(match.duration / 60, 1)).toFixed(1);
  const durationLabel = formatDuration(match.duration);

  const performanceRows = [
    {
      label: "KDA",
      value: `${match.kills}/${match.deaths}/${match.assists} (${kdaValue})`,
      width: clampToPercent(match.kills + match.assists, 30),
      toneClass: styles.barGreen,
    },
    {
      label: "CS",
      value: `${match.cs} (${csPerMin}/min)`,
      width: clampToPercent(match.cs, 320),
      toneClass: styles.barYellow,
    },
    {
      label: "Vision",
      value: `${match.visionScore}`,
      width: clampToPercent(match.visionScore, 80),
      toneClass: styles.barBlue,
    },
  ];

  const tips = [
    {
      dot: styles.dotGreen,
      text: `${match.result} on ${match.champion} ${match.role} is recorded cleanly and ready for later backend sync.`,
    },
    {
      dot: styles.dotYellow,
      text: `CS pace was ${csPerMin}/min. Aim for 7.0+ when you want stronger side lane pressure.`,
    },
    {
      dot: styles.dotBlue,
      text: `Patch ${match.patch} and notes are saved with the match for easier trend analysis over time.`,
    },
  ];

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>
          <div className={styles.logoIcon}>C</div>
          <span className={styles.logoText}>Caietul</span>
        </Link>
        <div className={styles.navActions}>
          <Link to="/matches" className={`${styles.btn} ${styles.btnGhost}`}>
            Back
          </Link>
          <Link
            to={`/matches/${id}/edit`}
            className={`${styles.btn} ${styles.btnEdit}`}
          >
            Edit
          </Link>
          <Link
            to={`/matches/${id}/delete`}
            className={`${styles.btn} ${styles.btnDelete}`}
          >
            Delete
          </Link>
        </div>
      </nav>

      <main className={styles.main}>
        <Link to="/matches" className={styles.back}>
          Back to matches
        </Link>

        <div
          className={`${styles.matchHeader} ${
            match.result === "Victory" ? styles.headerWin : styles.headerLoss
          }`}
        >
          <div className={styles.headerLeft}>
            <div
              className={`${styles.resultText} ${
                match.result === "Victory" ? styles.winText : ""
              }`}
            >
              {match.result}
            </div>
            <div className={styles.meta}>
              <div className={styles.metaItem}>
                Champion:{" "}
                <span>
                  {match.champion} - {match.role}
                </span>
              </div>
              <div className={styles.metaItem}>
                KDA: <span>{kdaValue}</span>
              </div>
              <div className={styles.metaItem}>
                Duration: <span>{durationLabel}</span>
              </div>
              <div className={styles.metaItem}>
                Date: <span>{new Date(match.date).toLocaleDateString()}</span>
              </div>
              <div className={styles.metaItem}>
                Patch: <span>{match.patch}</span>
              </div>
              <div className={styles.metaItem}>
                Summary: <span>{getResultTone(match.result)}</span>
              </div>
            </div>
          </div>

          <div className={styles.scoreCircle}>
            <div className={styles.scoreNum}>{match.visionScore}</div>
            <div className={styles.scoreLabel}>Vision</div>
          </div>
        </div>

        <div className={styles.grid2}>
          <div className={styles.card}>
            <h3>Performance</h3>
            {performanceRows.map((row) => (
              <div className={styles.statRow} key={row.label}>
                <div className={styles.statName}>{row.label}</div>
                <div className={styles.statBarWrap}>
                  <div
                    className={`${styles.statBar} ${row.toneClass}`}
                    style={{ width: row.width }}
                  />
                </div>
                <div className={styles.statVal}>{row.value}</div>
              </div>
            ))}
          </div>

          <div className={styles.card}>
            <h3>Improvement Notes</h3>
            {tips.map((tip) => (
              <div className={styles.tipItem} key={tip.text}>
                <div className={`${styles.tipDot} ${tip.dot}`} />
                <div className={styles.tipText}>{tip.text}</div>
              </div>
            ))}
          </div>
        </div>

        {match.notes && (
          <div className={styles.card}>
            <h3>Personal Notes</h3>
            <p className={styles.tipText}>{match.notes}</p>
          </div>
        )}
      </main>
    </div>
  );
}
