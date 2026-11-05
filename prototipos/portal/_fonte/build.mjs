// Gera prototipos/portal/pN/index.html a partir de base.html + lib.js + cenas/pN.js. Sem dependências.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const saida = path.resolve(aqui, '..');
const ler = (p) => fs.readFileSync(path.join(aqui, p), 'utf8');

const ex = JSON.parse(fs.readFileSync(path.resolve(aqui, '../../../skills/orchestrate/portal/web/exemplo.json'), 'utf8'));
const dados = JSON.stringify({ intervaloMs: ex.intervaloMs, quadros: ex.quadros, detalhes: ex.detalhes });

const ESCURO = `
  --bg:#0c0f14;--surface:#141920;--fg:#e8ecf2;--muted:#8b96a6;--line:#252c37;--accent:#6ea0ff;
  --plate:#1b232d;--plate-2:#27313e;--edge:rgba(0,0,0,.55);--halo:#0c0f14;
  --sh-l:24%;--sh-r:42%;
  --c-ocioso:#58667a;--c-trabalhando:#5b9bff;--c-aguardando:#f5b04c;--c-concluido:#3fcf8e;--c-erro:#ff6369;
  --c-fila:#58667a;--c-andamento:#5b9bff;--c-validacao:#a18bff;--c-aprovada:#3fcf8e;--c-devolvida:#f5b04c;--c-bloqueada:#ff6369;
  color-scheme:dark;`;

const META = JSON.parse(ler('meta.json'));
const base = ler('base.html');
const lib = ler('lib.js').replace('__DADOS__', () => dados);

for (const m of META) {
  const cena = ler(`cenas/${m.id}.js`);
  const html = base
    .replaceAll('__ESCURO__', () => ESCURO)
    .replaceAll('__TITULO__', () => `${m.id.toUpperCase()} ${m.nome}`)
    .replaceAll('__ID__', () => m.id.toUpperCase())
    .replaceAll('__NOME__', () => m.nome)
    .replaceAll('__LAYOUT__', () => m.layout)
    .replace('__LIB__', () => lib)
    .replace('__CENA__', () => cena);
  fs.mkdirSync(path.join(saida, m.id), { recursive: true });
  fs.writeFileSync(path.join(saida, m.id, 'index.html'), html);
}

const cartoes = META.map((m) => `
  <article class="c">
    <div class="h"><b>${m.id.toUpperCase()} · ${m.nome}</b><a href="${m.id}/index.html" target="_blank" rel="noopener">abrir</a></div>
    <p>${m.desc}</p>
    <iframe src="${m.id}/index.html?auto=0&q=3" title="${m.nome}" loading="lazy"></iframe>
  </article>`).join('');
fs.writeFileSync(path.join(saida, 'index.html'), `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Galeria · protótipos do portal</title>
<style>
:root{--bg:#f3f5f8;--fg:#12161c;--muted:#5a6575;--line:#dde2e9;--surface:#fff;--accent:#2f6df6;color-scheme:light dark}
@media (prefers-color-scheme:dark){:root{--bg:#0c0f14;--fg:#e8ecf2;--muted:#8b96a6;--line:#252c37;--surface:#141920;--accent:#6ea0ff}}
body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.45 ui-sans-serif,system-ui,"Segoe UI",sans-serif}
header{padding:20px 24px 4px}h1{margin:0;font-size:20px}header p{margin:4px 0 0;color:var(--muted)}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(520px,1fr));gap:18px;padding:18px 24px 32px}
.c{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:6px}
.h{display:flex;justify-content:space-between}.h a{color:var(--accent)}
.c p{margin:0;color:var(--muted);font-size:13px;min-height:38px}
iframe{width:100%;aspect-ratio:16/10;border:1px solid var(--line);border-radius:10px;background:var(--bg)}
</style></head><body>
<header><h1>Portal · 10 protótipos isométricos</h1><p>Mesmos dados (exemplo.json), mesmo contrato. Cada um funciona em tema claro e escuro (botão “Tema” ou preferência do sistema). Clique em um agente na cena para ver o detalhe.</p></header>
<div class="g">${cartoes}</div></body></html>`);
console.log(`ok: ${META.length} protótipos em ${saida}`);
