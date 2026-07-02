import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Trash2, X } from "lucide-react";
import { api } from "../../services/api";

const SUGGESTIONS = [
  "Onde estou a gastar mais dinheiro?",
  "Quanto posso gastar este fim de semana?",
  "Como posso poupar 200€ por mês?",
];

export default function ChatPanel({ T, msgs, setMsgs, onClose }) {
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  const send = async (text) => {
    const t = text.trim();
    if (!t || typing) return;
    setMsgs((m) => [...m, { role: "user", text: t }]);
    setInput("");
    setTyping(true);

    // Optimistically add an empty assistant bubble that we'll fill in
    setMsgs((m) => [...m, { role: "assistant", text: "" }]);

    let abortCtrl;

    try {
      await new Promise((resolve, reject) => {
        abortCtrl = api.ai.chatStream(t, {
          onDelta: (delta) => {
            setMsgs((m) => {
              const copy = [...m];
              const last = copy[copy.length - 1];
              if (last?.role === "assistant") {
                copy[copy.length - 1] = { ...last, text: last.text + delta };
              }
              return copy;
            });
          },
          onDone: () => resolve(),
          onError: (err) => reject(err),
        });
      });
    } catch (error) {
      // Replace empty bubble with error message
      setMsgs((m) => {
        const copy = [...m];
        const last = copy[copy.length - 1];
        if (last?.role === "assistant" && last.text === "") {
          copy[copy.length - 1] = {
            ...last,
            text: error.message || "Ocorreu um erro. Tenta novamente.",
          };
        }
        return copy;
      });
    } finally {
      setTyping(false);
    }
  };

  const clearHistory = async () => {
    try {
      await api.ai.clearHistory();
      setMsgs([{ role: "assistant", text: "Histórico apagado. Como posso ajudar?" }]);
    } catch {
      // fail silently
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div
      className="slide-r"
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        width: 330,
        background: T.panel,
        borderLeft: `1px solid ${T.border}`,
        display: "flex",
        flexDirection: "column",
        zIndex: 10,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 16px 12px",
          borderBottom: `1px solid ${T.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              background: `linear-gradient(135deg,${T.accent},${T.accent2})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={13} color="#0A0D12" />
          </div>
          <span
            className="fp-disp"
            style={{
              fontFamily: "'Space Grotesk',sans-serif",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Assistente FinPilot
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {msgs.length > 1 && (
            <div
              className="fp-btn"
              onClick={clearHistory}
              title="Apagar histórico"
              style={{ padding: 4 }}
            >
              <Trash2 size={14} color={T.mut} />
            </div>
          )}
          <div className="fp-btn" onClick={onClose}>
            <X size={15} color={T.sub} />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        className="fp-scroll"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 14,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {msgs.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
              padding: "9px 12px",
              borderRadius: 12,
              fontSize: 12.5,
              lineHeight: 1.55,
              background: m.role === "user" ? T.accent : T.panel2,
              color: m.role === "user" ? "#0A0D12" : T.text,
              border: m.role === "assistant" ? `1px solid ${T.border}` : "none",
              animation: "fade-up .22s ease both",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {m.text}
          </div>
        ))}

        {typing && msgs[msgs.length - 1]?.text === "" && (
          <div style={{ display: "flex", gap: 4, padding: "9px 12px" }}>
            {[0, 1, 2].map((d) => (
              <span
                key={d}
                className="dot"
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: T.mut,
                  animationDelay: `${d * 0.15}s`,
                }}
              />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions (shown only on cold start) */}
      {msgs.length < 3 && (
        <div
          style={{
            padding: "0 14px 10px",
            display: "flex",
            flexDirection: "column",
            gap: 5,
          }}
        >
          {SUGGESTIONS.map((s) => (
            <div
              key={s}
              className="fp-btn fp-row"
              onClick={() => send(s)}
              style={{
                fontSize: 11.5,
                padding: "7px 10px",
                borderRadius: 9,
                border: `1px solid ${T.border}`,
                color: T.sub,
              }}
            >
              {s}
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div
        style={{
          padding: 12,
          borderTop: `1px solid ${T.border}`,
          display: "flex",
          gap: 8,
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Pergunta algo sobre as tuas finanças…"
          disabled={typing}
          style={{
            flex: 1,
            background: T.panel2,
            border: `1px solid ${T.border}`,
            borderRadius: 9,
            padding: "9px 11px",
            fontSize: 12,
            color: T.text,
            outline: "none",
            opacity: typing ? 0.6 : 1,
          }}
        />
        <div
          className="fp-btn"
          onClick={() => send(input)}
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: T.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            opacity: typing || !input.trim() ? 0.5 : 1,
          }}
        >
          <Send size={14} color="#0A0D12" />
        </div>
      </div>
    </div>
  );
}
