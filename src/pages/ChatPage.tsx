import ChatWidget from "../components/ChatWidget";
import styles from "../styles/ChatPage.module.css";

export default function ChatPage() {
  return (
    <div className={styles.container}>
      <h2>Real-time Chat</h2>
      <ChatWidget />
    </div>
  );
}
