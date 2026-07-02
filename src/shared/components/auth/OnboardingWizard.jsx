import { useState } from "react";
import { CheckCheck } from "lucide-react";
import { createGlobalStyles } from "../../utils/theme";

const BANKS   = ["Caixa Geral de Depósitos", "Novo Banco", "Santander", "BPI", "Millennium BCP"];
const PRESETS = [
  { n: "Básico",       d: "Alimentação 300€ · Casa 600€ · Transportes 150€" },
  { n: "Moderado",     d: "Alimentação 400€ · Casa 800€ · Lazer 200€" },
  { n: "Personalizado",d: "Configurar manualmente mais tarde" },
];

export default function OnboardingWizard({ T, step, setStep, onDone }) {
  const [income, setIncome] = useState("");
  const [bank,   setBank]   = useState(null);
  const [preset, setPreset] = useState(null);
  const next = () => step < 3 ? setStep(s => s + 1) : onDone();

  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", background: T.bg, color: T.text, minHeight: 600, borderRadius: 20, border: `1px solid ${T.border}`, overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 48 }}>
      <style>{createGlobalStyles(T)}</style>

      {/* Progress */}
      <div style={{ width: 320, marginBottom: 36 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
          {[1, 2, 3].map(s => <div key={s} style={{ flex: 1, height: 3, borderRadius: 3, background: s <= step ? T.accent : T.border, transition: "background .4s" }} />)}
        </div>
        <div style={{ fontSize: 11.5, color: T.sub }}>Passo {step} de 3</div>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="page" style={{ width: 340, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>👋</div>
          <div className="fp-disp" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Bem-vindo ao FinPilot!</div>
          <div style={{ fontSize: 13, color: T.sub, marginBottom: 28, lineHeight: 1.6 }}>Vamos configurar o teu espaço financeiro em 3 passos rápidos.</div>
          <div style={{ textAlign: "left", marginBottom: 8 }}>
            <label style={{ fontSize: 12.5, color: T.sub, display: "block", marginBottom: 6 }}>Qual é o teu rendimento mensal líquido?</label>
            <div style={{ position: "relative" }}>
              <input value={income} onChange={e => setIncome(e.target.value)} placeholder="Ex: 2400" type="number"
                style={{ width: "100%", padding: "12px 40px 12px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, color: T.text, fontSize: 14, outline: "none" }} />
              <span style={{ position: "absolute", right: 14, top: 14, fontSize: 13, color: T.mut }}>€</span>
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: T.mut, marginBottom: 4 }}>Esta informação é usada apenas para calcular orçamentos sugeridos.</div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="page" style={{ width: 360, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>🏦</div>
          <div className="fp-disp" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Liga a tua conta bancária</div>
          <div style={{ fontSize: 13, color: T.sub, marginBottom: 24, lineHeight: 1.6 }}>Utilizamos Open Banking (PSD2). Os teus dados são encriptados e nunca partilhados com terceiros.</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            {BANKS.map(b => (
              <div key={b} className="fp-btn" onClick={() => setBank(b)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", borderRadius: 10, border: `1px solid ${bank === b ? T.accent : T.border}`, background: bank === b ? `${T.accent}10` : T.panel2, cursor: "pointer", transition: "all .18s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: T.panel, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🏦</div>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{b}</span>
                </div>
                {bank === b && <CheckCheck size={15} color={T.accent} />}
              </div>
            ))}
          </div>
          <div className="fp-btn" style={{ fontSize: 12, color: T.sub, cursor: "pointer" }}>Continuar sem ligar conta (importar CSV depois)</div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="page" style={{ width: 360, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>💰</div>
          <div className="fp-disp" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Escolhe um ponto de partida</div>
          <div style={{ fontSize: 13, color: T.sub, marginBottom: 24, lineHeight: 1.6 }}>Podes sempre ajustar os orçamentos mais tarde.</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {PRESETS.map(p => (
              <div key={p.n} className="fp-btn" onClick={() => setPreset(p.n)}
                style={{ textAlign: "left", padding: "14px 16px", borderRadius: 10, border: `1px solid ${preset === p.n ? T.accent : T.border}`, background: preset === p.n ? `${T.accent}10` : T.panel2, transition: "all .18s" }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  {p.n}{preset === p.n && <CheckCheck size={14} color={T.accent} />}
                </div>
                <div style={{ fontSize: 11.5, color: T.sub }}>{p.d}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
        {step > 1 && (
          <div className="fp-btn" onClick={() => setStep(s => s - 1)}
            style={{ padding: "12px 24px", borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 13.5, fontWeight: 500, color: T.sub }}>
            ← Voltar
          </div>
        )}
        <div className="fp-btn" onClick={next}
          style={{ padding: "12px 32px", borderRadius: 10, background: T.accent, color: "#0A0D12", fontSize: 13.5, fontWeight: 600 }}>
          {step === 3 ? "Começar a usar →" : "Próximo →"}
        </div>
      </div>
    </div>
  );
}
