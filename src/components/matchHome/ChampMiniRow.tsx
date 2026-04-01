import styles from "../../styles/MatchHomePage.module.css";

type ChampMiniRowProps = {
  icon: string;
  bgClass: string;
  name: string;
  sub: string;
  wr: string;
  wrClass: string;
  kda: string;
};

export default function ChampMiniRow({
  icon,
  bgClass,
  name,
  sub,
  wr,
  wrClass,
  kda,
}: ChampMiniRowProps) {
  return (
    <div className={styles.champRow}>
      <div className={`${styles.champMiniIcon} ${bgClass}`}>{icon}</div>
      <div>
        <div className={styles.champMiniName}>{name}</div>
        <div className={styles.champMiniSub}>{sub}</div>
      </div>
      <div>
        <div className={`${styles.champMiniWr} ${wrClass}`}>{wr}</div>
        <div className={styles.champMiniGames}>{kda}</div>
      </div>
    </div>
  );
}
