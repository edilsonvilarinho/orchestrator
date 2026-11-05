const I = mk({ x: 0, y: 0, tw: 64, th: 32 });
CENA = { vb: [1000, 620], fn(q) {
  const maxS = Math.max(1, ...q.agentes.map((a) => a.tokens.saida));
  let s = `<text class="cap" x="28" y="48">LEDs = tokens de saída (relativo ao maior)</text>`;
  q.agentes.forEach((a, i) => {
    const cx = 110 + i * 156, cy = 470, w = 1.5, h = 190, [gx, gy] = I.S(cx, cy), x = gx - w / 2, y = gy - w / 2, P = I.P;
    let g = box(I, x, y, 0, w, w, h, 'pl2');
    const lit = a.tokens.saida ? Math.max(1, Math.round(10 * a.tokens.saida / maxS)) : 0;
    for (let r = 0; r < 10; r++) {
      const z0 = 12 + r * 17, z1 = z0 + 10;
      g += poly([P(x + w, y + .2, z1), P(x + w, y + w - .2, z1), P(x + w, y + w - .2, z0), P(x + w, y + .2, z0)], `led ${r < lit ? 'on' : 'off'}`);
    }
    for (let z = 30; z < h; z += 40) { const [a1, b1] = P(x + .2, y + w, z), [a2, b2] = P(x + w - .2, y + w, z); g += `<line class="vent" x1="${a1}" y1="${b1}" x2="${a2}" y2="${b2}"/>`; }
    g += boxAt(I, cx, cy, .6, .6, 6, '', h);
    const tarefa = q.tarefas.filter((t) => t.dono === a.id).pop(), topo = cy - h - 6 - 24;
    if (tarefa) g += pill(cx, topo - 14, tarefa.id);
    g += txt(cx, cy + w * 16 + 22, nome(a.id), EST_AG[a.estado]);
    s += obj(a.id, g);
  });
  return s;
} };
