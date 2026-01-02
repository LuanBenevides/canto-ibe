import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function downloadLyrics(song) {
  const doc = new jsPDF();

  // === Página 1: Letra ===
  doc.setFontSize(16);
  doc.text(song.title || 'Sem título', 10, 10);
  
  doc.setFontSize(12);
  doc.text('Tom: ' + (song.originalKey || 'N/A'), 10, 20);

  // Quebra automática do texto da letra
  const lyrics = song.lyrics || 'Sem letra disponível';
  doc.text(lyrics, 10, 30, { maxWidth: 180 });

  // === Página 2: Performances ===
  if (song.performances && song.performances.length > 0) {
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Performances', 10, 10);
    
    doc.setFontSize(12);
    let y = 20;

    song.performances.forEach((p, index) => {
      // Nome do cantor
      doc.text(`${index + 1}. ${p.name || 'Sem nome'}`, 10, y);
      // Tom da performance
      if (p.key) doc.text(`Tom: ${p.key}`, 80, y);
      // Data
      if (p.date) doc.text(`Data: ${p.date}`, 140, y);
      y += 8;
      // Local, se houver
      if (p.location) {
        doc.text(`Local: ${p.location}`, 10, y);
        y += 8;
      }
      // Notas, se houver
      if (p.notes) {
        const splitNotes = doc.splitTextToSize(`Notas: ${p.notes}`, 180);
        doc.text(splitNotes, 10, y);
        y += splitNotes.length * 6 + 4;
      }
      y += 4;
      // Quebra de página automática, se necessário
      if (y > 270 && index < song.performances.length - 1) {
        doc.addPage();
        y = 20;
      }
    });
  }
  // Salvar o PDF
  doc.save(`${song.title || 'musica'}.pdf`);
}

export function downloadMonthlySchedule(schedule, singers, musicians, instruments, songs) {
  if (!schedule || schedule.length === 0) {
    alert('Nenhuma escala encontrada para este mês.');
    return;
  }

  const doc = new jsPDF();

  // Título e data
  doc.setFontSize(16);
  doc.text('Escalas do Mês', 14, 15);
  const now = new Date();
  const formatted = now.toLocaleDateString('pt-BR');
  doc.setFontSize(11);
  doc.text(`Gerado em: ${formatted}`, 14, 22);

  // Monta tabela de dados
  const tableData = schedule.map(sch => {
    const leader = singers.find(s => s.id === sch.leaderId);
    const leaderName = leader ? `${leader.firstName} ${leader.lastName}` : '—';

    const singerNames = (sch.singers || [])
      .map(id => {
        const s = singers.find(s => s.id === id);
        return s ? `${s.firstName} ${s.lastName}` : '—';
      })
      .join(', ') || '—';

    const musicianNames = Object.entries(sch.musiciansSelection || {})
      .map(([instId, musId]) => {
        const inst = instruments.find(i => i.id === instId)?.name;
        const mus = musicians.find(m => m.id === musId)?.name;
        return `${inst || 'Instrumento'}: ${mus || '—'}`;
      })
      .join(' | ') || '—';

    const songList = (sch.songsSelection || [])
      .map(s => {
        const song = songs.find(song => song.id === s.songId);
        return song ? `${song.title} (${s.key || '-'})` : '—';
      })
      .join(', ') || '—';

    return [
      sch.date,
      leaderName,
      singerNames,
      musicianNames,
      songList
    ];
  });

  // Cabeçalhos
  const headers = [['Data', 'Dirigente', 'Cantores', 'Músicos', 'Músicas']];

  // Usa o plugin explicitamente
  autoTable(doc, {
    head: headers,
    body: tableData,
    startY: 28,
    theme: 'grid',
    headStyles: { fillColor: [92, 68, 56], textColor: 255, fontStyle: 'bold' },
    bodyStyles: { textColor: 46, fontSize: 9 },
    styles: { cellPadding: 3, halign: 'left', valign: 'middle' },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 35 },
      2: { cellWidth: 40 },
      3: { cellWidth: 45 },
      4: { cellWidth: 45 }
    }
  });

  doc.save('Escala_Mensal.pdf');
}



