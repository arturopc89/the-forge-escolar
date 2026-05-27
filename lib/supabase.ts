import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* ── Types ───────────────────────────────────────────────── */
export interface Credencial {
  id: string;
  usuario: string;
  pin: string;
  rol: 'alumno' | 'docente';
  nombre: string;
}

export interface Alumno {
  id: string;
  usuario: string;
  nombre: string;
  grado: string;
  xp: number;
  racha: number;
  nivel: number;
}

export interface Skill {
  id: string;
  nombre: string;
  orden: number;
  xp_reward: number;
}

export interface AlumnoSkill {
  alumno_id: string;
  skill_id: string;
  estado: 'locked' | 'active' | 'done';
  xp_ganado: number;
  completado_at: string | null;
}

export interface SesionProgreso {
  id: string;
  alumno_id: string;
  sesion_id: string;
  paso_actual: number;
  completado: boolean;
  hints_usados: number;
  iniciado_at: string;
  completado_at: string | null;
}

/* ── Auth helpers ────────────────────────────────────────── */
export async function loginUsuario(usuario: string, pin: string) {
  const { data, error } = await supabase
    .from('credenciales')
    .select('*')
    .eq('usuario', usuario)
    .eq('pin', pin)
    .single();

  if (error || !data) return null;
  return data as Credencial;
}

/* ── Alumno helpers ──────────────────────────────────────── */
export async function getAlumno(usuario: string) {
  const { data, error } = await supabase
    .from('alumnos')
    .select('*')
    .eq('usuario', usuario)
    .single();

  if (error || !data) return null;
  return data as Alumno;
}

export async function getAlumnoSkills(alumnoId: string) {
  const { data, error } = await supabase
    .from('alumno_skills')
    .select('*, skills(*)')
    .eq('alumno_id', alumnoId)
    .order('skills(orden)');

  if (error) return [];
  return data ?? [];
}

/* ── Session progress helpers ────────────────────────────── */
export async function upsertProgreso(
  alumnoId: string,
  sesionId: string,
  pasoActual: number,
  completado: boolean
) {
  const { data, error } = await supabase
    .from('sesion_progreso')
    .upsert(
      {
        alumno_id: alumnoId,
        sesion_id: sesionId,
        paso_actual: pasoActual,
        completado,
        completado_at: completado ? new Date().toISOString() : null,
      },
      { onConflict: 'alumno_id,sesion_id' }
    )
    .select()
    .single();

  return error ? null : data;
}

export async function completarSesion(alumnoId: string, xpReward: number) {
  // Mark box-model skill as done and update XP
  await supabase
    .from('alumno_skills')
    .update({
      estado: 'done',
      xp_ganado: xpReward,
      completado_at: new Date().toISOString(),
    })
    .eq('alumno_id', alumnoId)
    .eq('skill_id', 'box-model');

  // Unlock flexbox
  await supabase
    .from('alumno_skills')
    .update({ estado: 'active' })
    .eq('alumno_id', alumnoId)
    .eq('skill_id', 'flexbox');

  // Update XP
  await supabase.rpc('increment_xp', { p_alumno_id: alumnoId, p_xp: xpReward });
}

/* ── Docente: all students with live progress ────────────── */
export async function getAllAlumnos() {
  const { data, error } = await supabase
    .from('alumnos')
    .select('*, sesion_progreso(*)')
    .order('nombre');

  if (error) return [];
  return data ?? [];
}
