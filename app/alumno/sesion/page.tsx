'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/* ────────────────────────────────────────────────────────────
   TYPES
──────────────────────────────────────────────────────────── */
type Step = 1 | 2 | 3 | 4;

interface LayerInfo {
  nombre: string;
  color: string;
  bg: string;
  descripcion: string;
  css: string;
}

/* ────────────────────────────────────────────────────────────
   STEP INDICATOR
──────────────────────────────────────────────────────────── */
const stepLabels = ['Concepto', 'Analogía', 'Ejercicio', '¡Listo!'];

function StepIndicator({ current }: { current: Step }) {
  return (
    <div
      className="flex items-center justify-center gap-0 px-4 py-4 bg-white border-b"
      style={{ borderColor: '#E5E1D8' }}
    >
      {stepLabels.map((label, i) => {
        const stepNum = (i + 1) as Step;
        const done = stepNum < current;
        const active = stepNum === current;
        return (
          <div key={label} className="flex items-center">
            {/* Circle */}
            <div className="flex flex-col items-center">
              <div
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: done ? '#1D9E75' : active ? '#534AB7' : '#E5E1D8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.3s',
                }}
              >
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7l4 4 6-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span style={{ fontSize: 12, fontWeight: 700, color: active ? 'white' : '#9CA3AF', fontFamily: "'JetBrains Mono', monospace" }}>
                    {stepNum}
                  </span>
                )}
              </div>
              <span style={{
                fontSize: 11, marginTop: 4,
                fontWeight: active ? 700 : 400,
                color: active ? '#534AB7' : done ? '#1D9E75' : '#9CA3AF',
                fontFamily: "'DM Sans', sans-serif",
                whiteSpace: 'nowrap',
              }}>
                {label}
              </span>
            </div>
            {/* Line */}
            {i < stepLabels.length - 1 && (
              <div style={{
                width: 48, height: 3, marginBottom: 18, flexShrink: 0,
                background: done ? '#1D9E75' : '#E5E1D8',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   BOX MODEL SVG  (Step 1)
──────────────────────────────────────────────────────────── */
const LAYER_DATA: Record<string, LayerInfo> = {
  margin: {
    nombre: 'Margin',
    color: '#27500A',
    bg: '#EAF3DE',
    descripcion: 'Espacio AFUERA del elemento. Separa este elemento de otros.',
    css: 'margin: 20px;',
  },
  border: {
    nombre: 'Border',
    color: '#712B13',
    bg: '#FAEEDA',
    descripcion: 'El borde visible alrededor del elemento.',
    css: 'border: 2px solid #D85A30;',
  },
  padding: {
    nombre: 'Padding',
    color: '#3C3489',
    bg: '#EEEDFE',
    descripcion: 'Espacio ADENTRO del elemento, entre el contenido y el borde.',
    css: 'padding: 16px;',
  },
  content: {
    nombre: 'Content',
    color: '#0C447C',
    bg: '#E6F1FB',
    descripcion: 'El contenido real: texto, imagen, o lo que sea.',
    css: 'width: 200px; height: 100px;',
  },
};

function BoxModelSVG({
  marginSize,
  paddingSize,
  onHover,
  hovered,
}: {
  marginSize: number;
  paddingSize: number;
  onHover: (layer: string | null) => void;
  hovered: string | null;
}) {
  const W = 420, H = 260;
  const m = Math.max(8, marginSize);
  const bt = 14; // visual border thickness
  const p = Math.max(8, paddingSize);

  const layers = {
    margin:  { x: 0,         y: 0,         w: W,               h: H },
    border:  { x: m,         y: m,         w: W - 2 * m,       h: H - 2 * m },
    padding: { x: m + bt,    y: m + bt,    w: W - 2*(m+bt),    h: H - 2*(m+bt) },
    content: { x: m+bt+p,    y: m+bt+p,    w: W - 2*(m+bt+p),  h: H - 2*(m+bt+p) },
  };

  const labelPos: Record<string, { x: number; y: number; anchor: 'start' | 'middle' | 'end' }> = {
    margin:  { x: 6,    y: H - 6,   anchor: 'start' },
    border:  { x: m+4,  y: m + 14,  anchor: 'start' },
    padding: { x: m+bt+4, y: m+bt+14, anchor: 'start' },
    content: { x: W/2,  y: H/2,     anchor: 'middle' },
  };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', maxWidth: 420, height: 'auto', display: 'block' }}
    >
      {(['margin', 'border', 'padding', 'content'] as const).map((key) => {
        const l = layers[key];
        const info = LAYER_DATA[key];
        const isHovered = hovered === key;
        const lp = labelPos[key];
        return (
          <g key={key}>
            <rect
              x={l.x} y={l.y} width={l.w} height={l.h}
              rx={key === 'margin' ? 0 : key === 'border' ? 6 : key === 'padding' ? 4 : 2}
              fill={info.bg}
              stroke={info.color}
              strokeWidth={isHovered ? 3 : 2}
              opacity={isHovered ? 1 : 0.85}
              style={{ cursor: 'pointer', transition: 'opacity 0.15s, stroke-width 0.15s' }}
              onMouseEnter={() => onHover(key)}
              onMouseLeave={() => onHover(null)}
            />
            <text
              x={lp.x} y={lp.y}
              textAnchor={lp.anchor}
              fill={info.color}
              fontSize={11}
              fontFamily="'DM Sans', sans-serif"
              fontWeight="700"
              pointerEvents="none"
              opacity={0.85}
            >
              {info.nombre.toUpperCase()}
            </text>
          </g>
        );
      })}
      {/* "contenido" label in content box */}
      <text
        x={W / 2} y={H / 2 + 8}
        textAnchor="middle"
        fill={LAYER_DATA.content.color}
        fontSize={13}
        fontFamily="'JetBrains Mono', monospace"
        pointerEvents="none"
      >
        contenido
      </text>
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
   STEP 1 — Concepto
──────────────────────────────────────────────────────────── */
function Step1({ onNext }: { onNext: () => void }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [marginSize, setMarginSize] = useState(22);
  const [paddingSize, setPaddingSize] = useState(18);

  const info = hovered ? LAYER_DATA[hovered] : null;

  return (
    <div className="animate-fade-slide flex flex-col gap-6 p-5 md:p-8">
      <div>
        <h2
          className="text-2xl md:text-3xl font-bold mb-2"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1612' }}
        >
          ¿Qué es el Box Model?
        </h2>
        <p style={{ color: '#6B7280', lineHeight: 1.6 }}>
          En CSS, cada elemento de una página web es una caja rectangular.
          Esa caja tiene cuatro capas que controlan cuánto espacio ocupa.
        </p>
        <p className="mt-1" style={{ color: '#6B7280', lineHeight: 1.6 }}>
          Pasá el cursor sobre cada capa del diagrama para entender qué hace.
        </p>
      </div>

      {/* SVG + Info Panel */}
      <div className="flex flex-col md:flex-row gap-5 items-start">
        {/* SVG */}
        <div className="w-full md:w-[420px] shrink-0 rounded-2xl overflow-hidden border" style={{ borderColor: '#E5E1D8' }}>
          <BoxModelSVG
            marginSize={marginSize}
            paddingSize={paddingSize}
            onHover={setHovered}
            hovered={hovered}
          />
        </div>

        {/* Info panel */}
        <div
          className="w-full md:flex-1 rounded-2xl p-5 min-h-[150px] flex flex-col justify-center transition-all"
          style={{
            background: info ? '#FAFAFA' : '#F5F3F0',
            border: `2px solid ${info ? info.color + '40' : '#E5E1D8'}`,
          }}
        >
          {info ? (
            <div className="animate-fade-in">
              <p
                className="text-xl font-bold mb-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: info.color }}
              >
                {info.nombre}
              </p>
              <p className="text-sm mb-4" style={{ color: '#1A1612', lineHeight: 1.6 }}>
                {info.descripcion}
              </p>
              <div
                className="rounded-lg px-4 py-2.5 text-sm"
                style={{
                  background: '#1a1614',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: '#97C459',
                }}
              >
                {info.css}
              </div>
            </div>
          ) : (
            <p className="text-sm text-center" style={{ color: '#9CA3AF' }}>
              👆 Pasá el cursor sobre una capa
            </p>
          )}
        </div>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-white rounded-2xl p-5 border" style={{ borderColor: '#E5E1D8' }}>
        <div>
          <div className="flex justify-between text-sm mb-2" style={{ color: '#1A1612' }}>
            <span style={{ fontWeight: 500 }}>Margin</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#534AB7' }}>
              {marginSize}px
            </span>
          </div>
          <input
            type="range" min={8} max={40} value={marginSize}
            onChange={(e) => setMarginSize(Number(e.target.value))}
          />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-2" style={{ color: '#1A1612' }}>
            <span style={{ fontWeight: 500 }}>Padding</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#534AB7' }}>
              {paddingSize}px
            </span>
          </div>
          <input
            type="range" min={8} max={40} value={paddingSize}
            onChange={(e) => setPaddingSize(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="px-8 py-3 rounded-xl text-white font-semibold text-sm transition-all cursor-pointer"
          style={{ background: '#534AB7', fontFamily: "'DM Sans', sans-serif" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#3C3489')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#534AB7')}
        >
          ¡Entendí! Siguiente →
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   STEP 2 — Analogía
──────────────────────────────────────────────────────────── */
function Step2({ onNext }: { onNext: () => void }) {
  return (
    <div className="animate-fade-slide flex flex-col gap-6 p-5 md:p-8">
      <div>
        <h2
          className="text-2xl md:text-3xl font-bold mb-2"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1612' }}
        >
          La foto enmarcada
        </h2>
        <p style={{ color: '#6B7280', lineHeight: 1.6 }}>
          Para acordarte del Box Model, pensá en una foto enmarcada colgada en la pared.
        </p>
      </div>

      {/* Illustration + Table */}
      <div className="flex flex-col md:flex-row gap-6 items-center">
        {/* SVG Illustration */}
        <div className="shrink-0 w-full max-w-xs mx-auto md:mx-0">
          <svg viewBox="0 0 280 220" style={{ width: '100%', height: 'auto' }}>
            {/* Wall background */}
            <rect x="0" y="0" width="280" height="220" fill="#F0EDE8" rx="8" />

            {/* MARGIN label */}
            <text x="6" y="18" fontSize="9" fontFamily="'DM Sans'" fontWeight="700" fill="#27500A" opacity="0.8">MARGIN</text>

            {/* BORDER (wooden frame) */}
            <rect x="26" y="26" width="228" height="168" rx="6" fill="#C4874A" stroke="#8B5E2E" strokeWidth="2" />
            <rect x="30" y="30" width="220" height="160" rx="4" fill="#D4934E" />
            <text x="30" y="46" fontSize="9" fontFamily="'DM Sans'" fontWeight="700" fill="#712B13" opacity="0.9">BORDER</text>

            {/* PADDING (white mat) */}
            <rect x="50" y="50" width="180" height="120" rx="2" fill="white" stroke="#E5E1D8" strokeWidth="1" />
            <text x="54" y="65" fontSize="9" fontFamily="'DM Sans'" fontWeight="700" fill="#3C3489" opacity="0.9">PADDING</text>

            {/* CONTENT (photo) */}
            <rect x="68" y="68" width="144" height="84" rx="3" fill="#DBEAFE" />
            {/* Mountains */}
            <polygon points="68,152 98,105 128,135 158,92 212,152" fill="#93C5FD" opacity="0.8" />
            <polygon points="68,152 108,112 148,152" fill="#60A5FA" opacity="0.6" />
            {/* Sun */}
            <circle cx="182" cy="85" r="10" fill="#FCD34D" />
            {/* Snow */}
            <polygon points="138,92 158,92 148,110" fill="white" opacity="0.8" />
            <text x="140" y="164" textAnchor="middle" fontSize="9" fontFamily="'DM Sans'" fontWeight="700" fill="#0C447C" opacity="0.9">CONTENT</text>
          </svg>
        </div>

        {/* Equivalence table */}
        <div className="flex-1 w-full">
          <h3 className="text-base font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1612' }}>
            Equivalencias
          </h3>
          <div className="flex flex-col gap-3">
            {[
              { emoji: '🖼️', thing: 'La foto',    equals: 'Content',  color: '#0C447C', bg: '#E6F1FB' },
              { emoji: '⬜', thing: 'Espacio blanco', equals: 'Padding', color: '#3C3489', bg: '#EEEDFE' },
              { emoji: '🪵', thing: 'El marco',   equals: 'Border',   color: '#712B13', bg: '#FAEEDA' },
              { emoji: '📏', thing: 'Distancia a la pared', equals: 'Margin', color: '#27500A', bg: '#EAF3DE' },
            ].map((row) => (
              <div
                key={row.equals}
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: row.bg }}
              >
                <span className="text-xl">{row.emoji}</span>
                <span className="flex-1 text-sm" style={{ color: '#1A1612', fontFamily: "'DM Sans', sans-serif" }}>
                  {row.thing}
                </span>
                <span className="font-bold text-sm" style={{ color: row.color, fontFamily: "'Space Grotesk', sans-serif" }}>
                  = {row.equals}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="px-8 py-3 rounded-xl text-white font-semibold text-sm transition-all cursor-pointer"
          style={{ background: '#1D9E75', fontFamily: "'DM Sans', sans-serif" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#158a65')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#1D9E75')}
        >
          ¡Tiene sentido! →
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   STEP 3 — Editor en Vivo
──────────────────────────────────────────────────────────── */
const INITIAL_CSS = `.boton {
  color: white;
  font-size: 16px;
  cursor: pointer;
}`;

function CheckItem({ done, label }: { done: boolean; label: string }) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all"
      style={{
        background: done ? '#E1F5EE' : '#F5F3F0',
        border: `1px solid ${done ? '#A3D9C4' : '#E5E1D8'}`,
      }}
    >
      <div
        style={{
          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
          background: done ? '#1D9E75' : 'white',
          border: `2px solid ${done ? '#1D9E75' : '#D1D5DB'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.25s',
        }}
      >
        {done && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <code style={{ fontSize: 13, color: done ? '#1D9E75' : '#6B7280', fontFamily: "'JetBrains Mono', monospace" }}>
        {label}
      </code>
    </div>
  );
}

function Step3({ onNext }: { onNext: () => void }) {
  const [css, setCss] = useState(INITIAL_CSS);
  const [previewCSS, setPreviewCSS] = useState('color: white; font-size: 16px; cursor: pointer;');

  // Extract content between braces
  const extractCSS = useCallback((text: string) => {
    const match = text.match(/\.boton\s*\{([\s\S]*?)\}/);
    return match ? match[1].trim() : '';
  }, []);

  useEffect(() => {
    setPreviewCSS(extractCSS(css));
  }, [css, extractCSS]);

  const validation = useMemo(() => ({
    hasPadding:    /padding\s*:/i.test(css),
    hasBorder:     /border\s*:/i.test(css),
    hasBackground: /background(-color)?\s*:/i.test(css),
  }), [css]);

  const allDone = validation.hasPadding && validation.hasBorder && validation.hasBackground;
  const lines = css.split('\n').length;
  const chars = css.length;

  return (
    <div className="animate-fade-slide flex flex-col gap-5 p-5 md:p-8">
      <div>
        <h2
          className="text-2xl md:text-3xl font-bold mb-2"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1612' }}
        >
          Ahora hacelo vos
        </h2>
        <p className="text-sm mb-3" style={{ color: '#6B7280', lineHeight: 1.6 }}>
          El botón de abajo se ve básico. Escribí el CSS para completar los tres objetivos:
        </p>
        <div className="flex flex-col gap-2">
          {[
            '✓ Darle padding de 16px',
            '✓ Un borde naranja de 2px',
            '✓ Cambiar el color de fondo a #534AB7',
          ].map((t) => (
            <p key={t} className="text-sm font-medium" style={{ color: '#534AB7' }}>{t}</p>
          ))}
        </div>
      </div>

      {/* Editor + Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Editor */}
        <div className="flex flex-col rounded-2xl overflow-hidden" style={{ background: '#1a1614' }}>
          <div
            className="flex items-center gap-2 px-4 py-2.5 border-b"
            style={{ borderColor: '#2a2520' }}
          >
            {['#E24B4A','#F59E0B','#1D9E75'].map((c) => (
              <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
            ))}
            <span className="text-xs ml-2" style={{ color: '#6B7280', fontFamily: "'JetBrains Mono', monospace" }}>
              estilos.css
            </span>
          </div>
          <textarea
            value={css}
            onChange={(e) => setCss(e.target.value)}
            spellCheck={false}
            className="flex-1 resize-none p-4 outline-none"
            style={{
              background: 'transparent',
              color: '#E5E1D8',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              lineHeight: 1.7,
              minHeight: 220,
              border: 'none',
            }}
          />
          <div
            className="px-4 py-2 border-t text-xs"
            style={{ borderColor: '#2a2520', color: '#6B7280', fontFamily: "'JetBrains Mono', monospace" }}
          >
            {lines} líneas · {chars} caracteres
          </div>
        </div>

        {/* Preview */}
        <div className="flex flex-col rounded-2xl overflow-hidden border" style={{ borderColor: '#E5E1D8' }}>
          <div
            className="px-4 py-2.5 border-b text-sm font-medium"
            style={{ borderColor: '#E5E1D8', color: '#6B7280', background: '#F5F3F0', fontFamily: "'DM Sans', sans-serif" }}
          >
            Resultado en tiempo real
          </div>
          <div
            className="flex-1 flex items-center justify-center p-8 min-h-[220px]"
            style={{
              backgroundImage: 'linear-gradient(#e8e8e8 1px, transparent 1px), linear-gradient(90deg, #e8e8e8 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              background: 'white',
            }}
          >
            <style dangerouslySetInnerHTML={{
              __html: `.preview-btn { ${previewCSS} }`
            }} />
            <button
              className="preview-btn rounded-lg px-4 py-2 text-sm font-medium transition-none"
              style={{
                background: '#E5E1D8', color: '#1A1612',
                border: '1px solid #D1D5DB', borderRadius: 8,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Hola, soy un botón
            </button>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold mb-1" style={{ color: '#1A1612', fontFamily: "'Space Grotesk', sans-serif" }}>
          Progreso
        </p>
        <CheckItem done={validation.hasPadding}    label="padding: 16px" />
        <CheckItem done={validation.hasBorder}     label="border naranja" />
        <CheckItem done={validation.hasBackground} label="background-color" />
      </div>

      {/* Submit button — appears when all checks pass */}
      <div className="flex justify-end">
        <div style={{ opacity: allDone ? 1 : 0.3, transition: 'opacity 0.4s', pointerEvents: allDone ? 'auto' : 'none' }}>
          <button
            onClick={onNext}
            className="px-8 py-3 rounded-xl text-white font-semibold text-sm cursor-pointer"
            style={{ background: '#534AB7', fontFamily: "'DM Sans', sans-serif" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#3C3489')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#534AB7')}
          >
            Entregar mi solución →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   STEP 4 — Celebración
──────────────────────────────────────────────────────────── */
const CONFETTI = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: `${4 + ((i * 7 + i * i) % 92)}%`,
  width:  `${6 + (i % 6) * 2}px`,
  height: `${6 + (i % 5) * 2}px`,
  color: ['#534AB7', '#1D9E75', '#D85A30', '#7B74CC', '#34D399'][(i % 5)],
  delay: `${(i * 0.11).toFixed(2)}s`,
  duration: `${(2.2 + (i % 5) * 0.3).toFixed(1)}s`,
  shape: i % 4 === 0 ? '50%' : '2px',
}));

function Step4({ onDashboard, onLogin }: { onDashboard: () => void; onLogin: () => void }) {
  const [xpWidth, setXpWidth] = useState(68);
  const [showBadge, setShowBadge] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const t1 = setTimeout(() => setShowBadge(true), 300);
    const t2 = setTimeout(() => { setShowXP(true); setXpWidth(74); }, 700);
    const t3 = setTimeout(() => setShowNext(true), 1200);
    const t4 = setTimeout(() => setShowConfetti(false), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  return (
    <div className="animate-fade-slide flex flex-col items-center gap-8 p-5 md:p-12 text-center">
      {/* Confetti */}
      {showConfetti && CONFETTI.map((c) => (
        <div
          key={c.id}
          className="confetti-piece"
          style={{
            left: c.left,
            top: '-20px',
            width: c.width,
            height: c.height,
            background: c.color,
            borderRadius: c.shape,
            animation: `confettiFall ${c.duration} ease-in ${c.delay} forwards`,
          }}
        />
      ))}

      {/* Emoji */}
      <div className="animate-bounce-emoji text-6xl">🎯</div>

      {/* Title */}
      <div>
        <h1
          className="text-4xl md:text-5xl font-bold"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1612' }}
        >
          ¡Lo lograste!
        </h1>
        <p className="text-lg mt-2" style={{ color: '#6B7280', fontFamily: "'DM Sans', sans-serif" }}>
          Dominaste el Box Model de CSS
        </p>
      </div>

      {/* Badge */}
      {showBadge && (
        <div
          className="animate-scale-in inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white text-lg"
          style={{ background: '#534AB7', border: '2px solid #3C3489', fontFamily: "'Space Grotesk', sans-serif" }}
        >
          🔓 Box Model dominado
        </div>
      )}

      {/* XP bar */}
      {showXP && (
        <div className="animate-fade-in w-full max-w-md">
          <p
            className="text-4xl font-bold mb-4"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: '#D85A30' }}
          >
            +30 XP
          </p>
          <div
            className="w-full rounded-full overflow-hidden mb-2"
            style={{ height: 14, background: '#E5E1D8' }}
          >
            <div
              style={{
                height: 14, borderRadius: 999,
                background: 'linear-gradient(90deg, #534AB7, #7B74CC)',
                width: `${xpWidth}%`,
                transition: 'width 1.5s ease-out',
              }}
            />
          </div>
          <p className="text-sm" style={{ color: '#6B7280', fontFamily: "'JetBrains Mono', monospace" }}>
            340 → 370 XP · Nivel 3
          </p>
        </div>
      )}

      {/* Next skill unlocked */}
      {showNext && (
        <div
          className="animate-fade-in w-full max-w-md rounded-2xl p-5 text-left"
          style={{ background: '#E1F5EE', border: '2px solid #1D9E75' }}
        >
          <p className="text-sm font-bold" style={{ color: '#1D9E75', fontFamily: "'Space Grotesk', sans-serif" }}>
            ✨ Siguiente: Flexbox
          </p>
          <p className="text-sm mt-1" style={{ color: '#1A1612' }}>
            Ya podés empezar la próxima sesión
          </p>
        </div>
      )}

      {/* Buttons */}
      {showNext && (
        <div className="animate-fade-in flex flex-col sm:flex-row gap-3 w-full max-w-md">
          <button
            onClick={onDashboard}
            className="flex-1 py-3 rounded-xl text-white font-semibold text-sm cursor-pointer transition-all"
            style={{ background: '#1D9E75', fontFamily: "'DM Sans', sans-serif" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#158a65')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#1D9E75')}
          >
            Ver mi progreso →
          </button>
          <button
            onClick={onLogin}
            className="flex-1 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all"
            style={{
              background: 'transparent',
              border: '2px solid #E5E1D8',
              color: '#6B7280',
              fontFamily: "'DM Sans', sans-serif",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#534AB7', e.currentTarget.style.color = '#534AB7')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E5E1D8', e.currentTarget.style.color = '#6B7280')}
          >
            Volver al inicio
          </button>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   MAIN PAGE
──────────────────────────────────────────────────────────── */
export default function SesionPage() {
  const [step, setStep] = useState<Step>(1);
  const router = useRouter();
  const topRef = useRef<HTMLDivElement>(null);

  const advance = useCallback((next: Step) => {
    setStep(next);
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F5F3F0' }}>
      {/* Header */}
      <header
        className="px-6 py-4 flex items-center justify-between shrink-0"
        style={{ background: '#534AB7' }}
      >
        <span
          className="text-xl font-bold text-white cursor-pointer"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          onClick={() => router.push('/alumno/dashboard')}
        >
          {'</>'} The Forge
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white opacity-75">Sesión 4 · Box Model</span>
        </div>
      </header>

      {/* Scroll anchor */}
      <div ref={topRef} />

      {/* Step indicator */}
      <StepIndicator current={step} />

      {/* Content */}
      <div className="flex-1 max-w-4xl w-full mx-auto">
        {step === 1 && <Step1 onNext={() => advance(2)} />}
        {step === 2 && <Step2 onNext={() => advance(3)} />}
        {step === 3 && <Step3 onNext={() => advance(4)} />}
        {step === 4 && (
          <Step4
            onDashboard={() => router.push('/alumno/dashboard')}
            onLogin={() => router.push('/login')}
          />
        )}
      </div>
    </div>
  );
}
