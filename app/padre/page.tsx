'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

/* ── Parent → alumno mapping ─────────────────────────────── */
const PADRE_TO_ALUMNO: Record<string, string> = {
  'roberto.garcia': 'maria.garcia',
};

/* ── Skill metadata ──────────────────────────────────────── */
const SKILL_META: Record<string, { label: string }> = {
  'html':        { label: 'HTML' },
  'css-basico':  { label: 'CSS básico' },
  'box-model':   { label: 'Box Model' },
  'flexbox':     { label: 'Flexbox' },
  'responsive':  { label: 'Responsive' },
  'git':         { label: 'Git' },
};

/* ── Types ───────────────────────────────────────────────── */
interface Alumno {
  id: string;
  usuario: string;
  nombre: string;
  grado: string;
  xp: number;
  racha: number;
  nivel: number;
}

interface SkillRow {
  skill_id: string;
  estado: 'locked' | 'active' | 'done';
  xp_ganado: number;
  completado_at: string | null;
  skills: { id: string; nombre: string; orden: number };
}

interface SesionProgreso {
  alumno_id: string;
  sesion_id: string;
  paso_actual: number;
  completado: boolean;
  hints_usados: number;
  iniciado_at: string | null;
  completado_at: string | null;
}

/* ── Helpers ─────────────────────────────────────────────── */
function getInitials(nombre: string): string {
  return nombre
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatHour(isoStr: string): string {
  return new Date(isoStr).toLocaleTimeString('es-PY', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* ── Progress bar ────────────────────────────────────────── */
function SessionProgressBar({
  current,
  total,
  color,
}: {
  current: number;
  total: number;
  color: string;
}) {
  const pct = Math.min(100, Math.round((current / total) * 100));
  return (
    <div>
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height: 10, background: '#E5E1D8' }}
      >
        <div
          style={{
            height: 10,
            borderRadius: 999,
            background: color,
            width: `${pct}%`,
            transition: 'width 0.8s ease-out',
          }}
        />
      </div>
      <p
        className="text-xs mt-1.5"
        style={{
          color: '#6B7280',
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {current} / {total} sesiones del año
      </p>
    </div>
  );
}

/* ── Skill badge list ────────────────────────────────────── */
function SkillBadges({ skills }: { skills: SkillRow[] }) {
  const sorted = [...skills].sort((a, b) => a.skills.orden - b.skills.orden);

  return (
    <div className="flex flex-wrap md:flex-nowrap gap-3 overflow-x-auto pb-1">
      {sorted.map((sk) => {
        const bg =
          sk.estado === 'done'
            ? '#1D9E75'
            : sk.estado === 'active'
            ? '#534AB7'
            : '#D1D5DB';
        const textColor = sk.estado === 'locked' ? '#9CA3AF' : 'white';
        const icon =
          sk.estado === 'done' ? '✓' : sk.estado === 'active' ? '●' : '🔒';
        const meta = SKILL_META[sk.skill_id] ?? { label: sk.skill_id };

        return (
          <div
            key={sk.skill_id}
            className="flex items-center gap-2 rounded-xl px-3 py-2 shrink-0"
            style={{
              background:
                sk.estado === 'done'
                  ? '#E1F5EE'
                  : sk.estado === 'active'
                  ? '#EEEDFE'
                  : '#F5F3F0',
              border:
                sk.estado === 'active'
                  ? '1.5px solid #534AB7'
                  : '1.5px solid transparent',
              opacity: sk.estado === 'locked' ? 0.6 : 1,
            }}
          >
            {/* Color square icon */}
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                background: bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: 12,
              }}
            >
              <span style={{ color: textColor }}>{icon}</span>
            </div>

            <div className="flex flex-col">
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  fontWeight: sk.estado === 'active' ? 700 : 500,
                  color:
                    sk.estado === 'locked'
                      ? '#9CA3AF'
                      : sk.estado === 'done'
                      ? '#1D9E75'
                      : '#534AB7',
                }}
              >
                {meta.label}
              </span>
              {sk.estado === 'done' && (
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    color: '#1D9E75',
                  }}
                >
                  +{sk.xp_ganado} XP
                </span>
              )}
              {sk.estado === 'active' && (
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 10,
                    color: '#534AB7',
                  }}
                >
                  En curso
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────── */
export default function PadrePage() {
  const router = useRouter();

  const [alumno, setAlumno] = useState<Alumno | null>(null);
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [progreso, setProgreso] = useState<SesionProgreso | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parenteName, setParenteName] = useState('');

  const loadData = useCallback(async () => {
    // Auth check
    const raw =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('forge_user')
        : null;

    if (!raw) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(raw) as {
      usuario: string;
      nombre: string;
      rol: string;
    };

    if (user.rol !== 'padre') {
      router.push('/login');
      return;
    }

    setParenteName(user.nombre ?? user.usuario);

    // Resolve alumno usuario from padre mapping
    const alumnoUsuario = PADRE_TO_ALUMNO[user.usuario];
    if (!alumnoUsuario) {
      setError(
        'No encontramos un alumno vinculado a tu cuenta. Contactá al docente.'
      );
      setLoading(false);
      return;
    }

    // Fetch alumno
    const { data: alumnoData, error: alumnoErr } = await supabase
      .from('alumnos')
      .select('id, nombre, grado, xp, racha, nivel, usuario')
      .eq('usuario', alumnoUsuario)
      .single();

    if (alumnoErr || !alumnoData) {
      setError(
        'No pudimos encontrar la información del alumno. Intentá de nuevo más tarde.'
      );
      setLoading(false);
      return;
    }

    setAlumno(alumnoData as Alumno);

    // Fetch skills
    const { data: skillsData } = await supabase
      .from('alumno_skills')
      .select('*, skills(*)')
      .eq('alumno_id', alumnoData.id);

    const sorted = ((skillsData ?? []) as SkillRow[]).sort(
      (a, b) => a.skills.orden - b.skills.orden
    );
    setSkills(sorted);

    // Fetch session 4 progress
    const { data: progresoData } = await supabase
      .from('sesion_progreso')
      .select('*')
      .eq('alumno_id', alumnoData.id)
      .eq('sesion_id', 'sesion-4')
      .single();

    setProgreso((progresoData as SesionProgreso) ?? null);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleLogout() {
    sessionStorage.removeItem('forge_user');
    router.push('/login');
  }

  /* ── Loading state ──────────────────────────────────────── */
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#F5F3F0' }}
      >
        <div className="flex flex-col items-center gap-3">
          <svg
            className="animate-spin"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="#534AB7"
              strokeWidth="3"
              strokeOpacity="0.3"
            />
            <path
              d="M12 2a10 10 0 0 1 10 10"
              stroke="#534AB7"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <p
            style={{
              color: '#6B7280',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Cargando información…
          </p>
        </div>
      </div>
    );
  }

  /* ── Error state ────────────────────────────────────────── */
  if (error || !alumno) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: '#F5F3F0' }}
      >
        <div
          className="bg-white rounded-2xl shadow-sm p-8 max-w-md w-full text-center"
          style={{ border: '2px solid #D85A30' }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <h2
            className="text-xl font-bold mb-2"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              color: '#1A1612',
            }}
          >
            No encontramos la información
          </h2>
          <p
            className="text-sm mb-6"
            style={{
              color: '#6B7280',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {error ?? 'Ocurrió un error inesperado. Intentá de nuevo.'}
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold cursor-pointer"
            style={{
              background: '#534AB7',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  /* ── Derived state ──────────────────────────────────────── */
  const sessionCompleted = progreso?.completado === true;
  const firstName = alumno.nombre.split(' ')[0];
  const initials = getInitials(alumno.nombre);
  const avatarBg = sessionCompleted ? '#1D9E75' : '#534AB7';

  // Year progress: 4 of 28 sessions completed (sesion-4 = current)
  const sessionsCompleted = 4;
  const totalSessions = 28;

  return (
    <div className="min-h-screen" style={{ background: '#F5F3F0' }}>

      {/* ── Header ──────────────────────────────────────────── */}
      <header
        className="px-6 py-4 flex items-center justify-between gap-4"
        style={{ background: '#534AB7' }}
      >
        {/* Left: logo + subtitle */}
        <div className="flex flex-col">
          <span
            className="text-xl font-bold text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {'</>'} The Forge
          </span>
          <span
            className="text-xs text-white"
            style={{ opacity: 0.75, fontFamily: "'DM Sans', sans-serif" }}
          >
            Portal de Familias
          </span>
        </div>

        {/* Right: child name + logout */}
        <div className="flex items-center gap-3">
          <span
            className="text-sm text-white"
            style={{ fontFamily: "'DM Sans', sans-serif", opacity: 0.9 }}
          >
            {alumno.nombre}
          </span>
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="flex items-center justify-center rounded-full cursor-pointer transition-colors"
            style={{
              width: 34,
              height: 34,
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              border: 'none',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')
            }
          >
            {/* Logout icon */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* ── Section 1: Child hero card ─────────────────────── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-5 flex-wrap">
            {/* Avatar */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: avatarBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 22,
                fontWeight: 700,
                fontFamily: "'Space Grotesk', sans-serif",
                flexShrink: 0,
                border: '3px solid rgba(0,0,0,0.06)',
              }}
            >
              {initials}
            </div>

            {/* Name, grade, badge */}
            <div className="flex-1 min-w-0">
              <h1
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: '#1A1612',
                  lineHeight: 1.2,
                }}
              >
                {alumno.nombre}
              </h1>
              <p
                className="text-sm mt-0.5"
                style={{
                  color: '#6B7280',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {alumno.grado ?? '7mo Grado'}
              </p>
              {/* Status badge */}
              <span
                className="inline-flex items-center gap-1 text-xs font-semibold rounded-full px-3 py-1 mt-2"
                style={
                  sessionCompleted
                    ? { background: '#E1F5EE', color: '#1D9E75' }
                    : { background: '#FFFBEA', color: '#D97706' }
                }
              >
                {sessionCompleted ? '✓ Sesión 4 completada' : '⏳ En sesión 4'}
              </span>
            </div>

            {/* Stat pills */}
            <div className="flex gap-2 flex-wrap">
              {/* XP */}
              <div
                className="flex flex-col items-center rounded-xl px-4 py-2"
                style={{ background: '#EEEDFE', minWidth: 72 }}
              >
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#534AB7',
                    lineHeight: 1,
                  }}
                >
                  {alumno.xp}
                </span>
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 10,
                    color: '#534AB7',
                    marginTop: 2,
                    fontWeight: 600,
                  }}
                >
                  XP total
                </span>
              </div>

              {/* Nivel */}
              <div
                className="flex flex-col items-center rounded-xl px-4 py-2"
                style={{ background: '#FAECE7', minWidth: 72 }}
              >
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#D85A30',
                    lineHeight: 1,
                  }}
                >
                  {alumno.nivel}
                </span>
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 10,
                    color: '#D85A30',
                    marginTop: 2,
                    fontWeight: 600,
                  }}
                >
                  Nivel
                </span>
              </div>

              {/* Racha */}
              <div
                className="flex flex-col items-center rounded-xl px-4 py-2"
                style={{ background: '#E1F5EE', minWidth: 72 }}
              >
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#1D9E75',
                    lineHeight: 1,
                  }}
                >
                  {alumno.racha}
                </span>
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 10,
                    color: '#1D9E75',
                    marginTop: 2,
                    fontWeight: 600,
                  }}
                >
                  días
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 2: Progress narrative ─────────────────── */}
        <div
          className="bg-white rounded-2xl p-6 shadow-sm"
          style={{
            border: sessionCompleted
              ? '2px solid #1D9E75'
              : '2px solid #F5C842',
          }}
        >
          <h2
            className="text-lg font-bold mb-3"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              color: '#1A1612',
            }}
          >
            ¿Cómo le va en Informática?
          </h2>

          <p
            className="text-sm mb-4"
            style={{
              color: '#1A1612',
              fontFamily: "'DM Sans', sans-serif",
              lineHeight: 1.6,
            }}
          >
            {sessionCompleted ? (
              <>
                <strong>{firstName}</strong> completó la Sesión 4 sobre el{' '}
                <strong>Box Model de CSS</strong>. Lleva{' '}
                <strong>
                  {sessionsCompleted} de {totalSessions} sesiones
                </strong>{' '}
                del año.
              </>
            ) : (
              <>
                <strong>{firstName}</strong> está trabajando en la Sesión 4
                sobre el <strong>Box Model de CSS</strong>. Lleva{' '}
                <strong>
                  {sessionsCompleted - 1} de {totalSessions} sesiones
                </strong>{' '}
                completadas en el año.
              </>
            )}
          </p>

          <SessionProgressBar
            current={sessionCompleted ? sessionsCompleted : sessionsCompleted - 1}
            total={totalSessions}
            color={sessionCompleted ? '#1D9E75' : '#534AB7'}
          />

          <p
            className="text-sm mt-4"
            style={{
              color: '#1A1612',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
            }}
          >
            Racha de <strong>{alumno.racha} días</strong> seguidos 🔥
          </p>
        </div>

        {/* ── Section 3: Skill tree (simplified) ────────────── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2
            className="text-lg font-bold mb-4"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              color: '#1A1612',
            }}
          >
            Habilidades que está aprendiendo
          </h2>

          {skills.length > 0 ? (
            <SkillBadges skills={skills} />
          ) : (
            // Fallback static list if no DB data yet
            <div className="flex flex-wrap gap-3">
              {Object.entries(SKILL_META).map(([id, meta], i) => {
                const state: 'done' | 'active' | 'locked' =
                  i < 2 ? 'done' : i === 2 ? 'active' : 'locked';
                const bg =
                  state === 'done'
                    ? '#1D9E75'
                    : state === 'active'
                    ? '#534AB7'
                    : '#D1D5DB';
                const icon =
                  state === 'done' ? '✓' : state === 'active' ? '●' : '🔒';
                return (
                  <div
                    key={id}
                    className="flex items-center gap-2 rounded-xl px-3 py-2"
                    style={{
                      background:
                        state === 'done'
                          ? '#E1F5EE'
                          : state === 'active'
                          ? '#EEEDFE'
                          : '#F5F3F0',
                      border:
                        state === 'active'
                          ? '1.5px solid #534AB7'
                          : '1.5px solid transparent',
                      opacity: state === 'locked' ? 0.6 : 1,
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 7,
                        background: bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        color: state === 'locked' ? '#9CA3AF' : 'white',
                      }}
                    >
                      {icon}
                    </div>
                    <span
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 13,
                        fontWeight: state === 'active' ? 700 : 500,
                        color:
                          state === 'locked'
                            ? '#9CA3AF'
                            : state === 'done'
                            ? '#1D9E75'
                            : '#534AB7',
                      }}
                    >
                      {meta.label}
                    </span>
                    {state === 'done' && (
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 10,
                          color: '#1D9E75',
                        }}
                      >
                        +30 XP
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Section 4: Sesión de hoy ───────────────────────── */}
        <div
          className="rounded-2xl p-6 shadow-sm"
          style={
            sessionCompleted
              ? { background: '#E1F5EE', border: '2px solid #1D9E75' }
              : {
                  background: '#FFFBEA',
                  border: '2px solid #F5C842',
                }
          }
        >
          {/* Label */}
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: sessionCompleted ? '#1D9E75' : '#D97706' }}
          >
            {sessionCompleted ? '✓ Completó la sesión de hoy' : '⏳ En progreso — Sesión 4: El Box Model'}
          </span>

          <h2
            className="text-xl font-bold mt-2 mb-2"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              color: '#1A1612',
            }}
          >
            El Box Model de CSS
          </h2>

          <p
            className="text-sm mb-3"
            style={{
              color: '#6B7280',
              fontFamily: "'DM Sans', sans-serif",
              lineHeight: 1.6,
            }}
          >
            Aprendió cómo CSS calcula el espacio de cada elemento y practicó
            con un editor interactivo.
          </p>

          {sessionCompleted ? (
            <div className="flex flex-col gap-1.5">
              {progreso?.completado_at && (
                <p
                  className="text-sm"
                  style={{
                    color: '#1D9E75',
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 500,
                  }}
                >
                  ✓ Completó a las {formatHour(progreso.completado_at)}
                </p>
              )}
              <p
                className="text-sm font-bold"
                style={{
                  color: '#1D9E75',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                +30 XP ganados
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {/* Step indicator */}
              <div className="flex items-center gap-2">
                {['Exploración visual', 'Analogía de la caja', 'Código en acción', 'Completado'].map(
                  (step, i) => {
                    const stepNum = i + 1;
                    const currentStep = progreso?.paso_actual ?? 1;
                    const isDone = currentStep > stepNum;
                    const isCurrent = currentStep === stepNum;
                    return (
                      <div key={step} className="flex items-center gap-1.5">
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: isDone
                              ? '#1D9E75'
                              : isCurrent
                              ? '#534AB7'
                              : '#D1D5DB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {isDone ? (
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 12 12"
                              fill="none"
                            >
                              <path
                                d="M2 6l3 3 5-5"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ) : (
                            <span
                              style={{
                                color: 'white',
                                fontSize: 9,
                                fontWeight: 700,
                              }}
                            >
                              {stepNum}
                            </span>
                          )}
                        </div>
                        {i < 3 && (
                          <div
                            style={{
                              width: 16,
                              height: 2,
                              background: isDone ? '#1D9E75' : '#D1D5DB',
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </div>
                    );
                  }
                )}
              </div>
              <p
                className="text-xs"
                style={{
                  color: '#D97706',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Paso {progreso?.paso_actual ?? 1} de 4 en progreso
              </p>
            </div>
          )}
        </div>

        {/* ── Section 5: Mensaje del docente ────────────────── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            {/* Teacher avatar */}
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: '#534AB7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 15,
                fontWeight: 700,
                fontFamily: "'Space Grotesk', sans-serif",
                flexShrink: 0,
              }}
            >
              PG
            </div>

            <div className="flex-1 min-w-0">
              <h2
                className="text-base font-bold mb-2"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: '#1A1612',
                }}
              >
                Mensaje del Prof. González
              </h2>
              <p
                className="text-sm"
                style={{
                  color: '#6B7280',
                  fontFamily: "'DM Sans', sans-serif",
                  lineHeight: 1.7,
                }}
              >
                El grupo está avanzando muy bien.{' '}
                <strong style={{ color: '#1A1612' }}>{firstName}</strong> se
                destaca por su atención al detalle en los ejercicios prácticos.
                Esta semana trabajamos con el Box Model de CSS, un concepto
                fundamental para construir páginas web. ¡Excelente trabajo!
              </p>
            </div>
          </div>
        </div>

        {/* ── Section 6: Próximamente ───────────────────────── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: '#6B7280', fontFamily: "'DM Sans', sans-serif" }}
          >
            Próximamente
          </p>

          <div className="flex items-start gap-4 mb-5">
            {/* Icon */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: '#EEEDFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: 20,
              }}
            >
              ⬡
            </div>

            <div>
              <h3
                className="font-bold text-base"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: '#1A1612',
                }}
              >
                Próxima sesión: Flexbox
              </h3>
              <p
                className="text-sm mt-0.5"
                style={{
                  color: '#6B7280',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Layouts modernos y alineación de elementos
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push('/plan')}
            className="text-sm font-semibold cursor-pointer bg-transparent border-none p-0"
            style={{
              color: '#1D9E75',
              fontFamily: "'DM Sans', sans-serif",
              textDecoration: 'none',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.textDecoration = 'underline')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.textDecoration = 'none')
            }
          >
            Ver programa completo del año →
          </button>
        </div>

      </main>
    </div>
  );
}
