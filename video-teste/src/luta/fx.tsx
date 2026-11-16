import React, { useMemo } from "react";
import { random } from "remotion";

export const W = 1080;
export const H = 1920;
export const ANCORA_Y = 1330; // onde o chão (y = 0 do mundo) fica na tela com a câmera em repouso

const sai = (t: number) => 1 - Math.pow(1 - t, 3);
const lim = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

export type Cam = { x: number; y: number; z: number };

export const tremer = (f: number, amp: number, semente = "t"): [number, number] => [
  (random(`${semente}x${f}`) - 0.5) * 2 * amp,
  (random(`${semente}y${f}`) - 0.5) * 2 * amp,
];

// ---------- Linhas de velocidade (espaço da tela) ----------
export const LinhasVelocidade: React.FC<{
  f: number;
  modo: "h" | "v" | "radial";
  cor?: string;
  n?: number;
  cx?: number;
  cy?: number;
  miolo?: number; // raio livre no centro (modo radial)
  opacidade?: number;
  y0?: number;
  y1?: number;
}> = ({ f, modo, cor = "#fff", n = 36, cx = W / 2, cy = H / 2, miolo = 380, opacidade = 1, y0 = 0, y1 = H }) => {
  const itens = [];
  for (let i = 0; i < n; i++) {
    const r = (k: string) => random(`lv-${k}-${i}-${Math.floor(f / 2)}`);
    if (modo === "radial") {
      const ang = r("a") * Math.PI * 2;
      const r0 = miolo + r("r") * 260;
      const r1 = 1500;
      const larg = 0.006 + r("w") * 0.02;
      const p0 = [cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0];
      const p1 = [cx + Math.cos(ang - larg) * r1, cy + Math.sin(ang - larg) * r1];
      const p2 = [cx + Math.cos(ang + larg) * r1, cy + Math.sin(ang + larg) * r1];
      itens.push(<polygon key={i} points={`${p0} ${p1} ${p2}`} fill={cor} opacity={0.35 + r("o") * 0.65} />);
    } else if (modo === "h") {
      const y = y0 + r("y") * (y1 - y0);
      const comp = 180 + r("l") * 700;
      const x = r("x") * (W + comp) - comp;
      const esp = 2 + r("w") * 9;
      itens.push(<rect key={i} x={x} y={y} width={comp} height={esp} rx={esp / 2} fill={cor} opacity={0.2 + r("o") * 0.6} />);
    } else {
      const x = r("x") * W;
      const comp = 200 + r("l") * 800;
      const y = r("y") * (H + comp) - comp;
      const esp = 2 + r("w") * 8;
      itens.push(<rect key={i} x={x} y={y} width={esp} height={comp} rx={esp / 2} fill={cor} opacity={0.2 + r("o") * 0.6} />);
    }
  }
  return <g opacity={opacidade}>{itens}</g>;
};

// ---------- Faísca de impacto ----------
export const Impacto: React.FC<{ x: number; y: number; f: number; f0: number; cor?: string; tam?: number; dur?: number }> = ({
  x,
  y,
  f,
  f0,
  cor = "#fff",
  tam = 1,
  dur = 8,
}) => {
  const t = f - f0;
  if (t < 0 || t > dur) return null;
  const k = t / dur;
  const n = 11;
  const ext = tam * (50 + 170 * sai(k));
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2 + random(`imp${f0}`) * 6;
    const r = i % 2 === 0 ? ext * (0.7 + random(`ir${f0}-${i}`) * 0.5) : ext * 0.28 * (1 - k * 0.6);
    pts.push(`${x + Math.cos(a) * r},${y + Math.sin(a) * r}`);
  }
  return (
    <g opacity={1 - k * k}>
      <polygon points={pts.join(" ")} fill={cor} />
      <polygon
        points={pts.join(" ")}
        fill="#fff"
        transform={`translate(${x} ${y}) scale(0.55) translate(${-x} ${-y})`}
      />
      {new Array(7).fill(0).map((_, i) => {
        const a = random(`il${f0}-${i}`) * Math.PI * 2;
        const r0 = ext * (0.9 + k * 0.8);
        const r1 = r0 + tam * 70 * (1 - k);
        return (
          <line
            key={i}
            x1={x + Math.cos(a) * r0}
            y1={y + Math.sin(a) * r0}
            x2={x + Math.cos(a) * r1}
            y2={y + Math.sin(a) * r1}
            stroke={cor}
            strokeWidth={6 * tam}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
};

// ---------- Onda de choque ----------
export const Onda: React.FC<{
  x: number;
  y: number;
  f: number;
  f0: number;
  cor?: string;
  tam?: number;
  dur?: number;
  achatada?: number; // razão ry/rx (ex.: 0.25 para anel no chão)
}> = ({ x, y, f, f0, cor = "#fff", tam = 1, dur = 18, achatada = 1 }) => {
  const t = f - f0;
  if (t < 0 || t > dur) return null;
  const k = t / dur;
  const r = tam * (30 + 430 * sai(k));
  return (
    <ellipse
      cx={x}
      cy={y}
      rx={r}
      ry={r * achatada}
      fill="none"
      stroke={cor}
      strokeWidth={Math.max(1, 30 * tam * (1 - k))}
      opacity={1 - k}
    />
  );
};

// ---------- Poeira ----------
export const Poeira: React.FC<{ x: number; y: number; f: number; f0: number; dir?: number; tam?: number; cor?: string; n?: number }> = ({
  x,
  y,
  f,
  f0,
  dir = 0,
  tam = 1,
  cor = "#8a90bd",
  n = 8,
}) => {
  const t = f - f0;
  const dur = 30;
  if (t < 0 || t > dur) return null;
  const k = t / dur;
  return (
    <g>
      {new Array(n).fill(0).map((_, i) => {
        const r = (s: string) => random(`po-${s}-${f0}-${i}-${x}`);
        const vx = (dir * (0.5 + r("vx")) + (r("sx") - 0.5) * (dir === 0 ? 2.4 : 0.8)) * 150 * tam;
        const vy = -(20 + r("vy") * 90) * tam;
        return (
          <circle
            key={i}
            cx={x + vx * sai(k)}
            cy={y + vy * sai(k) - 8}
            r={tam * (16 + r("r") * 30) * (0.5 + sai(k) * 0.9)}
            fill={cor}
            opacity={0.55 * (1 - k)}
          />
        );
      })}
    </g>
  );
};

// ---------- Raio ----------
export const Raio: React.FC<{ x1: number; y1: number; x2: number; y2: number; semente: string; cor?: string; larg?: number; desvio?: number }> = ({
  x1,
  y1,
  x2,
  y2,
  semente,
  cor = "#54e0ff",
  larg = 6,
  desvio = 46,
}) => {
  const n = 9;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const comp = Math.hypot(dx, dy) || 1;
  const nx = -dy / comp;
  const ny = dx / comp;
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const d = i === 0 || i === n ? 0 : (random(`${semente}-${i}`) - 0.5) * 2 * desvio;
    pts.push([x1 + dx * u + nx * d, y1 + dy * u + ny * d]);
  }
  const d = `M ${pts.map((p) => p.join(",")).join(" L ")}`;
  const meio = pts[4];
  const ramo = `M ${meio.join(",")} L ${meio[0] + nx * 70 + dx * 0.08},${meio[1] + ny * 70 + dy * 0.08} L ${meio[0] + nx * 95 + dx * 0.2},${
    meio[1] + ny * 95 + dy * 0.2
  }`;
  return (
    <g fill="none" strokeLinejoin="round" strokeLinecap="round">
      <path d={d} stroke={cor} strokeWidth={larg * 3.2} opacity={0.3} />
      <path d={d} stroke={cor} strokeWidth={larg * 1.6} opacity={0.8} />
      <path d={ramo} stroke={cor} strokeWidth={larg} opacity={0.7} />
      <path d={d} stroke="#fff" strokeWidth={larg * 0.6} />
    </g>
  );
};

// ---------- Aura de energia ----------
export const Aura: React.FC<{ x: number; y: number; f: number; cor: string; cor2: string; forca: number; id: string }> = ({
  x,
  y,
  f,
  cor,
  cor2,
  forca,
  id,
}) => {
  if (forca <= 0) return null;
  const n = 16;
  const ciclo = 13;
  return (
    <g opacity={Math.min(1, forca * 1.3)}>
      <ellipse cx={x} cy={y - 250 * forca} rx={230 * forca} ry={420 * forca} fill={`url(#aura-${id})`} />
      {new Array(n).fill(0).map((_, i) => {
        const fase = (f + (i * ciclo) / n + random(`af${i}`) * ciclo) % ciclo;
        const u = fase / ciclo;
        const volta = Math.floor((f + (i * ciclo) / n) / ciclo);
        const r = (s: string) => random(`au-${s}-${i}-${volta}`);
        const px = x + (r("x") - 0.5) * 300 * forca;
        const py = y - u * 560 * forca * (0.6 + r("h") * 0.6);
        const alt = (120 + r("a") * 190) * forca * (1 - u * 0.5);
        const larg = (34 + r("w") * 46) * forca * (1 - u * 0.6);
        const bal = Math.sin(f * 0.8 + i) * 16;
        return (
          <path
            key={i}
            d={`M ${px - larg / 2},${py} Q ${px - larg / 2},${py - alt * 0.5} ${px + bal},${py - alt} Q ${px + larg / 2},${py - alt * 0.5} ${
              px + larg / 2
            },${py} Q ${px},${py + larg * 0.5} ${px - larg / 2},${py} Z`}
            fill={i % 3 === 0 ? "#fff" : i % 3 === 1 ? cor : cor2}
            opacity={(i % 3 === 0 ? 0.3 : 0.55) * (1 - u)}
          />
        );
      })}
      <ellipse cx={x} cy={y} rx={250 * forca} ry={34 * forca} fill={cor} opacity={0.35} />
    </g>
  );
};

// ---------- Pedras flutuando ----------
export const Pedras: React.FC<{ x: number; f: number; f0: number; n?: number; forca: number; cor?: string; larg?: number }> = ({
  x,
  f,
  f0,
  n = 12,
  forca,
  cor = "#0b0e24",
  larg = 620,
}) => {
  if (forca <= 0) return null;
  return (
    <g>
      {new Array(n).fill(0).map((_, i) => {
        const r = (s: string) => random(`pe-${s}-${i}-${f0}`);
        const t = Math.max(0, f - f0 - r("d") * 50);
        const px = x + (r("x") - 0.5) * larg;
        const py = -(t * (1.2 + r("v") * 3.4)) * forca - 4;
        const tam = 8 + r("s") * 22;
        const rot = t * (r("ro") - 0.5) * 12;
        if (py < -900) return null;
        return (
          <polygon
            key={i}
            points={`${-tam},${-tam * 0.4} ${-tam * 0.2},${-tam} ${tam},${-tam * 0.5} ${tam * 0.7},${tam * 0.7} ${-tam * 0.6},${tam * 0.8}`}
            fill={cor}
            stroke="#3a4690"
            strokeWidth={2}
            transform={`translate(${px} ${py}) rotate(${rot})`}
          />
        );
      })}
    </g>
  );
};

// ---------- Arco de corte ----------
export const ArcoCorte: React.FC<{ x: number; y: number; f: number; f0: number; raio?: number; a0?: number; a1?: number; cor?: string; dir?: 1 | -1 }> = ({
  x,
  y,
  f,
  f0,
  raio = 250,
  a0 = -150,
  a1 = 30,
  cor = "#54e0ff",
  dir = 1,
}) => {
  const t = f - f0;
  if (t < 0 || t > 7) return null;
  const k = t / 7;
  const n = 18;
  const fora: string[] = [];
  const dentro: string[] = [];
  const fim = a0 + (a1 - a0) * Math.min(1, (t + 1) / 2.5);
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const a = ((a0 + (fim - a0) * u) * Math.PI) / 180;
    const esp = Math.sin(u * Math.PI) * 58 * (1 - k * 0.7);
    fora.push(`${x + dir * Math.cos(a) * (raio + esp * 0.4)},${y + Math.sin(a) * (raio + esp * 0.4)}`);
    dentro.push(`${x + dir * Math.cos(a) * (raio - esp)},${y + Math.sin(a) * (raio - esp)}`);
  }
  const d = `M ${fora.join(" L ")} L ${dentro.reverse().join(" L ")} Z`;
  return (
    <g opacity={1 - k * k}>
      <path d={d} fill={cor} opacity={0.75} />
      <path d={d} fill="#fff" transform={`translate(${x} ${y}) scale(0.97) translate(${-x} ${-y})`} opacity={0.9} />
    </g>
  );
};

// ---------- Feixe de energia (horizontal) ----------
export const Feixe: React.FC<{ x1: number; x2: number; y: number; f: number; cor: string; cor2: string; larg: number; semente: string }> = ({
  x1,
  x2,
  y,
  f,
  cor,
  cor2,
  larg,
  semente,
}) => {
  const n = 14;
  const borda = (esc: number, s: string) => {
    const cima: string[] = [];
    const baixo: string[] = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const xx = x1 + (x2 - x1) * u;
      const afina = 0.35 + 0.65 * Math.min(1, u * 5);
      const j1 = (random(`${semente}${s}c${i}-${f}`) - 0.5) * larg * 0.3;
      const j2 = (random(`${semente}${s}b${i}-${f}`) - 0.5) * larg * 0.3;
      cima.push(`${xx},${y - (larg / 2) * esc * afina + j1 * esc}`);
      baixo.push(`${xx},${y + (larg / 2) * esc * afina + j2 * esc}`);
    }
    return `${cima.join(" ")} ${baixo.reverse().join(" ")}`;
  };
  return (
    <g>
      <polygon points={borda(1.9, "a")} fill={cor2} opacity={0.3} />
      <polygon points={borda(1.25, "b")} fill={cor} opacity={0.85} />
      <polygon points={borda(0.6, "c")} fill="#fff" />
    </g>
  );
};

// ---------- Partículas ao vento (espaço da tela) ----------
export const Particulas: React.FC<{ f: number; cor: string; n?: number; vx?: number; vy?: number; tam?: number; semente?: string; opacidade?: number }> = ({
  f,
  cor,
  n = 26,
  vx = -3,
  vy = 1.2,
  tam = 1,
  semente = "p",
  opacidade = 1,
}) => (
  <g opacity={opacidade}>
    {new Array(n).fill(0).map((_, i) => {
      const r = (s: string) => random(`${semente}-${s}-${i}`);
      const v = 0.5 + r("v") * 1.2;
      const x = (((r("x") * (W + 200) + f * vx * v) % (W + 200)) + W + 200) % (W + 200) - 100;
      const y = (((r("y") * (H + 200) + f * vy * v + Math.sin(f * 0.07 + i) * 30) % (H + 200)) + H + 200) % (H + 200) - 100;
      const s = (5 + r("s") * 9) * tam;
      return (
        <ellipse
          key={i}
          cx={x}
          cy={y}
          rx={s}
          ry={s * 0.45}
          fill={cor}
          opacity={0.35 + r("o") * 0.55}
          transform={`rotate(${f * (3 + r("ro") * 8) + i * 40} ${x} ${y})`}
        />
      );
    })}
  </g>
);

// ---------- Rachaduras / cratera no chão ----------
export const Cratera: React.FC<{ x: number; f: number; f0: number; cor?: string; tam?: number }> = ({ x, f, f0, cor = "#ff9a1c", tam = 1 }) => {
  const t = f - f0;
  if (t < 0) return null;
  const k = lim(t / 6);
  const brilho = Math.max(0.25, 1 - t / 40);
  return (
    <g>
      <ellipse cx={x} cy={6} rx={190 * tam * k} ry={22 * tam * k} fill="#03040c" />
      {new Array(9).fill(0).map((_, i) => {
        const a = (i / 8 - 0.5) * 2.6;
        const l = (150 + random(`cr${i}-${f0}`) * 200) * tam * k;
        const x2 = x + Math.sin(a) * l;
        const y2 = 8 + Math.abs(Math.cos(a)) * l * 0.16 + 6;
        const xm = x + Math.sin(a) * l * 0.5 + (random(`cm${i}-${f0}`) - 0.5) * 40;
        return (
          <polyline
            key={i}
            points={`${x},8 ${xm},${y2 * 0.5 + 6} ${x2},${y2}`}
            fill="none"
            stroke={cor}
            strokeWidth={5}
            opacity={brilho}
            strokeLinejoin="round"
          />
        );
      })}
    </g>
  );
};

// ---------- Céu (espaço da tela) ----------
export const Ceu: React.FC<{ f: number; cam: Cam; lua?: { x: number; y: number; r: number }; nuvens?: number }> = ({
  f,
  cam,
  lua = { x: 540, y: 470, r: 205 },
  nuvens = 1,
}) => {
  const estrelas = useMemo(
    () =>
      new Array(110).fill(0).map((_, i) => ({
        x: random(`ex${i}`) * W,
        y: random(`ey${i}`) * 1500 - 300,
        r: 1 + random(`er${i}`) * 2.4,
        fase: random(`ef${i}`) * 6,
      })),
    [],
  );
  const lx = lua.x - cam.x * 0.03;
  const ly = lua.y - cam.y * 0.1;
  return (
    <g>
      <rect width={W} height={H} fill="url(#ceu-noite)" />
      <g transform={`translate(${-cam.x * 0.02} ${-cam.y * 0.06})`}>
        {estrelas.map((e, i) => (
          <circle key={i} cx={e.x} cy={e.y} r={e.r} fill="#dfe8ff" opacity={0.35 + 0.45 * Math.abs(Math.sin(f * 0.05 + e.fase))} />
        ))}
      </g>
      <circle cx={lx} cy={ly} r={lua.r * 2.3} fill="url(#halo-lua)" />
      <circle cx={lx} cy={ly} r={lua.r} fill="url(#lua)" />
      <g opacity={0.5} fill="#cfc8ae">
        <circle cx={lx - lua.r * 0.35} cy={ly - lua.r * 0.25} r={lua.r * 0.17} />
        <circle cx={lx + lua.r * 0.3} cy={ly + lua.r * 0.1} r={lua.r * 0.25} />
        <circle cx={lx - lua.r * 0.1} cy={ly + lua.r * 0.5} r={lua.r * 0.12} />
        <circle cx={lx + lua.r * 0.42} cy={ly - lua.r * 0.48} r={lua.r * 0.09} />
        <circle cx={lx - lua.r * 0.6} cy={ly + lua.r * 0.22} r={lua.r * 0.08} />
      </g>
      {nuvens > 0
        ? [0, 1, 2, 3, 4].map((i) => {
            const larg = 420 + random(`nw${i}`) * 380;
            const x = (((random(`nx${i}`) * 1900 + f * (0.25 + i * 0.07)) % 1900) + 1900) % 1900 - 500 - cam.x * 0.05;
            const y = 140 + i * 215 + random(`ny${i}`) * 80 - cam.y * 0.14;
            return (
              <g key={i} opacity={0.5 * nuvens} fill={i % 2 ? "#2b2f7a" : "#3a3488"}>
                <ellipse cx={x} cy={y} rx={larg / 2} ry={26} />
                <ellipse cx={x - larg * 0.18} cy={y - 18} rx={larg * 0.24} ry={24} />
                <ellipse cx={x + larg * 0.2} cy={y - 12} rx={larg * 0.2} ry={20} />
                <ellipse cx={x + larg * 0.05} cy={y + 14} rx={larg * 0.36} ry={16} />
              </g>
            );
          })
        : null}
    </g>
  );
};

export const DefsCena: React.FC = () => (
  <defs>
    <linearGradient id="ceu-noite" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#050818" />
      <stop offset="0.38" stopColor="#11174a" />
      <stop offset="0.62" stopColor="#2c2670" />
      <stop offset="0.78" stopColor="#5d3788" />
      <stop offset="1" stopColor="#1a1440" />
    </linearGradient>
    <radialGradient id="lua">
      <stop offset="0" stopColor="#fffdf0" />
      <stop offset="0.8" stopColor="#f2edd6" />
      <stop offset="1" stopColor="#d9d3ba" />
    </radialGradient>
    <radialGradient id="halo-lua">
      <stop offset="0.38" stopColor="#cfd8ff" stopOpacity="0.5" />
      <stop offset="0.6" stopColor="#9aa6ff" stopOpacity="0.16" />
      <stop offset="1" stopColor="#9aa6ff" stopOpacity="0" />
    </radialGradient>
    <linearGradient id="chao" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#1d2456" />
      <stop offset="0.12" stopColor="#10143a" />
      <stop offset="1" stopColor="#05060f" />
    </linearGradient>
    <linearGradient id="nevoa" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#7b4fa6" stopOpacity="0" />
      <stop offset="1" stopColor="#7b4fa6" stopOpacity="0.55" />
    </linearGradient>
    <radialGradient id="aura-ren">
      <stop offset="0" stopColor="#bff6ff" stopOpacity="0.75" />
      <stop offset="0.5" stopColor="#54e0ff" stopOpacity="0.3" />
      <stop offset="1" stopColor="#1c6bff" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="aura-kaen">
      <stop offset="0" stopColor="#fff1b8" stopOpacity="0.75" />
      <stop offset="0.5" stopColor="#ff9a1c" stopOpacity="0.32" />
      <stop offset="1" stopColor="#ff3d00" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="esfera">
      <stop offset="0" stopColor="#ffffff" />
      <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.95" />
      <stop offset="0.75" stopColor="#ffe9a8" stopOpacity="0.7" />
      <stop offset="1" stopColor="#ff7ad9" stopOpacity="0" />
    </radialGradient>
  </defs>
);

// ---------- Cenário em camadas (paralaxe) ----------
const serra = (semente: string, altura: number, passo: number) => {
  const pts: string[] = ["-3200,60"];
  for (let x = -3200; x <= 3200; x += passo) {
    const a = altura * (0.35 + random(`${semente}-${x}`) * 0.65);
    pts.push(`${x},${-a}`);
    pts.push(`${x + passo * 0.5},${-a * (0.3 + random(`${semente}v-${x}`) * 0.4)}`);
  }
  pts.push("3200,60");
  return pts.join(" ");
};

export const camada = (cam: Cam, p: number) => {
  const zp = 1 + (cam.z - 1) * p;
  return `translate(${W / 2 - cam.x * p * zp} ${ANCORA_Y - cam.y * p * zp}) scale(${zp})`;
};

export const Cenario: React.FC<{ cam: Cam }> = ({ cam }) => {
  const longe = useMemo(() => serra("s1", 560, 330), []);
  const perto = useMemo(() => serra("s2", 300, 240), []);
  const detalhes = useMemo(() => {
    const itens: React.ReactNode[] = [];
    for (let x = -2600; x <= 2600; x += 46) {
      const r = (s: string) => random(`ch-${s}-${x}`);
      const px = x + r("j") * 30;
      if (r("t") > 0.45) {
        const h = 10 + r("h") * 20;
        itens.push(<polygon key={`g${x}`} points={`${px - 5},2 ${px - 2},${-h} ${px + 2},1 ${px + 6},${-h * 0.7} ${px + 9},2`} fill="#2c3878" />);
      }
      if (r("p") > 0.6) {
        itens.push(<ellipse key={`p${x}`} cx={px + 20} cy={26 + r("y") * 150} rx={10 + r("rx") * 34} ry={4 + r("ry") * 8} fill="#080a1e" />);
      }
      if (r("c") > 0.8) {
        itens.push(
          <polyline
            key={`c${x}`}
            points={`${px},${14 + r("cy") * 60} ${px + 30},${24 + r("cy") * 60} ${px + 46},${18 + r("cy") * 60} ${px + 84},${32 + r("cy") * 60}`}
            fill="none"
            stroke="#060818"
            strokeWidth={3}
          />,
        );
      }
    }
    return itens;
  }, []);
  const pilar = (x: number, h: number, l: number, k: number) => (
    <g key={`pl${x}`}>
      <polygon points={`${x},10 ${x},${-h} ${x + l * 0.4},${-h - 26 * k} ${x + l * 0.62},${-h + 12} ${x + l},${-h - 8} ${x + l},10`} fill="#0b0f30" />
      <polygon points={`${x},10 ${x},${-h} ${x + 7},${-h - 4} ${x + 7},10`} fill="#2d3a86" />
    </g>
  );
  return (
    <>
      <polygon points={longe} fill="#1b2160" transform={camada(cam, 0.14)} />
      <polygon points={perto} fill="#141846" transform={camada(cam, 0.28)} />
      <g transform={camada(cam, 0.28)}>
        <rect x={-3200} y={-260} width={6400} height={330} fill="url(#nevoa)" />
      </g>
      <g transform={camada(cam, 0.6)}>
        {pilar(-900, 300, 70, 1)}
        {pilar(-560, 190, 60, 0.4)}
        {pilar(520, 250, 64, 0.8)}
        {pilar(980, 340, 76, 1)}
        {pilar(-1500, 260, 70, 0.7)}
        {pilar(1500, 220, 64, 0.5)}
        {/* portal em ruínas */}
        <g fill="#0b0f30">
          <rect x={-120} y={-330} width={34} height={345} />
          <rect x={150} y={-330} width={34} height={345} />
          <polygon points="-190,-352 254,-352 270,-392 -206,-392" />
          <rect x={-150} y={-296} width={364} height={24} />
        </g>
        <g fill="#2d3a86">
          <rect x={-120} y={-330} width={6} height={345} />
          <rect x={150} y={-330} width={6} height={345} />
          <polygon points="-206,-392 270,-392 268,-386 -204,-386" />
        </g>
        <rect x={-3200} y={-6} width={6400} height={80} fill="#0b0f30" />
      </g>
      <g transform={camada(cam, 1)}>
        <rect x={-3600} y={0} width={7200} height={1500} fill="url(#chao)" />
        <rect x={-3600} y={-2} width={7200} height={5} fill="#4c5db4" />
        {detalhes}
      </g>
    </>
  );
};

export const Primeiro: React.FC<{ cam: Cam }> = ({ cam }) => (
  <g transform={camada(cam, 1.5)} fill="#03040c">
    <polygon points="-760,560 -700,300 -610,360 -560,250 -470,330 -400,560" />
    <polygon points="380,560 450,330 520,380 600,270 680,350 760,560" />
    <polygon points="-1500,560 -1420,330 -1340,400 -1260,300 -1180,560" />
    <polygon points="1180,560 1260,320 1340,390 1440,290 1520,560" />
  </g>
);
