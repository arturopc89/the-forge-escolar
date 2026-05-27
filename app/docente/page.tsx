'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

/* ────────────────────────────────────────────────────────────
   TYPES & CONSTANTS
──────────────────────────────────────────────────────────── */
type StudentStatus = 'done' | 'working' | 'hint' | 'stuck';

interface Student {
  id: string;
  usuario: string;
  nombre: string;
  grado: string;
  initials: string;
  xp: number;
  racha: number;
  nivel: number;
  status: StudentStatus;
  hints: number;
  stuckMins: number | null;
  completadoAt: string | null;
  pasoActual: number;
  iniciadoAt: string | null;
}

interface SkillRow {
  skill_id: string;
  estado: 'locked' | 'active' | 'done';
  xp_ganado: number;
  completado_at: string | null;
  skills: { id: string; nombre: string; orden: number };
}

const STATUS_LABEL: Record<StudentStatus, string> = {
  done:    'Completado',
  working: 'En progreso',
  hint:    'Con pista',
  stuck:   'Bloqueado',
};

const STATUS_COLORS: Record<StudentStatus, { bg: string; badge: string; border: string }> = {
  done:    { bg: '#E1F5EE', badge: '#1D9E75', border: 'transparent' },
  working: { bg: '#FFFBEA', badge: '#D97706', border: 'transparent' },
  hint:    { bg: '#FAECE7', badge: '#D85A30', border: 'transparent' },
  stuck:   { bg: '#FCEBEB', badge: '#E24B4A', border: '#E24B4A' },
};

const SKILL_META: Record<string, string> = {
  'html':        'HTML',
  'css-basico':  'CSS básico',
  'box-model':   'Box Model',
  'flexbox':     'Flexbox',
  'responsive':  'Responsive',
  'git':         'Git',
};

const STEP_LABELS = [
  'Exploración visual',
  'Analogía de la caja',
  'Código en acción',
  'Completado ✓',
];

// Demo defaults for students without real-time activity yet
const DEMO_DEFAULTS: Record<string, { status: StudentStatus; hints: number; stuckMins: number | null; pasoActual: number }> = {
  'valentina.p': { status: 'done',    hints: 1, stuckMins: null, pasoActual: 4 },
  'joaquin.r':   { status: 'done',    hints: 0, stuckMins: null, pasoActual: 4 },
  'sofia.m':     { status: 'done',    hints: 0, stuckMins: null, pasoActual: 4 },
  'lucas.t':     { status: 'working', hints: 1, stuckMins: null, pasoActual: 3 },
  'camila.v':    { status: 'working', hints: 2, stuckMins: null, pasoActual: 2 },
  'andres.f':    { status: 'hint',    hints: 3, stuckMins: null, pasoActual: 3 },
  'diego.r':     { status: 'stuck',   hints: 4, stuckMins: 18,   pasoActual: 3 },
};

const PLAN = [
  { time: '0–10 min',  type: 'APERTURA',    text: 'Repaso: ¿qué es CSS? 3 preguntas al grupo',    status: 'done'    },
  { time: '10–25 min', type: 'CONCEPTO',    text: 'Explicación visual del Box Model con diagrama', status: 'active'  },
  { time: '25–75 min', type: 'CONSTRUCCIÓN',text: 'Alumnos trabajan en el editor interactivo',     status: 'pending' },
  { time: '75–90 min', type: 'CIERRE',      text: '2–3 voluntarios muestran su trabajo',           status: 'pending' },
];

/* ────────────────────────────────────────────────────────────
   HELPERS
──────────────────────────────────────────────────────────── */
function getInitials(nombre: string) {
  return nombre.split(/\s+/).map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function timeAgo(isoStr: string) {
  const mins = Math.floor((Date.now() - new Date(isoStr).getTime()) / 60000);
  if (mins < 1) return 'hace un momento';
  if (mins === 1) return 'hace 1 min';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  return hrs === 1 ? 'hace 1 hora' : `hace ${hrs} horas`;
}

function formatTime(isoStr: string) {
  return new Date(isoStr).toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' });
}

/* ────────────────────────────────────────────────────────────
   SESSION TIMER
──────────────────────────────────────────────────────────── */
function SessionTimer() {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return (
    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'rgba(255,255,255,0.9)', fontSize: 13 }}>
      ⏱ {m} min {String(s).padStart(2, '0')} seg
    </span>
  );
}

/* ────────────────────────────────────────────────────────────
   STUDENT DETAIL DRAWER
──────────────────────────────────────────────────────────── */
function StudentDetailDrawer({ student, onClose }: { student: Student; onClose: () => void }) {
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchSkills() {
      const { data } = await supabase
        .from('alumno_skills')
        .select('*, skills(*)')
        .eq('alumno_id', student.id);
      setSkills(((data ?? []) as SkillRow[]).sort((a, b) => a.skills.orden - b.skills.orden));
      setLoadingSkills(false);
    }
    fetchSkills();
  }, [student.id]);

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const colors = STATUS_COLORS[student.status];
  const avatarBg = student.status === 'done' ? '#1D9E75' : student.status === 'stuck' ? '#E24B4A' : '#534AB7';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(26,22,18,0.45)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden"
        style={{
          width: 'min(480px, 100vw)',
          background: '#F5F3F0',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.18)',
          animation: 'slideInRight 0.25s ease-out',
        }}
      >
        {/* Drawer header */}
        <div className="flex items-center gap-4 px-6 py-5 shrink-0" style={{ background: '#534AB7' }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
            background: avatarBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 17, fontWeight: 700,
            fontFamily: "'Space Grotesk', sans-serif",
            border: '3px solid rgba(255,255,255,0.3)',
          }}>
            {student.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-base truncate" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {student.nombre}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-white opacity-75">{student.grado}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: colors.badge + '33', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
                {STATUS_LABEL[student.status]}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors"
            style={{ background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 16 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'XP Total', value: student.xp,   color: '#534AB7', mono: true },
              { label: 'Nivel',    value: student.nivel, color: '#D85A30', mono: true },
              { label: 'Racha',    value: `${student.racha}d`, color: '#1D9E75', mono: true },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl p-3 shadow-sm text-center">
                <p className="text-2xl font-bold" style={{
                  color: stat.color,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>{stat.value}</p>
                <p className="text-xs mt-0.5" style={{ color: '#9CA3AF', fontFamily: "'DM Sans', sans-serif" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Session 4 progress */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm" style={{ color: '#1A1612', fontFamily: "'Space Grotesk', sans-serif" }}>
                Sesión 4 — Box Model
              </h3>
              {student.hints > 0 && (
                <span className="text-xs px-2 py-1 rounded-full" style={{ background: '#FAECE7', color: '#D85A30', fontFamily: "'DM Sans', sans-serif" }}>
                  💡 {student.hints} {student.hints === 1 ? 'pista usada' : 'pistas usadas'}
                </span>
              )}
            </div>

            {/* Step progress */}
            <div className="flex flex-col gap-2">
              {STEP_LABELS.map((label, i) => {
                const stepNum = i + 1;
                const isDone = student.pasoActual > stepNum || student.status === 'done';
                const isCurrent = student.pasoActual === stepNum && student.status !== 'done';
                return (
                  <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2.5"
                    style={{
                      background: isDone ? '#E1F5EE' : isCurrent ? '#EEEDFE' : '#F5F3F0',
                    }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                      background: isDone ? '#1D9E75' : isCurrent ? '#534AB7' : '#D1D5DB',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isDone ? (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : isCurrent ? (
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />
                      ) : (
                        <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>{stepNum}</span>
                      )}
                    </div>
                    <span className="text-sm flex-1" style={{
                      fontFamily: "'DM Sans', sans-serif",
                      color: isDone ? '#1D9E75' : isCurrent ? '#534AB7' : '#9CA3AF',
                      fontWeight: isCurrent ? 600 : 400,
                    }}>
                      {label}
                    </span>
                    {isCurrent && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#534AB7', color: 'white', fontSize: 10 }}>
                        Aquí
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Timestamps */}
            {(student.iniciadoAt || student.completadoAt) && (
              <div className="mt-4 pt-3 flex flex-col gap-1" style={{ borderTop: '1px solid #F5F3F0' }}>
                {student.iniciadoAt && (
                  <p className="text-xs" style={{ color: '#9CA3AF', fontFamily: "'DM Sans', sans-serif" }}>
                    🕐 Inició a las {formatTime(student.iniciadoAt)}
                  </p>
                )}
                {student.completadoAt && (
                  <p className="text-xs" style={{ color: '#1D9E75', fontFamily: "'DM Sans', sans-serif" }}>
                    ✓ Completó a las {formatTime(student.completadoAt)} · {timeAgo(student.completadoAt)}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Skill path */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-sm mb-4" style={{ color: '#1A1612', fontFamily: "'Space Grotesk', sans-serif" }}>
              Camino de habilidades
            </h3>
            {loadingSkills ? (
              <div className="flex gap-2">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="rounded-xl" style={{ width: 52, height: 52, background: '#E5E1D8', opacity: 0.5 + i * 0.1 }} />
                ))}
              </div>
            ) : skills.length === 0 ? (
              <p className="text-xs" style={{ color: '#9CA3AF' }}>Sin datos de habilidades</p>
            ) : (
              <div className="flex flex-col gap-2">
                {skills.map((sk) => {
                  const bg = sk.estado === 'done' ? '#1D9E75' : sk.estado === 'active' ? '#534AB7' : '#E5E1D8';
                  const textColor = sk.estado === 'locked' ? '#9CA3AF' : 'white';
                  const icon = sk.estado === 'done' ? '✓' : sk.estado === 'active' ? '●' : '🔒';
                  const label = SKILL_META[sk.skill_id] ?? sk.skills?.nombre ?? sk.skill_id;
                  return (
                    <div key={sk.skill_id} className="flex items-center gap-3 rounded-lg px-3 py-2"
                      style={{ background: sk.estado === 'locked' ? '#F5F3F0' : sk.estado === 'done' ? '#E1F5EE' : '#EEEDFE' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        background: bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: sk.estado === 'locked' ? 0.5 : 1,
                        fontSize: 12,
                      }}>
                        <span style={{ color: textColor }}>{icon}</span>
                      </div>
                      <span className="text-sm flex-1" style={{
                        fontFamily: "'DM Sans', sans-serif",
                        color: sk.estado === 'locked' ? '#9CA3AF' : '#1A1612',
                        fontWeight: sk.estado === 'active' ? 600 : 400,
                      }}>
                        {label}
                      </span>
                      {sk.estado === 'done' && (
                        <span className="text-xs" style={{ color: '#1D9E75', fontFamily: "'JetBrains Mono', monospace" }}>
                          +{sk.xp_ganado} XP
                        </span>
                      )}
                      {sk.estado === 'active' && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#534AB7', color: 'white', fontSize: 10 }}>
                          Activo
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Help note for stuck */}
          {student.status === 'stuck' && (
            <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: '#FCEBEB', border: '1.5px solid #E24B4A' }}>
              <span style={{ fontSize: 20 }}>🚨</span>
              <div>
                <p className="text-sm font-bold" style={{ color: '#E24B4A', fontFamily: "'Space Grotesk', sans-serif" }}>
                  Alumno bloqueado
                </p>
                <p className="text-xs mt-1" style={{ color: '#6B7280', fontFamily: "'DM Sans', sans-serif" }}>
                  Lleva {student.stuckMins} minutos en el mismo paso y usó {student.hints} pistas. Necesita ayuda directa.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}

/* ────────────────────────────────────────────────────────────
   STUDENT CARD
──────────────────────────────────────────────────────────── */
function StudentCard({ student, isNew, onClick }: { student: Student; isNew: boolean; onClick: () => void }) {
  const colors = STATUS_COLORS[student.status];

  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl p-4 flex flex-col gap-2 transition-all duration-500 cursor-pointer ${isNew ? 'animate-scale-in' : ''}`}
      style={{ background: colors.bg, border: `2px solid ${colors.border}` }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Live pulse for stuck */}
      {student.status === 'stuck' && (
        <div className="absolute top-3 right-3 animate-pulse-ring"
          style={{ width: 10, height: 10, borderRadius: '50%', background: '#E24B4A' }} />
      )}

      {/* Just-completed flash */}
      {isNew && student.status === 'done' && (
        <div className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full animate-scale-in"
          style={{ background: '#1D9E75', color: 'white', fontFamily: "'DM Sans', sans-serif" }}>
          ✓ ¡Listo!
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
          background: student.status === 'done' ? '#1D9E75' : student.status === 'stuck' ? '#E24B4A' : '#534AB7',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: 13, fontWeight: 700,
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          {student.initials}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: '#1A1612', fontFamily: "'DM Sans', sans-serif" }}>
            {student.nombre}
          </p>
          <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-0.5"
            style={{ background: colors.badge + '22', color: colors.badge }}>
            {STATUS_LABEL[student.status]}
            {student.status === 'stuck' && student.stuckMins ? ` ${student.stuckMins} min` : ''}
          </span>
        </div>

        {/* Hints count */}
        {student.hints > 0 && (
          <div className="flex items-center gap-1 text-xs shrink-0" style={{ color: '#6B7280' }}>
            <span>💡</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{student.hints}</span>
          </div>
        )}
      </div>

      {/* XP badge for completed */}
      {student.status === 'done' && student.xp > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: '#6B7280', fontFamily: "'JetBrains Mono', monospace" }}>
            {student.xp} XP total
          </span>
          {student.completadoAt && (
            <span className="text-xs" style={{ color: '#9CA3AF' }}>· {timeAgo(student.completadoAt)}</span>
          )}
        </div>
      )}

      {/* Step progress dots */}
      <div className="flex gap-1.5 mt-0.5">
        {[1,2,3,4].map((step) => (
          <div key={step} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: (student.pasoActual >= step || student.status === 'done')
              ? (student.status === 'done' ? '#1D9E75' : '#534AB7')
              : '#D1D5DB',
          }} />
        ))}
      </div>

      {/* View hint */}
      <div className="flex items-center gap-1 mt-1" style={{ color: '#9CA3AF' }}>
        <span style={{ fontSize: 10, fontFamily: "'DM Sans', sans-serif" }}>Ver detalle →</span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   MAIN PAGE
──────────────────────────────────────────────────────────── */
export default function DocentePage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [newlyCompleted, setNewlyCompleted] = useState<Set<string>>(new Set());
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [planOpen, setPlanOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  /* ── Auth check ── */
  useEffect(() => {
    const raw = typeof window !== 'undefined' ? sessionStorage.getItem('forge_user') : null;
    if (!raw) { router.push('/login'); return; }
    const user = JSON.parse(raw);
    if (user.rol !== 'docente') router.push('/login');
  }, [router]);

  /* ── Load data from Supabase ── */
  const loadStudents = useCallback(async (highlightNew?: string) => {
    const { data: alumnosData } = await supabase
      .from('alumnos')
      .select('id, usuario, nombre, grado, xp, racha, nivel')
      .order('nombre');

    if (!alumnosData) return;

    const alumnoIds = alumnosData.map((a) => a.id);

    const { data: progresoData } = await supabase
      .from('sesion_progreso')
      .select('alumno_id, paso_actual, completado, completado_at, hints_usados, iniciado_at')
      .eq('sesion_id', 'sesion-4')
      .in('alumno_id', alumnoIds);

    const progresoMap = new Map(
      (progresoData ?? []).map((p) => [p.alumno_id, p])
    );

    const merged: Student[] = alumnosData.map((a) => {
      const progreso = progresoMap.get(a.id);
      const demo = DEMO_DEFAULTS[a.usuario];

      let status: StudentStatus;
      let completadoAt: string | null = null;

      if (progreso?.completado) {
        status = 'done';
        completadoAt = progreso.completado_at;
      } else if (progreso?.paso_actual && progreso.paso_actual >= 2) {
        status = 'working';
      } else if (demo) {
        status = demo.status;
      } else {
        status = 'working';
      }

      return {
        id: a.id,
        usuario: a.usuario,
        nombre: a.nombre,
        grado: a.grado ?? '7mo Grado',
        initials: getInitials(a.nombre),
        xp: a.xp ?? 0,
        racha: a.racha ?? 0,
        nivel: a.nivel ?? 1,
        status,
        hints: progreso?.hints_usados ?? demo?.hints ?? 0,
        stuckMins: demo?.stuckMins ?? null,
        completadoAt,
        pasoActual: progreso?.paso_actual ?? demo?.pasoActual ?? 1,
        iniciadoAt: progreso?.iniciado_at ?? null,
      };
    });

    setStudents(merged);
    setLastUpdate(new Date());
    setLoading(false);

    if (highlightNew) {
      setNewlyCompleted((prev) => new Set([...prev, highlightNew]));
      setTimeout(() => {
        setNewlyCompleted((prev) => {
          const next = new Set(prev);
          next.delete(highlightNew);
          return next;
        });
      }, 4000);
    }

    // Update drawer if it's open and a student changed
    if (selectedStudent) {
      const updated = merged.find((s) => s.id === selectedStudent.id);
      if (updated) setSelectedStudent(updated);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  /* ── Supabase Realtime subscription ── */
  useEffect(() => {
    const channel = supabase
      .channel('docente-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sesion_progreso' }, async (payload) => {
        const row = payload.new as { alumno_id: string; completado: boolean } | undefined;
        const highlightId = row?.completado ? row.alumno_id : undefined;
        await loadStudents(highlightId);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'alumnos' }, async () => {
        await loadStudents();
      })
      .subscribe((status) => {
        setRealtimeConnected(status === 'SUBSCRIBED');
      });

    return () => { supabase.removeChannel(channel); };
  }, [loadStudents]);

  /* ── Metrics ── */
  const done    = students.filter((s) => s.status === 'done').length;
  const working = students.filter((s) => s.status === 'working').length;
  const hint    = students.filter((s) => s.status === 'hint').length;
  const stuck   = students.filter((s) => s.status === 'stuck').length;
  const total   = students.length;
  const pct     = total > 0 ? Math.round((done / total) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F3F0' }}>
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#534AB7" strokeWidth="3" strokeOpacity="0.3"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="#534AB7" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <p style={{ color: '#6B7280', fontFamily: "'DM Sans', sans-serif" }}>Cargando panel…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#F5F3F0' }}>
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between flex-wrap gap-2" style={{ background: '#534AB7' }}>
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-white cursor-pointer"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            onClick={() => router.push('/login')}>
            {'</>'} The Forge
          </span>
          <span className="text-sm text-white opacity-75 hidden sm:block">
            Panel del docente — 7mo Grado
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: realtimeConnected ? '#34D399' : '#9CA3AF',
              boxShadow: realtimeConnected ? '0 0 0 3px rgba(52,211,153,0.3)' : 'none',
            }} />
            <span className="text-xs text-white opacity-75">
              {realtimeConnected ? 'En vivo' : 'Conectando…'}
            </span>
          </div>
          <span className="text-xs text-white opacity-75">Sesión 4 en curso</span>
          <SessionTimer />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* Metric cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Presentes hoy', value: total,        color: '#534AB7' },
            { label: 'Completaron',   value: done,         color: '#1D9E75' },
            { label: 'En progreso',   value: working+hint, color: '#D97706' },
            { label: 'Bloqueados',    value: stuck,        color: '#E24B4A', warn: stuck > 0 },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-1"
              style={{ border: card.warn ? '2px solid #E24B4A' : '2px solid transparent' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 36, fontWeight: 700, color: card.color, lineHeight: 1 }}>
                {card.value}
              </span>
              <span className="text-xs font-medium" style={{ color: '#6B7280', fontFamily: "'DM Sans', sans-serif" }}>
                {card.label}
              </span>
            </div>
          ))}
        </div>

        {/* Class progress bar */}
        <div className="bg-white rounded-2xl px-6 py-4 shadow-sm flex items-center gap-4">
          <span className="text-sm font-semibold shrink-0" style={{ color: '#1A1612', fontFamily: "'Space Grotesk', sans-serif", minWidth: 140 }}>
            Progreso del grado
          </span>
          <div className="flex-1 rounded-full overflow-hidden" style={{ height: 10, background: '#E5E1D8' }}>
            <div style={{
              height: 10, borderRadius: 999,
              background: 'linear-gradient(90deg, #1D9E75, #34D399)',
              width: `${pct}%`,
              transition: 'width 0.8s ease-out',
            }} />
          </div>
          <span className="text-sm font-bold shrink-0" style={{ color: '#1D9E75', fontFamily: "'JetBrains Mono', monospace" }}>
            {done}/{total}
          </span>
          {lastUpdate && (
            <span className="text-xs shrink-0 hidden sm:block" style={{ color: '#9CA3AF' }}>
              actualizado {timeAgo(lastUpdate.toISOString())}
            </span>
          )}
        </div>

        {/* Student grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1612' }}>
              Alumnos en tiempo real
            </h2>
            <p className="text-xs" style={{ color: '#9CA3AF', fontFamily: "'DM Sans', sans-serif" }}>
              Hacé click en un alumno para ver su progreso
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {students.map((s) => (
              <StudentCard
                key={s.id}
                student={s}
                isNew={newlyCompleted.has(s.id)}
                onClick={() => setSelectedStudent(s)}
              />
            ))}
          </div>
        </div>

        {/* Session plan */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button className="w-full flex items-center justify-between px-6 py-4 cursor-pointer"
            onClick={() => setPlanOpen((o) => !o)}>
            <h2 className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1612' }}>
              Plan de hoy — Sesión 4: Box Model
            </h2>
            <span style={{ color: '#6B7280', fontSize: 18, transition: 'transform 0.2s', transform: planOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▾</span>
          </button>

          {planOpen && (
            <div className="border-t" style={{ borderColor: '#E5E1D8' }}>
              {PLAN.map((item, i) => {
                const isActive = item.status === 'active';
                const isDone   = item.status === 'done';
                return (
                  <div key={item.type} className="flex items-start gap-4 px-6 py-4 transition-colors"
                    style={{
                      background: isActive ? '#EEEDFE' : 'transparent',
                      borderBottom: i < PLAN.length - 1 ? '1px solid #F5F3F0' : 'none',
                    }}>
                    <div style={{ marginTop: 2, flexShrink: 0 }}>
                      {isDone ? (
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      ) : isActive ? (
                        <div className="animate-pulse-ring" style={{ width: 22, height: 22, borderRadius: '50%', background: '#534AB7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />
                        </div>
                      ) : (
                        <div style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid #D1D5DB' }} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', fontFamily: "'JetBrains Mono', monospace" }}>{item.time}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                          style={{
                            background: isDone ? '#E1F5EE' : isActive ? '#EEEDFE' : '#F5F3F0',
                            color: isDone ? '#1D9E75' : isActive ? '#534AB7' : '#9CA3AF',
                          }}>
                          {item.type}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: isActive ? '#1A1612' : '#9CA3AF', fontFamily: "'DM Sans', sans-serif" }}>
                        {item.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>

      {/* Student detail drawer */}
      {selectedStudent && (
        <StudentDetailDrawer
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}
