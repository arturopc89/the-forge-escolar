'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, type Alumno, type AlumnoSkill } from '@/lib/supabase';

/* ── Skill tree display data (static labels/order) ── */
const SKILL_META: Record<string, { label: string }> = {
  'html':       { label: 'HTML' },
  'css-basico': { label: 'CSS básico' },
  'box-model':  { label: 'Box Model' },
  'flexbox':    { label: 'Flexbox' },
  'responsive': { label: 'Responsive' },
  'git':        { label: 'Git' },
};

/* ── Streak dots ─────────────────────────────────────────── */
function StreakDots({ racha }: { racha: number }) {
  const total = 14;
  const dots = Array.from({ length: total }, (_, i) => {
    const fromEnd = total - 1 - i;
    if (fromEnd === 0) return 'today';
    if (fromEnd < racha) return 'active';
    return 'empty';
  });
  return (
    <div className="flex gap-1 mt-3 flex-wrap">
      {dots.map((type, i) => (
        <div key={i} style={{
          width: 14, height: 14, borderRadius: '50%',
          background: type === 'today' ? '#1D9E75' : type === 'active' ? '#534AB7' : '#E5E1D8',
        }} />
      ))}
    </div>
  );
}

/* ── XP Bar ──────────────────────────────────────────────── */
function XPBar({ current, max }: { current: number; max: number }) {
  const pct = Math.min(100, Math.round((current / max) * 100));
  return (
    <div>
      <div className="w-full rounded-full overflow-hidden" style={{ height: 10, background: '#E5E1D8' }}>
        <div
          className="xp-bar-fill rounded-full"
          style={{ '--bar-target': `${pct}%`, height: 10, background: '#534AB7' } as React.CSSProperties}
        />
      </div>
      <p className="text-xs mt-1.5" style={{ color: '#6B7280', fontFamily: "'JetBrains Mono', monospace" }}>
        {current} / {max} para nivel {Math.floor(current / 100) + 1}
      </p>
    </div>
  );
}

/* ── Skill Node ──────────────────────────────────────────── */
function SkillNode({ skillId, estado, completadoAt, xpGanado }: {
  skillId: string;
  estado: 'locked' | 'active' | 'done';
  completadoAt?: string | null;
  xpGanado?: number;
}) {
  const [tooltip, setTooltip] = useState(false);
  const meta = SKILL_META[skillId] ?? { label: skillId };

  const bg = estado === 'done' ? '#1D9E75' : estado === 'active' ? '#534AB7' : '#E5E1D8';
  const icon = estado === 'done' ? '✓' : estado === 'active' ? '●' : '🔒';
  const textColor = estado === 'locked' ? '#9CA3AF' : 'white';

  const dateStr = completadoAt
    ? new Date(completadoAt).toLocaleDateString('es-PY', { day: 'numeric', month: 'long' })
    : null;

  return (
    <div className="relative flex flex-col items-center"
      onMouseEnter={() => setTooltip(true)}
      onMouseLeave={() => setTooltip(false)}>
      <div
        className={estado === 'active' ? 'animate-pulse-ring' : ''}
        style={{
          width: 72, height: 72, borderRadius: 16,
          background: bg,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          opacity: estado === 'locked' ? 0.5 : 1,
          border: estado === 'active' ? '2px solid #7B74CC' : '2px solid transparent',
          cursor: estado === 'locked' ? 'default' : 'pointer',
          transition: 'transform 0.15s',
          userSelect: 'none',
        }}
        onMouseEnter={(e) => { if (estado !== 'locked') e.currentTarget.style.transform = 'scale(1.07)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontSize: 10, color: textColor, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, marginTop: 2, textAlign: 'center', padding: '0 4px' }}>
          {meta.label}
        </span>
      </div>

      {tooltip && estado !== 'active' && (
        <div className="animate-slide-down absolute z-10 whitespace-nowrap rounded-xl px-3 py-2 text-xs shadow-lg"
          style={{ bottom: 'calc(100% + 8px)', background: '#1A1612', color: 'white',
            fontFamily: "'DM Sans', sans-serif", left: '50%', transform: 'translateX(-50%)' }}>
          {estado === 'done'
            ? `Completado el ${dateStr} · +${xpGanado} XP`
            : `Primero completá ${SKILL_META['box-model']?.label ?? 'Box Model'}`}
          <div style={{ position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)', width: 10, height: 10, background: '#1A1612', rotate: '45deg' }} />
        </div>
      )}
    </div>
  );
}

/* ── Skill Tree ──────────────────────────────────────────── */
function SkillTree({ skills }: { skills: Array<AlumnoSkill & { skills: { id: string; nombre: string; orden: number } }> }) {
  const sorted = [...skills].sort((a, b) => a.skills.orden - b.skills.orden);

  return (
    <div>
      <div className="hidden md:flex items-center gap-0">
        {sorted.map((sk, i) => (
          <div key={sk.skill_id} className="flex items-center">
            <SkillNode skillId={sk.skill_id} estado={sk.estado} completadoAt={sk.completado_at} xpGanado={sk.xp_ganado} />
            {i < sorted.length - 1 && (
              <div style={{ width: 36, height: 3, background: sk.estado === 'done' ? '#1D9E75' : '#E5E1D8', flexShrink: 0 }} />
            )}
          </div>
        ))}
      </div>
      <div className="flex md:hidden flex-col items-start">
        {sorted.map((sk, i) => (
          <div key={sk.skill_id} className="flex flex-col items-start">
            <SkillNode skillId={sk.skill_id} estado={sk.estado} completadoAt={sk.completado_at} xpGanado={sk.xp_ganado} />
            {i < sorted.length - 1 && (
              <div style={{ width: 3, height: 24, marginLeft: 34, background: sk.estado === 'done' ? '#1D9E75' : '#E5E1D8' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────── */
export default function DashboardPage() {
  const router = useRouter();
  const [alumno, setAlumno] = useState<Alumno | null>(null);
  const [skills, setSkills] = useState<Array<AlumnoSkill & { skills: { id: string; nombre: string; orden: number } }>>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    // Get user from sessionStorage
    const raw = typeof window !== 'undefined' ? sessionStorage.getItem('forge_user') : null;
    const user = raw ? JSON.parse(raw) : { usuario: 'maria.garcia' };

    const { data: alumnoData } = await supabase
      .from('alumnos')
      .select('*')
      .eq('usuario', user.usuario)
      .single();

    if (!alumnoData) { router.push('/login'); return; }
    setAlumno(alumnoData);

    const { data: skillsData } = await supabase
      .from('alumno_skills')
      .select('*, skills(*)')
      .eq('alumno_id', alumnoData.id);

    setSkills((skillsData ?? []) as typeof skills);
    setLoading(false);
  }, [router]);

  useEffect(() => { loadData(); }, [loadData]);

  const activeSkill = skills.find((s) => s.estado === 'active');
  const xpMax = (alumno?.nivel ?? 3) * 100 + 100;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F3F0' }}>
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#534AB7" strokeWidth="3" strokeOpacity="0.3"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="#534AB7" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <p style={{ color: '#6B7280', fontFamily: "'DM Sans', sans-serif" }}>Cargando tu progreso…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#F5F3F0' }}>
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between" style={{ background: '#534AB7' }}>
        <span className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {'</>'} The Forge
        </span>
        <span className="text-sm text-white opacity-90" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {alumno?.nombre} · {alumno?.grado}
        </span>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6B7280' }}>XP Total</p>
            <p className="text-4xl font-bold mb-3" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#534AB7' }}>
              {alumno?.xp ?? 0}
            </p>
            <XPBar current={alumno?.xp ?? 0} max={xpMax} />
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6B7280' }}>Racha</p>
            <p className="text-4xl font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#1D9E75' }}>
              {alumno?.racha ?? 0} días
            </p>
            <StreakDots racha={alumno?.racha ?? 0} />
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6B7280' }}>Misión actual</p>
            <p className="text-4xl font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#D85A30' }}>
              Sesión 4
            </p>
            <p className="text-sm mt-1" style={{ color: '#1A1612' }}>
              {activeSkill ? SKILL_META[activeSkill.skill_id]?.label : 'CSS y el Box Model'}
            </p>
            <span className="inline-block text-xs font-semibold rounded-full px-3 py-1 mt-2" style={{ background: '#FAECE7', color: '#D85A30' }}>
              En progreso
            </span>
          </div>
        </div>

        {/* Skill tree */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1612' }}>
            Tu camino este año
          </h2>
          {skills.length > 0
            ? <SkillTree skills={skills as typeof skills} />
            : <p className="text-sm" style={{ color: '#9CA3AF' }}>Cargando habilidades…</p>
          }
        </div>

        {/* Next action */}
        <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '2px solid #1D9E75' }}>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#1D9E75' }}>Sesión de hoy</span>
          <h2 className="text-2xl font-bold mt-2 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1612' }}>
            El Box Model de CSS
          </h2>
          <p className="text-sm mb-1" style={{ color: '#6B7280' }}>
            Entendé cómo CSS calcula el espacio de cada elemento. Con ejercicio interactivo incluido.
          </p>
          <p className="text-sm font-medium mb-5" style={{ color: '#1D9E75' }}>+30 XP al completar</p>
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
