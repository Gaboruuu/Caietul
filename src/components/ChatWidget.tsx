import { useEffect, useRef, useState } from "react";
import { API_BASE } from "../config/apiBase";
import styles from "../styles/ChatWidget.module.css";

type ChatMessage = {
  id: string;
  timestamp: number;
  author?: string;
  text?: string;
};

export default function ChatWidget() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("currentUser") || "null")
      : null;

  useEffect(() => {
    const isProdBackend = API_BASE.startsWith("http");
    const protocol = isProdBackend
      ? "wss"
      : window.location.protocol === "https:"
        ? "wss"
        : "ws";
    const host = isProdBackend ? new URL(API_BASE).host : window.location.host;
    const ws = new WebSocket(`${protocol}://${host}/ws`);
    wsRef.current = ws;

    ws.addEventListener("open", () => {
      // Identify ourselves to the server
      ws.send(JSON.stringify({ type: "identify", data: { user } }));
    });

    ws.addEventListener("message", (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        if (payload.type === "chat-history") {
          setMessages(payload.data || []);
        } else if (payload.type === "chat") {
          setMessages((m) => [...m, payload.data]);
        }
      } catch (e) {
        // ignore
      }
    });

    return () => {
      ws.close();
    };
  }, [user]);

  const send = () => {
    if (!text.trim() || !wsRef.current) return;
    const payload = {
      type: "chat",
      data: { author: user?.email || "anonymous", text },
    };
    wsRef.current.send(JSON.stringify(payload));
    setText("");
  };

  return (
    <div className={styles.widget}>
      <div className={styles.messages}>
        {messages.map((m) => (
          <div key={m.id} className={styles.message}>
            <div className={styles.meta}>
              <strong>{m.author}</strong>
              <span>{new Date(m.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className={styles.text}>{m.text}</div>
          </div>
        ))}
      </div>

      <div className={styles.inputRow}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
        />
        <button type="button" onClick={send} className={styles.sendBtn}>
          Send
        </button>
      </div>
    </div>
  );
}
