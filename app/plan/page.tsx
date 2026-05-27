'use client';

import { useRouter } from 'next/navigation';

/* ────────────────────────────────────────────────────────────
   DATA
──────────────────────────────────────────────────────────── */

const PILLARS = [
  {
    icon: '🛠',
    title: 'Aprender haciendo',
    body: 'Todo el aprendizaje pasa a través de código real que funciona',
  },
  {
    icon: '🔓',
    title: 'Progresión por dominios',
    body: 'Cada habilidad desbloquea la siguiente. No hay saltos',
  },
  {
    icon: '⚡',
    title: 'Retroalimentación inmediata',
    body: 'El código funciona o no. El alumno lo ve al instante',
  },
  {
    icon: '🎮',
    title: 'Gamificación auténtica',
    body: 'XP y niveles que reflejan aprendizaje real, no memorización',
  },
];

interface Session {
  num: number;
  title: string;
  isToday?: boolean;
}

interface Trimester {
  num: string;
  title: string;
  dates: string;
  sessions: number;
  color: string;
  skills: string[];
  list: Session[];
}

const TRIMESTERS: Trimester[] = [
  {
    num: 'T1',
    title: 'Fundamentos Web',
    dates: 'Agosto – Octubre',
    sessions: 8,
    color: '#534AB7',
    skills: ['HTML', 'CSS básico', 'Box Model'],
    list: [
      { num: 1, title: 'Pensamiento computacional — La web como sistema' },
      { num: 2, title: 'HTML — Tu primera página web' },
      { num: 3, title: 'HTML avanzado — Formularios y semántica' },
      { num: 4, title: 'CSS — El Box Model', isToday: true },
      { num: 5, title: 'CSS — Flexbox y layouts modernos' },
      { num: 6, title: 'CSS — Diseño responsive' },
      { num: 7, title: 'Proyecto integrador — Portafolio personal' },
      { num: 8, title: 'Revisión y evaluación del trimestre' },
    ],
  },
  {
    num: 'T2',
    title: 'JavaScript',
    dates: 'Octubre – Diciembre',
    sessions: 8,
    color: '#1D9E75',
    skills: ['JS variables', 'Lógica', 'DOM interactividad'],
    list: [
      { num: 9,  title: 'JavaScript — Variables, tipos y operadores' },
      { num: 10, title: 'JavaScript — Condicionales y lógica' },
      { num: 11, title: 'JavaScript — Bucles y funciones' },
      { num: 12, title: 'DOM — Selección y manipulación' },
      { num: 13, title: 'DOM — Eventos e interactividad' },
      { num: 14, title: 'DOM — Formularios dinámicos' },
      { num: 15, title: 'Proyecto: To-do app desde cero' },
      { num: 16, title: 'Revisión y evaluación del trimestre' },
    ],
  },
  {
    num: 'T3',
    title: 'Proyectos Colaborativos',
    dates: 'Febrero – Abril',
    sessions: 8,
    color: '#D85A30',
    skills: ['Git', 'APIs', 'Trabajo en equipo'],
    list: [
      { num: 17, title: 'Control de versiones con Git' },
      { num: 18, title: 'GitHub — Trabajo colaborativo' },
      { num: 19, title: 'APIs — Datos externos con fetch' },
      { num: 20, title: 'Diseño UI/UX básico' },
      { num: 21, title: 'Proyecto grupal — Planificación y sprint 1' },
      { num: 22, title: 'Proyecto grupal — Sprint 2' },
      { num: 23, title: 'Proyecto grupal — Sprint 3 y testing' },
      { num: 24, title: 'Presentación de proyectos' },
    ],
  },
  {
    num: 'T4',
    title: 'Especialización y Demo Day',
    dates: 'Abril – Junio',
    sessions: 4,
    color: '#D97706',
    skills: ['Portafolio profesional', 'Presentación'],
    list: [
      { num: 25, title: 'Desarrollo profesional — ¿Qué es ser programador?' },
      { num: 26, title: 'Portafolio digital personal' },
      { num: 27, title: 'Proyecto final — Desarrollo' },
      { num: 28, title: '🎉 Demo Day — Presentación ante la comunidad' },
    ],
  },
];

interface Skill {
  id: string;
  name: string;
  trimester: string;
  current: boolean;
}

const SKILLS: Skill[] = [
  { id: 'html',      name: 'HTML',        trimester: 'T1', current: true  },
  { id: 'css',       name: 'CSS básico',  trimester: 'T1', current: true  },
  { id: 'box-model', name: 'Box Model',   trimester: 'T1', current: true  },
  { id: 'flexbox',   name: 'Flexbox',     trimester: 'T2', current: false },
  { id: 'responsive',name: 'Responsive',  trimester: 'T2', current: false },
  { id: 'git',       name: 'Git',         trimester: 'T3', current: false },
];

const STAT_PILLS = ['28 sesiones', '4 trimestres', '6 habilidades', '1 proyecto final'];

/* ────────────────────────────────────────────────────────────
   TRIMESTER CARD
──────────────────────────────────────────────────────────── */
function TrimesterCard({ t }: { t: Trimester }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
    >
      {/* Colored header */}
      <div className="px-5 py-4" style={{ background: t.color }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.75)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                {t.num}
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                ·
              </span>
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.65)',
                }}
              >
                {t.dates}
              </span>
            </div>
            <h3
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 17,
                fontWeight: 700,
                color: 'white',
                margin: 0,
              }}
            >
              {t.title}
            </h3>
          </div>
          <div
            style={{
              flexShrink: 0,
              background: 'rgba(255,255,255,0.18)',
              borderRadius: 10,
              padding: '4px 10px',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 20,
                fontWeight: 700,
                color: 'white',
                display: 'block',
                lineHeight: 1,
              }}
            >
              {t.sessions}
            </span>
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 10,
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              sesiones
            </span>
          </div>
        </div>

        {/* Skill badges */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {t.skills.map((sk) => (
            <span
              key={sk}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11,
                fontWeight: 600,
                background: 'rgba(255,255,255,0.22)',
                color: 'white',
                borderRadius: 99,
                padding: '2px 9px',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
            >
              {sk}
            </span>
          ))}
        </div>
      </div>

      {/* Session list */}
      <div className="px-5 py-3 flex flex-col" style={{ gap: 0 }}>
        {t.list.map((s, i) => (
          <div
            key={s.num}
            className="flex items-center gap-3 py-2.5"
            style={{
              borderBottom:
                i < t.list.length - 1 ? '1px solid #F5F3F0' : 'none',
              background: s.isToday ? '#EEEDFE' : 'transparent',
              borderRadius: s.isToday ? 8 : 0,
              paddingLeft: s.isToday ? 8 : 0,
              paddingRight: s.isToday ? 8 : 0,
              margin: s.isToday ? '2px -8px' : 0,
            }}
          >
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                fontWeight: 700,
                color: s.isToday ? t.color : '#9CA3AF',
                minWidth: 22,
                flexShrink: 0,
              }}
            >
              S{s.num}
            </span>
            <span
              className="flex-1 text-sm"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: s.isToday ? '#1A1612' : '#6B7280',
                fontWeight: s.isToday ? 600 : 400,
              }}
            >
              {s.title}
            </span>
            {s.isToday && (
              <span
                style={{
                  flexShrink: 0,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  background: t.color,
                  color: 'white',
                  borderRadius: 99,
                  padding: '2px 8px',
                  whiteSpace: 'nowrap',
                }}
              >
                ← Hoy
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   MAIN PAGE
──────────────────────────────────────────────────────────── */
export default function PlanPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen" style={{ background: '#F5F3F0' }}>

      {/* ── Top header bar ── */}
      <header
        className="px-6 py-4 flex items-center justify-between"
        style={{ background: '#534AB7' }}
      >
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 18,
            color: 'white',
          }}
        >
          {'</>'} The Forge
        </span>
        <button
          onClick={() => router.back()}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 8,
            color: 'white',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 500,
            padding: '6px 14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')
          }
        >
          ← Volver
        </button>
      </header>

      {/* ── Hero ── */}
      <section
        className="px-6 py-14 flex flex-col items-center text-center"
        style={{ background: '#1A1612' }}
      >
        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(36px, 6vw, 60px)',
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.1,
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          Programa 2025
        </h1>
        <p
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 18,
            fontWeight: 600,
            color: '#1D9E75',
            marginTop: 10,
          }}
        >
          7mo Grado · Informática
        </p>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
            color: '#D1D5DB',
            marginTop: 8,
            maxWidth: 480,
          }}
        >
          28 sesiones para aprender a programar creando cosas reales
        </p>

        {/* Stat pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          {STAT_PILLS.map((pill) => (
            <span
              key={pill}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                background: 'rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.85)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 99,
                padding: '6px 16px',
              }}
            >
              {pill}
            </span>
          ))}
        </div>
      </section>

      {/* ── Main content ── */}
      <main className="max-w-5xl mx-auto px-4 py-12 flex flex-col gap-16">

        {/* ── Section 2: Filosofía ── */}
        <section>
          <div className="mb-6">
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                fontWeight: 700,
                color: '#534AB7',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 6,
              }}
            >
              02 — Filosofía
            </p>
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 'clamp(22px, 4vw, 30px)',
                fontWeight: 700,
                color: '#1A1612',
                margin: 0,
              }}
            >
              Cuatro pilares del aprendizaje
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PILLARS.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl p-6"
                style={{
                  background: 'white',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                }}
              >
                <span style={{ fontSize: 28 }}>{p.icon}</span>
                <h3
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 16,
                    fontWeight: 700,
                    color: '#1A1612',
                    margin: '10px 0 6px',
                  }}
                >
                  {p.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14,
                    color: '#6B7280',
                    margin: 0,
                    lineHeight: 1.55,
                  }}
                >
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 3: Mapa del año ── */}
        <section>
          <div className="mb-6">
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                fontWeight: 700,
                color: '#534AB7',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 6,
              }}
            >
              03 — Mapa del año
            </p>
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 'clamp(22px, 4vw, 30px)',
                fontWeight: 700,
                color: '#1A1612',
                margin: 0,
              }}
            >
              Las 28 sesiones del año
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {TRIMESTERS.map((t) => (
              <TrimesterCard key={t.num} t={t} />
            ))}
          </div>
        </section>

        {/* ── Section 4: Habilidades del año ── */}
        <section>
          <div className="mb-6">
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                fontWeight: 700,
                color: '#534AB7',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 6,
              }}
            >
              04 — Habilidades
            </p>
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 'clamp(22px, 4vw, 30px)',
                fontWeight: 700,
                color: '#1A1612',
                margin: 0,
              }}
            >
              6 habilidades en el año
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {SKILLS.map((sk) => (
              <div
                key={sk.id}
                className="rounded-2xl p-4 flex flex-col items-center text-center gap-2"
                style={{
                  background: sk.current ? '#EEEDFE' : 'white',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                  border: sk.current
                    ? '1.5px solid #534AB7'
                    : '1.5px solid transparent',
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: sk.current ? '#534AB7' : '#E5E1D8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10,
                      fontWeight: 700,
                      color: sk.current ? 'white' : '#9CA3AF',
                    }}
                  >
                    {sk.id === 'html'
                      ? '</>'
                      : sk.id === 'css'
                      ? '#'
                      : sk.id === 'box-model'
                      ? '□'
                      : sk.id === 'flexbox'
                      ? '⊞'
                      : sk.id === 'responsive'
                      ? '⊡'
                      : '⎇'}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12,
                    fontWeight: 600,
                    color: sk.current ? '#534AB7' : '#6B7280',
                    lineHeight: 1.3,
                  }}
                >
                  {sk.name}
                </span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    fontWeight: 700,
                    color: sk.current ? '#534AB7' : '#9CA3AF',
                    background: sk.current
                      ? 'rgba(83,74,183,0.12)'
                      : '#F5F3F0',
                    borderRadius: 99,
                    padding: '2px 8px',
                  }}
                >
                  {sk.trimester}
                </span>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer
        className="px-6 py-8 text-center"
        style={{ borderTop: '1px solid #E5E1D8' }}
      >
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            color: '#9CA3AF',
          }}
        >
          Metodología © The Forge Escolar · Adaptada para el Plan Nacional de
          Educación Digital de Paraguay
        </p>
      </footer>
    </div>
  );
}
