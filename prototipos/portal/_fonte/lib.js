const DADOS = __DADOS__;
const EST_AG = { ocioso: 'Ocioso', trabalhando: 'Trabalhando', aguardando: 'Aguardando', concluido: 'Concluído', erro: 'Erro' };
const EST_TA = { fila: 'Fila', andamento: 'Em andamento', validacao: 'Validação', aprovada: 'Aprovada', devolvida: 'Devolvida', bloqueada: 'Bloqueada' };
const TEMAS = ['sistema', 'claro', 'escuro'];
let Q = DADOS.quadros[0], SEL = 'am', IDX = 0, AUTO = true, TIMER = null, CENA = null;

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '—').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1).replace('.0', '') + 'k' : String(n ?? 0));
const curto = (s, n) => { s = String(s ?? ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
const agente = (id) => Q.agentes.find((a) => a.id === id);
const nome = (id) => { const a = agente(id); return !a ? String(id) : a.tipo === 'am' ? 'orquestradora' : a.tipo; };
const tok = (a) => (a.tokens?.entrada || 0) + (a.tokens?.saida || 0) + (a.tokens?.cache || 0);
const hora = (iso) => { const d = new Date(iso); return isNaN(d) ? '—' : d.toLocaleTimeString('pt-BR'); };

// ---------------------------------------------------------------- geometria isométrica
// P(x,y,z): grade -> tela. x cresce para baixo-direita, y para baixo-esquerda, z para cima (px).
// S(sx,sy): tela -> grade (z=0). Permite posicionar objetos em coordenadas de tela, sem sobreposição calculada à mão.
function mk(o) {
  const P = (x, y, z = 0) => [o.x + (x - y) * o.tw / 2, o.y + (x + y) * o.th / 2 - z];
  const S = (sx, sy) => { const u = (sx - o.x) * 2 / o.tw, v = (sy - o.y) * 2 / o.th; return [(u + v) / 2, (v - u) / 2]; };
  return { P, S, o };
}
const pts = (a) => a.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
const poly = (a, c, x = '') => `<polygon class="${c}" points="${pts(a)}" ${x}/>`;
// Face l = y+d (frente-esquerda), r = x+w (frente-direita), t = topo.
function box(I, x, y, z, w, d, h, c = '') {
  const P = I.P;
  return `<g class="bx ${c}">`
    + poly([P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x, y + d, z)], 'l')
    + poly([P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x + w, y, z)], 'r')
    + poly([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)], 't')
    + '</g>';
}
// Caixa centrada no ponto de tela (sx,sy) do chão.
function boxAt(I, sx, sy, w, d, h, c = '', z = 0) { const [gx, gy] = I.S(sx, sy); return box(I, gx - w / 2, gy - d / 2, z, w, d, h, c); }
// Contorno do piso (rombo) para wireframes e trilhos.
function rombo(I, sx, sy, w, d, z = 0, c = '') {
  const [gx, gy] = I.S(sx, sy), P = I.P;
  return poly([P(gx - w / 2, gy - d / 2, z), P(gx + w / 2, gy - d / 2, z), P(gx + w / 2, gy + d / 2, z), P(gx - w / 2, gy + d / 2, z)], c);
}
const txt = (x, y, a, b = '', anchor = 'middle') =>
  `<text class="lab" x="${x}" y="${y}" text-anchor="${anchor}">${esc(a)}</text>`
  + (b ? `<text class="sub" x="${x}" y="${y + 14}" text-anchor="${anchor}">${esc(b)}</text>` : '');
// Objeto clicável de agente. data-obj alimenta o verificador de sobreposição.
const obj = (id, inner) => {
  const a = agente(id);
  return `<g class="o a-${a.estado}${SEL === id ? ' sel' : ''}" data-obj="${esc(id)}" data-ag="${esc(id)}" tabindex="0" role="button" aria-label="${esc(nome(id))}, ${EST_AG[a.estado]}">${inner}</g>`;
};
// Objeto clicável de tarefa (seleciona o dono).
const semEx = (s) => String(s ?? '').replace(/^\(exemplo\)\s*/, '');
const pill = (x, y, label) => { const w = 14 + String(label).length * 7; return `<rect class="pill" x="${x - w / 2}" y="${y - 9}" width="${w}" height="18" rx="9"/><text class="num" x="${x}" y="${y + 3.5}" text-anchor="middle">${esc(label)}</text>`; };
const objT = (t, inner, chk = true) =>
  `<g class="o t-${t.estado}${SEL === t.dono ? ' sel' : ''}"${chk ? ` data-obj="${esc(t.id)}"` : ''} data-ag="${esc(t.dono)}" tabindex="0" role="button" aria-label="Tarefa ${esc(t.id)}, ${EST_TA[t.estado]}">${inner}</g>`;
const pintar = (itens) => itens.sort((a, b) => a.k - b.k).map((i) => i.s).join('');
const falasRecentes = (n = 3) => Q.falas.slice(-n);
const reduz = () => matchMedia('(prefers-reduced-motion:reduce)').matches;
// Ponto dourado que corre por um caminho (fala em curso).
const pacote = (d, dur = 2.4) => reduz() ? '' : `<circle class="pkt" r="4"><animateMotion dur="${dur}s" repeatCount="indefinite" path="${d}"/></circle>`;

// ---------------------------------------------------------------- painéis
function cabecalho() {
  const t = Q.totais || {};
  $('#tot').innerHTML = `<span>ativos <b>${t.agentesAtivos ?? 0}</b></span><span>entrada <b>${fmt(t.tokensEntrada)}</b></span><span>saída <b>${fmt(t.tokensSaida)}</b></span><span>cache <b>${fmt(t.tokensCache)}</b></span><span>quadro <b>${IDX + 1}/${DADOS.quadros.length}</b></span>`;
  $('#leg').innerHTML = Object.entries(EST_AG).map(([k, v]) => `<span><i style="background:var(--c-${k})"></i>${v}</span>`).join('')
    + '<span style="margin-left:auto">tarefas:</span>' + Object.entries(EST_TA).map(([k, v]) => `<span><i style="background:var(--c-${k})"></i>${v}</span>`).join('');
}
function painel() {
  const a = agente(SEL) || Q.agentes[0];
  const passos = (DADOS.detalhes?.[a.id]?.passos || []).slice(-4);
  $('#det').innerHTML = `<h2>Agente</h2>
    <div class="ag-h a-${a.estado}"><span class="dot"></span><div><b>${esc(nome(a.id))}</b><small>${esc(a.descricao)}</small></div><span class="chip">${EST_AG[a.estado]}</span></div>
    <p class="ativ">${esc(a.atividade)}</p>
    <dl class="kv">
      <div><dt>Modelo</dt><dd>${esc(a.modelo)}</dd></div><div><dt>Ferramentas</dt><dd>${a.ferramentas}</dd></div><div><dt>Erros</dt><dd>${a.erros}</dd></div>
      <div><dt>Entrada</dt><dd>${fmt(a.tokens.entrada)}</dd></div><div><dt>Saída</dt><dd>${fmt(a.tokens.saida)}</dd></div><div><dt>Cache</dt><dd>${fmt(a.tokens.cache)}</dd></div>
    </dl>
    ${passos.length ? '<ul class="l pas" style="margin-top:12px">' + passos.map((p) => `<li class="${p.erro ? 'er' : ''}"><span>${esc(p.ferramenta || p.tipo)}</span>${esc(p.resumo)}</li>`).join('') + '</ul>' : ''}`;
  $('#tar').innerHTML = '<h2>Tarefas</h2><ul class="l">' + (Q.tarefas.map((t) =>
    `<li data-ag="${esc(t.dono)}"><span class="chip t-${t.estado}">${EST_TA[t.estado]}</span> <b>${esc(t.id)}</b> ${esc(t.titulo)}<br><small>${esc(nome(t.dono))}${t.devolucoes ? ` · ${t.devolucoes} devolução(ões)` : ''}</small></li>`).join('') || '<li><small>sem tarefas</small></li>') + '</ul>';
  $('#fal').innerHTML = '<h2>Comunicação</h2><ul class="l">' + (Q.falas.slice(-8).reverse().map((f) =>
    `<li><small>${hora(f.ts)}</small> <b>${esc(nome(f.de))}</b> → <b>${esc(nome(f.para))}</b><br>${esc(f.texto)}</li>`).join('') || '<li><small>sem mensagens</small></li>') + '</ul>';
}
function desenhar(foco) {
  $('#cena').innerHTML = CENA.fn(Q);
  cabecalho(); painel();
  if (foco) $(`#cena [data-ag="${SEL}"]`)?.focus();
}
function quadro(i) { IDX = (i + DADOS.quadros.length) % DADOS.quadros.length; Q = DADOS.quadros[IDX]; desenhar(); }
function ciclo() { clearTimeout(TIMER); if (AUTO) TIMER = setTimeout(() => { quadro(IDX + 1); ciclo(); }, DADOS.intervaloMs || 3500); }

// ---------------------------------------------------------------- tema
function lerTema() { try { const v = localStorage.getItem('proto:tema'); return TEMAS.includes(v) ? v : 'sistema'; } catch { return 'sistema'; } }
function aplicarTema(m) {
  const r = document.documentElement;
  if (m === 'claro') r.setAttribute('data-theme', 'light'); else if (m === 'escuro') r.setAttribute('data-theme', 'dark'); else r.removeAttribute('data-theme');
  $('#tema').textContent = 'Tema: ' + m;
}

// ---------------------------------------------------------------- verificador de sobreposição (SAT entre polígonos convexos)
function formas(g) {
  const out = [];
  g.querySelectorAll('polygon,text,ellipse,circle,rect').forEach((e) => {
    if (e.closest('[data-ign]')) return;
    if (e.tagName === 'polygon') out.push(e.getAttribute('points').trim().split(/\s+/).map((p) => p.split(',').map(Number)));
    else { const b = e.getBBox(); out.push([[b.x, b.y], [b.x + b.width, b.y], [b.x + b.width, b.y + b.height], [b.x, b.y + b.height]]); }
  });
  return out;
}
function proj(p, ax) { let mn = 1e9, mx = -1e9; for (const [x, y] of p) { const v = x * ax[0] + y * ax[1]; if (v < mn) mn = v; if (v > mx) mx = v; } return [mn, mx]; }
function sat(a, b) {
  for (const P of [a, b]) for (let i = 0; i < P.length; i++) {
    const [x1, y1] = P[i], [x2, y2] = P[(i + 1) % P.length];
    const l = Math.hypot(y1 - y2, x2 - x1) || 1, ax = [(y1 - y2) / l, (x2 - x1) / l];
    const [a1, a2] = proj(a, ax), [b1, b2] = proj(b, ax);
    if (a2 <= b1 + 1 || b2 <= a1 + 1) return false;
  }
  return true;
}
function checar() {
  const falhas = [], guarda = [Q, IDX];
  const svg = $('#cena'), vb = svg.viewBox.baseVal;
  DADOS.quadros.forEach((q, qi) => {
    Q = q; svg.innerHTML = CENA.fn(q);
    const os = [...svg.querySelectorAll('[data-obj]')].map((g) => ({ id: g.dataset.obj, f: formas(g) }));
    for (const o of os) for (const f of o.f) for (const [x, y] of f)
      if (x < -1 || y < -1 || x > vb.width + 1 || y > vb.height + 1) { falhas.push(`q${qi}: ${o.id} fora do viewBox`); break; }
    for (let i = 0; i < os.length; i++) for (let j = i + 1; j < os.length; j++)
      if (os[i].f.some((a) => os[j].f.some((b) => sat(a, b)))) falhas.push(`q${qi}: ${os[i].id} x ${os[j].id}`);
  });
  [Q, IDX] = guarda; desenhar();
  return [...new Set(falhas)];
}

function iniciar() {
  const qs = new URLSearchParams(location.search);
  $('#cena').setAttribute('viewBox', `0 0 ${CENA.vb[0]} ${CENA.vb[1]}`);
  aplicarTema(qs.get('tema') === 'escuro' ? (document.documentElement.setAttribute('data-theme', 'dark'), 'escuro') : qs.get('tema') === 'claro' ? (document.documentElement.setAttribute('data-theme', 'light'), 'claro') : lerTema());
  if (qs.get('q')) { IDX = +qs.get('q') % DADOS.quadros.length; Q = DADOS.quadros[IDX]; }
  if (qs.get('sel')) SEL = qs.get('sel');
  if (qs.get('auto') === '0') AUTO = false;
  $('#auto').textContent = AUTO ? 'Pausar' : 'Retomar'; $('#auto').setAttribute('aria-pressed', String(AUTO));
  desenhar(); ciclo();
  document.addEventListener('click', (e) => { const t = e.target.closest?.('[data-ag]'); if (t) { SEL = t.dataset.ag; desenhar(); } });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const t = e.target.closest?.('[data-ag][role="button"]'); if (t) { e.preventDefault(); SEL = t.dataset.ag; desenhar(true); }
  });
  $('#ant').onclick = () => quadro(IDX - 1);
  $('#prox').onclick = () => quadro(IDX + 1);
  $('#auto').onclick = () => { AUTO = !AUTO; $('#auto').textContent = AUTO ? 'Pausar' : 'Retomar'; $('#auto').setAttribute('aria-pressed', String(AUTO)); ciclo(); };
  $('#tema').onclick = () => { const m = TEMAS[(TEMAS.indexOf(lerTema()) + 1) % 3]; try { localStorage.setItem('proto:tema', m); } catch { /* sem storage */ } aplicarTema(m); };
  if (qs.has('checar')) {
    const f = checar(), pre = document.createElement('pre');
    pre.id = 'resultado-checar'; pre.textContent = JSON.stringify({ falhas: f }); document.body.appendChild(pre);
  }
}
