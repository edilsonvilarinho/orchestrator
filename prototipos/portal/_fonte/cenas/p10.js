const I = mk({ x: 284, y: 90, tw: 80, th: 40 });
CENA = { vb: [1000, 560], fn(q) {
  const am = q.agentes.find((a) => a.tipo === 'am') || q.agentes[0];
  const ws = q.agentes.filter((a) => a !== am);
  const HUB = [1, 4], P = I.P;
  const est = ws.map((a, i) => { const x = 4 + 2.8 * i, up = i % 2 === 0; return { a, x, y: 4 + (up ? -2.6 : 2.6), up }; });
  const xf = est.length ? est[est.length - 1].x : 4;
  const pt = (g) => P(g[0], g[1]).map((v) => v.toFixed(1)).join(',');
  let s = `<path class="trk" d="M${pt(HUB)} L${pt([xf, 4])}"/>`;
  est.forEach((e) => { s += `<path class="trk" d="M${pt([e.x, 4])} L${pt([e.x, e.y])}"/>`; });
  est.forEach((e) => { if (e.a.estado === 'trabalhando') s += `<path class="cx on" d="M${pt(HUB)} L${pt([e.x, 4])} L${pt([e.x, e.y])}"/>`; });
  const rota = {}; est.forEach((e) => { rota[e.a.id] = `M${pt(HUB)} L${pt([e.x, 4])} L${pt([e.x, e.y])}`; });
  for (const f of falasRecentes(4)) { const d = rota[f.para] || rota[f.de]; if (d) s += pacote(d, 3); }
  const [hx, hy] = P(...HUB);
  s += obj(am.id, boxAt(I, hx, hy, 2, 2, 16, 'pl') + boxAt(I, hx, hy, 1.2, 1.2, 8, '', 16) + txt(hx, hy + 62, nome(am.id), EST_AG[am.estado]));
  est.forEach((e) => {
    const [x, y] = P(e.x, e.y), tarefa = q.tarefas.filter((t) => t.dono === e.a.id).pop();
    let g = boxAt(I, x, y, 1.2, 1.2, 10, 'pl') + boxAt(I, x, y, .7, .7, 6, '', 10);
    g += e.up ? txt(x + 62, y, nome(e.a.id), EST_AG[e.a.estado], 'start') : txt(x - 62, y, nome(e.a.id), EST_AG[e.a.estado], 'end');
    if (tarefa) g += pill(x, y - 38, tarefa.id);
    s += obj(e.a.id, g);
  });
  return s;
} };
