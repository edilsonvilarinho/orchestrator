const I = mk({ x: 450, y: 100, tw: 56, th: 28 });
const COR = { delegacao: 'andamento', retorno: 'aprovada', devolucao: 'devolvida', veredito: 'validacao', fala: 'fila', atividade: 'fila' };
const NOME_TIPO = { delegacao: 'delegação', retorno: 'retorno', devolucao: 'devolução', veredito: 'veredito', fala: 'fala', atividade: 'atividade' };
const PIT = 1.9, D = 1.1, LW = 12.2;
CENA = { vb: [1000, 500], fn(q) {
  const falas = q.falas.slice(-10), idx = {};
  q.agentes.forEach((a, k) => { idx[a.id] = k; });
  const slotX = (i) => .6 + i * 1.1;
  let s = '';
  q.agentes.forEach((a, k) => {
    const y = k * PIT, [lx, ly] = I.P(0, y + D / 2);
    let g = box(I, 0, y, 0, LW, D, 4, 'pl') + `<circle cx="${lx - 12}" cy="${ly}" r="4.5" fill="var(--fc)"/>` + `<text class="lab" x="${lx - 22}" y="${ly + 4}" text-anchor="end">${esc(nome(a.id))}</text>`;
    falas.forEach((f, i) => { if (f.de === a.id) g += box(I, slotX(i), y + (D - .7) / 2, 4, .7, .7, 10, `t-${COR[f.tipo] || 'fila'}`); });
    s += obj(a.id, g);
  });
  falas.forEach((f, i) => {
    if (idx[f.de] === undefined || idx[f.para] === undefined) return;
    const x = slotX(i) + .35, [x1, y1] = I.P(x, idx[f.de] * PIT + D / 2, 4), [x2, y2] = I.P(x, idx[f.para] * PIT + D / 2, 4);
    s += `<path class="lk" d="M${x1},${y1} L${x2},${y2}"/>`;
  });
  Object.keys(COR).forEach((t, i) => { const x = 250 + i * 110; s += `<rect x="${x}" y="462" width="12" height="12" rx="3" class="t-${COR[t]}" fill="var(--fc)"/><text class="sub" x="${x + 18}" y="472" style="stroke:none">${NOME_TIPO[t]}</text>`; });
  return s;
} };
