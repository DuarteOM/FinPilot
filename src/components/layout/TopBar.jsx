import { useRef } from "react";
import { Bell, BellRing, CheckCheck, Search, X } from "lucide-react";
import { formatCurrency } from "../../utils/currency";

export default function TopBar({
  T,
  view,
  profile,
  notifs,
  setNotifs,
  searchQ,
  setSearchQ,
  searchOpen,
  setSearchOpen,
  notifOpen,
  setNotifOpen,
  searchResults,
}) {
  const searchRef = useRef(null);
  const notifRef = useRef(null);

  const unread = notifs.filter((n) => !n.read).length;

  const PAGE_TITLES = {
    dashboard:     `Olá, ${profile.name.split(" ")[0]}`,
    transactions:  "Transações",
    budgets:       "Orçamentos",
    goals:         "Objetivos",
    subscriptions: "Subscrições",
    reports:       "Relatórios",
    settings:      "Definições",
  };

  return (
    <div
      style={{
        padding: "18px 28px 0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0,
      }}
    >
      {/* Title */}
      <div>
        <div
          className="fp-disp"
          style={{
            fontFamily: "'Space Grotesk',sans-serif",
            fontSize: 19,
            fontWeight: 600,
            letterSpacing: -0.3,
          }}
        >
          {PAGE_TITLES[view] ?? view}
        </div>
        <div style={{ fontSize: 12, color: T.sub, marginTop: 2 }}>
          {new Intl.DateTimeFormat("pt-PT", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }).format(new Date())}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Search */}
        <div ref={searchRef} style={{ position: "relative" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 12px",
              width: 200,
              borderRadius: 9,
              border: `1px solid ${searchOpen ? T.accent : T.border}`,
              color: T.mut,
              fontSize: 12,
              cursor: "text",
              transition: "border-color .2s",
            }}
          >
            <Search size={13} />
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              placeholder="Pesquisar transações…"
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                color: T.text,
                fontSize: 12,
                flex: 1,
              }}
            />
            {searchQ && (
              <X
                size={11}
                className="fp-btn"
                onClick={() => setSearchQ("")}
              />
            )}
          </div>

          {searchOpen && searchQ && (
            <div
              className="scale-in"
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                width: 300,
                background: T.panel,
                border: `1px solid ${T.border}`,
                borderRadius: 12,
                boxShadow: "0 12px 28px rgba(0,0,0,.22)",
                padding: 8,
                zIndex: 30,
                transformOrigin: "top right",
              }}
            >
              {searchResults.length === 0 ? (
                <div
                  style={{
                    padding: "12px 10px",
                    fontSize: 12,
                    color: T.sub,
                    textAlign: "center",
                  }}
                >
                  Sem resultados para "{searchQ}"
                </div>
              ) : (
                searchResults.map((t) => (
                  <div
                    key={t.id}
                    className="fp-row"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 8px",
                      borderRadius: 8,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 8,
                          background: `${t.color}22`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <t.icon size={12} color={t.color} />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 500 }}>{t.merchant}</div>
                        <div style={{ fontSize: 10.5, color: T.sub }}>
                          {t.cat} · {t.ds}
                        </div>
                      </div>
                    </div>
                    <span
                      className="fp-num"
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: t.amount > 0 ? T.accent : T.text,
                      }}
                    >
                      {t.amount > 0 ? "+" : ""}
                      {formatCurrency(t.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <div
            className="fp-btn"
            onClick={() => setNotifOpen((o) => !o)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              border: `1px solid ${notifOpen ? T.accent : T.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              transition: "border-color .2s",
            }}
          >
            <Bell size={14} />
            {unread > 0 && (
              <span
                className="dot"
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: T.danger,
                }}
              />
            )}
          </div>

          {notifOpen && (
            <div
              className="scale-in"
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                width: 320,
                background: T.panel,
                border: `1px solid ${T.border}`,
                borderRadius: 12,
                boxShadow: "0 12px 28px rgba(0,0,0,.22)",
                zIndex: 30,
                transformOrigin: "top right",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  borderBottom: `1px solid ${T.border}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <BellRing size={14} />
                  Notificações
                  {unread > 0 && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: T.accent,
                        background: `${T.accent}18`,
                        padding: "1px 6px",
                        borderRadius: 5,
                      }}
                    >
                      {unread} novas
                    </span>
                  )}
                </div>
                {unread > 0 && (
                  <div
                    className="fp-btn"
                    onClick={() =>
                      setNotifs((ns) => ns.map((n) => ({ ...n, read: true })))
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 10.5,
                      color: T.sub,
                    }}
                  >
                    <CheckCheck size={11} />
                    Marcar lidas
                  </div>
                )}
              </div>

              <div className="fp-scroll" style={{ maxHeight: 300, overflowY: "auto" }}>
                {notifs.map((n, i) => (
                  <div
                    key={n.id}
                    className="fp-row"
                    onClick={() =>
                      setNotifs((ns) =>
                        ns.map((x) => (x.id === n.id ? { ...x, read: true } : x))
                      )
                    }
                    style={{
                      display: "flex",
                      gap: 10,
                      padding: "11px 14px",
                      cursor: "pointer",
                      borderBottom:
                        i < notifs.length - 1 ? `1px solid ${T.border}` : "none",
                      background: n.read ? "transparent" : `${T.accent}08`,
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: `${n.color}22`,
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 1,
                      }}
                    >
                      <n.icon size={13} color={n.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {n.title}
                        {!n.read && (
                          <span
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              background: T.accent,
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: T.sub,
                          marginTop: 2,
                          lineHeight: 1.4,
                        }}
                      >
                        {n.text}
                      </div>
                      <div style={{ fontSize: 10, color: T.mut, marginTop: 3 }}>
                        {n.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
