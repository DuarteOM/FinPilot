export default function Toggle({ T, val, onToggle, label, sub }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: 11.5, color: T.sub, marginTop: 2 }}>{sub}</div>}
      </div>
      <div className="fp-btn" onClick={onToggle}
        style={{ width: 40, height: 22, borderRadius: 11, background: val ? T.accent : T.border, position: "relative", transition: "background .25s" }}>
        <div style={{ position: "absolute", top: 2, left: val ? 18 : 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.2)", transition: "left .25s" }} />
      </div>
    </div>
  );
}
