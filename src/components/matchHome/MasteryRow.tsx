import styles from "../../styles/MatchHomePage.module.css";

type MasteryRowProps = {
  icon: string;
  bgClass: string;
  name: string;
  points: string;
  badge: string;
  badgeClass: string;
};

export default function MasteryRow({
  icon,
  bgClass,
  name,
  points,
  badge,
  badgeClass,
}: MasteryRowProps) {
  return (
    <div className={styles.masteryRow}>
      <div className={`${styles.masteryIcon} ${bgClass}`}>{icon}</div>
      <div>
        <div className={styles.masteryName}>{name}</div>
        <div className={styles.masteryPts}>{points}</div>
      </div>
      <div className={`${styles.masteryBadge} ${badgeClass}`}>{badge}</div>
    </div>
  );
}
