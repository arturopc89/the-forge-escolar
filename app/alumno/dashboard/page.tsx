'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/* ── Skill tree data ─────────────────────────────────────── */
const skills = [
  { id: 'html',   label: 'HTML',      state: 'done',    xp: 50, date: '28 de abril' },
  { id: 'css',    label: 'CSS básico', state: 'done',   xp: 50, date: '12 de mayo' },
  { id: 'box',    label: 'Box Model', state: 'active',  xp: 30, date: null },
  { id: 'flex',   label: 'Flexbox',   state: 'locked',  xp: 40, date: null },
  { id: 'resp',   label: 'Responsive',state: 'locked',  xp: 50, date: null },
  { id: 'git',    label: 'Git',       state: 'locked',  xp: 60, date: null },
];

/* ── Streak dots ─────────────────────────────────────────── */
function StreakDots() {
  const dots = Array.from({ length: 14 }, (_, i) => {
    if (i < 6) return 'empty';
    if (i < 13) return 'active';
    return 'today';
  });
  return (
    <div className="flex gap-1 mt-3 flex-wrap">
      {dots.map((type, i) => (
        <div
          key={i}
          title={type === 'today' ? 'Hoy' : type === 'active' ? `Día ${i - 5}` : ''}
          style={{
            width: 14, height: 14, borderRadius: '50%',
            background:
              type === 'today'   ? '#1D9E75' :
              type === 'active'  ? '#534AB7' :
              '#E5E1D8',
            transition: 'background 0.2s',
          }}
        />
      ))}
    </div>
  );
}

/* ── XP Bar ─────────────────────────────────────────────── */
function XPBar({ current, max }: { current: number; max: number }) {
  const pct = Math.round((current / max) * 100);
  return (
    <div>
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height: 10, background: '#E5E1D8' }}
      >
        <div
          className="xp-bar-fill rounded-full"
          style={{ '--bar-target': `${pct}%`, height: 10, background: '#534AB7' } as React.CSSProperties}
        />
      </div>
      <p className="text-xs mt-1.5" style={{ color: '#6B7280', fontFamily: "'JetBrains Mono', monospace" }}>
        {current} / {max} para nivel 4
      </p>
    </div>
  );
}

/* ── Skill Node ──────────────────────────────────────────── */
function SkillNode({ skill }: { skill: typeof skills[0] }) {
  const [tooltip, setTooltip] = useState(false);

  const bg =
    skill.state === 'done'   ? '#1D9E75' :
    skill.state === 'active' ? '#534AB7' :
    '#E5E1D8';
  const textColor =
    skill.state === 'locked' ? '#9CA3AF' : 'white';
  const icon =
    skill.state === 'done'   ? '✓' :
    skill.state === 'active' ? '●' :
    '🔒';

  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={() => setTooltip(true)}
      onMouseLeave={() => setTooltip(false)}
    >
      <div
        className={skill.state === 'active' ? 'animate-pulse-ring' : ''}
        style={{
          width: 72, height: 72, borderRadius: 16,
          background: bg,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          cursor: skill.state === 'locked' ? 'default' : 'pointer',
          opacity: skill.state === 'locked' ? 0.5 : 1,
          border: skill.state === 'active' ? '2px solid #7B74CC' : '2px solid transparent',
          transition: 'transform 0.15s',
          userSelect: 'none',
        }}
        onMouseEnter={(e) => {
          if (skill.state !== 'locked') e.currentTarget.style.transform = 'scale(1.07)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontSize: 10, color: textColor, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, marginTop: 2, textAlign: 'center', padding: '0 4px' }}>
          {skill.label}
        </span>
      </div>

      {/* Tooltip */}
      {tooltip && skill.state !== 'active' && (
        <div
          className="animate-slide-down absolute z-10 whitespace-nowrap rounded-xl px-3 py-2 text-xs shadow-lg"
          style={{
            bottom: 'calc(100% + 8px)',
            background: '#1A1612', color: 'white',
            fontFamily: "'DM Sans', sans-serif",
            left: '50%', transform: 'translateX(-50%)',
          }}
        >
          {skill.state === 'done'
            ? `Completado el ${skill.date} · +${skill.xp} XP`
            : `Primero completá Box Model`}
          <div style={{
            position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)',
            width: 10, height: 10, background: '#1A1612', rotate: '45deg',
          }} />
        </div>
      )}
    </div>
  );
}

/* ── Skill Tree ──────────────────────────────────────────── */
function SkillTree() {
  return (
    <div>
      {/* Desktop: horizontal */}
      <div className="hidden md:flex items-center gap-0">
        {skills.map((sk, i) => (
          <div key={sk.id} className="flex items-center">
            <SkillNode skill={sk} />
            {i < skills.length - 1 && (
              <div style={{
                width: 36, height: 3,
                background: sk.state === 'done' ? '#1D9E75' : '#E5E1D8',
                flexShrink: 0,
              }} />
            )}
          </div>
        ))}
      </div>
      {/* Mobile: vertical */}
      <div className="flex md:hidden flex-col items-start gap-0">
        {skills.map((sk, i) => (
          <div key={sk.id} className="flex flex-col items-start">
            <SkillNode skill={sk} />
            {i < skills.length - 1 && (
              <div style={{
                width: 3, height: 24, marginLeft: 34,
                background: sk.state === 'done' ? '#1D9E75' : '#E5E1D8',
              }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────── */
export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="min-h-screen" style={{ background: '#F5F3F0' }}>
      {/* Header */}
      <header
        className="px-6 py-4 flex items-center justify-between"
        style={{ background: '#534AB7' }}
      >
        <span
          className="text-xl font-bold text-white"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {'</>'} The Forge
        </span>
        <span className="text-sm text-white opacity-90" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          María García · 7mo Grado
        </span>
      </header>

      {/* Body */}
      <main className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* ── Metric Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* XP */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6B7280' }}>
              XP Total
            </p>
            <p
              className="text-4xl font-bold mb-3"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: '#534AB7' }}
            >
              340
            </p>
            {mounted && <XPBar current={340} max={500} />}
          </div>

          {/* Racha */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6B7280' }}>
              Racha
            </p>
            <p
              className="text-4xl font-bold"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: '#1D9E75' }}
            >
              8 días
            </p>
            <StreakDots />
          </div>

          {/* Misión */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6B7280' }}>
              Misión actual
            </p>
            <p
              className="text-4xl font-bold"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: '#D85A30' }}
            >
              Sesión 4
            </p>
            <p className="text-sm mt-1" style={{ color: '#1A1612' }}>CSS y el Box Model</p>
            <span
              className="inline-block text-xs font-semibold rounded-full px-3 py-1 mt-2"
              style={{ background: '#FAECE7', color: '#D85A30' }}
            >
              En progreso
            </span>
          </div>
        </div>

        {/* ── Skill Tree ── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2
            className="text-lg font-bold mb-6"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1612' }}
          >
            Tu camino este año
          </h2>
          <SkillTree />
        </div>

        {/* ── Next Action Card ── */}
        <div
          className="bg-white rounded-2xl p-6 shadow-sm"
          style={{ border: '2px solid #1D9E75' }}
        >
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: '#1D9E75' }}
          >
            Sesión de hoy
          </span>
          <h2
            className="text-2xl font-bold mt-2 mb-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1612' }}
          >
            El Box Model de CSS
          </h2>
          <p className="text-sm mb-1" style={{ color: '#6B7280' }}>
            Entendé cómo CSS calcula el espacio de cada elemento. Con ejercicio interactivo incluido.
          </p>
          <p className="text-sm font-medium mb-5" style={{ color: '#1D9E75' }}>
            +30 XP al completar
          </p>
          <button
            onClick={() => router.push('/alumno/sesion')}
            className="px-8 py-3 rounded-xl text-white font-semibold text-sm transition-all cursor-pointer"
            style={{ background: '#1D9E75', fontFamily: "'DM Sans', sans-serif" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#158a65')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#1D9E75')}
          >
            Empezar la sesión →
          </button>
        </div>

      </main>
    </div>
  );
}
