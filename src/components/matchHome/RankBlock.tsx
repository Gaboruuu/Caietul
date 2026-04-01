import styles from "../../styles/MatchHomePage.module.css";

type RankBlockProps = {
  queueType: string;
  rankName: string;
  lp: string;
  wins: string;
  losses: string;
  winRate: string;
  alt?: boolean;
};

export default function RankBlock({
  queueType,
  rankName,
  lp,
  wins,
  losses,
  winRate,
  alt = false,
}: RankBlockProps) {
  return (
    <div className={styles.rankBlock}>
      <div className={`${styles.rankIcon} ${alt ? styles.rankIconAlt : ""}`}>
        💎
      </div>
      <div className={styles.rankInfo}>
        <div className={styles.rankType}>{queueType}</div>
        <div className={styles.rankName}>{rankName}</div>
        <div className={styles.rankLp}>{lp}</div>
        <div className={styles.rankWl}>
          <span className={styles.wlWins}>{wins}</span>
          <span className={styles.wlSep}>/</span>
          <span className={styles.wlLosses}>{losses}</span>
          <span className={styles.wlWr}>{winRate}</span>
        </div>
      </div>
    </div>
  );
}
