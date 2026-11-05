const I = mk({ x: 0, y: 0, tw: 80, th: 40 });
CENA = { vb: [1000, 620], fn(q) {
  const am = q.agentes.find((a) => a.tipo === 'am') || q.agentes[0];
  const ws = q.agentes.filter((a) => a !== am);
  const C = [500, 300], RX = 370, RY = 185, P = { [am.id]: C };
  ws.forEach((a, i) => { const t = (-90 + i * 360 / ws.length) * Math.PI / 180; P[a.id] = [C[0] + RX * Math.cos(t), C[1] + RY * Math.sin(t)]; });
  let s = `<ellipse class="ring" cx="${C[0]}" cy="${C[1]}" rx="${RX}" ry="${RY}"/>`;
  ws.forEach((a) => { const [x, y] = P[a.id]; s += `<path class="cx${a.estado === 'trabalhando' ? ' on' : ''}" d="M${C[0]},${C[1]} L${x},${y}"/>`; });
  for (const f of falasRecentes(4)) if (P[f.de] && P[f.para]) s += pacote(`M${P[f.de][0]},${P[f.de][1]} L${P[f.para][0]},${P[f.para][1]}`);
  s += obj(am.id, boxAt(I, C[0], C[1], 2.8, 2.8, 14, 'pl') + boxAt(I, C[0], C[1], 1.8, 1.8, 8, '', 14) + txt(C[0], C[1] + 78, nome(am.id), EST_AG[am.estado]));
  ws.forEach((a) => {
    const [x, y] = P[a.id];
    s += obj(a.id, boxAt(I, x, y, 1.8, 1.8, 10, 'pl') + boxAt(I, x, y, 1, 1, 8 + Math.min(a.ferramentas * 3, 30), '', 10) + txt(x, y + 58, nome(a.id), EST_AG[a.estado]));
  });
  return s;
} };
