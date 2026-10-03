import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const C = {
  bg: "#F2F5F9", surface: "#FFFFFF",
  primary: "#1A4A7A", primaryLight: "#2563A8",
  accent: "#C9A84C", accentLight: "#FDF6E3",
  green: "#2A7F5A", greenLight: "#EAF5EF",
  warn: "#C0662A", warnLight: "#FEF0E6",
  danger: "#A0291F", dangerLight: "#FDECEA",
  text: "#1A2332", textMuted: "#6B7A8D", border: "#D5DDE8",
  meridian: "#8B3A8B", meridianLight: "#F5EAF5",
};

// Credenciales del médico (en producción esto iría en backend)
const MEDICO_EMAIL = "medico@electroacu.co";
const MEDICO_PASSWORD = "STC2026";
const STORAGE_KEY = "electroacu_sesiones";

const PUNTOS_QI = [
  { codigo: "PC7", nombre: "Daling", meridiano: "Pericardio", color: "#7B2FBE", emoji: "🔵",
    accion: "Punto principal STC · Desbloquea el meridiano en la muñeca · Calma el Shen" },
  { codigo: "PC6", nombre: "Neiguan", meridiano: "Pericardio", color: "#7B2FBE", emoji: "🔵",
    accion: "Abre el Yin Wei Mai · Mueve el Qi y Xue · Alivia dolor irradiado al antebrazo" },
  { codigo: "IG4", nombre: "Hegu", meridiano: "Intestino Grueso", color: "#1A7A4A", emoji: "🟢",
    accion: "Punto analgésico maestro · Mueve el Qi de la mano y muñeca · Antiinflamatorio" },
  { codigo: "TR5", nombre: "Waiguan", meridiano: "Triple Recalentador", color: "#C09A1A", emoji: "🟡",
    accion: "Punto comando dolor de muñeca y dedos · Abre Yang Wei Mai · Par de PC6" },
];

const SINTOMAS_STC = [
  { id: "parestesia_nocturna", label: "Parestesias nocturnas", icon: "🌙" },
  { id: "adormecimiento_dedos", label: "Adormecimiento de dedos", icon: "🖐" },
  { id: "dolor_muneca", label: "Dolor en muñeca", icon: "🤚" },
  { id: "dolor_irradiado", label: "Dolor irradiado al antebrazo", icon: "💪" },
  { id: "debilidad_agarre", label: "Debilidad al cerrar el puño", icon: "✊" },
  { id: "torpeza_fina", label: "Torpeza motora fina", icon: "✍️" },
  { id: "signo_phalen", label: "Phalen positivo subjetivo", icon: "🔻" },
  { id: "sensacion_hinchazon", label: "Sensación de hinchazón", icon: "🌡" },
];

// Datos demo para cuando no hay datos del paciente aún
const DEMO_SESSIONS = [
  { id: 1, date: "2026-06-18", time: "21:00", mano: "Derecha", puntos_usados: ["PC7","PC6","IG4"], frecuencia_hz: 2, intensidad_ma: 3, duracion_min: 20, dolor_eva_antes: 6, dolor_eva_despues: 4, sintomas_antes: ["parestesia_nocturna","adormecimiento_dedos"], sintomas_despues: ["adormecimiento_dedos"], efecto_adverso: "Ninguno", notas: "Primera sesión. Dormí mejor esa noche.", paciente: "Ana Gómez" },
  { id: 2, date: "2026-06-21", time: "20:30", mano: "Derecha", puntos_usados: ["PC7","PC6","IG4","TR5"], frecuencia_hz: 2, intensidad_ma: 4, duracion_min: 20, dolor_eva_antes: 5, dolor_eva_despues: 3, sintomas_antes: ["adormecimiento_dedos","dolor_muneca"], sintomas_despues: [], efecto_adverso: "Eritema leve bajo electrodo", notas: "Aumenté la intensidad.", paciente: "Ana Gómez" },
  { id: 3, date: "2026-06-24", time: "21:15", mano: "Derecha", puntos_usados: ["PC7","PC6","IG4","TR5","P7"], frecuencia_hz: 4, intensidad_ma: 4, duracion_min: 25, dolor_eva_antes: 4, dolor_eva_despues: 2, sintomas_antes: ["dolor_muneca"], sintomas_despues: [], efecto_adverso: "Ninguno", notas: "Muy buena sesión. Casi sin síntomas.", paciente: "Ana Gómez" },
];

async function loadSessions() {
  const { data, error } = await supabase
    .from("sesiones")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return data || [];
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background: C.surface, borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 12px rgba(26,74,122,0.07)", border: `1px solid ${C.border}`, ...style }}>
      {children}
    </div>
  );
}

function SectionTitle({ children, icon }) {
  return (
    <p style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: 6 }}>
      {icon && <span>{icon}</span>}{children}
    </p>
  );
}

function PainDot({ value }) {
  const col = value <= 3 ? C.green : value <= 6 ? C.warn : C.danger;
  const bg  = value <= 3 ? C.greenLight : value <= 6 ? C.warnLight : C.dangerLight;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: "50%", background: bg, color: col, fontWeight: 800, fontSize: 14 }}>{value}</span>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setError("");
    setTimeout(() => {
      if (email === MEDICO_EMAIL && password === MEDICO_PASSWORD) {
        onLogin();
      } else {
        setError("Email o contraseña incorrectos.");
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, #0F2540 0%, ${C.primary} 60%, ${C.primaryLight} 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚕️</div>
        <h1 style={{ color: "#fff", fontSize: 22, margin: "0 0 6px" }}>ElectroAcu · Panel Médico</h1>
        <p style={{ color: "rgba(255,255,255,0.5)", margin: 0, fontSize: 14 }}>Seguimiento de electroacupuntura STC</p>
      </div>

      <div style={{ background: C.surface, borderRadius: 18, padding: 28, width: "100%", maxWidth: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 8 }}>Email</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="medico@electroacu.co"
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, color: C.text, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 8 }}>Contraseña</label>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, color: C.text, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
          />
        </div>
        {error && (
          <div style={{ background: C.dangerLight, borderRadius: 8, padding: "10px 14px", color: C.danger, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            ⚠ {error}
          </div>
        )}
        <button onClick={handleLogin} disabled={loading} style={{
          width: "100%", background: loading ? C.border : C.primary, color: loading ? C.textMuted : "#fff",
          border: "none", borderRadius: 12, padding: 15, fontSize: 15, fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer"
        }}>
          {loading ? "Verificando…" : "Ingresar al panel"}
        </button>
        <p style={{ margin: "16px 0 0", fontSize: 12, color: C.textMuted, textAlign: "center" }}>
          Demo: medico@electroacu.co / STC2026
        </p>
      </div>
    </div>
  );
}

// ─── DASHBOARD MÉDICO ─────────────────────────────────────────────────────────
function Dashboard({ onLogout }) {
  const [sessions, setSessions] = useState([]);
  const [tab, setTab] = useState("resumen");
  const [aiSummary, setAiSummary] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  // Recargar sesiones del localStorage cada vez que se monta
useEffect(() => {

  const fetchSessions = async () => {
    const data = await loadSessions();
    setSessions(data);
  };

  fetchSessions();

  const interval = setInterval(fetchSessions, 5000);

  return () => clearInterval(interval);

}, []);

  const ss = sessions;
  const avgAntes   = ss.reduce((a, s) => a + s.dolor_eva_antes, 0) / Math.max(ss.length, 1);
  const avgDespues = ss.reduce((a, s) => a + s.dolor_eva_despues, 0) / Math.max(ss.length, 1);
  const avgMejora  = avgAntes - avgDespues;

  const puntosFreq = {};
  ss.forEach(s => s.puntos_usados.forEach(p => { puntosFreq[p] = (puntosFreq[p] || 0) + 1; }));

  const sintomasPost = {};
  ss.forEach(s => (s.sintomas_despues || []).forEach(sym => { sintomasPost[sym] = (sintomasPost[sym] || 0) + 1; }));

  const generateAI = async () => {
    setLoadingAI(true);
    setAiSummary("");
    try {
      const dataStr = ss.map(s =>
        `Sesión ${s.fecha} ${s.time}: Mano ${s.mano}, Puntos: ${s.puntos_usados.join(", ")}, ` +
        `${s.frecuencia_hz}Hz/${s.intensidad_ma}mA/${s.duracion_min}min, ` +
        `EVA antes: ${s.dolor_eva_antes} → después: ${s.dolor_eva_despues}, ` +
        `Síntomas previos: [${(s.sintomas_antes||[]).join(", ")}], ` +
        `Síntomas residuales: [${(s.sintomas_despues||[]).join(", ")}], ` +
        `Efecto adverso: ${s.efecto_adverso}. Notas: "${s.notas}"`
      ).join("\n");

      const prompt = `Eres un médico especialista en medicina tradicional china y rehabilitación. Analiza el siguiente registro de electroacupuntura domiciliaria para síndrome del túnel carpiano leve-moderado de la paciente Ana Gómez (mano derecha). Genera un resumen clínico estructurado en español para el médico tratante incluyendo:
1. Tendencia analgésica (EVA)
2. Respuesta a los puntos Qi utilizados
3. Síntomas residuales más frecuentes
4. Tolerancia y efectos adversos
5. Recomendaciones de ajuste de protocolo (frecuencia Hz, intensidad, puntos adicionales)

Usa terminología de medicina tradicional china combinada con criterios clínicos occidentales. Máximo 220 palabras.

Registro de sesiones:
${dataStr}`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, messages: [{ role: "user", content: prompt }] })
      });
      const json = await res.json();
      setAiSummary(json.content?.[0]?.text || "No se pudo generar el resumen.");
    } catch {
      setAiSummary("Error de conexión con el servicio de IA.");
    }
    setLoadingAI(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, maxWidth: 520, margin: "0 auto", paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #0F2540, ${C.primary})`, padding: "24px 20px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.5)", margin: "0 0 4px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Panel médico</p>
            <h2 style={{ color: "#fff", margin: "0 0 4px", fontSize: 20 }}>Dr. Luis Vargas</h2>
            <p style={{ color: "rgba(255,255,255,0.55)", margin: 0, fontSize: 13 }}>Acupuntura Médica · Rehabilitación</p>
          </div>
          <button onClick={onLogout} style={{ background: "rgba(255,255,255,0.12)", border: "none", color: "rgba(255,255,255,0.7)", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer" }}>
            Salir
          </button>
        </div>
        <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", marginTop: 16 }}>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Paciente: </span>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>Ana Gómez</span>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}> · STC leve-moderado · Mano derecha</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", margin: "16px 16px 16px", background: C.bg, borderRadius: 10, padding: 4, border: `1px solid ${C.border}` }}>
        {[{ id: "resumen", label: "📊 Resumen" }, { id: "sesiones", label: "📋 Sesiones" }, { id: "puntos", label: "🔮 Puntos" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: "9px 4px", border: "none", cursor: "pointer", borderRadius: 8,
            background: tab === t.id ? C.surface : "transparent",
            color: tab === t.id ? C.primary : C.textMuted,
            fontWeight: tab === t.id ? 700 : 500, fontSize: 12,
            boxShadow: tab === t.id ? "0 1px 4px rgba(0,0,0,0.08)" : "none"
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 14 }}>

        {tab === "resumen" && <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { icon: "📅", val: ss.length, label: "Sesiones totales", col: C.primary },
              { icon: "📉", val: `${avgMejora.toFixed(1)} pts`, label: "Mejora EVA media", col: C.green },
              { icon: "🔵", val: `${avgAntes.toFixed(1)} → ${avgDespues.toFixed(1)}`, label: "EVA antes → después", col: C.warn },
              { icon: "⚠️", val: ss.filter(s => s.efecto_adverso !== "Ninguno").length, label: "Efectos adversos", col: C.danger },
            ].map(m => (
              <Card key={m.label} style={{ padding: 14 }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{m.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 22, color: m.col }}>{m.val}</div>
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{m.label}</div>
              </Card>
            ))}
          </div>

          <Card>
            <SectionTitle icon="📈">Evolución EVA por sesión</SectionTitle>
            {ss.map((s, i) => (
              <div key={s.id} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: C.textMuted }}>Sesión {i + 1} · {s.fecha}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: s.dolor_eva_antes - s.dolor_eva_despues > 0 ? C.green : C.danger }}>
                    {s.dolor_eva_antes - s.dolor_eva_despues > 0 ? "↓" : "↑"} {Math.abs(s.dolor_eva_antes - s.dolor_eva_despues)} EVA
                  </span>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 3 }}>
                  <span style={{ fontSize: 10, color: C.textMuted, minWidth: 40 }}>Antes</span>
                  <div style={{ flex: 1, height: 8, borderRadius: 4, background: C.bg }}>
                    <div style={{ width: `${(s.dolor_eva_antes / 10) * 100}%`, height: "100%", borderRadius: 4, background: C.warn }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.warn, minWidth: 16 }}>{s.dolor_eva_antes}</span>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: C.textMuted, minWidth: 40 }}>Después</span>
                  <div style={{ flex: 1, height: 8, borderRadius: 4, background: C.bg }}>
                    <div style={{ width: `${(s.dolor_eva_despues / 10) * 100}%`, height: "100%", borderRadius: 4, background: C.green }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.green, minWidth: 16 }}>{s.dolor_eva_despues}</span>
                </div>
              </div>
            ))}
          </Card>

          {Object.keys(sintomasPost).length > 0 && (
            <Card>
              <SectionTitle icon="🔎">Síntomas residuales post-sesión</SectionTitle>
              {Object.entries(sintomasPost).sort((a, b) => b[1] - a[1]).map(([id, cnt]) => {
                const s = SINTOMAS_STC.find(x => x.id === id);
                return s ? (
                  <div key={id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: `1px solid ${C.bg}` }}>
                    <span>{s.icon}</span>
                    <span style={{ flex: 1, fontSize: 13 }}>{s.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: cnt >= 2 ? C.danger : C.warn }}>{cnt}/{ss.length} ses.</span>
                  </div>
                ) : null;
              })}
            </Card>
          )}

          <Card style={{ borderLeft: `4px solid ${C.meridian}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <SectionTitle icon="🤖">Análisis clínico IA</SectionTitle>
              <button onClick={generateAI} disabled={loadingAI} style={{
                background: loadingAI ? C.border : C.primary, color: loadingAI ? C.textMuted : "#fff",
                border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: loadingAI ? "not-allowed" : "pointer"
              }}>
                {loadingAI ? "Analizando…" : "Generar"}
              </button>
            </div>
            {aiSummary
              ? <p style={{ margin: 0, lineHeight: 1.75, fontSize: 13, color: C.text, whiteSpace: "pre-wrap" }}>{aiSummary}</p>
              : <p style={{ margin: 0, color: C.textMuted, fontSize: 13, fontStyle: "italic" }}>Genera un análisis integrado: evolución EVA, síntomas residuales, tolerancia y ajuste de protocolo.</p>
            }
          </Card>
        </>}

        {tab === "sesiones" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[...ss].reverse().map((s, i) => (
              <Card key={s.id} style={{ borderLeft: `4px solid ${s.dolor_eva_antes - s.dolor_eva_despues >= 2 ? C.green : C.warn}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <div>
                    <span style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>{s.fecha} · {s.time}</span>
                    <span style={{ fontSize: 12, color: C.textMuted, marginLeft: 8 }}>Mano {s.mano}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <PainDot value={s.dolor_eva_antes} />
                    <span style={{ color: C.textMuted }}>→</span>
                    <PainDot value={s.dolor_eva_despues} />
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                  {s.puntos_usados.map(p => {
                    const pt = PUNTOS_QI.find(x => x.codigo === p);
                    return (
                      <span key={p} style={{ background: pt ? `${pt.color}18` : C.bg, color: pt?.color || C.text, border: `1px solid ${pt?.color || C.border}44`, borderRadius: 6, padding: "3px 9px", fontSize: 12, fontWeight: 700 }}>{p}</span>
                    );
                  })}
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, display: "flex", flexWrap: "wrap", gap: "3px 14px", marginBottom: 6 }}>
                  <span>⚡ {s.frecuencia_hz} Hz</span>
                  <span>🔋 {s.intensidad_ma} mA</span>
                  <span>⏱ {s.duracion_min} min</span>
                  {s.efecto_adverso !== "Ninguno" && <span style={{ color: C.warn }}>⚠ {s.efecto_adverso}</span>}
                </div>
                {(s.sintomas_despues||[]).length > 0 && (
                  <div style={{ fontSize: 12, color: C.danger, marginBottom: 4 }}>
                    Residuales: {s.sintomas_despues.map(id => SINTOMAS_STC.find(x => x.id === id)?.label).filter(Boolean).join(", ")}
                  </div>
                )}
                {s.notas && <p style={{ margin: "6px 0 0", fontSize: 12, color: C.textMuted, fontStyle: "italic" }}>"{s.notas}"</p>}
              </Card>
            ))}
          </div>
        )}

        {tab === "puntos" && (
          <>
            <Card>
              <SectionTitle icon="📊">Frecuencia de uso por punto</SectionTitle>
              {PUNTOS_QI.map(p => {
                const cnt = puntosFreq[p.codigo] || 0;
                const pct = ss.length > 0 ? cnt / ss.length : 0;
                return (
                  <div key={p.codigo} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: p.color }}>{p.emoji} {p.codigo} – {p.nombre}</span>
                      <span style={{ fontSize: 12, color: C.textMuted }}>{cnt}/{ss.length}</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: C.bg }}>
                      <div style={{ width: `${pct * 100}%`, height: "100%", borderRadius: 4, background: p.color }} />
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: C.textMuted }}>{p.accion}</p>
                  </div>
                );
              })}
            </Card>
            <Card>
              <SectionTitle icon="🗺">Referencia clínica de puntos</SectionTitle>
              {PUNTOS_QI.map(p => (
                <div key={p.codigo} style={{ paddingBottom: 14, marginBottom: 14, borderBottom: `1px solid ${C.bg}` }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 18 }}>{p.emoji}</span>
                    <span style={{ fontWeight: 800, color: p.color, fontSize: 14 }}>{p.codigo}</span>
                    <span style={{ fontWeight: 600, color: C.text, fontSize: 14 }}>– {p.nombre}</span>
                    <span style={{ fontSize: 12, color: C.textMuted, background: C.bg, borderRadius: 4, padding: "2px 7px" }}>{p.meridiano}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: C.text }}>⚡ {p.accion}</p>
                </div>
              ))}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [loggedIn, setLoggedIn] = useState(() => {
    return sessionStorage.getItem("medico_auth") === "true";
  });

  const handleLogin = () => {
    sessionStorage.setItem("medico_auth", "true");
    setLoggedIn(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("medico_auth");
    setLoggedIn(false);
  };

  return loggedIn
    ? <Dashboard onLogout={handleLogout} />
    : <LoginScreen onLogin={handleLogin} />;
}
