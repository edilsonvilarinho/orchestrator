const I = mk({ x: 0, y: 0, tw: 64, th: 32 });
const POS = [[190, 250], [500, 250], [810, 250], [190, 500], [500, 500], [810, 500]];
CENA = { vb: [1000, 620], fn(q) {
  return q.agentes.slice(0, 6).map((a, i) => {
    const [cx, cy] = POS[i], z = 70, w = 2.2;
    const g = `<ellipse class="shadow" cx="${cx}" cy="${cy}" rx="56" ry="28"/>`
      + `<g class="fl">${box(I, ...I.S(cx, cy).map((v) => v - w / 2), z, w, w, 6, 'wire')}${boxAt(I, cx, cy, .9, .9, 8 + Math.min(a.ferramentas * 4, 44), '', z + 6)}</g>`
      + txt(cx, cy + 50, nome(a.id), EST_AG[a.estado]);
    return obj(a.id, g);
  }).join('');
} };
