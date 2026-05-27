'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/* ── Students data ───────────────────────────────────────── */
const STUDENTS = [
  { id: 1, name: 'María G.',     initials: 'MG', status: 'done',     hints: 0, time: null },
  { id: 2, name: 'Valentina P.', initials: 'VP', status: 'done',     hints: 1, time: null },
  { id: 3, name: 'Joaquín R.',   initials: 'JR', status: 'done',     hints: 0, time: null },
  { id: 4, name: 'Sofía M.',     initials: 'SM', status: 'done',     hints: 0, time: null },
  { id: 5, name: 'Lucas T.',     initials: 'LT', status: 'working',  hints: 1, time: null },
  { id: 6, name: 'Camila V.',    initials: 'CV', status: 'working',  hints: 2, time: null },
  { id: 7, name: 'Andrés F.',    initials: 'AF', status: 'hint',     hints: 3, time: null },
  { id: 8, name: 'Diego R.',     initials: 'DR', status: 'stuck',    hints: 4, time: 18 },
];

type StudentStatus = 'done' | 'working' | 'hint' | 'stuck';

const STATUS_LABEL: Record<StudentStatus, string> = {
  done:    'Completado',
  working: 'En progreso',
  hint:    'Con pista',
  stuck:   'Bloqueado',
};

const STATUS_COLORS: Record<StudentStatus, { bg: string; badge: string; text: string; border: string }> = {
  done:    { bg: '#E1F5EE', badge: '#1D9E75', text: '#1D9E75', border: 'transparent' },
  working: { bg: '#FFFBEA', badge: '#D97706', text: '#D97706', border: 'transparent' },
  hint:    { bg: '#FAECE7', badge: '#D85A30', text: '#D85A30', border: 'transparent' },
  stuck:   { bg: '#FCEBEB', badge: '#E24B4A', text: '#E24B4A', border: '#E24B4A' },
};

/* ── Plan steps ──────────────────────────────────────────── */
const PLAN = [
  { time: '0–10 min',  type: 'APERTURA',       label: 'apertura',     text: 'Repaso: ¿qué es CSS? 3 preguntas al grupo',           status: 'done' },
  { time: '10–25 min', type: 'CONCEPTO',        label: 'concepto',     text: 'Explicación visual del Box Model con diagrama',        status: 'active' },
  { time: '25–75 min', type: 'CONSTRUCCIÓN',    label: 'construccion', text: 'Alumnos trabajan en el editor interactivo',            status: 'pending' },
  { time: '75–90 min', type: 'CIERRE',          label: 'cierre',       text: '2–3 voluntarios muestran su trabajo',                 status: 'pending' },
];

/* ── Student card ────────────────────────────────────────── */
function StudentCard({ student }: { student: typeof STUDENTS[0] }) {
  const st = student.status as StudentStatus;
  const colors = STATUS_COLORS[st];

  return (
    <div
      className="relative rounded-2xl p-4 flex flex-col gap-2 transition-all"
      style={{
        background: colors.bg,
        border: `2px solid ${colors.border || 'transparent'}`,
      }}
    >
      {/* Pulsing indicator for stuck */}
      {st === 'stuck' && (
        <div
          className="absolute top-3 right-3 animate-pulse-ring"
          style={{
            width: 10, height: 10, borderRadius: '50%',
            background: '#E24B4A',
          }}
        />
      )}

      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          style={{
            width: 40, height: 40, borderRadius: '50%',
            background: st === 'done' ? '#1D9E75' : st === 'stuck' ? '#E24B4A' : '#534AB7',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 13, fontWeight: 700,
            fontFamily: "'Space Grotesk', sans-serif",
            flexShrink: 0,
          }}
        >
          {student.initials}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: '#1A1612', fontFamily: "'DM Sans', sans-serif" }}>
            {student.name}
          </p>
          <span
            className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-0.5"
            style={{ background: colors.badge + '22', color: colors.badge }}
          >
            {STATUS_LABEL[st]}
            {st === 'stuck' && student.time ? ` ${student.time} min` : ''}
          </span>
        </div>

        {/* Hints */}
        {student.hints > 0 && (
          <div className="flex items-center gap-1 text-xs" style={{ color: '#6B7280' }}>
            <span>💡</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{student.hints}</span>
          </div>
        )}
      </div>

      {/* Help button for stuck */}
      {st === 'stuck' && (
        <button
          className="w-full mt-1 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer transition-all"
          style={{ background: '#D85A30', fontFamily: "'DM Sans', sans-serif" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#B84A24')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#D85A30')}
        >
          Ir a ayudar →
        </button>
      )}
    </div>
  );
}

/* ── Timer ────────────────────────────────────────────────── */
function SessionTimer() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return (
    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'rgba(255,255,255,0.9)', fontSize: 13 }}>
      ⏱ {m} min {String(s).padStart(2, '0')} seg
    </span>
  );
}

/* ── Main page ────────────────────────────────────────────── */
export default function DocentePage() {
  const router = useRouter();
  const [planOpen, setPlanOpen] = useState(true);

  const done    = STUDENTS.filter((s) => s.status === 'done').length;
  const working = STUDENTS.filter((s) => s.status === 'working').length;
  const hint    = STUDENTS.filter((s) => s.status === 'hint').length;
  const stuck   = STUDENTS.filter((s) => s.status === 'stuck').length;

  return (
    <div className="min-h-screen" style={{ background: '#F5F3F0' }}>
      {/* Header */}
      <header
        className="px-6 py-4 flex items-center justify-between flex-wrap gap-2"
        style={{ background: '#534AB7' }}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-xl font-bold text-white cursor-pointer"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            onClick={() => router.push('/login')}
          >
            {'</>'} The Forge
          </span>
          <span className="text-sm text-white opacity-75 hidden sm:block">
            Panel del docente — 7mo Grado
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-white opacity-75">Sesión 4 en curso</span>
          <SessionTimer />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* ── Metric cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Presentes hoy', value: 23, color: '#534AB7', bg: '#EEEDFE' },
            { label: 'Completaron',   value: done,  color: '#1D9E75', bg: '#E1F5EE' },
            { label: 'Usando pista',  value: hint,  color: '#D85A30', bg: '#FAECE7' },
            { label: 'Bloqueados',    value: stuck, color: '#E24B4A', bg: '#FCEBEB' },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-1"
              style={{ border: card.color === '#E24B4A' ? '2px solid #E24B4A' : '2px solid transparent' }}
            >
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 36, fontWeight: 700, color: card.color, lineHeight: 1 }}>
                {card.value}
              </span>
              <span className="text-xs font-medium" style={{ color: '#6B7280', fontFamily: "'DM Sans', sans-serif" }}>
                {card.label}
              </span>
            </div>
          ))}
        </div>

        {/* ── Student grid ── */}
        <div>
          <h2
            className="text-lg font-bold mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1612' }}
          >
            Alumnos en tiempo real
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {STUDENTS.map((s) => <StudentCard key={s.id} student={s} />)}
          </div>
        </div>

        {/* ── Session plan ── */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-6 py-4 cursor-pointer"
            onClick={() => setPlanOpen((o) => !o)}
          >
            <h2
              className="text-lg font-bold"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1612' }}
            >
              Plan de hoy — Sesión 4: Box Model
            </h2>
            <span style={{ color: '#6B7280', fontSize: 18, transition: 'transform 0.2s', transform: planOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
              ▾
            </span>
          </button>

          {planOpen && (
            <div className="border-t" style={{ borderColor: '#E5E1D8' }}>
              {PLAN.map((item, i) => {
                const isActive  = item.status === 'active';
                const isDone    = item.status === 'done';
                const isPending = item.status === 'pending';
                return (
                  <div
                    key={item.label}
                    className="flex items-start gap-4 px-6 py-4 transition-colors"
                    style={{
                      background: isActive ? '#EEEDFE' : 'transparent',
                      borderBottom: i < PLAN.length - 1 ? '1px solid #F5F3F0' : 'none',
                    }}
                  >
                    {/* Status icon */}
                    <div style={{ marginTop: 2, flexShrink: 0 }}>
                      {isDone ? (
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      ) : isActive ? (
                        <div className="animate-pulse-ring" style={{ width: 22, height: 22, borderRadius: '50%', background: '#534AB7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />
                        </div>
                      ) : (
                        <div style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid #D1D5DB' }} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', fontFamily: "'JetBrains Mono', monospace" }}>
                          {item.time}
                        </span>
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                          style={{
                            background: isDone ? '#E1F5EE' : isActive ? '#EEEDFE' : '#F5F3F0',
                            color: isDone ? '#1D9E75' : isActive ? '#534AB7' : '#9CA3AF',
                          }}
                        >
                          {item.type}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: isActive ? '#1A1612' : isPending ? '#9CA3AF' : '#6B7280', fontFamily: "'DM Sans', sans-serif" }}>
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
