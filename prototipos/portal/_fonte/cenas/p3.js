const I = mk({ x: 0, y: 0, tw: 64, th: 32 });
const ET = ['fila', 'andamento', 'validacao', 'devolvida', 'aprovada', 'bloqueada'];
CENA = { vb: [1000, 620], fn(q) {
  let s = `<text class="cap" x="28" y="64">Tarefas por etapa</text><text class="cap" x="28" y="364">Agentes</text>`;
  ET.forEach((e, i) => {
    const cx = 100 + i * 160, cy = 235, ts = q.tarefas.filter((t) => t.estado === e);
    if (i) s += `<path d="M${cx - 88},${cy - 7} l11,7 l-11,7z" fill="var(--muted)" opacity=".55"/>`;
    const [gx, gy] = I.S(cx, cy);
    let g = boxAt(I, cx, cy, 2.2, 2.2, 8, 'pl2');
    ts.slice(0, 4).forEach((t, k) => {
      g += objT(t, box(I, gx - 1.1 + .15 + (k % 2) * 1.3, gy - 1.1 + .15 + Math.floor(k / 2) * 1.3, 8, .6, .6, 16, `t-${t.estado}`), false);
    });
    g += txt(cx, cy + 58, EST_TA[e], `${ts.length} tarefa(s)`);
    s += `<g data-obj="etapa-${e}" class="t-${e}">${g}</g>`;
  });
  q.agentes.forEach((a, i) => {
    const cx = 125 + i * 150, cy = 470;
    s += obj(a.id, boxAt(I, cx, cy, 1.6, 1.6, 3, 'pl') + boxAt(I, cx, cy, .8, .8, 28, '', 3) + txt(cx, cy + 48, nome(a.id), EST_AG[a.estado]));
  });
  return s;
} };
