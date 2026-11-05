const I = mk({ x: 0, y: 0, tw: 72, th: 36 });
const POS = [[200, 230], [500, 230], [800, 230], [200, 450], [500, 450], [800, 450]];
CENA = { vb: [1000, 620], fn(q) {
  return q.agentes.slice(0, 6).map((a, i) => {
    const [cx, cy] = POS[i], [gx, gy] = I.S(cx, cy);
    const g = boxAt(I, cx, cy, 3.2, 2.6, 2, a.tipo === 'am' ? 'pl2' : 'pl')
      + box(I, gx - 1.0, gy - .7, 2, 2.0, 1.1, 20, 'pl2')
      + box(I, gx - .4, gy - .02, 22, .8, .3, 1.2, 'pl')
      + box(I, gx - .45, gy - .55, 22, .9, .12, 24, 'mon')
      + txt(cx, cy + 70, nome(a.id), EST_AG[a.estado]);
    return obj(a.id, g);
  }).join('');
} };
