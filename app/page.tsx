'use client';

import { useRouter } from 'next/navigation';

/* ── Mini demo preview data ─────────────────────────────── */
const DEMO_STUDENTS = [
  { initials: 'MG', name: 'María G.',     status: 'done',    bg: '#1D9E75', label: 'Completado' },
  { initials: 'JR', name: 'Joaquín R.',   status: 'done',    bg: '#1D9E75', label: 'Completado' },
  { initials: 'SM', name: 'Sofía M.',     status: 'done',    bg: '#1D9E75', label: 'Completado' },
  { initials: 'VP', name: 'Valentina P.', status: 'done',    bg: '#1D9E75', label: 'Completado' },
  { initials: 'LT', name: 'Lucas T.',     status: 'working', bg: '#534AB7', label: 'En progreso' },
  { initials: 'CV', name: 'Camila V.',    status: 'working', bg: '#534AB7', label: 'En progreso' },
  { initials: 'AF', name: 'Andrés F.',    status: 'hint',    bg: '#D85A30', label: 'Con pista'   },
  { initials: 'DR', name: 'Diego R.',     status: 'stuck',   bg: '#E24B4A', label: 'Bloqueado'   },
];

const STATUS_BG: Record<string, string> = {
  done: '#E1F5EE', working: '#FFFBEA', hint: '#FAECE7', stuck: '#FCEBEB',
};
const STATUS_COLOR: Record<string, string> = {
  done: '#1D9E75', working: '#D97706', hint: '#D85A30', stuck: '#E24B4A',
};

const STEPS = [
  { n: '01', title: 'El docente activa la sesión',    desc: 'Elige el tema y la actividad del día desde su panel.',                    color: '#534AB7' },
  { n: '02', title: 'Los alumnos trabajan solos',     desc: 'Sesiones interactivas con editor de código, pistas y validación.',        color: '#534AB7' },
  { n: '03', title: 'El docente ve todo en vivo',     desc: 'Quién terminó, quién necesita ayuda, sin tener que preguntar.',           color: '#1D9E75' },
  { n: '04', title: 'La familia recibe el reporte',   desc: 'Portal de familias con XP, habilidades y mensaje del docente.',           color: '#1D9E75' },
];

const SKILLS = [
  { label: 'HTML',       trimestre: 'T1', color: '#534AB7' },
  { label: 'CSS',        trimestre: 'T1', color: '#534AB7' },
  { label: 'Box Model',  trimestre: 'T1', color: '#534AB7' },
  { label: 'Flexbox',    trimestre: 'T2', color: '#1D9E75' },
  { label: 'Responsive', trimestre: 'T2', color: '#1D9E75' },
  { label: 'Git',        trimestre: 'T3', color: '#D85A30' },
];

const DEMO_LOGINS = [
  {
    icon: '👩‍🎓', role: 'Alumno', tagline: 'Sesiones interactivas con XP y skill tree',
    user: 'maria.garcia', pin: '1234', color: '#534AB7',
    features: ['Editor de código con feedback inmediato', 'Árbol de habilidades desbloqueables', 'Racha de días y puntos de XP'],
  },
  {
    icon: '👨‍🏫', role: 'Docente', tagline: 'Panel en tiempo real para toda la clase',
    user: 'docente', pin: '0000', color: '#1D9E75',
    features: ['Estado de cada alumno en vivo', 'Drawer con detalle completo', 'Plan de sesión integrado'],
  },
  {
    icon: '👨‍👧', role: 'Familia', tagline: 'Seguimiento del aprendizaje de tu hijo/a',
    user: 'roberto.garcia', pin: '1234', color: '#D85A30',
    features: ['Resumen de progreso semanal', 'Habilidades aprendidas', 'Mensaje del docente'],
  },
];

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(15,13,10,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {'</>'} The Forge
        </span>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/plan')}
            className="text-sm font-medium cursor-pointer hidden sm:block transition-colors"
            style={{ color: 'rgba(255,255,255,0.55)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}>
            Plan anual
          </button>
          <button onClick={() => router.push('/login')}
            className="px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all"
            style={{ background: '#534AB7', color: 'white' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#3C3489')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#534AB7')}>
            Entrar a la demo →
          </button>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-40 pb-24 overflow-hidden"
        style={{ background: '#0f0d0a', minHeight: '100vh' }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(83,74,183,0.22) 0%, transparent 70%)',
        }} />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
          style={{ background: 'rgba(83,74,183,0.2)', border: '1px solid rgba(83,74,183,0.4)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34D399', display: 'inline-block', boxShadow: '0 0 0 3px rgba(52,211,153,0.2)' }} />
          <span className="text-xs font-semibold" style={{ color: '#A5B4FC' }}>Demo disponible · Paraguay 2025</span>
        </div>

        <h1 className="text-center font-bold leading-tight mb-6 max-w-3xl"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'white', fontSize: 'clamp(2.2rem, 5.5vw, 3.75rem)' }}>
          La clase de informática
          <br />
          <span style={{ background: 'linear-gradient(135deg, #7B74CC 0%, #1D9E75 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            que los estudiantes esperan
          </span>
        </h1>

        <p className="text-center mb-10 max-w-xl" style={{ color: 'rgba(255,255,255,0.52)', fontSize: '1.1rem', lineHeight: 1.75 }}>
          The Forge convierte la programación en una aventura. Sesiones interactivas, panel docente
          en tiempo real y portal para las familias. Para colegios secundarios.
        </p>

        <div className="flex flex-wrap gap-3 justify-center mb-20">
          <button onClick={() => router.push('/login')}
            className="px-7 py-3.5 rounded-xl font-semibold cursor-pointer transition-all"
            style={{ background: '#534AB7', color: 'white', fontSize: '1rem' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#3C3489'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#534AB7'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            Probá la demo →
          </button>
          <button onClick={() => router.push('/plan')}
            className="px-7 py-3.5 rounded-xl font-semibold cursor-pointer transition-all"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'white', border: '1px solid rgba(255,255,255,0.14)', fontSize: '1rem' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.13)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}>
            Ver programa anual
          </button>
        </div>

        {/* ── MINI DOCENTE PANEL ── */}
        <div className="w-full max-w-2xl rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
          <div className="flex items-center justify-between px-5 py-3" style={{ background: '#534AB7' }}>
            <span className="text-sm font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Panel del docente · Sesión 4 en curso
            </span>
            <div className="flex items-center gap-2">
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#34D399', boxShadow: '0 0 0 2px rgba(52,211,153,0.3)' }} />
              <span className="text-xs text-white opacity-70">En vivo</span>
              <span className="text-xs ml-3" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'JetBrains Mono', monospace" }}>4/8 completaron</span>
            </div>
          </div>
          <div className="px-5 py-2.5" style={{ background: '#1e1a17' }}>
            <div className="flex items-center gap-3">
              <div className="flex-1 rounded-full overflow-hidden" style={{ height: 4, background: 'rgba(255,255,255,0.08)' }}>
                <div style={{ width: '50%', height: 4, background: 'linear-gradient(90deg,#534AB7,#1D9E75)', borderRadius: 999 }} />
              </div>
              <span className="text-xs shrink-0" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'JetBrains Mono', monospace" }}>50%</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 p-4" style={{ background: '#1A1612' }}>
            {DEMO_STUDENTS.map((s) => (
              <div key={s.initials} className="rounded-xl p-2.5 flex flex-col gap-1.5" style={{ background: STATUS_BG[s.status] }}>
                <div className="flex items-center gap-1.5">
                  <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 9, fontWeight: 700 }}>
                    {s.initials}
                  </div>
                  <span style={{ fontSize: 10, color: '#1A1612', fontWeight: 500 }} className="truncate">{s.name}</span>
                </div>
                <span style={{ fontSize: 9, color: STATUS_COLOR[s.status], fontWeight: 700 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM ─────────────────────────────────────────── */}
      <section className="px-6 py-24" style={{ background: '#F5F3F0' }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-3 text-center" style={{ color: '#D85A30', letterSpacing: '0.15em' }}>El problema</p>
          <h2 className="text-3xl font-bold text-center mb-14" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1612' }}>
            La informática escolar está rota
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '😴', title: 'Alumnos desenganchados', desc: 'Teoría y papel no conectan con la realidad digital. Los jóvenes se aburren y desconectan.' },
              { icon: '🕶️', title: 'Docente "a ciegas"',    desc: 'Sin visibilidad de quién entendió, quién necesita ayuda o lleva 20 min bloqueado.' },
              { icon: '🚪', title: 'Familias afuera',        desc: 'Los padres no saben qué aprendió su hijo esta semana, ni cómo acompañarlo en casa.' },
            ].map((c) => (
              <div key={c.title} className="bg-white rounded-2xl p-7 shadow-sm">
                <div style={{ fontSize: 40, marginBottom: 16 }}>{c.icon}</div>
                <h3 className="font-bold mb-2 text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1612' }}>{c.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3 ROLES ─────────────────────────────────────────── */}
      <section className="px-6 py-24" style={{ background: '#1A1612' }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-3 text-center" style={{ color: '#1D9E75', letterSpacing: '0.15em' }}>La solución</p>
          <h2 className="text-3xl font-bold text-center mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'white' }}>
            Una plataforma. Tres experiencias.
          </h2>
          <p className="text-center mb-14 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.75 }}>
            Alumno, docente y familia. Cada actor tiene su vista diseñada para sus necesidades.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '🎮', role: 'Alumno',  color: '#534AB7', title: 'Aprender haciendo', features: ['Sesiones paso a paso', 'Editor con feedback inmediato', 'XP, niveles y racha', 'Árbol de habilidades'] },
              { icon: '📊', role: 'Docente', color: '#1D9E75', title: 'Ver sin preguntar',  features: ['Panel en tiempo real', 'Estado de cada alumno', 'Detalle por alumno', 'Plan de sesión integrado'] },
              { icon: '💬', role: 'Familia', color: '#D85A30', title: 'Acompañar desde casa', features: ['Resumen semanal', 'Habilidades desbloqueadas', 'Sesiones completadas', 'Mensaje del docente'] },
            ].map((item) => (
              <div key={item.role} className="rounded-2xl p-6 flex flex-col gap-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${item.color}44` }}>
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: 32 }}>{item.icon}</span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: item.color }}>{item.role}</p>
                    <p className="font-bold text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'white' }}>{item.title}</p>
                  </div>
                </div>
                <ul className="flex flex-col gap-2">
                  {item.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      <span style={{ color: item.color, flexShrink: 0 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section className="px-6 py-24" style={{ background: '#F5F3F0' }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-3 text-center" style={{ color: '#534AB7', letterSpacing: '0.15em' }}>Cómo funciona</p>
          <h2 className="text-3xl font-bold text-center mb-14" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1612' }}>
            Una sesión completa en 4 pasos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {STEPS.map((step) => (
              <div key={step.n} className="bg-white rounded-2xl p-6 shadow-sm flex gap-4 items-start">
                <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-xs"
                  style={{ background: step.color, fontFamily: "'JetBrains Mono', monospace" }}>
                  {step.n}
                </div>
                <div>
                  <h3 className="font-bold mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1612' }}>{step.title}</h3>
                  <p className="text-sm" style={{ color: '#6B7280' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SKILLS ──────────────────────────────────────────── */}
      <section className="px-6 py-24" style={{ background: 'white' }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-3 text-center" style={{ color: '#D85A30', letterSpacing: '0.15em' }}>Programa</p>
          <h2 className="text-3xl font-bold text-center mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1612' }}>
            28 sesiones. 6 habilidades. 4 trimestres.
          </h2>
          <p className="text-center mb-12 max-w-lg mx-auto" style={{ color: '#6B7280' }}>
            Cada habilidad desbloquea la siguiente. Los alumnos progresan a su ritmo, el docente ve todo desde su panel.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {SKILLS.map((sk, i) => (
              <div key={sk.label} className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-white"
                    style={{ background: sk.color }}>
                    <span style={{ fontSize: 18 }}>✓</span>
                    <span className="text-xs font-bold mt-0.5">{sk.label}</span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: sk.color + '18', color: sk.color }}>{sk.trimestre}</span>
                </div>
                {i < SKILLS.length - 1 && (
                  <div style={{ width: 24, height: 3, background: '#E5E1D8', flexShrink: 0, marginBottom: 22 }} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <button onClick={() => router.push('/plan')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all"
              style={{ background: '#EEEDFE', color: '#534AB7' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#D8D5FA')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#EEEDFE')}>
              Ver el programa completo del año →
            </button>
          </div>
        </div>
      </section>

      {/* ── DEMO CTA ────────────────────────────────────────── */}
      <section className="px-6 py-24" style={{ background: '#1A1612' }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-3 text-center" style={{ color: '#534AB7', letterSpacing: '0.15em' }}>Demo interactiva</p>
          <h2 className="text-3xl font-bold text-center mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'white' }}>
            Probá cada rol ahora mismo
          </h2>
          <p className="text-center mb-14 max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1.75 }}>
            Datos reales en Supabase. Panel del docente con Realtime.
            Abrí las tres pestañas al mismo tiempo para ver la magia en vivo.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DEMO_LOGINS.map((demo) => (
              <div key={demo.role} className="rounded-2xl overflow-hidden flex flex-col"
                style={{ background: 'rgba(255,255,255,0.04)', border: `1.5px solid ${demo.color}44` }}>
                <div className="px-5 py-4" style={{ background: demo.color }}>
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: 30 }}>{demo.icon}</span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-white opacity-75">{demo.role}</p>
                      <p className="text-sm font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{demo.tagline}</p>
                    </div>
                  </div>
                </div>
                <div className="px-5 py-4 flex flex-col gap-2">
                  {[['Usuario', demo.user], ['PIN', demo.pin]].map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between rounded-lg px-3 py-2"
                      style={{ background: 'rgba(255,255,255,0.07)' }}>
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
                      <span className="text-xs font-bold" style={{ color: 'white', fontFamily: "'JetBrains Mono', monospace" }}>{val}</span>
                    </div>
                  ))}
                </div>
                <div className="px-5 pb-4 flex flex-col gap-1.5 flex-1">
                  {demo.features.map((f) => (
                    <p key={f} className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      <span style={{ color: demo.color }}>✓</span>{f}
                    </p>
                  ))}
                </div>
                <div className="px-5 pb-5">
                  <button onClick={() => router.push('/login')}
                    className="w-full py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all"
                    style={{ background: demo.color, color: 'white' }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
                    Entrar como {demo.role} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────── */}
      <section className="px-6 py-24 text-center" style={{ background: '#534AB7' }}>
        <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          ¿Tu colegio quiere sumarse?
        </h2>
        <p className="mb-10 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.75 }}>
          The Forge está diseñado para el contexto educativo paraguayo.
          Programa de 28 sesiones, listo para implementar.
        </p>
        <button onClick={() => router.push('/login')}
          className="px-8 py-4 rounded-xl font-bold text-base cursor-pointer transition-all inline-block"
          style={{ background: 'white', color: '#534AB7' }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}>
          Ver la demo completa →
        </button>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="px-6 py-8 flex items-center justify-between flex-wrap gap-2"
        style={{ background: '#0f0d0a', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="font-bold" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: "'Space Grotesk', sans-serif" }}>
          {'</>'} The Forge Escolar
        </span>
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.22)' }}>
          Paraguay · 2025 · Metodología de programación para colegios secundarios
        </span>
      </footer>

    </div>
  );
}
