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
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("currentUser") || "null")
      : null;

  useEffect(() => {
    // Determine WebSocket URL
    let wsUrl: string;
    
    if (import.meta.env.PROD && API_BASE) {
      // Production: connect directly to backend
      const backendUrl = new URL(API_BASE);
      const protocol = backendUrl.protocol === "https:" ? "wss" : "ws";
      wsUrl = `${protocol}://${backendUrl.host}/ws`;
    } else {
      // Development: use relative URL to proxy through Vite
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      wsUrl = `${protocol}://${window.location.host}/ws`;
    }

    console.log("Connecting to WebSocket:", wsUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.addEventListener("open", () => {
      console.log("WebSocket connected");
      setIsConnected(true);
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

    ws.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    });

    ws.addEventListener("close", () => {
      console.log("WebSocket closed");
      setIsConnected(false);
    });

    return () => {
      if (ws.readyState !== WebSocket.CLOSED) {
        ws.close();
      }
    };
  }, [user]);

  const send = () => {
    if (!text.trim() || !wsRef.current) return;

    // Check if WebSocket is in OPEN state (readyState === 1)
    if (wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn(
        "WebSocket is not in OPEN state. Current state:",
        wsRef.current.readyState,
      );
      return;
    }

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
