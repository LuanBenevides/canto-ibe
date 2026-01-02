import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

/* =========================
   GENÉRICOS
========================= */

export async function getAll(entity) {
  const { data, error } = await supabase
    .from(entity)
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

export async function find(entity, id) {
  const { data, error } = await supabase
    .from(entity)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

export async function upsert(entity, item) {
  const payload = {
    ...item,
    id: item.id || uuidv4(),
  };

  const { data, error } = await supabase
    .from(entity)
    .upsert(payload)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
}

export async function remove(entity, id) {
  const { error } = await supabase
    .from(entity)
    .delete()
    .eq('id', id);

  if (error) {
    console.error(error);
    throw error;
  }
}

/* =========================
   SONGS / PERFORMANCES
========================= */

export async function addPerformance(songId, singerId, key, date) {
  const { data: song, error } = await supabase
    .from('songs')
    .select('performances')
    .eq('id', songId)
    .single();

  if (error) throw error;

  const performances = song.performances || [];

  performances.push({ singerId, key, date });

  const { data, error: updateError } = await supabase
    .from('songs')
    .update({ performances })
    .eq('id', songId)
    .select()
    .single();

  if (updateError) throw updateError;

  return data;
}

/* =========================
   SCHEDULE
========================= */

export async function addSchedule(
  date,
  singers,
  musiciansSelection,
  leaderId,
  songsSelection
) {
  const { data: existing } = await supabase
    .from('schedule')
    .select('*')
    .eq('date', date)
    .eq('leaderId', leaderId)
    .maybeSingle();

  const schedule = {
    id: existing?.id || uuidv4(),
    date,
    singers,
    musiciansSelection,
    leaderId,
    songsSelection,
  };

  const { data, error } = await supabase
    .from('schedule')
    .upsert(schedule)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteSchedule(id) {
  const { error } = await supabase
    .from('schedule')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/* =========================
   IMPEDIMENTS
========================= */

export async function addImpediment(memberId, date) {
  const { data, error } = await supabase
    .from('impediments')
    .insert({
      id: uuidv4(),
      memberId,
      date,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

/* =========================
   LEGACY (não faz nada agora)
========================= */

export async function clearAll() {
  console.warn('clearAll ignorado: usando Supabase');
}
