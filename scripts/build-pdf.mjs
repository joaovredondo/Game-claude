// Gera dist/Aetherforge-Roadmap.pdf a partir de docs/ROADMAP.md
// Renderiza um HTML moderno com o Chromium (via Playwright) e imprime em PDF.
//
// Uso: node scripts/build-pdf.mjs
//
// Requer o Chromium do ambiente (Playwright). Se o Playwright não resolver
// localmente, tentamos o caminho global (npm root -g).

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ROADMAP = join(ROOT, 'docs', 'ROADMAP.md');
const OUT_DIR = join(ROOT, 'dist');
const OUT_PDF = join(OUT_DIR, 'Aetherforge-Roadmap.pdf');

/* ---------- Resolver Playwright (local ou global) ---------- */
async function loadChromium() {
  try {
    return (await import('playwright')).chromium;
  } catch {
    try {
      const gRoot = execSync('npm root -g').toString().trim();
      const req = createRequire(join(gRoot, 'noop.js'));
      return req('playwright').chromium;
    } catch (e) {
      console.error('Não foi possível carregar o Playwright:', e.message);
      process.exit(1);
    }
  }
}

/* ---------- Mini conversor Markdown -> HTML ----------
   Suporta os construtos usados no ROADMAP.md: headings, hr, tabelas,
   listas, blockquote, negrito, código inline e links. */
function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function inline(s) {
  let t = escapeHtml(s);
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return t;
}
function rarityClass(cell) {
  const map = {
    'Comum': 'r-common', 'Incomum': 'r-uncommon', 'Raro': 'r-rare',
    'Épico': 'r-epic', 'Lendário': 'r-legendary', 'Mítico': 'r-mythic', 'Divino': 'r-divine',
  };
  for (const k in map) if (cell.includes(k)) return map[k];
  return '';
}
function renderTable(rows) {
  const header = rows[0].slice(1, -1).split('|').map((c) => c.trim());
  const body = rows.slice(2).map((r) => r.slice(1, -1).split('|').map((c) => c.trim()));
  let h = '<table><thead><tr>';
  for (const c of header) h += `<th>${inline(c)}</th>`;
  h += '</tr></thead><tbody>';
  for (const row of body) {
    h += '<tr>';
    for (const c of row) {
      const cls = rarityClass(c);
      h += `<td class="${cls}">${inline(c)}</td>`;
    }
    h += '</tr>';
  }
  h += '</tbody></table>';
  return h;
}
function mdToHtml(md) {
  const lines = md.split('\n');
  let html = '';
  let i = 0;
  let listOpen = false;
  const closeList = () => { if (listOpen) { html += '</ul>'; listOpen = false; } };

  while (i < lines.length) {
    const line = lines[i];

    // tabela
    if (/^\s*\|/.test(line)) {
      const tbl = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) { tbl.push(lines[i].trim()); i++; }
      closeList();
      html += renderTable(tbl);
      continue;
    }
    // hr
    if (/^---+\s*$/.test(line)) { closeList(); html += '<hr/>'; i++; continue; }
    // headings
    let m;
    if ((m = line.match(/^###\s+(.*)$/))) { closeList(); html += `<h3>${inline(m[1])}</h3>`; i++; continue; }
    if ((m = line.match(/^##\s+(.*)$/)))  { closeList(); html += `<h2>${inline(m[1])}</h2>`; i++; continue; }
    if ((m = line.match(/^#\s+(.*)$/)))   { closeList(); html += `<h1>${inline(m[1])}</h1>`; i++; continue; }
    // blockquote
    if ((m = line.match(/^>\s?(.*)$/)))   { closeList(); html += `<blockquote>${inline(m[1])}</blockquote>`; i++; continue; }
    // lista
    if ((m = line.match(/^[-*]\s+(.*)$/))) {
      if (!listOpen) { html += '<ul>'; listOpen = true; }
      html += `<li>${inline(m[1])}</li>`; i++; continue;
    }
    // vazio
    if (/^\s*$/.test(line)) { closeList(); i++; continue; }
    // parágrafo
    closeList();
    html += `<p>${inline(line)}</p>`;
    i++;
  }
  closeList();
  return html;
}

/* ---------- Página de capa ---------- */
function coverPage() {
  const date = new Date().toISOString().slice(0, 10);
  return `
  <section class="cover">
    <div class="cover-glow"></div>
    <div class="cover-inner">
      <div class="kicker">ROADMAP DE IMPLEMENTAÇÃO</div>
      <h1 class="cover-title">AETHERFORGE</h1>
      <div class="cover-sub">Caçadores da Fratura</div>
      <p class="cover-desc">Action-loot RPG de navegador — caça, loot com raridade,
      e a <strong>Forja Ativa</strong>: refino de itens (+0 → +11) que mistura sorte e habilidade.</p>
      <div class="rarity-row">
        <span class="pill r-common">Comum</span>
        <span class="pill r-uncommon">Incomum</span>
        <span class="pill r-rare">Raro</span>
        <span class="pill r-epic">Épico</span>
        <span class="pill r-legendary">Lendário</span>
        <span class="pill r-mythic">Mítico</span>
        <span class="pill r-divine">Divino</span>
      </div>
      <div class="cover-foot">Gerado em ${date} · 9 fases · 56 features rastreadas</div>
    </div>
  </section>`;
}

/* ---------- CSS ---------- */
const CSS = `
:root{
  --ink:#0B0E14; --ink2:#1b2230; --muted:#5b6675; --line:#e6e9ef;
  --accent:#7c3aed; --accent2:#22d3ee;
  --common:#6b7280; --uncommon:#3FB950; --rare:#3B82F6; --epic:#A855F7;
  --legendary:#D97706; --mythic:#EF4444; --divine:#0891b2;
}
*{box-sizing:border-box;}
body{font-family:'Inter','Segoe UI',system-ui,sans-serif;color:var(--ink);margin:0;font-size:12px;line-height:1.55;}
.content{padding:26px 34px;}
h1{font-size:22px;font-weight:800;letter-spacing:-.5px;margin:22px 0 8px;color:var(--ink);}
h2{font-size:16px;font-weight:800;margin:22px 0 6px;color:var(--ink);border-left:4px solid var(--accent);padding-left:10px;}
h3{font-size:13px;font-weight:700;margin:16px 0 4px;color:var(--ink2);}
p{margin:6px 0;color:#243040;}
strong{color:var(--ink);}
code{background:#f2f0fb;color:#5b21b6;padding:1px 5px;border-radius:5px;font-family:'SFMono-Regular',Consolas,monospace;font-size:11px;}
a{color:var(--accent);text-decoration:none;}
hr{border:none;border-top:1px solid var(--line);margin:18px 0;}
ul{margin:6px 0 6px 4px;padding-left:18px;}
li{margin:3px 0;color:#243040;}
blockquote{margin:10px 0;padding:10px 14px;background:linear-gradient(90deg,#faf7ff,#f4fbff);
  border-left:3px solid var(--accent2);border-radius:8px;color:#333c4a;font-size:11.5px;}
table{width:100%;border-collapse:collapse;margin:10px 0 16px;font-size:11px;
  box-shadow:0 1px 0 var(--line);border-radius:10px;overflow:hidden;}
thead th{background:linear-gradient(135deg,#171b26,#2a2140);color:#fff;text-align:left;
  padding:8px 10px;font-weight:700;font-size:10.5px;letter-spacing:.2px;}
tbody td{padding:7px 10px;border-bottom:1px solid var(--line);vertical-align:top;}
tbody tr:nth-child(even) td{background:#fafbfd;}
.r-common{color:var(--common);font-weight:700;}
.r-uncommon{color:var(--uncommon);font-weight:700;}
.r-rare{color:var(--rare);font-weight:700;}
.r-epic{color:var(--epic);font-weight:700;}
.r-legendary{color:var(--legendary);font-weight:700;}
.r-mythic{color:var(--mythic);font-weight:700;}
.r-divine{color:var(--divine);font-weight:700;}

/* Capa */
.cover{position:relative;height:100vh;background:radial-gradient(1200px 600px at 70% -10%,#3b2a63 0%,#0B0E14 55%);
  color:#fff;overflow:hidden;display:flex;align-items:center;page-break-after:always;}
.cover-glow{position:absolute;inset:0;
  background:
   radial-gradient(600px 300px at 15% 90%,rgba(34,211,238,.20),transparent 60%),
   radial-gradient(500px 300px at 90% 30%,rgba(168,85,247,.28),transparent 60%);}
.cover-inner{position:relative;padding:0 60px;max-width:660px;}
.kicker{letter-spacing:5px;font-size:11px;color:#22d3ee;font-weight:700;margin-bottom:14px;}
.cover-title{font-size:64px;font-weight:900;letter-spacing:-2px;line-height:1;margin:0;
  background:linear-gradient(120deg,#fff 30%,#c4b5fd 60%,#67e8f9);-webkit-background-clip:text;background-clip:text;color:transparent;}
.cover-sub{font-size:20px;color:#cbd5e1;font-weight:600;margin-top:6px;letter-spacing:1px;}
.cover-desc{color:#94a3b8;font-size:13px;margin-top:20px;max-width:520px;line-height:1.6;}
.cover-desc strong{color:#e9d5ff;}
.rarity-row{display:flex;gap:8px;margin-top:26px;flex-wrap:wrap;}
.pill{padding:4px 12px;border-radius:999px;font-size:10.5px;font-weight:700;border:1px solid rgba(255,255,255,.14);}
.pill.r-common{color:#cbd5e1;} .pill.r-uncommon{color:#4ade80;} .pill.r-rare{color:#60a5fa;}
.pill.r-epic{color:#c084fc;} .pill.r-legendary{color:#fbbf24;} .pill.r-mythic{color:#f87171;} .pill.r-divine{color:#22d3ee;}
.cover-foot{margin-top:40px;color:#64748b;font-size:11px;border-top:1px solid rgba(255,255,255,.1);padding-top:16px;}
`;

/* ---------- Monta e imprime ---------- */
async function main() {
  if (!existsSync(ROADMAP)) { console.error('ROADMAP.md não encontrado:', ROADMAP); process.exit(1); }
  const md = readFileSync(ROADMAP, 'utf8');
  const body = mdToHtml(md);

  const doc = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<style>${CSS}</style></head><body>
${coverPage()}
<main class="content">${body}</main>
</body></html>`;

  mkdirSync(OUT_DIR, { recursive: true });
  // Guarda o HTML intermediário (útil para debug/preview)
  writeFileSync(join(OUT_DIR, 'roadmap.preview.html'), doc);

  const chromium = await loadChromium();
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(doc, { waitUntil: 'networkidle' });
  await page.pdf({
    path: OUT_PDF,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', bottom: '14mm', left: '0', right: '0' },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate:
      '<div style="width:100%;font-size:8px;color:#94a3b8;padding:0 14mm;display:flex;justify-content:space-between;">' +
      '<span>Aetherforge — Roadmap</span><span>Página <span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
  });
  await browser.close();
  console.log('PDF gerado:', OUT_PDF);
}

main();
