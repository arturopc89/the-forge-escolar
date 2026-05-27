'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate short delay
    await new Promise((r) => setTimeout(r, 500));

    if (usuario === 'maria.garcia' && pin === '1234') {
      router.push('/alumno/dashboard');
    } else if (usuario === 'docente' && pin === '0000') {
      router.push('/docente');
    } else {
      setError('Usuario o PIN incorrecto. Revisá tus datos.');
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#0f0d0a' }}
    >
      {/* Card */}
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl px-8 py-10 animate-fade-in"
        style={{ animation: 'fadeIn 0.35s ease-out' }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="text-5xl font-bold mb-3 select-none"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#D85A30' }}
          >
            {'</>'}
          </div>
          <h1
            className="text-2xl font-bold text-forge-dark"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1612' }}
          >
            The Forge
          </h1>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
            Ingresá con los datos de tu colegio
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="usuario"
              className="text-sm font-medium"
              style={{ color: '#1A1612' }}
            >
              Usuario
            </label>
            <input
              id="usuario"
              type="text"
              autoFocus
              autoComplete="off"
              placeholder="ej: maria.garcia"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
              style={{
                borderColor: '#E5E1D8',
                color: '#1A1612',
                fontFamily: "'DM Sans', sans-serif",
              }}
              onFocus={(e) => (e.target.style.borderColor = '#534AB7')}
              onBlur={(e) => (e.target.style.borderColor = '#E5E1D8')}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="pin"
              className="text-sm font-medium"
              style={{ color: '#1A1612' }}
            >
              PIN
            </label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="••••"
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                setPin(val);
              }}
              className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none tracking-[0.4em] transition-all"
              style={{
                borderColor: '#E5E1D8',
                color: '#1A1612',
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: pin ? '0.4em' : undefined,
              }}
              onFocus={(e) => (e.target.style.borderColor = '#534AB7')}
              onBlur={(e) => (e.target.style.borderColor = '#E5E1D8')}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              className="text-sm rounded-lg px-4 py-2.5 animate-fade-in"
              style={{ background: '#FAECE7', color: '#D85A30', border: '1px solid #F5C4B2' }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-white font-semibold text-sm transition-all mt-1 cursor-pointer disabled:opacity-70"
            style={{
              background: loading ? '#6B7280' : '#534AB7',
              fontFamily: "'DM Sans', sans-serif",
            }}
            onMouseEnter={(e) => {
              if (!loading) (e.currentTarget.style.background = '#3C3489');
            }}
            onMouseLeave={(e) => {
              if (!loading) (e.currentTarget.style.background = '#534AB7');
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Entrando…
              </span>
            ) : (
              'Entrar al Forge →'
            )}
          </button>
        </form>

        {/* Hint for demo */}
        <p className="text-xs text-center mt-6" style={{ color: '#9CA3AF' }}>
          Demo: <strong>maria.garcia</strong> / <strong>1234</strong>
        </p>
      </div>
    </div>
  );
}
