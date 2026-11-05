const I = mk({ x: 0, y: 0, tw: 64, th: 32 });
CENA = { vb: [1000, 620], fn(q) {
  const am = q.agentes.find((a) => a.tipo === 'am') || q.agentes[0];
  const ws = q.agentes.filter((a) => a !== am);
  const tile = (a, cx, cy, w) => obj(a.id,
    boxAt(I, cx, cy, w, w, 12, 'pl') + boxAt(I, cx, cy, w - .7, w - .7, 5, '', 12)
    + txt(cx, cy + w * 16 + 22, nome(a.id), EST_AG[a.estado]));
  const x0 = 500 - (ws.length - 1) * 80;
  let s = `<text class="cap" x="28" y="52">Orquestração</text><text class="cap" x="28" y="262">Agentes</text><text class="cap" x="28" y="472">Tarefas</text>`;
  ws.forEach((a, i) => { const x = x0 + i * 160; s += `<path class="cx${a.estado === 'trabalhando' ? ' on' : ''}" d="M500,172 V218 H${x} V262"/>`; });
  s += tile(am, 500, 115, 2.6);
  ws.forEach((a, i) => { s += tile(a, x0 + i * 160, 310, 1.8); });
  const ts = q.tarefas.slice(0, 8), t0 = 500 - (ts.length - 1) * 70;
  ts.forEach((t, i) => {
    const cx = t0 + i * 140, cy = 525;
    s += objT(t, boxAt(I, cx, cy, 1.1, 1.1, 16) + txt(cx, cy + 40, t.id, curto(semEx(t.titulo), 20)));
  });
  return s;
} };
