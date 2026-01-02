import React, { useState } from 'react';
import Singers from './Singers';
import Songs from './Songs';
import Musicians from './Musicians';
import Instruments from './Instruments';
import Calendar from './Calendar';
import Impediments from './Impediments';

export default function Dashboard() {
  const [tab, setTab] = useState('singers');

  const tabs = [
    { key: 'singers', label: 'Cantores' },
    { key: 'songs', label: 'Músicas' },
    { key: 'musicians', label: 'Músicos' },
    { key: 'instruments', label: 'Instrumentos' },
    { key: 'calendar', label: 'Agenda' },
    { key: 'impediments', label: 'Impedimentos' },
  ];

  return (
    <div className="container">
      <div className="card" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            className="button"
            style={{
              backgroundColor: tab === t.key ? 'var(--color-accent)' : undefined
            }}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        {tab === 'singers' && <Singers />}
        {tab === 'songs' && <Songs />}
        {tab === 'musicians' && <Musicians />}
        {tab === 'instruments' && <Instruments />}
        {tab === 'calendar' && <Calendar />}
        {tab === 'impediments' && <Impediments />}
      </div>
    </div>
  );
}
