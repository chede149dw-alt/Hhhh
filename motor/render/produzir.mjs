#!/usr/bin/env node
// Comando único: node render/produzir.mjs <pasta do projeto> [--processos N] [--sem-voz] [--so-checar]
// 1 voz → 2 planos → 3 áudio → 4 quadros (paralelo) → 5 junção → 6 folha de contato → 7 checagens (falham o build)
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { renderizar } from './renderizar.mjs';
import { compilarProjeto } from '../direcao/compilar.mjs';
import { iniciarServidor, RAIZ } from './servidor.mjs';
import { abrirNavegador, abrirPagina, capturar } from './navegador.mjs';

const args = process.argv.slice(2);
const pasta = path.resolve(args[0]);
const proj = path.basename(pasta);
const opc = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const N = +opc('processos', 4);
const AQUI = path.dirname(new URL(import.meta.url).pathname);
const py = (script, ...a) => { const r = spawnSync('python3', [path.join(AQUI, '..', 'audio', script), ...a], { stdio: 'inherit' }); if (r.status) throw new Error(`${script} falhou`); };
const passo = (n, txt) => console.log(`\n== ${n}. ${txt}`);
const t0 = Date.now();
const relatorio = { projeto: proj, checagens: [] };
const checar = (nome, ok, detalhe) => { relatorio.checagens.push({ nome, ok, detalhe }); console.log(`  ${ok ? '✅' : '❌'} ${nome}: ${detalhe}`); };

const soChecar = args.includes('--so-checar');
if (!soChecar) {
  passo(1, 'voz (Edge TTS)');
  if (!args.includes('--sem-voz')) py('voz.py', pasta);
  passo(2, 'planos (diretor)');
  const tl0 = compilarProjeto(pasta);
  console.log(`  ${tl0.planos.length} planos, ${tl0.duracao.toFixed(2)} s`);
  passo(3, 'áudio (efeitos + mixagem)');
  py('sfx.py'); py('mixar.py', pasta);
}
const tl = JSON.parse(fs.readFileSync(path.join(pasta, 'timeline.json')));
const fps = tl.fps || 60, total = Math.round(tl.duracao * fps);
const dirQ = path.join(pasta, 'quadros');
if (!soChecar) {
  passo(4, `quadros: ${total} quadros a ${fps} fps, ${N} processos`);
  fs.rmSync(dirQ, { recursive: true, force: true });
  let feitos = 0; const ti = Date.now();
  await renderizar({
    pagina: `motor/visual/episodio.html?projeto=${proj}`,
    quadros: Array.from({ length: total }, (_, i) => i), saida: dirQ, fps, processos: N, formato: 'jpeg',
    aoQuadro: () => { if (++feitos % 120 === 0) { const s = (Date.now() - ti) / 1000; console.log(`  ${feitos}/${total} (${(feitos / s).toFixed(2)} q/s, faltam ~${Math.round((total - feitos) / (feitos / s) / 60)} min)`); } },
  });
  passo(5, 'junção (ffmpeg)');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(fps), '-i', path.join(dirQ, 'quadro_%05d.jpg'), '-i', path.join(pasta, 'audio.wav'),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', String(fps), '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', path.join(pasta, 'final.mp4')]);
  passo(6, 'folha de contato (20 quadros)');
  const sel = Array.from({ length: 20 }, (_, i) => Math.round((i + 0.5) * total / 20));
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(pasta, 'final.mp4'), '-vf', `select='${sel.map((s) => `eq(n\\,${s})`).join('+')}',scale=216:384,tile=5x4`, '-frames:v', '1', '-vsync', 'vfr', path.join(pasta, 'folha_contato.png')]);
}

passo(7, 'checagens');
const mp4 = path.join(pasta, 'final.mp4');
// duração
const durV = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp4]).toString();
checar('duração bate com o roteiro (±0,5 s)', Math.abs(durV - tl.duracao) <= 0.5, `vídeo ${durV.toFixed(2)} s, roteiro ${tl.duracao.toFixed(2)} s`);
// LUFS
const lufsTxt = spawnSync('ffmpeg', ['-hide_banner', '-i', mp4, '-af', 'ebur128=framelog=quiet', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
const lufs = +[...lufsTxt.matchAll(/I:\s+(-?[\d.]+) LUFS/g)].at(-1)[1];
checar('loudness entre -14,5 e -13,5 LUFS', lufs >= -14.5 && lufs <= -13.5, `${lufs.toFixed(1)} LUFS`);
// preto e trecho parado: quadros reduzidos em cinza (64x114)
const W = 64, H = 114;
const bruto = execFileSync('ffmpeg', ['-v', 'error', '-i', mp4, '-vf', `scale=${W}:${H},format=gray`, '-f', 'rawvideo', '-'], { maxBuffer: 1 << 30 });
const nq = Math.floor(bruto.length / (W * H));
let pretos = 0, parado = 0, maiorParado = 0, iniParado = 0, ondeParado = 0;
const permitido = (i) => tl.efeitos.some((e) => e.tipo === 'preto' && i / fps >= e.ini - 0.1 && i / fps <= e.fim + 0.1);
for (let i = 0; i < nq; i++) {
  const f = bruto.subarray(i * W * H, (i + 1) * W * H);
  let max = 0; for (const v of f) if (v > max) max = v;
  if (max < 12 && !permitido(i)) pretos++;
  if (i > 0) {
    const g = bruto.subarray((i - 1) * W * H, i * W * H); let dmax = 0;   // maior mudança de pixel (cenas escuras têm média baixa)
    for (let k = 0; k < f.length; k++) { const d = Math.abs(f[k] - g[k]); if (d > dmax) dmax = d; }
    if (dmax <= 3 && !permitido(i)) { if (!parado) iniParado = i; parado++; if (parado > maiorParado) { maiorParado = parado; ondeParado = iniParado; } } else parado = 0;
  }
}
checar('nenhum quadro totalmente preto (fora do preto declarado)', pretos === 0, `${pretos} de ${nq}`);
checar('nenhum trecho parado > 1 s (fora de pausa/preto declarado)', maiorParado <= fps, `maior: ${(maiorParado / fps).toFixed(2)} s${maiorParado ? ` em ${(ondeParado / fps).toFixed(2)} s` : ''}`);
// sincronia: cada evento (palavra marcada) vs. o som no áudio (início de energia) — tolerância 2 quadros
const W8 = JSON.parse(fs.readFileSync(path.join(pasta, 'words.json')));
let piorSync = 0;
for (const ev of tl.eventos) {
  const w = W8.palavras.find((p) => p.plano === ev.plano && p.texto.toLowerCase().replace(/[^a-zà-ú0-9]/gi, '') === ev.palavra.toLowerCase().replace(/[^a-zà-ú0-9]/gi, ''));
  const esperado = ev.acao === 'corte_preto_batida' ? w.fim + 0.8 : w.ini;
  piorSync = Math.max(piorSync, Math.abs(ev.t - esperado));
}
const sonsEv = tl.sons.filter((s) => ['batida', 'grade_impacto'].includes(s.som));   // sons de ataque seco e alto
const audio = execFileSync('ffmpeg', ['-v', 'error', '-i', path.join(pasta, 'audio.wav'), '-ac', '1', '-ar', '8000', '-f', 's16le', '-'], { maxBuffer: 1 << 28 });
const amp = new Int16Array(audio.buffer, audio.byteOffset, audio.length / 2);
let piorAudio = 0;
for (const s of sonsEv) {   // correlação: onde o próprio arquivo do efeito aparece no áudio final (±150 ms)
  const sfx = execFileSync('ffmpeg', ['-v', 'error', '-i', path.join(AQUI, '..', 'audio', 'sfx', `${s.som}.wav`), '-t', '0.25', '-ac', '1', '-ar', '8000', '-f', 's16le', '-'], { maxBuffer: 1 << 24 });
  const ref = new Int16Array(sfx.buffer, sfx.byteOffset, sfx.length / 2);
  const c = Math.round(s.t * 8000); let melhor = -Infinity, onde = c;
  for (let lag = -1200; lag <= 1200; lag++) {
    let x = 0; for (let k = 0; k < ref.length; k += 2) x += ref[k] * (amp[c + lag + k] || 0);
    if (x > melhor) { melhor = x; onde = c + lag; }
  }
  piorAudio = Math.max(piorAudio, Math.abs(onde - c) / 8000);
}
checar('sincronia: ação na palavra marcada (≤ 2 quadros)', piorSync <= 2 / fps, `pior ${(piorSync * 1000).toFixed(0)} ms em ${tl.eventos.length} eventos`);
checar('sincronia: som do impacto no instante marcado (≤ 2 quadros)', piorAudio <= 2 / fps, `pior ${(piorAudio * 1000).toFixed(0)} ms em ${sonsEv.length} sons`);
// determinismo + legendas dentro da tela (na página)
{
  const srv = await iniciarServidor(); const nav = await abrirNavegador();
  try {
    const url = `${srv.url}/motor/visual/episodio.html?projeto=${proj}`;
    const pag = await abrirPagina(nav, url);
    const qa = Math.round(total * 0.35), qb = Math.round(total * 0.7);
    const md5 = (b) => crypto.createHash('md5').update(b).digest('hex');
    const a1 = md5(await capturar(pag, qa / fps, 'jpeg')), b1 = md5(await capturar(pag, qb / fps, 'jpeg'));
    const b2 = md5(await capturar(pag, qb / fps, 'jpeg')), a2 = md5(await capturar(pag, qa / fps, 'jpeg'));
    checar('determinismo: quadros repetidos fora de ordem dão o mesmo md5', a1 === a2 && b1 === b2, `${qa}: ${a1.slice(0, 8)}=${a2.slice(0, 8)} · ${qb}: ${b1.slice(0, 8)}=${b2.slice(0, 8)}`);
    const fora = await pag.evaluate(async () => {
      let pior = 0; const el = document.getElementById('legenda');
      for (const g of window.__grupos) { await window.quadro(g.ini + 0.15); const r = el.getBoundingClientRect(); const spans = [...el.querySelectorAll('span')].map((s) => s.getBoundingClientRect());
        for (const b of spans) pior = Math.max(pior, -b.left, b.right - 1080, -b.top, b.bottom - 1920); }   // as letras, não a caixa
      return { pior, n: window.__grupos.length };
    });
    checar('legendas dentro da tela 1080x1920', fora.pior <= 0, `${fora.n} grupos, pior estouro ${fora.pior.toFixed(0)} px`);
  } finally { await nav.close(); await srv.fechar(); }
}
relatorio.ok = relatorio.checagens.every((c) => c.ok);
relatorio.minutos = +((Date.now() - t0) / 60000).toFixed(1);
fs.writeFileSync(path.join(pasta, 'relatorio.json'), JSON.stringify(relatorio, null, 2));
console.log(`\n${relatorio.ok ? 'PRONTO ✅' : 'FALHOU ❌'} — ${mp4} (${relatorio.minutos} min)`);
process.exit(relatorio.ok ? 0 : 1);
