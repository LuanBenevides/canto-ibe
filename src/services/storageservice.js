import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'canto-ibe:data';

async function seedIfNeeded() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}data.json`);
      const data = await res.json();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to seed data.json', err);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          users: [],
          singers: [],
          songs: [],
          instruments: [],
          musicians: [],
          schedule: [],
          impediments: []
        })
      );
    }
  }
}

async function read() {
  await seedIfNeeded();
  return JSON.parse(localStorage.getItem(STORAGE_KEY));
}

async function write(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}


export async function getAll(entity) {
  const db = await read();
  return db[entity] || [];
}

export async function find(entity, id) {
  const db = await read();
  return db[entity].find(i => i.id === id);
}

export async function upsert(entity, item) {
  const db = await read();
  db[entity] = db[entity] || [];

  if (!item.id) item.id = uuidv4();

  const idx = db[entity].findIndex(i => i.id === item.id);
  if (idx === -1) db[entity].push(item);
  else db[entity][idx] = item;

  await write(db);
  return item;
}

export async function remove(entity, id) {
  const db = await read();
  db[entity] = db[entity].filter(i => i.id !== id);
  await write(db);
}


export async function addPerformance(songId, singerId, key, date) {
  const db = await read();
  const song = db.songs.find(s => s.id === songId);
  if (!song) throw new Error('Música não encontrada');
  song.performances = song.performances || [];
  song.performances.push({ singerId, key, date });
  await write(db);
  return song;
}

export async function addSchedule(date, singers, musiciansSelection, leaderId, songsSelection) {
  const db = await read();
  db.schedule = db.schedule || [];

  const existingIndex = db.schedule.findIndex(s => s.date === date && s.leaderId === leaderId);

  const schedule = {
    id: existingIndex >= 0 ? db.schedule[existingIndex].id : uuidv4(),
    date,
    singers,
    musiciansSelection,
    leaderId,
    songsSelection
  };

  if (existingIndex >= 0) db.schedule[existingIndex] = schedule;
  else db.schedule.push(schedule);

  await write(db);
  return schedule;
}

export async function deleteSchedule(id) {
  const db = await read();
  db.schedule = db.schedule.filter(sch => sch.id !== id);
  await write(db);
}

export async function addImpediment(memberId, date) {
  const db = await read();
  db.impediments = db.impediments || [];
  db.impediments.push({ id: uuidv4(), memberId, date });
  await write(db);
}

export async function clearAll() {
  localStorage.removeItem(STORAGE_KEY);
  await seedIfNeeded();
}
