import { useEffect, useMemo, useRef, useState } from "react";
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
  const retryRef = useRef<number>(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [connectTrigger, setConnectTrigger] = useState(0);

  // Read user once and memoize. Re-parsing localStorage on every render
  // produced a new object reference each time, which made the WS effect
  // re-fire on every re-render and tear down the socket immediately.
  const user = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(localStorage.getItem("currentUser") || "null");
    } catch {
      return null;
    }
  }, []);
  const userKey = user?.email || user?.id || "anonymous";

  useEffect(() => {
    // Connect directly to backend WebSocket (bypass Vite proxy issues)
    // In production, API_BASE is the backend URL
    // In development, we connect directly to the remote backend
    const backendUrl =
      import.meta.env.PROD && API_BASE
        ? API_BASE
        : "https://caietul-backend.onrender.com";

    const wsUrl = backendUrl.replace(/^http/, "ws") + "/ws";

    // Tracks whether this effect's cleanup has run. Prevents the close handler
    // from scheduling a reconnect for a socket we deliberately closed.
    let cancelled = false;

    console.log("Connecting to WebSocket:", wsUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.addEventListener("open", () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      retryRef.current = 0;
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

    ws.addEventListener("close", (ev) => {
      console.log("WebSocket closed", {
        code: ev?.code,
        reason: ev?.reason,
        wasClean: ev?.wasClean,
      });
      setIsConnected(false);

      if (cancelled) return;

      // Attempt reconnect with exponential backoff
      const retry = Math.min((retryRef.current || 0) + 1, 6); // cap retries
      retryRef.current = retry;
      const delay = Math.min(1000 * 2 ** (retry - 1), 30000);
      console.log(`Reconnecting in ${delay}ms (attempt ${retry})`);
      reconnectTimerRef.current = setTimeout(() => {
        setConnectTrigger((n) => n + 1);
      }, delay);
    });

    return () => {
      cancelled = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        ws.close();
      }
    };
  }, [userKey, connectTrigger]);

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
