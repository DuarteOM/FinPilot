export default function ToastList({ T, toasts }) {
  if (toasts.length === 0) return null;
  const dotColor = type => type === "success" ? T.accent : type === "error" ? T.danger : T.warn;
  return (
    <div style={{ position: "absolute", bottom: 22, left: 22, display: "flex", flexDirection: "column", gap: 8, zIndex: 50 }}>
      {toasts.map(t => (
        <div key={t.id} className="toast-in"
          style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 14px", borderRadius: 10, background: T.panel, border: `1px solid ${T.border}`, boxShadow: "0 8px 20px rgba(0,0,0,.2)", fontSize: 12.5, maxWidth: 280 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: dotColor(t.type), flexShrink: 0 }} />
          {t.text}
        </div>
      ))}
    </div>
  );
}
