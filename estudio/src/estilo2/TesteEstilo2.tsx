import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { CORES_CHEDE } from "../personagens/Chede";
import { Vivo, clamp, lerp, useP } from "../episodios/comum";
import { Grao } from "../estilo/Acabamento";
import "@fontsource/roboto-condensed/800.css";

// Teste do visual 2.0 — continua 2D. A "profundidade" vem da cena:
// luz do ambiente tingindo o personagem, luz do poste de um lado, fundo desfocado, neblina e câmera suave.

const rnd = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// ---------- Luz da cena sobre personagens 2D ----------
// Desenha o personagem e, por cima (só dentro da silhueta), o tom do ambiente e a luz quente do poste.
export const LuzCena: React.FC<{
  id: string;
  ativo: boolean;
  amb: string; // cor do ambiente (multiplica)
  ambForca: number;
  luz: { x: number; y: number; raio: number; cor: string; forca: number };
  children: React.ReactNode;
}> = ({ id, ativo, amb, ambForca, luz, children }) => {
  if (!ativo) return <>{children}</>;
  return (
    <g>
      <defs>
        <filter id={`${id}b`}>
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" />
        </filter>
        <mask id={`${id}m`} maskUnits="userSpaceOnUse" x={-3000} y={-3000} width={8000} height={9000}>
          <use href={`#${id}g`} filter={`url(#${id}b)`} />
        </mask>
        <radialGradient id={`${id}r`} gradientUnits="userSpaceOnUse" cx={luz.x} cy={luz.y} r={luz.raio}>
          <stop offset={0} stopColor={luz.cor} stopOpacity={luz.forca} />
          <stop offset={0.55} stopColor={luz.cor} stopOpacity={luz.forca * 0.35} />
          <stop offset={1} stopColor={luz.cor} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g id={`${id}g`}>{children}</g>
      <rect x={-3000} y={-3000} width={8000} height={9000} fill={amb} opacity={ambForca} mask={`url(#${id}m)`} style={{ mixBlendMode: "multiply" }} />
      <rect x={-3000} y={-3000} width={8000} height={9000} fill={`url(#${id}r)`} mask={`url(#${id}m)`} style={{ mixBlendMode: "overlay" }} />
      <rect x={-3000} y={-3000} width={8000} height={9000} fill={`url(#${id}r)`} opacity={0.18} mask={`url(#${id}m)`} style={{ mixBlendMode: "screen" }} />
    </g>
  );
};

export const Desfoque: React.FC<{ id: string; px: number; children: React.ReactNode }> = ({ id, px, children }) =>
  px < 0.3 ? (
    <>{children}</>
  ) : (
    <g>
      <defs>
        <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={px} />
        </filter>
      </defs>
      <g filter={`url(#${id})`}>{children}</g>
    </g>
  );

// camada com paralaxe: k = quanto acompanha a câmera (0 = infinito, 1 = plano dos personagens)
const Camada: React.FC<{ k: number; cam: { x: number; y: number; z: number }; children: React.ReactNode }> = ({ k, cam, children }) => {
  const s = 1 + (cam.z - 1) * k;
  return (
    <g transform={`translate(540,1100) scale(${s}) translate(${-540 + cam.x * k},${-1100 + cam.y * k})`}>{children}</g>
  );
};

// ---------- Rua à noite (2D, em camadas) ----------
const POSTE = { x: 230, topo: 640 };

const Ceu: React.FC<{ novo: boolean }> = ({ novo }) => (
  <g>
    <defs>
      <linearGradient id="ceuN" x1="0" y1="0" x2="0" y2="1">
        <stop offset={0} stopColor={novo ? "#070F26" : "#1C2C55"} />
        <stop offset={0.55} stopColor={novo ? "#1A2E63" : "#26407A"} />
        <stop offset={1} stopColor={novo ? "#3A5A9C" : "#26407A"} />
      </linearGradient>
      <radialGradient id="luaBrilho">
        <stop offset={0} stopColor="#DCE8FF" stopOpacity={0.55} />
        <stop offset={1} stopColor="#DCE8FF" stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect x={-600} y={-400} width={2300} height={1700} fill="url(#ceuN)" />
    {Array.from({ length: 70 }).map((_, i) => (
      <circle key={i} cx={-300 + rnd(i) * 1700} cy={rnd(i + 5) * 1000} r={1 + rnd(i + 9) * 2.2} fill="#fff" opacity={0.25 + rnd(i + 2) * 0.6} />
    ))}
    {novo && <circle cx={800} cy={360} r={240} fill="url(#luaBrilho)" />}
    <circle cx={800} cy={360} r={52} fill="#F4F6FF" />
  </g>
);

const PrediosLonge: React.FC = () => (
  <g>
    {Array.from({ length: 14 }).map((_, i) => {
      const w = 110 + rnd(i) * 120;
      const h = 220 + rnd(i + 3) * 380;
      const x = -500 + i * 150;
      return (
        <g key={i}>
          <rect x={x} y={1180 - h} width={w} height={h} fill="#1D2F5E" />
          {Array.from({ length: Math.floor(h / 46) * 3 }).map((_, j) =>
            rnd(i * 31 + j) > 0.72 ? (
              <rect key={j} x={x + 14 + (j % 3) * (w / 3.2)} y={1180 - h + 20 + Math.floor(j / 3) * 46} width={14} height={20} fill="#FFC56E" opacity={0.85} />
            ) : null,
          )}
        </g>
      );
    })}
  </g>
);

const CasasPerto: React.FC = () => (
  <g>
    {[
      { x: -420, w: 520, h: 330, c: "#2C437C" },
      { x: 120, w: 460, h: 280, c: "#33508D" },
      { x: 600, w: 560, h: 360, c: "#2A4078" },
      { x: 1180, w: 500, h: 300, c: "#30498A" },
    ].map((c, i) => (
      <g key={i}>
        <rect x={c.x} y={1330 - c.h} width={c.w} height={c.h} fill={c.c} />
        <path d={`M ${c.x - 20} ${1330 - c.h} L ${c.x + c.w / 2} ${1330 - c.h - 110} L ${c.x + c.w + 20} ${1330 - c.h} Z`} fill="#22305A" />
        <rect x={c.x + 60} y={1330 - c.h + 90} width={110} height={90} fill={i % 2 ? "#FFCB78" : "#1A2547"} />
        <rect x={c.x + c.w - 170} y={1330 - c.h + 90} width={110} height={90} fill={i % 2 ? "#1A2547" : "#FFCB78"} />
        <rect x={c.x + c.w / 2 - 45} y={1330 - 170} width={90} height={170} fill="#1A2547" />
      </g>
    ))}
    {/* muro */}
    <rect x={-600} y={1300} width={2300} height={60} fill="#3A528C" />
  </g>
);

const Chao: React.FC<{ novo: boolean }> = ({ novo }) => (
  <g>
    <defs>
      <linearGradient id="chaoN" x1="0" y1="0" x2="0" y2="1">
        <stop offset={0} stopColor={novo ? "#2B406F" : "#34497A"} />
        <stop offset={1} stopColor={novo ? "#141E3A" : "#34497A"} />
      </linearGradient>
      <radialGradient id="poça" cx={0.5} cy={0.5} r={0.5}>
        <stop offset={0} stopColor="#FFB45E" stopOpacity={0.55} />
        <stop offset={1} stopColor="#FFB45E" stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect x={-600} y={1360} width={2300} height={1000} fill="url(#chaoN)" />
    <rect x={-600} y={1360} width={2300} height={18} fill="#4C66A3" />
    {novo && <ellipse cx={POSTE.x + 160} cy={1640} rx={560} ry={150} fill="url(#poça)" style={{ mixBlendMode: "screen" }} />}
  </g>
);

const Poste: React.FC<{ novo: boolean }> = ({ novo }) => (
  <g>
    <defs>
      <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1">
        <stop offset={0} stopColor="#FFC877" stopOpacity={0.45} />
        <stop offset={1} stopColor="#FFC877" stopOpacity={0} />
      </linearGradient>
      <radialGradient id="halo">
        <stop offset={0} stopColor="#FFE2A8" stopOpacity={0.9} />
        <stop offset={0.3} stopColor="#FFB45E" stopOpacity={0.35} />
        <stop offset={1} stopColor="#FFB45E" stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect x={POSTE.x - 12} y={POSTE.topo} width={24} height={1640 - POSTE.topo} fill="#141B33" />
    <path d={`M ${POSTE.x} ${POSTE.topo + 10} Q ${POSTE.x + 10} ${POSTE.topo - 30} ${POSTE.x + 90} ${POSTE.topo - 20}`} stroke="#141B33" strokeWidth={18} fill="none" />
    {novo && <path d={`M ${POSTE.x + 70} ${POSTE.topo - 10} L ${POSTE.x + 110} ${POSTE.topo - 10} L ${POSTE.x + 520} 1660 L ${POSTE.x - 260} 1660 Z`} fill="url(#cone)" style={{ mixBlendMode: "screen" }} />}
    <ellipse cx={POSTE.x + 90} cy={POSTE.topo - 8} rx={34} ry={14} fill="#FFE7B4" />
    {novo && <circle cx={POSTE.x + 90} cy={POSTE.topo} r={170} fill="url(#halo)" style={{ mixBlendMode: "screen" }} />}
  </g>
);

const Neblina: React.FC<{ y: number; forca: number }> = ({ y, forca }) => (
  <g>
    <defs>
      <linearGradient id={`neb${y}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset={0} stopColor="#8FAAE6" stopOpacity={0} />
        <stop offset={0.5} stopColor="#8FAAE6" stopOpacity={forca} />
        <stop offset={1} stopColor="#8FAAE6" stopOpacity={0} />
      </linearGradient>
    </defs>
    <rect x={-600} y={y - 200} width={2300} height={400} fill={`url(#neb${y})`} />
  </g>
);

const Mato: React.FC = () => (
  <g fill="#0B1226">
    {Array.from({ length: 26 }).map((_, i) => {
      const x = -200 + i * 26 + (i > 13 ? 900 : 0);
      const h = 160 + rnd(i) * 260;
      const b = (rnd(i + 4) - 0.5) * 120;
      return <path key={i} d={`M ${x} 2000 Q ${x + b * 0.3} ${2000 - h * 0.6} ${x + b} ${2000 - h} Q ${x + 14 + b * 0.3} ${2000 - h * 0.6} ${x + 22} 2000 Z`} />;
    })}
  </g>
);

const LUZ_POSTE = { x: POSTE.x + 90, y: POSTE.topo + 40, raio: 900, cor: "#FFB25C", forca: 0.75 };

// ---------- Cena larga: Chede e Kaik conversando sob o poste ----------
const CenaRua: React.FC<{ novo: boolean }> = ({ novo }) => {
  const { f, p } = useP();
  const cam = novo ? { x: lerp(40, -40, p), y: lerp(0, -20, p), z: lerp(1.0, 1.14, p) } : { x: 0, y: 0, z: 1 };
  const fala = Math.sin(f / 7);
  return (
    <AbsoluteFill style={{ background: "#0B1430" }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <Camada k={0.05} cam={cam}><Ceu novo={novo} /></Camada>
        <Camada k={0.3} cam={cam}>
          <Desfoque id="dLonge" px={novo ? 7 : 0}><PrediosLonge /></Desfoque>
          {novo && <Neblina y={1150} forca={0.35} />}
        </Camada>
        <Camada k={0.6} cam={cam}>
          <Desfoque id="dCasas" px={novo ? 4 : 0}><CasasPerto /></Desfoque>
          {novo && <Neblina y={1320} forca={0.22} />}
        </Camada>
        <Camada k={1} cam={cam}>
          <Chao novo={novo} />
          <Poste novo={novo} />
          {novo && (
            <g opacity={0.35}>
              <ellipse cx={560} cy={1652} rx={180} ry={22} fill="#05080F" transform="skewX(-40) translate(1380,0)" />
            </g>
          )}
          <LuzCena id="lzR" ativo={novo} amb="#6F86CF" ambForca={0.75} luz={LUZ_POSTE}>
            <Vivo quem="chede" x={430} y={1650} s={0.56} vista="tresQuartos" expr="neutro" pose={{ olharX: 0.8, cabeca: -3 }} />
            <Vivo
              quem="kaik"
              x={720}
              y={1650}
              s={0.56}
              vista="tresQuartos"
              expr={f > 60 ? "rindo" : "feliz"}
              espelhar
              pose={{ bracoD: 35 + fala * 12, antebracoD: -60 + fala * 10, cabeca: fala * 2, olharX: 0.8 }}
            />
          </LuzCena>
        </Camada>
        {novo && (
          <Camada k={1.5} cam={cam}>
            <Desfoque id="dMato" px={10}><Mato /></Desfoque>
          </Camada>
        )}
      </svg>
      {novo && <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(3,6,18,0.6) 100%)" }} />}
      <Grao forca={novo ? 0.08 : 0} />
    </AbsoluteFill>
  );
};

// ---------- Close no rosto do Chede (foco passa do fundo para ele) ----------
const DetalheRosto: React.FC<{ resp: number }> = ({ resp }) => (
  // por cima da cabeça (coordenadas do rig): bochecha, pálpebra e sombra do nariz
  <g transform={`translate(0,${-resp * 6 - 1420})`}>
    <g transform="translate(0,20)">
      <ellipse cx={-118} cy={92} rx={42} ry={22} fill="#E06F5C" opacity={0.22} />
      <ellipse cx={118} cy={92} rx={42} ry={22} fill="#E06F5C" opacity={0.22} />
      <path d="M -102 -26 Q -74 -42 -46 -26" stroke={CORES_CHEDE.peleSombra} strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d="M 46 -26 Q 74 -42 102 -26" stroke={CORES_CHEDE.peleSombra} strokeWidth={6} fill="none" strokeLinecap="round" />
    </g>
  </g>
);

const CenaClose: React.FC = () => {
  const { f, p } = useP();
  const z = lerp(1, 1.12, p);
  const foco = interpolate(f, [0, 45], [2, 16], clamp); // fundo vai desfocando
  const espanto = f > 70;
  const s = 1.9;
  const resp = (Math.sin(f / 12) + 1) / 2;
  const ox = interpolate(f, [0, 40, 70, 90], [0.6, 0.6, -0.2, -0.6], clamp);
  return (
    <AbsoluteFill style={{ background: "#0B1430" }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <g transform={`translate(540,900) scale(${1.6 * z}) translate(-540,-1000)`}>
          <Desfoque id="dFundoClose" px={foco}>
            <Ceu novo />
            <PrediosLonge />
            <CasasPerto />
            <Chao novo />
            <Poste novo />
          </Desfoque>
          {/* bokeh das luzes */}
          {Array.from({ length: 12 }).map((_, i) => (
            <circle key={i} cx={100 + rnd(i) * 900} cy={700 + rnd(i + 3) * 600} r={20 + rnd(i + 6) * 30} fill="#FFC36E" opacity={interpolate(foco, [2, 16], [0, 0.25]) * (0.5 + rnd(i + 8))} style={{ mixBlendMode: "screen" }} />
          ))}
        </g>
        <g transform={`translate(540,1000) scale(${z}) translate(-540,-1000)`}>
          <LuzCena id="lzC" ativo amb="#6F86CF" ambForca={0.7} luz={{ x: 80, y: 500, raio: 1100, cor: "#FFB25C", forca: 0.8 }}>
            <g transform={`translate(540,${1000 + 1420 * s - 140}) scale(${s})`}>
              <Vivo quem="chede" x={0} y={0} s={1} vista="frente" expr={espanto ? "espanto" : "neutro"} pose={{ olharX: ox, olharY: espanto ? -0.2 : 0 }} />
              <DetalheRosto resp={resp} />
            </g>
          </LuzCena>
        </g>
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 45%, rgba(3,6,18,0.65) 100%)" }} />
      <Grao forca={0.08} />
    </AbsoluteFill>
  );
};

// ---------- Antes x depois ----------
const Rotulo: React.FC<{ texto: string; x: number; cor: string }> = ({ texto, x, cor }) => (
  <div style={{ position: "absolute", top: 160, left: x, width: 540, textAlign: "center", fontFamily: "'Roboto Condensed'", fontWeight: 800, fontSize: 90, color: cor, WebkitTextStroke: "8px #000", paintOrder: "stroke fill" }}>
    {texto}
  </div>
);
const AntesDepois: React.FC = () => {
  const f = useCurrentFrame();
  const corte = interpolate(f, [0, 25], [1080, 540], clamp);
  return (
    <AbsoluteFill>
      <CenaRua novo={false} />
      <AbsoluteFill style={{ clipPath: `inset(0 0 0 ${corte}px)` }}>
        <CenaRua novo />
      </AbsoluteFill>
      <div style={{ position: "absolute", left: corte - 4, top: 0, width: 8, height: 1920, background: "#fff" }} />
      <Rotulo texto="ANTES" x={0} cor="#fff" />
      <Rotulo texto="DEPOIS" x={540} cor="#FFD23F" />
    </AbsoluteFill>
  );
};

export const DURACAO_TESTE2 = 330;
export const TesteEstilo2: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Sequence durationInFrames={90}><AntesDepois /></Sequence>
    <Sequence from={90} durationInFrames={120}><CenaRua novo /></Sequence>
    <Sequence from={210} durationInFrames={120}><CenaClose /></Sequence>
  </AbsoluteFill>
);
