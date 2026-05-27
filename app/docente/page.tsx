'use client';

import { useState, useEffect, useCallback } from 'react';
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
  initials: string;
  xp: number;
  status: StudentStatus;
  hints: number;
  stuckMins: number | null;
  completadoAt: string | null;
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

// Demo defaults for students without real-time activity yet
const DEMO_DEFAULTS: Record<string, { status: StudentStatus; hints: number; stuckMins: number | null }> = {
  'valentina.p': { status: 'done',    hints: 1, stuckMins: null },
  'joaquin.r':   { status: 'done',    hints: 0, stuckMins: null },
  'sofia.m':     { status: 'done',    hints: 0, stuckMins: null },
  'lucas.t':     { status: 'working', hints: 1, stuckMins: null },
  'camila.v':    { status: 'working', hints: 2, stuckMins: null },
  'andres.f':    { status: 'hint',    hints: 3, stuckMins: null },
  'diego.r':     { status: 'stuck',   hints: 4, stuckMins: 18  },
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
  return `hace ${mins} min`;
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
   STUDENT CARD
──────────────────────────────────────────────────────────── */
function StudentCard({ student, isNew }: { student: Student; isNew: boolean }) {
  const colors = STATUS_COLORS[student.status];

  return (
    <div
      className={`relative rounded-2xl p-4 flex flex-col gap-2 transition-all duration-500 ${isNew ? 'animate-scale-in' : ''}`}
      style={{ background: colors.bg, border: `2px solid ${colors.border}` }}
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

      {/* Help button for stuck */}
      {student.status === 'stuck' && (
        <button className="w-full mt-1 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer transition-all"
          style={{ background: '#D85A30', fontFamily: "'DM Sans', sans-serif" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#B84A24')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#D85A30')}>
          Ir a ayudar →
        </button>
      )}
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

  /* ── Load data from Supabase ── */
  const loadStudents = useCallback(async (highlightNew?: string) => {
    // Fetch all alumnos + their sesion_progreso for sesion-4
    const { data: alumnosData } = await supabase
      .from('alumnos')
      .select('id, usuario, nombre, xp')
      .order('nombre');

    if (!alumnosData) return;

    const alumnoIds = alumnosData.map((a) => a.id);

    const { data: progresoData } = await supabase
      .from('sesion_progreso')
      .select('alumno_id, paso_actual, completado, completado_at, hints_usados')
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
        initials: getInitials(a.nombre),
        xp: a.xp,
        status,
        hints: progreso?.hints_usados ?? demo?.hints ?? 0,
        stuckMins: demo?.stuckMins ?? null,
        completadoAt,
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
  }, []);

  /* ── Initial load ── */
  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  /* ── Supabase Realtime subscription ── */
  useEffect(() => {
    const channel = supabase
      .channel('docente-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sesion_progreso' },
        async (payload) => {
          // A student updated their progress
          const row = payload.new as { alumno_id: string; completado: boolean } | undefined;
          const highlightId = row?.completado ? row.alumno_id : undefined;
          await loadStudents(highlightId);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'alumnos' },
        async () => { await loadStudents(); }
      )
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

  /* ── Progress bar ── */
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

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
          {/* Realtime indicator */}
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

        {/* ── Metric cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Presentes hoy', value: total,   color: '#534AB7', bg: '#EEEDFE', border: false },
            { label: 'Completaron',   value: done,    color: '#1D9E75', bg: '#E1F5EE', border: false },
            { label: 'En progreso',   value: working + hint, color: '#D97706', bg: '#FFFBEA', border: false },
            { label: 'Bloqueados',    value: stuck,   color: '#E24B4A', bg: '#FCEBEB', border: true  },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-1"
              style={{ border: card.border ? '2px solid #E24B4A' : '2px solid transparent' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 36, fontWeight: 700, color: card.color, lineHeight: 1 }}>
                {card.value}
              </span>
              <span className="text-xs font-medium" style={{ color: '#6B7280', fontFamily: "'DM Sans', sans-serif" }}>
                {card.label}
              </span>
            </div>
          ))}
        </div>

        {/* ── Class progress bar ── */}
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

        {/* ── Student grid ── */}
        <div>
          <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1612' }}>
            Alumnos en tiempo real
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {students.map((s) => (
              <StudentCard
                key={s.id}
                student={s}
                isNew={newlyCompleted.has(s.id)}
              />
            ))}
          </div>
        </div>

        {/* ── Session plan ── */}
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
                const isActive  = item.status === 'active';
                const isDone    = item.status === 'done';
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
    </div>
  );
}
