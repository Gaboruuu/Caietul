import { Link, useParams, useNavigate } from "react-router-dom";
import styles from "../styles/DeleteConfirmPage.module.css";
import { matchStore, formatDuration } from "../store/matchStore";

export default function DeleteConfirmPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const match = matchStore.getById(id || "");

  const handleDelete = () => {
    if (match) {
      matchStore.delete(match.id);
      navigate("/matches");
    }
  };

  if (!match) {
    return (
      <div className={styles.page}>
        <main style={{ padding: "2rem" }}>
          <p>Match not found</p>
          <Link to="/matches">Back to matches</Link>
        </main>
      </div>
    );
  }
  return (
    <div className={styles.page}>
      <div className={styles.center}>
        <div className={styles.dialog}>
          <div className={styles.dangerIcon}>🗑️</div>

          <h1 className={styles.title}>Delete this match?</h1>
          <p className={styles.description}>
            This action cannot be undone. The match record and all its
            associated performance data will be permanently removed.
          </p>

          <div className={styles.matchPreview}>
            <div className={styles.matchInfo}>
              <div className={styles.champIcon}>
                {match.champion.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className={styles.matchName}>
                  {match.champion} · {match.role}
                </div>
                <div className={styles.matchSub}>
                  {new Date(match.date).toLocaleDateString()} ·{" "}
                  {formatDuration(match.duration)} · Vision {match.visionScore}
                </div>
              </div>
            </div>
            <span
              className={`${styles.winPill} ${match.result === "Victory" ? styles.win : styles.loss}`}
            >
              {match.result}
            </span>
          </div>

          <div className={styles.warningText}>
            ⚠️ This will permanently delete this match record.
          </div>

          <div className={styles.actions}>
            <Link to="/matches" className={`${styles.btn} ${styles.btnCancel}`}>
              Cancel
            </Link>
            <button
              onClick={handleDelete}
              className={`${styles.btn} ${styles.btnDelete}`}
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
