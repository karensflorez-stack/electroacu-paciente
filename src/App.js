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
};

const PUNTOS_QI = [
  { codigo: "PC7", nombre: "Daling", meridiano: "Pericardio", color: "#7B2FBE", emoji: "🔵",
    ubicacion: "Pliegue palmar de la muñeca, entre tendones del palmar mayor y flexor radial" },
  { codigo: "PC6", nombre: "Neiguan", meridiano: "Pericardio", color: "#7B2FBE", emoji: "🔵",
    ubicacion: "2 cun proximal al pliegue de muñeca, entre tendones" },
  { codigo: "IG4", nombre: "Hegu", meridiano: "Intestino Grueso", color: "#1A7A4A", emoji: "🟢",
    ubicacion: "Dorso de la mano, mitad del 2° metacarpiano, borde radial" },
  { codigo: "TR5", nombre: "Waiguan", meridiano: "Triple Recalentador", color: "#C09A1A", emoji: "🟡",
    ubicacion: "2 cun proximal al pliegue dorsal de muñeca, entre cúbito y radio" },
];

const SINTOMAS_STC = [
  { id: "parestesia_nocturna", label: "Parestesias nocturnas", icon: "🌙" },
  { id: "adormecimiento_dedos", label: "Adormecimiento de dedos (pulgar, índice, medio)", icon: "🖐" },
  { id: "dolor_muneca", label: "Dolor en muñeca", icon: "🤚" },
  { id: "dolor_irradiado", label: "Dolor irradiado al antebrazo", icon: "💪" },
  { id: "debilidad_agarre", label: "Debilidad al cerrar el puño", icon: "✊" },
  { id: "torpeza_fina", label: "Torpeza motora fina (botones, escritura)", icon: "✍️" },
  { id: "signo_phalen", label: "Síntomas al doblar la muñeca (Prueba de Phalen)", icon: "🔻" },
  { id: "sensacion_hinchazon", label: "Sensación de hinchazón sin edema visible", icon: "🌡" },
];

const STORAGE_KEY = "electroacu_sesiones";


function Card({ children, style = {} }) {
  return (
    <div style={{
      background: C.surface, borderRadius: 14, padding: "18px 20px",
      boxShadow: "0 2px 12px rgba(26,74,122,0.07)",
      border: `1px solid ${C.border}`, ...style
    }}>{children}</div>
  );
}

function SectionTitle({ children, icon }) {
  return (
    <p style={{
      margin: "0 0 14px", fontSize: 13, fontWeight: 700,
      color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em",
      display: "flex", alignItems: "center", gap: 6
    }}>
      {icon && <span>{icon}</span>}{children}
    </p>
  );
}

function SliderField({ label, value, min, max, unit, onChange, color = C.primary }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <label style={{ fontSize: 13, color: C.textMuted, fontWeight: 600 }}>{label}</label>
        <span style={{ fontSize: 15, fontWeight: 800, color }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: color }} />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: C.textMuted }}>{min}{unit}</span>
        <span style={{ fontSize: 11, color: C.textMuted }}>{max}{unit}</span>
      </div>
    </div>
  );
}

function HandDiagram({ selectedPoints = [] }) {
  const puntos = {
    PC7: { x: 140, y: 210 }, PC6: { x: 140, y: 175 },
    IG4: { x: 180, y: 135 }, TR5: { x: 175, y: 175 }, 
  };
  const colorMap = { PC7: "#7B2FBE", PC6: "#7B2FBE", IG4: "#1A7A4A", TR5: "#C09A1A" };

  return (
    <svg viewBox="0 0 300 310" style={{ width: "100%", maxWidth: 260, margin: "0 auto", display: "block" }}>
      <ellipse cx="140" cy="175" rx="55" ry="70" fill="#F5EDE3" stroke="#C8A882" strokeWidth="1.5" />
      <rect x="110" y="235" width="60" height="55" rx="8" fill="#F5EDE3" stroke="#C8A882" strokeWidth="1.5" />
      {[[105,70,18,95],[95,38,16,90],[120,28,17,95],[145,34,16,88],[168,48,14,78]].map(([x,y,w,h],i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx={8} fill="#F5EDE3" stroke="#C8A882" strokeWidth="1.5" />
      ))}
      <rect x="110" y="288" width="60" height="18" rx="4" fill="#EADDD0" stroke="#C8A882" strokeWidth="1" />
      <line x1="140" y1="60" x2="140" y2="290" stroke="#7B2FBE" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
      <line x1="104" y1="100" x2="104" y2="260" stroke="#C05A1A" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
      <line x1="176" y1="105" x2="176" y2="260" stroke="#C09A1A" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
      {Object.entries(puntos).map(([cod, p]) => {
        const active = selectedPoints.includes(cod);
        const col = colorMap[cod] || C.primary;
        return (
          <g key={cod}>
            <circle cx={p.x} cy={p.y} r={active ? 11 : 8}
              fill={active ? col : "#fff"} stroke={col} strokeWidth={active ? 2.5 : 2}
              style={{ filter: active ? `drop-shadow(0 0 5px ${col}88)` : "none" }} />
            {active && <circle cx={p.x} cy={p.y} r={5} fill="#fff" opacity={0.6} />}
            <text x={p.x + 14} y={p.y + 4} fontSize="9"
              fill={active ? col : C.textMuted} fontWeight={active ? "700" : "400"}>{cod}</text>
          </g>
        );
      })}
      <text x="10" y="305" fontSize="9" fill={C.textMuted}>Vista palmar</text>
    </svg>
  );
}

export default function App() {
  const [sessions, setSessions] = useState([]);
  
  useEffect(() => {
  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from("sesiones")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error) {
      setSessions(data || []);
    }
  };

  fetchSessions();
}, []);

  const [step, setStep] = useState("home");
  const [form, setForm] = useState({
    mano: "Derecha",
    puntos_usados: ["PC7", "PC6", "IG4"],
    frecuencia_hz: 2, intensidad_ma: 3, duracion_min: 20,
    dolor_eva_antes: 5, dolor_eva_despues: 3,
    sintomas_antes: [], sintomas_despues: [],
    efecto_adverso: "Ninguno", notas: "",
  });

  const togglePunto = (cod) => setForm(f => ({
    ...f, puntos_usados: f.puntos_usados.includes(cod)
      ? f.puntos_usados.filter(p => p !== cod)
      : [...f.puntos_usados, cod]
  }));

  const toggleSintoma = (field, id) => setForm(f => ({
    ...f, [field]: f[field].includes(id) ? f[field].filter(s => s !== id) : [...f[field], id]
  }));

const handleSubmit = async () => {
  const now = new Date();

  const session = {
    paciente: "Ana Gómez",

    fecha: now.toISOString().split("T")[0],
    hora: now.toTimeString().slice(0, 5),

    mano: form.mano,

    frecuencia_hz: form.frecuencia_hz,
    intensidad_ma: form.intensidad_ma,
    duracion_min: form.duracion_min,

    dolor_eva_antes: form.dolor_eva_antes,
    dolor_eva_despues: form.dolor_eva_despues,

    sintomas_antes: form.sintomas_antes,
    sintomas_despues: form.sintomas_despues,

    puntos_usados: form.puntos_usados,

    efecto_adverso: form.efecto_adverso,
    notas: form.notas
  };

  const { error } = await supabase
    .from("sesiones")
    .insert([session]);

  if (error) {
    console.error(error);
    alert("Error enviando la sesión");
    return;
  }

  alert("Sesión enviada correctamente");
  setStep("done");
};

  const resetForm = () => {
    setForm({ mano: "Derecha", puntos_usados: ["PC7","PC6","IG4"], frecuencia_hz: 2, intensidad_ma: 3, duracion_min: 20, dolor_eva_antes: 5, dolor_eva_despues: 3, sintomas_antes: [], sintomas_despues: [], efecto_adverso: "Ninguno", notas: "" });
    setStep("home");
  };

  const last = sessions[sessions.length - 1];
  const mejora = sessions.length
    ? (sessions.reduce((a, s) => a + (s.dolor_eva_antes - s.dolor_eva_despues), 0) / sessions.length).toFixed(1)
    : "—";

  if (step === "done") return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: C.greenLight, fontSize: 38, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>✓</div>
      <h2 style={{ color: C.primary, marginBottom: 10, fontSize: 22 }}>¡Sesión registrada!</h2>
      <p style={{ color: C.textMuted, maxWidth: 280, lineHeight: 1.6, marginBottom: 32 }}>
        Tu médico podrá ver esta información en su panel de seguimiento.
      </p>
      <button onClick={resetForm} style={{ background: C.primary, color: "#fff", border: "none", borderRadius: 12, padding: "14px 36px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
        Volver al inicio
      </button>
    </div>
  );

  if (step === "form") return (
    <div style={{ minHeight: "100vh", background: C.bg, paddingBottom: 40, maxWidth: 480, margin: "0 auto" }}>
      <div style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`, padding: "20px 20px 26px", borderRadius: "0 0 20px 20px", marginBottom: 20 }}>
        <button onClick={() => setStep("home")} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: "pointer", marginBottom: 12 }}>← Volver</button>
        <h2 style={{ color: "#fff", margin: "0 0 4px", fontSize: 17 }}>⚡ Registrar sesión</h2>
        <p style={{ color: "rgba(255,255,255,0.65)", margin: 0, fontSize: 13 }}>
          {new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 14 }}>

        <Card>
          <SectionTitle icon="🤚">Mano tratada</SectionTitle>
          <div style={{ display: "flex", gap: 10 }}>
            {["Derecha", "Izquierda", "Ambas"].map(m => (
              <button key={m} onClick={() => setForm(f => ({ ...f, mano: m }))} style={{
                flex: 1, padding: "10px 4px", borderRadius: 10,
                border: `2px solid ${form.mano === m ? C.primary : C.border}`,
                background: form.mano === m ? C.primary : "#fff",
                color: form.mano === m ? "#fff" : C.text,
                fontWeight: 600, fontSize: 13, cursor: "pointer"
              }}>{m}</button>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle icon="🔮">Puntos Qi aplicados</SectionTitle>
          <HandDiagram selectedPoints={form.puntos_usados} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            {PUNTOS_QI.map(p => (
              <button key={p.codigo} onClick={() => togglePunto(p.codigo)} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                borderRadius: 10, border: `2px solid ${form.puntos_usados.includes(p.codigo) ? p.color : C.border}`,
                background: form.puntos_usados.includes(p.codigo) ? `${p.color}11` : "#fafafa",
                cursor: "pointer", textAlign: "left"
              }}>
                <span style={{ fontSize: 16 }}>{p.emoji}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 700, color: form.puntos_usados.includes(p.codigo) ? p.color : C.text, fontSize: 13 }}>
                    {p.codigo} – {p.nombre}
                  </span>
                  <span style={{ fontSize: 11, color: C.textMuted, display: "block" }}>{p.ubicacion}</span>
                </div>
                {form.puntos_usados.includes(p.codigo) && <span style={{ color: p.color, fontWeight: 700 }}>✓</span>}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle icon="⚡">Parámetros del dispositivo</SectionTitle>
          <SliderField label="Frecuencia" value={form.frecuencia_hz} min={1} max={50} unit=" Hz"
            onChange={v => setForm(f => ({ ...f, frecuencia_hz: v }))} color={C.accent} />
          <SliderField label="Duración" value={form.duracion_min} min={5} max={20} unit=" min"
            onChange={v => setForm(f => ({ ...f, duracion_min: v }))} color={C.green} />
        </Card>

        <Card>
          <SectionTitle icon="🩺">Dolor en muñeca/mano (EVA 0–10)</SectionTitle>
          <SliderField label="Antes de la sesión" value={form.dolor_eva_antes} min={0} max={10}
            onChange={v => setForm(f => ({ ...f, dolor_eva_antes: v }))}
            color={form.dolor_eva_antes > 6 ? C.danger : form.dolor_eva_antes > 3 ? C.warn : C.green} />
          <SliderField label="Al finalizar la sesión" value={form.dolor_eva_despues} min={0} max={10}
            onChange={v => setForm(f => ({ ...f, dolor_eva_despues: v }))}
            color={form.dolor_eva_despues > 6 ? C.danger : form.dolor_eva_despues > 3 ? C.warn : C.green} />
          {form.dolor_eva_antes > form.dolor_eva_despues && (
            <div style={{ background: C.greenLight, borderRadius: 8, padding: "10px 14px", color: C.green, fontWeight: 600, fontSize: 13 }}>
              ↓ Reducción de {form.dolor_eva_antes - form.dolor_eva_despues} puntos EVA en esta sesión
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle icon="📋">Síntomas presentes ANTES</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {SINTOMAS_STC.map(s => (
              <button key={s.id} onClick={() => toggleSintoma("sintomas_antes", s.id)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                borderRadius: 9, border: `1.5px solid ${form.sintomas_antes.includes(s.id) ? C.warn : C.border}`,
                background: form.sintomas_antes.includes(s.id) ? C.warnLight : "#fafafa",
                cursor: "pointer", textAlign: "left"
              }}>
                <span>{s.icon}</span>
                <span style={{ fontSize: 13, color: C.text, fontWeight: form.sintomas_antes.includes(s.id) ? 600 : 400 }}>{s.label}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle icon="📋">Síntomas presentes DESPUÉS</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {SINTOMAS_STC.map(s => (
              <button key={s.id} onClick={() => toggleSintoma("sintomas_despues", s.id)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                borderRadius: 9, border: `1.5px solid ${form.sintomas_despues.includes(s.id) ? C.green : C.border}`,
                background: form.sintomas_despues.includes(s.id) ? C.greenLight : "#fafafa",
                cursor: "pointer", textAlign: "left"
              }}>
                <span>{s.icon}</span>
                <span style={{ fontSize: 13, color: C.text, fontWeight: form.sintomas_despues.includes(s.id) ? 600 : 400 }}>{s.label}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle icon="⚠️">Efectos en piel / reacciones</SectionTitle>
          {["Ninguno","Eritema leve bajo electrodo","Eritema intenso","Ardor durante sesión","Parestesia aumentada","Otro"].map(e => (
            <button key={e} onClick={() => setForm(f => ({ ...f, efecto_adverso: e }))} style={{
              display: "block", width: "100%", marginBottom: 7, padding: "10px 14px",
              borderRadius: 9, border: `1.5px solid ${form.efecto_adverso === e ? C.accent : C.border}`,
              background: form.efecto_adverso === e ? C.accentLight : "#fafafa",
              color: C.text, cursor: "pointer", textAlign: "left", fontSize: 13,
              fontWeight: form.efecto_adverso === e ? 700 : 400
            }}>{e}</button>
          ))}
        </Card>

        <Card>
          <SectionTitle icon="📝">Notas para el médico</SectionTitle>
          <textarea value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
            placeholder="Ej: dormí mejor esa noche, tuve dificultad colocando los electrodos en PC7…"
            style={{ width: "100%", minHeight: 80, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, fontSize: 13, fontFamily: "inherit", color: C.text, resize: "vertical", boxSizing: "border-box" }} />
        </Card>

        <button onClick={handleSubmit} style={{
          background: C.primary, color: "#fff", border: "none", borderRadius: 12,
          padding: 17, fontSize: 16, fontWeight: 700, cursor: "pointer",
          boxShadow: `0 4px 16px ${C.primary}44`
        }}>
          Enviar al médico →
        </button>
      </div>
    </div>
  );

  // HOME
  return (
    <div style={{ minHeight: "100vh", background: C.bg, maxWidth: 480, margin: "0 auto", paddingBottom: 32 }}>
      <div style={{ background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryLight} 100%)`, padding: "32px 20px 36px", borderRadius: "0 0 28px 28px", marginBottom: 22 }}>
        <p style={{ color: "rgba(255,255,255,0.6)", margin: "0 0 4px", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Paciente</p>
        <h2 style={{ color: "#fff", margin: "0 0 4px", fontSize: 22 }}>Ana Gómez</h2>
        <p style={{ color: "rgba(255,255,255,0.6)", margin: "0 0 18px", fontSize: 13 }}>
          Síndrome del túnel carpiano leve-moderado
        </p>
        <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "12px 16px" }}>
          <p style={{ color: "rgba(255,255,255,0.6)", margin: "0 0 4px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>Protocolo activo</p>
          <p style={{ color: "#fff", margin: 0, fontSize: 13, fontWeight: 600 }}>PC7 · PC6 · IG4 · TR5 — 2 Hz / 20 min</p>
        </div>
      </div>

      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { icon: "📅", val: sessions.length, label: "Sesiones" },
            { icon: "📉", val: sessions.length ? `${mejora} pts` : "—", label: "Mejora EVA" },
            { icon: "✅", val: sessions.length ? "100%" : "—", label: "Adherencia" },
          ].map(m => (
            <Card key={m.label} style={{ padding: "14px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{m.icon}</div>
              <div style={{ fontWeight: 800, color: C.primary, fontSize: 18 }}>{m.val}</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{m.label}</div>
            </Card>
          ))}
        </div>

        {last && (
          <Card style={{ borderLeft: `4px solid ${C.accent}` }}>
            <p style={{ margin: "0 0 10px", fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Última sesión · {last.date}</p>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {[last.dolor_eva_antes, last.dolor_eva_despues].map((v, i) => (
                  <span key={i} style={{
                    width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: 14,
                    background: v <= 3 ? "#EAF5EF" : v <= 6 ? "#FEF0E6" : "#FDECEA",
                    color: v <= 3 ? "#2A7F5A" : v <= 6 ? "#C0662A" : "#A0291F"
                  }}>{v}</span>
                ))}
                <span style={{ color: C.textMuted, fontSize: 12 }}>EVA</span>
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: C.text, fontSize: 13 }}>Mano {last.mano} · {last.duracion_min} min</p>
                <p style={{ margin: "2px 0 0", color: C.textMuted, fontSize: 12 }}>{last.puntos_usados.join(" · ")} · {last.frecuencia_hz} Hz</p>
              </div>
            </div>
          </Card>
        )}

        <Card>
          <SectionTitle icon="🔮">Tus puntos de tratamiento</SectionTitle>
          {PUNTOS_QI.slice(0, 4).map(p => (
            <div key={p.codigo} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.bg}` }}>
              <span>{p.emoji}</span>
              <div>
                <span style={{ fontWeight: 700, color: p.color, fontSize: 13 }}>{p.codigo} – {p.nombre} </span>
                <span style={{ fontSize: 12, color: C.textMuted }}>({p.meridiano})</span>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: C.textMuted }}>{p.ubicacion}</p>
              </div>
            </div>
          ))}
        </Card>

        <button onClick={() => setStep("form")} style={{
          background: C.primary, color: "#fff", border: "none", borderRadius: 12,
          padding: 18, fontSize: 16, fontWeight: 700, cursor: "pointer",
          boxShadow: `0 4px 20px ${C.primary}44`,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10
        }}>
          <span>⚡</span> Registrar sesión de hoy
        </button>
      </div>
    </div>
  );
}
