const I = mk({ x: 0, y: 0, tw: 72, th: 36 });
const PISOS = [
  { n: 'Orquestração', f: (a) => a.tipo === 'am', cy: 170 },
  { n: 'Execução', f: (a) => a.tipo !== 'am' && a.tipo !== 'test-runner', cy: 405 },
  { n: 'Verificação', f: (a) => a.tipo === 'test-runner', cy: 640, tarefas: true },
];
const CX = 330;
CENA = { vb: [1000, 780], fn(q) {
  let s = '', n = 0;
  PISOS.forEach((p) => {
    const [gx, gy] = I.S(CX, p.cy), slot = (k, w) => [gx - 5.25 + .7 + k * 2.4 + (1 - w) / 2, gy - w / 2];
    s += `<g data-ign>${boxAt(I, CX, p.cy, 10.5, 2, 10, 'pl')}</g>`;
    const itens = q.agentes.filter(p.f).map((a) => ({ a })), ts = p.tarefas ? q.tarefas.slice(0, 3) : [];
    let k = 0, linhas = [];
    itens.forEach(({ a }) => {
      const [x, y] = slot(k++, 1), num = ++n, [bx, by] = I.P(x + .5, y + .5, 10 + 34);
      s += obj(a.id, box(I, x, y, 10, 1, 1, 34) + pill(bx, by - 16, num));
      linhas.push({ id: a.id, t: nome(a.id), sub: EST_AG[a.estado], cls: `a-${a.estado}`, num });
    });
    ts.forEach((t) => {
      const [x, y] = slot(k++, .8), [bx, by] = I.P(x + .4, y + .4, 10 + 14);
      s += objT(t, box(I, x, y, 10, .8, .8, 14) + pill(bx, by - 16, t.id));
      linhas.push({ id: t.dono, t: `${t.id} · ${semEx(t.titulo)}`, sub: EST_TA[t.estado], cls: `t-${t.estado}`, num: t.id });
    });
    s += `<text class="cap" x="620" y="${p.cy - 62}">${p.n}</text>`;
    linhas.slice(0, 4).forEach((l, r) => {
      const y = p.cy - 34 + r * 36;
      s += `<g class="${l.cls}" data-ag="${esc(l.id)}" style="cursor:pointer">${pill(644, y, l.num)}<text class="lab" x="676" y="${y - 1}">${esc(curto(l.t, 28))}</text><text class="sub" x="676" y="${y + 13}">${esc(l.sub)}</text></g>`;
    });
  });
  return s;
} };
