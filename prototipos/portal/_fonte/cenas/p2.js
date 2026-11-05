const I = mk({ x: 0, y: 0, tw: 64, th: 32 });
CENA = { vb: [1000, 620], fn(q) {
  const max = Math.max(1, ...q.agentes.map(tok));
  const H = (a) => 14 + 150 * Math.log10(1 + tok(a)) / Math.log10(1 + max);
  let s = `<text class="cap" x="28" y="48">Altura = tokens (escala log)</text>`;
  q.agentes.forEach((a, i) => {
    const cx = 120 + i * 152, cy = 470, h = H(a), t = tok(a) || 1;
    let g = boxAt(I, cx, cy, 2.3, 2.3, 4, 'pl'), z = 4;
    for (const [v, op] of [[a.tokens.cache, .45], [a.tokens.entrada, .72], [a.tokens.saida, 1]]) {
      if (!v) continue;
      const sh = Math.max(3, h * v / t);
      g += `<g opacity="${op}">${boxAt(I, cx, cy, 1.3, 1.3, sh, '', z)}</g>`; z += sh;
    }
    g += txt(cx, cy - z - 30, fmt(tok(a)), '') + txt(cx, cy + 57, nome(a.id), EST_AG[a.estado]);
    s += obj(a.id, g);
  });
  [['cache', .45], ['entrada', .72], ['saída', 1]].forEach(([n, op], i) => {
    const x = 380 + i * 110;
    s += `<rect x="${x}" y="584" width="12" height="12" rx="3" fill="var(--accent)" opacity="${op}"/><text class="sub" x="${x + 18}" y="594" style="stroke:none">${n}</text>`;
  });
  return s;
} };
