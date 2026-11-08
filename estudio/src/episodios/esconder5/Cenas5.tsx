import React from "react";
import { AbsoluteFill, interpolate, spring, useVideoConfig } from "remotion";
import { clamp, lerp, useP, Vivo } from "../comum";
import { Ator, Plano3D, camEntre, orbita, projetarP } from "../../cenarios3d/Kit3D";
import type { Cam } from "../../cenarios3d/Rua3D";
import { projetar } from "../../cenarios3d/Rua3D";
import { Campo3D } from "../../cenarios3d/Cenarios4";
import { CARROS5, CirculoCarros, Vazio3D } from "../../cenarios3d/Cenarios5";
import { Fenda } from "../../efeitos/Fenda";
import { Gato, PoseGato } from "../../personagens/Gato";
import { andar } from "../../personagens/Figurantes";
import { Aparencia, AparenciaCtx, Cabeca, CORES_CHEDE } from "../../personagens/Chede";
import { APARENCIA_AGENTE } from "../../personagens/Agente";
import { AMARELO, ComOlhoRoxo, Info, SeloSegue, contorno, fonte } from "../limites4/Comum4";

// Parte 5 · "E se você se escondesse dentro do seu poder?"
const CEN: [number, number] = [0, 1.5]; // centro do campo (onde os dois estão)
const CH: [number, number] = [-0.55, 1.4];
const KA: [number, number] = [0.6, 1.7];
const RC = 7; // raio do círculo de carros
const AMBAR = "#FFB21E";
const VERMELHO = "#FF4A3A";
const ROXO_CLARO = "#C9A6FF";

const encarar = (cam: Cam, eu: [number, number], outro: [number, number]) =>
  projetar(cam, [outro[0], 1.2, outro[1]]).x < projetar(cam, [eu[0], 1.2, eu[1]]).x;

// cenário do campo à noite com os carros
const campoNoite = (chegada: number, farol = 1, porta = 0, filhos?: React.ReactNode) => (
  <Campo3D noite marcas={1} rodasNovas filhos={<>
    <CirculoCarros c={CEN} r={RC} chegada={chegada} farol={farol} porta={porta} />
    {filhos}
  </>} />
);

// 12 agentes: 2 por carro, avançando do carro (avanco 0) até perto dos dois (avanco 1)
const agentes = (cam: Cam, f: number, avanco: number, andando = false, rMin = 3.0): Ator[] =>
  Array.from({ length: 12 }).map((_, i) => {
    const k = Math.floor(i / 2);
    const s = i % 2 ? 1 : -1;
    const a = CARROS5[k].a + s * 0.2;
    const r = lerp(RC - 1.4, rMin, avanco);
    const x = CEN[0] + Math.cos(a) * r;
    const z = CEN[1] + Math.sin(a) * r;
    const eu: [number, number] = [x, z];
    return {
      quem: "agente" as const, x, z,
      vista: "tresQuartos" as const,
      espelhar: encarar(cam, eu, CEN),
      expr: "neutro" as const,
      pose: { ...(andando ? andar(f + i * 7, 0.3, 0.8) : {}), controlado: 1, olharX: 0.8 },
    };
  });

// halo 2D dos faróis (luz estourando na lente, como na referência)
const Halos: React.FC<{ cam: Cam; chegada: number; farol?: number; n?: number }> = ({ cam, chegada, farol = 1, n = 6 }) => {
  const pts: { x: number; y: number; r: number; o: number }[] = [];
  const camDir = [cam.alvo[0] - cam.pos[0], cam.alvo[2] - cam.pos[2]];
  CARROS5.slice(0, n).forEach((k, i) => {
    const t = Math.min(1, Math.max(0, chegada * 6 - i));
    if (t <= 0) return;
    const e = 1 - Math.pow(1 - t, 3);
    const rr = RC + (1 - e) * 40;
    const cx = CEN[0] + k.x * rr, cz = CEN[1] + k.z * rr;
    const rot = Math.atan2(-k.x, -k.z);
    const fx = Math.sin(rot), fz = Math.cos(rot);
    // farol virado para a câmera brilha mais
    const de = -(fx * camDir[0] + fz * camDir[1]) / Math.hypot(camDir[0], camDir[1]);
    const o = Math.max(0.15, de) * farol;
    [-0.6, 0.6].forEach((lx) => {
      const wx = cx + lx * Math.cos(rot) + 2.2 * Math.sin(rot);
      const wz = cz - lx * Math.sin(rot) + 2.2 * Math.cos(rot);
      const q = projetar(cam, [wx, 0.72, wz]);
      if (q.pxPorMetro <= 0) return;
      pts.push({ x: q.x, y: q.y, r: Math.min(150, 0.45 * q.pxPorMetro + 14), o });
    });
  });
  return (
    <g style={{ mixBlendMode: "screen" }}>
      <defs>
        <radialGradient id="halo5">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity={1} />
          <stop offset="0.18" stopColor="#FFF0C8" stopOpacity={0.85} />
          <stop offset="0.5" stopColor="#FFC97A" stopOpacity={0.25} />
          <stop offset="1" stopColor="#FFB060" stopOpacity={0} />
        </radialGradient>
      </defs>
      {pts.map((q, i) => (
        <g key={i} opacity={q.o}>
          <circle cx={q.x} cy={q.y} r={q.r} fill="url(#halo5)" />
          <rect x={q.x - q.r * 2.2} y={q.y - 2} width={q.r * 4.4} height={4} fill="#FFF3D6" opacity={0.35} />
        </g>
      ))}
    </g>
  );
};

// bokeh: bolas grandes desfocadas de luz (frente)
const Bokeh: React.FC<{ n?: number; cor?: string; semente?: number; forca?: number }> = ({ n = 9, cor = "#FFD9A0", semente = 1, forca = 1 }) => {
  const { f } = useP();
  return (
    <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0, filter: "blur(6px)", mixBlendMode: "screen", pointerEvents: "none" }}>
      {Array.from({ length: n }).map((_, i) => {
        const r = (k: number) => { const s = Math.sin((i + semente * 13) * 91.3 + k * 17.1) * 43758.5; return s - Math.floor(s); };
        return <circle key={i} cx={r(1) * 1080 + Math.sin(f / 40 + i) * 20} cy={r(2) * 1920} r={40 + r(3) * 90} fill={cor} opacity={(0.08 + r(4) * 0.14) * forca} />;
      })}
    </svg>
  );
};

// gato posicionado no 3D (cartaz no chão)
const gatoEm = (cam: Cam, x: number, z: number, pose: PoseGato, f: number, extra: { brilho?: number; espelhar?: boolean; piscar?: number; olharX?: number } = {}) => {
  const q = projetarP(cam, [x, 0, z]);
  if (q.pxPorMetro <= 0) return null;
  const s = q.pxPorMetro * 0.0011;
  return (
    <g transform={`translate(${q.x},${q.y}) scale(${extra.espelhar ? -s : s},${s})`}>
      <ellipse cx={0} cy={4} rx={130} ry={22} fill="#000" opacity={0.35} />
      <Gato pose={pose} f={f} brilho={extra.brilho} piscar={extra.piscar} olharX={extra.olharX} />
    </g>
  );
};

// fenda deitada no chão (2D achatada) num ponto do 3D
const FendaChao: React.FC<{ cam: Cam; x: number; z: number; raio: number; intensidade?: number }> = ({ cam, x, z, raio, intensidade = 1 }) => {
  const q = projetar(cam, [x, 0.02, z]);
  const b = projetar(cam, [x, 0.02, z + 1]);
  const achata = Math.min(1, Math.max(0.12, Math.abs(b.y - q.y) / Math.max(1, q.pxPorMetro)));
  if (q.pxPorMetro <= 0 || raio <= 0.01) return null;
  return (
    <g transform={`translate(${q.x},${q.y}) scale(1,${achata})`}>
      <Fenda x={0} y={0} tamanho={(raio * q.pxPorMetro) / 120} intensidade={intensidade} />
    </g>
  );
};

const Titulo: React.FC<{ linhas: React.ReactNode[]; top?: number }> = ({ linhas, top = 210 }) => (
  <div style={{ position: "absolute", top, width: "100%", textAlign: "center", ...fonte, lineHeight: 1.02 }}>
    {linhas.map((l, i) => <div key={i} style={{ fontSize: 84, color: "#fff", whiteSpace: "nowrap", ...contorno(12) }}>{l}</div>)}
  </div>
);

// silhueta de quem espera (contraluz)
const APARENCIA_SILHUETA: Aparencia = { cores: { ...CORES_CHEDE }, cabelo: "raspado", estampa: "bolso", roupa: "moletom", calca: true };

// ======================================================================================
// 0 · Capa
export const E0_Capa: React.FC = () => {
  const { p, f } = useP();
  const cam = camEntre({ pos: [3.2, 6.2, 9.5], alvo: [0, 0.6, 1.2], fov: 44 }, { pos: [2.8, 5.6, 8.6], alvo: [0, 0.7, 1.2], fov: 42 }, p);
  return (
    <Plano3D id="e0" clima="noite" cam={cam} cenario={campoNoite(1)} desfoque={0.8} mato="ambos"
      fundo2D={<><Halos cam={cam} chegada={1} /><FendaChao cam={cam} x={CEN[0]} z={CEN[1]} raio={1.6} /></>}
      atores={[
        { quem: "chede", x: CH[0], z: CH[1], vista: "tresQuartos", expr: "espanto", pose: { bracoE: 40, antebracoE: 30, bracoD: 40, antebracoD: 30, olharY: 0.8 } },
        { quem: "kaik", x: KA[0], z: KA[1], vista: "tresQuartos", espelhar: true, expr: "medo", pose: { bracoE: 30, bracoD: 50, antebracoD: 40, olharY: 0.8 } },
        ...agentes(cam, f, 0.35),
      ]}
      html={<>
        <Titulo linhas={["E SE VOCÊ SE ESCONDESSE", <>DENTRO DO SEU <span style={{ color: AMARELO, textShadow: "0 0 40px rgba(255,190,60,0.8)" }}>PODER?</span></>]} />
        <div style={{ position: "absolute", top: 1480, width: "100%", textAlign: "center", ...fonte, fontSize: 170, color: AMARELO, ...contorno(14), transform: "rotate(-4deg)" }}>PARTE 5</div>
      </>}
    />
  );
};

// 1 · Faróis acenderam: um carro preto
export const E1_Farois: React.FC = () => {
  const { p } = useP();
  const k = CARROS5[0];
  const alvoCarro: [number, number, number] = [CEN[0] + k.x * RC, 0.9, CEN[1] + k.z * RC];
  const cam = camEntre(
    { pos: [CEN[0] - k.x * 5.2 + 0.9, 1.6, CEN[1] - k.z * 5.2 - 2.0], alvo: alvoCarro, fov: 46 },
    { pos: [CEN[0] - k.x * 4.2 + 0.8, 1.55, CEN[1] - k.z * 4.2 - 1.7], alvo: alvoCarro, fov: 42 }, p);
  const farol = interpolate(p, [0.22, 0.3, 0.33, 0.4], [0, 1, 0.4, 1], clamp);
  return (
    <Plano3D id="e1" clima="noite" cam={cam} cenario={campoNoite(1 / 6, farol)} desfoque={1.2} mato="ambos"
      atores={[
        { quem: "chede", x: CH[0], z: CH[1], vista: "costas" },
        { quem: "kaik", x: KA[0], z: KA[1], vista: "costas" },
      ]}
      fundo2D={<Halos cam={cam} chegada={1 / 6} farol={farol} n={1} />}
    />
  );
};

// 2 · Depois outro. E outro. Seis carros (vista de cima)
export const E2_SeisCarros: React.FC = () => {
  const { p } = useP();
  const chegada = interpolate(p, [0, 0.75], [1 / 6, 1], clamp);
  const cam = camEntre({ pos: [0.5, 13, CEN[1] + 8], alvo: [0, 0, CEN[1]], fov: 50 }, { pos: [0.2, 24, CEN[1] + 3], alvo: [0, 0, CEN[1]], fov: 48 }, p);
  const n = Math.min(6, Math.max(1, Math.ceil(chegada * 6 - 0.01)));
  return (
    <Plano3D id="e2" clima="noite" cam={cam} cenario={campoNoite(chegada)} desfoque={0.4}
      atores={[
        { quem: "chede", x: CH[0], z: CH[1], vista: "frente", expr: "medo", pose: { olharY: -1 } },
        { quem: "kaik", x: KA[0], z: KA[1], vista: "frente", expr: "medo", pose: { olharY: -1 } },
      ]}
      fundo2D={<Halos cam={cam} chegada={chegada} farol={0.7} />}
      html={<Info rotulo="CARROS PRETOS" valor={String(n)} y={170} cor={AMARELO} tam={190} />}
    />
  );
};

// 3 · Doze agentes, anel dourado nos olhos
export const E3_Agentes: React.FC = () => {
  const { p, f } = useP();
  if (p < 0.52) {
    const q = p / 0.52;
    const cam = orbita([CEN[0], 1, CEN[1]], lerp(200, 225, q), lerp(4.5, 3.8, q), 1.25, 52, 1.2);
    return (
      <Plano3D id="e3a" clima="noite" cam={cam} cenario={campoNoite(1, 1, interpolate(q, [0, 0.4], [0, 1], clamp))} desfoque={1} mato="esq"
        atores={[...agentes(cam, f, interpolate(q, [0.1, 1], [0, 0.25], clamp), true),
          { quem: "chede", x: CH[0], z: CH[1], vista: "tresQuartos", expr: "medo", espelhar: true },
          { quem: "kaik", x: KA[0], z: KA[1], vista: "tresQuartos", expr: "medo" },
        ]}
        fundo2D={<Halos cam={cam} chegada={1} />}
        html={<Info rotulo="AGENTES" valor="12" y={170} cor={AMARELO} tam={170} />}
      />
    );
  }
  // close no olho com o anel âmbar
  const q = (p - 0.52) / 0.48;
  const cam = orbita([CEN[0], 1, CEN[1]], 225, 3.6, 1.3, 52, 1.2);
  const s = lerp(2.1, 2.5, q);
  return (
    <AbsoluteFill>
      <Plano3D id="e3b" clima="noite" cam={cam} cenario={campoNoite(1)} desfoque={14} fundo2D={<Halos cam={cam} chegada={1} />} />
      <AbsoluteFill>
        <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
          <Vivo quem="agente" x={520} y={900 + 1372 * s} s={s} vista="tresQuartos" expr="neutro" pose={{ controlado: interpolate(q, [0.25, 0.5], [0, 1], clamp), oculos: interpolate(q, [0, 0.3], [1, 0], clamp), olharX: 0.2 }} />
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#2E3F8A", mixBlendMode: "color", opacity: 0.28 }} />
      <Info rotulo="CONTROLE MENTAL" valor="ANEL" y={170} cor={AMBAR} tam={150} de={14} />
    </AbsoluteFill>
  );
};

// 4 · Falaram juntos, na mesma voz
export const E4_Juntos: React.FC = () => {
  const { p, f } = useP();
  const cam = orbita([CEN[0], 1, CEN[1]], lerp(150, 215, p), lerp(7.5, 6.2, p), lerp(2.6, 2.0, p), 50, 0.9);
  const lista = agentes(cam, f, 0.55);
  const onda = (f % 18) / 18;
  return (
    <Plano3D id="e4" clima="noite" cam={cam} cenario={campoNoite(1)} desfoque={0.8} mato="ambos"
      atores={[...lista,
        { quem: "chede", x: CH[0], z: CH[1], vista: "tresQuartos", expr: "medo", espelhar: encarar(cam, CH, KA), pose: { olharX: 1 } },
        { quem: "kaik", x: KA[0], z: KA[1], vista: "tresQuartos", expr: "medo", espelhar: encarar(cam, KA, CH), pose: { olharX: 1 } },
      ]}
      fundo2D={<Halos cam={cam} chegada={1} farol={0.8} />}
      frente={<>
        {/* ondas âmbar saindo de cada agente ao mesmo tempo */}
        {lista.map((a, i) => {
          const q = projetarP(cam, [a.x, 1.55, a.z]);
          if (q.pxPorMetro <= 0) return null;
          return [0, 0.5].map((d) => {
            const t = (onda + d) % 1;
            return <circle key={`${i}${d}`} cx={q.x} cy={q.y} r={(0.15 + t * 0.6) * q.pxPorMetro} fill="none" stroke={AMBAR} strokeWidth={4} opacity={(1 - t) * 0.8} />;
          });
        })}
      </>}
    />
  );
};

// 5 · Doze bocas, uma mente só (holograma)
export const E5_UmaMente: React.FC = () => {
  const { p, f } = useP();
  const { fps } = useVideoConfig();
  const cx = 540, cy = 1000;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, #2A1E5C 0%, #120C2A 60%, #07050F 100%)" }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        {/* grade do holograma em perspectiva */}
        <g stroke="#7B5CFF" strokeWidth={2} opacity={0.35}>
          {Array.from({ length: 17 }).map((_, i) => <line key={`v${i}`} x1={540 + (i - 8) * 30} y1={1150} x2={540 + (i - 8) * 260} y2={1920} />)}
          {Array.from({ length: 10 }).map((_, i) => { const y = 1150 + Math.pow(i / 9, 1.8) * 770; return <line key={`h${i}`} x1={0} y1={y} x2={1080} y2={y} />; })}
          {Array.from({ length: 10 }).map((_, i) => { const y = 860 - Math.pow(i / 9, 1.8) * 860; return <line key={`t${i}`} x1={0} y1={y} x2={1080} y2={y} opacity={0.5} />; })}
        </g>
        {/* 12 bocas em círculo, linhas até o centro */}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
          const sp = spring({ frame: f - i * 2, fps, config: { damping: 12 } });
          const x = cx + Math.cos(a) * 360, y = cy + Math.sin(a) * 360;
          const fala = 0.5 + 0.5 * Math.sin(f / 2.2);
          const lin = interpolate(p, [0.25, 0.6], [0, 1], clamp);
          return (
            <g key={i}>
              <line x1={x} y1={y} x2={x + (cx - x) * lin} y2={y + (cy - y) * lin} stroke={AMBAR} strokeWidth={5} opacity={0.85} />
              <g transform={`translate(${x},${y}) scale(${sp})`}>
                <circle r={52} fill="#1A1238" stroke="#9C82FF" strokeWidth={4} />
                <path d={`M -26 0 Q 0 ${-8 - fala * 6} 26 0 Q 0 ${10 + fala * 18} -26 0 Z`} fill="#3A0E12" stroke="#E7D8FF" strokeWidth={4} />
              </g>
            </g>
          );
        })}
        {/* a mente no centro */}
        {(() => {
          const sp = spring({ frame: f - 14, fps, config: { damping: 10 } });
          return (
            <g transform={`translate(${cx},${cy}) scale(${sp})`}>
              <circle r={120 + Math.sin(f / 4) * 8} fill={AMBAR} opacity={0.18} />
              <circle r={80} fill={AMBAR} opacity={0.35} />
              <circle r={46} fill="#FFE2A0" />
              {[0, 1, 2].map((k) => { const t = ((f / 24 + k / 3) % 1); return <circle key={k} r={60 + t * 200} fill="none" stroke={AMBAR} strokeWidth={4} opacity={1 - t} />; })}
            </g>
          );
        })()}
      </svg>
      <Info rotulo="12 BOCAS" valor="1 MENTE" y={190} cor={AMBAR} tam={170} centro />
    </AbsoluteFill>
  );
};

// 6 · Kaik podia fugir... mas a 6 G o Chede desmaiava
export const E6_SeisG: React.FC = () => {
  const { p, f } = useP();
  const cam = camEntre({ pos: [1.9, 1.55, 4.6], alvo: [0.2, 1.35, 1.5], fov: 40 }, { pos: [1.6, 1.5, 4.0], alvo: [0.2, 1.35, 1.5], fov: 38 }, p);
  const desmaio = p > 0.55;
  const pisca = desmaio && Math.floor(f / 6) % 2 === 0;
  return (
    <Plano3D id="e6" clima="noite" cam={cam} cenario={campoNoite(1)} desfoque={2.5}
      atores={[...agentes(cam, f, 0.62),
        { quem: "kaik", x: KA[0], z: KA[1], vista: "tresQuartos", espelhar: true, expr: desmaio ? "medo" : "determinado", pose: { olharX: desmaio ? 1 : Math.sin(f / 9), cabeca: Math.sin(f / 9) * 6 } },
        { quem: "chede", x: CH[0], z: CH[1], vista: "tresQuartos", expr: desmaio ? "cansado" : "medo", pose: { cabeca: desmaio ? -14 : 0, olharY: desmaio ? 0.6 : 0, tronco: desmaio ? -6 : 0 } },
      ]}
      fundo2D={<Halos cam={cam} chegada={1} farol={0.7} />}
      html={desmaio
        ? <Info rotulo="CARREGANDO O CHEDE" valor="6 G" y={170} cor={pisca ? VERMELHO : "#fff"} tam={190} de={0} />
        : <Info rotulo="O KAIK SOZINHO" valor="FOGE" y={170} cor="#59D8FF" tam={170} />}
    />
  );
};

// 7 · Ideia maluca (close no Chede olhando o chão)
export const E7_Ideia: React.FC = () => {
  const { p, f } = useP();
  const cam = camEntre({ pos: [-1.6, 1.62, 3.5], alvo: [CH[0], 1.5, CH[1]], fov: 30 }, { pos: [-1.4, 1.6, 3.2], alvo: [CH[0], 1.52, CH[1]], fov: 28 }, p);
  const brilho = interpolate(p, [0.3, 0.7], [0, 1], clamp);
  return (
    <ComOlhoRoxo>
      <Plano3D id="e7" clima="noite" cam={cam} cenario={campoNoite(1)} desfoque={7}
        atores={[{ quem: "chede", x: CH[0], z: CH[1], vista: "tresQuartos", expr: "determinado", pose: { olharY: 1, olharX: 0.3, olhosPoder: brilho, cabeca: 8 } }]}
        fundo2D={<Halos cam={cam} chegada={1} farol={0.6} />}
        html={<><Bokeh n={8} semente={7} /><SeloSegue top={150} parte={6} /></>}
      />
    </ComOlhoRoxo>
  );
};

// 8 · Abriu a fenda no chão, debaixo dos dois
export const E8_FendaChao: React.FC = () => {
  const { p, f } = useP();
  const cam = camEntre({ pos: [2.6, 4.4, 6.4], alvo: [0, 0.4, 1.5], fov: 46 }, { pos: [2.2, 5.2, 5.6], alvo: [0, 0.3, 1.5], fov: 46 }, p);
  const raio = interpolate(p, [0.05, 0.6], [0.1, 1.7], clamp);
  return (
    <Plano3D id="e8" clima="noite" cam={cam} cenario={campoNoite(1)} desfoque={0.6} mato="ambos"
      fundo2D={<><Halos cam={cam} chegada={1} farol={0.7} /><FendaChao cam={cam} x={CEN[0]} z={CEN[1]} raio={raio} /></>}
      atores={[...agentes(cam, f, interpolate(p, [0, 1], [0.62, 0.85], clamp), true, 1.6),
        { quem: "chede", x: CH[0], z: CH[1], vista: "tresQuartos", expr: "determinado", pose: { olharY: 1, bracoE: 30, bracoD: 30 } },
        { quem: "kaik", x: KA[0], z: KA[1], vista: "tresQuartos", espelhar: true, expr: "espanto", pose: { olharY: 1, bracoE: 50, bracoD: 50 } },
      ]}
    />
  );
};

// 9 · Caíram. Fechou os olhos e a fenda fechou (vista de baixo)
export const E9_Caindo: React.FC = () => {
  const { p, f } = useP();
  const abre = interpolate(p, [0.55, 0.78], [1, 0], clamp);
  const flash = interpolate(p, [0.78, 0.8, 0.9], [0, 1, 0], clamp);
  const rx = 330 * abre, ry = 150 * abre;
  const queda = interpolate(p, [0, 1], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 20%, #241A4A 0%, #0D0920 50%, #040309 100%)" }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <defs>
          <clipPath id="portal9"><ellipse cx={540} cy={330} rx={Math.max(0.1, rx)} ry={Math.max(0.1, ry)} /></clipPath>
          <filter id="b9"><feGaussianBlur stdDeviation={12} /></filter>
        </defs>
        {/* estrelas/poeira subindo */}
        {Array.from({ length: 70 }).map((_, i) => {
          const r = (k: number) => { const s = Math.sin(i * 77.7 + k * 13.3) * 43758.5; return s - Math.floor(s); };
          const y = ((r(2) * 1920 - f * (8 + r(3) * 14)) % 1920 + 1920) % 1920;
          return <rect key={i} x={r(1) * 1080} y={y} width={3} height={14 + r(4) * 40} fill="#B9A6FF" opacity={0.25 + r(5) * 0.4} />;
        })}
        {/* o buraco lá em cima: céu da noite, agentes olhando pra baixo */}
        {abre > 0.01 && (
          <>
            <ellipse cx={540} cy={330} rx={rx + 40} ry={ry + 26} fill="#A779FF" filter="url(#b9)" />
            <g clipPath="url(#portal9)">
              <rect x={0} y={0} width={1080} height={700} fill="#1E3570" />
              {Array.from({ length: 7 }).map((_, i) => {
                const x = 300 + i * 80;
                return (
                  <g key={i}>
                    <circle cx={x} cy={260 + (i % 2) * 20} r={36} fill="#0E1018" />
                    <rect x={x - 12} y={290 + (i % 2) * 20} width={24} height={90 + Math.sin(f / 5 + i) * 30} rx={12} fill="#0E1018" />
                    <circle cx={x - 12} cy={252 + (i % 2) * 20} r={5} fill={AMBAR} />
                    <circle cx={x + 12} cy={252 + (i % 2) * 20} r={5} fill={AMBAR} />
                  </g>
                );
              })}
            </g>
            <ellipse cx={540} cy={330} rx={rx} ry={ry} fill="none" stroke="#E9DCFF" strokeWidth={6} />
          </>
        )}
        {/* os dois caindo em direção à câmera */}
        <g transform={`translate(${430 - queda * 60},${700 + queda * 500}) rotate(${-20 + f * 1.2}) scale(${0.35 + queda * 0.35})`}>
          <Vivo quem="chede" x={0} y={0} s={1} vista="frente" expr={p > 0.55 ? "cansado" : "espanto"} pose={{ bracoE: 140, antebracoE: 30, bracoD: 140, antebracoD: 30, pernaE: 20, joelhoE: 30, pernaD: -15, joelhoD: -30, piscar: p > 0.55 ? 1 : 0 }} />
        </g>
        <g transform={`translate(${680 + queda * 80},${640 + queda * 520}) rotate(${25 - f * 1.4}) scale(${0.33 + queda * 0.33})`}>
          <Vivo quem="kaik" x={0} y={0} s={1} vista="frente" expr="medo" pose={{ bracoE: 150, antebracoE: 20, bracoD: 120, antebracoD: 50, pernaE: -20, joelhoE: 40, pernaD: 25, joelhoD: -20 }} />
        </g>
        <rect width={1080} height={1920} fill="#E9DCFF" opacity={flash} />
      </svg>
    </AbsoluteFill>
  );
};

// 10 · Silêncio. Chão de pedra. Quatro graus.
export const E10_Vazio: React.FC = () => {
  const { p, f } = useP();
  const cam = orbita([0, 1, 0], lerp(-70, -40, p), lerp(9, 7.5, p), lerp(3.2, 2.4, p), 46, 0.9);
  const VC: [number, number] = [-0.45, 0.2], VK: [number, number] = [0.5, 0.0];
  const bafo = (x: number, z: number, d: number) => {
    const q = projetarP(cam, [x, 1.52, z]);
    const t = ((f + d) % 45) / 45;
    return q.pxPorMetro > 0 ? <circle cx={q.x + (encarar(cam, [x, z], [0, 3]) ? -1 : 1) * (0.12 + t * 0.25) * q.pxPorMetro} cy={q.y - t * 0.15 * q.pxPorMetro} r={(0.05 + t * 0.12) * q.pxPorMetro} fill="#EEF2FF" opacity={(1 - t) * 0.55} filter="url(#sombraSuave)" /> : null;
  };
  return (
    <Plano3D id="e10" clima="vazio" cam={cam} cenario={<Vazio3D />} desfoque={1}
      atores={[
        { quem: "chede", x: VC[0], z: VC[1], vista: "tresQuartos", expr: "medo", pose: { bracoE: 20, antebracoE: 110, bracoD: 20, antebracoD: 110, olharX: Math.sin(f / 14) } },
        { quem: "kaik", x: VK[0], z: VK[1], vista: "tresQuartos", espelhar: true, expr: "espanto", pose: { olharX: -Math.sin(f / 16) } },
      ]}
      frente={<>{bafo(VC[0], VC[1], 0)}{bafo(VK[0], VK[1], 20)}</>}
      html={<><Bokeh n={7} cor="#B9A6FF" semente={3} forca={0.8} /><Info rotulo="TEMPERATURA" valor="4" unidade="°C" y={170} cor="#9FD8FF" tam={190} /></>}
    />
  );
};

// 11 · Alguma coisa se mexeu (câmera térmica)
export const E11_Termica: React.FC = () => {
  const { p, f } = useP();
  const gx = interpolate(p, [0.15, 0.85], [760, 380], clamp);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#1A0F5A 0%, #2A1680 55%, #170C48 100%)" }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <defs>
          <filter id="termico" x="-50%" y="-50%" width="200%" height="200%">
            <feFlood floodColor="#FFB23A" result="c" />
            <feComposite in="c" in2="SourceAlpha" operator="in" result="m" />
            <feGaussianBlur in="m" stdDeviation={10} result="g" />
            <feMerge><feMergeNode in="g" /><feMergeNode in="m" /></feMerge>
          </filter>
          <linearGradient id="escalaT" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#1A0F5A" /><stop offset="0.4" stopColor="#7A2AC0" /><stop offset="0.7" stopColor="#FF4A3A" /><stop offset="1" stopColor="#FFF07A" />
          </linearGradient>
        </defs>
        {/* pilhas frias */}
        {[[120, 1300, 260, 520], [420, 1380, 200, 380], [700, 1240, 300, 600], [260, 1460, 160, 300], [880, 1420, 180, 340]].map(([x, y, w, h], i) => (
          <g key={i}>
            <rect x={x - w / 2} y={y - h} width={w} height={h} rx={14} fill={i % 2 ? "#33208E" : "#2B1A7A"} />
            <rect x={x - w / 2 + 20} y={y - h + 30} width={w * 0.5} height={h * 0.25} rx={10} fill="#3C28A0" />
          </g>
        ))}
        <rect x={0} y={1460} width={1080} height={460} fill="#1E1166" />
        {/* forma quente andando entre as pilhas */}
        <g transform={`translate(${gx},1470) scale(-0.9,0.9)`} filter="url(#termico)">
          <Gato pose="andando" f={f} />
        </g>
        {/* moldura de câmera */}
        <g stroke="#E8E0FF" strokeWidth={5} fill="none" opacity={0.85}>
          <path d="M 60 140 L 60 80 L 120 80" /><path d="M 1020 140 L 1020 80 L 960 80" />
          <path d="M 60 1780 L 60 1840 L 120 1840" /><path d="M 1020 1780 L 1020 1840 L 960 1840" />
          <path d="M 520 960 L 560 960 M 540 940 L 540 980" />
        </g>
        <circle cx={880} cy={112} r={12} fill={VERMELHO} opacity={Math.floor(f / 10) % 2 ? 1 : 0.3} />
        <text x={905} y={124} fontFamily="Roboto Condensed" fontWeight={800} fontSize={34} fill="#E8E0FF">REC</text>
        <rect x={980} y={520} width={22} height={760} rx={6} fill="url(#escalaT)" />
        <text x={968} y={510} textAnchor="end" fontFamily="Roboto Condensed" fontWeight={800} fontSize={30} fill="#E8E0FF">38°</text>
        <text x={968} y={1300} textAnchor="end" fontFamily="Roboto Condensed" fontWeight={800} fontSize={30} fill="#E8E0FF">4°</text>
      </svg>
      <Info rotulo="ALGO QUENTE" valor="38" unidade="°C" y={190} cor="#FFB23A" tam={160} de={10} />
    </AbsoluteFill>
  );
};

// 12 · Dois olhos no escuro... era um gato preto
export const E12_Gato: React.FC = () => {
  const { p, f } = useP();
  const cam = camEntre({ pos: [0.2, 0.55, 1.8], alvo: [0.3, 0.3, -1.6], fov: 38 }, { pos: [0.25, 0.5, 1.2], alvo: [0.3, 0.32, -1.6], fov: 34 }, p);
  const luz = interpolate(p, [0.42, 0.62], [0, 1], clamp);
  const gx = 0.3, gz = lerp(-2.6, -1.6, interpolate(p, [0.45, 0.8], [0, 1], clamp));
  const andando = p > 0.45 && p < 0.8;
  const q = projetarP(cam, [gx, 0, -2.6]);
  return (
    <AbsoluteFill>
      <Plano3D id="e12" clima="vazio" cam={cam} cenario={<Vazio3D />} desfoque={3}
        frente={luz > 0 ? gatoEm(cam, gx, gz, andando ? "andando" : "sentado", f, { espelhar: false, piscar: p > 0.85 && p < 0.9 ? 1 : 0 }) : null}
      />
      {/* escuridão que se abre quando ele entra na luz */}
      <AbsoluteFill style={{ background: "#03020A", opacity: 0.92 * (1 - luz) }} />
      {luz < 0.6 && q.pxPorMetro > 0 && (
        <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <g transform={`translate(${q.x},${q.y}) scale(${q.pxPorMetro * 0.0011})`} opacity={1 - luz * 1.6}>
            <Gato soOlhos brilho={1} piscar={p > 0.25 && p < 0.29 ? 1 : 0} />
          </g>
        </svg>
      )}
    </AbsoluteFill>
  );
};

// 13 · Ficaram só cinco minutos e abriram a fenda de volta
export const E13_Volta: React.FC = () => {
  const { p, f } = useP();
  const cam = camEntre({ pos: [1.2, 0.9, 4.6], alvo: [-0.1, 2.4, -1], fov: 52 }, { pos: [1.0, 0.8, 4.0], alvo: [-0.1, 3.1, -1], fov: 54 }, p);
  const abre = interpolate(p, [0.35, 0.8], [0, 1], clamp);
  const s = Math.floor(interpolate(p, [0, 0.4], [0, 300], clamp));
  const mm = String(Math.floor(s / 60)).padStart(2, "0"), ss = String(s % 60).padStart(2, "0");
  return (
    <ComOlhoRoxo>
      <Plano3D id="e13" clima="vazio" cam={cam} cenario={<Vazio3D fendaAcima={abre} />} desfoque={1.5}
        atores={[
          { quem: "chede", x: -0.4, z: 0.4, vista: "tresQuartos", expr: "determinado", pose: { olharY: -1, olhosPoder: abre, bracoD: 140, antebracoD: 10 } },
          { quem: "kaik", x: 0.55, z: 0.2, vista: "tresQuartos", espelhar: true, expr: "espanto", pose: { olharY: -1 } },
        ]}
        html={<Info rotulo="LÁ DENTRO" valor={`${mm}:${ss}`} y={170} cor="#9FD8FF" tam={180} de={0} />}
      />
    </ComOlhoRoxo>
  );
};

// cenário do dia seguinte (uma semana depois): campo vazio, marcas de pneu
const MarcasPneu: React.FC = () => (
  <group>
    {CARROS5.map((k, i) => (
      <group key={i} position={[CEN[0] + k.x * RC, 0.015, CEN[1] + k.z * RC]} rotation={[0, Math.atan2(-k.x, -k.z), 0]}>
        {[-0.75, 0.75].map((x) => (
          <mesh key={x} position={[x, 0, -3]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.28, 9]} />
            <meshStandardMaterial color="#5A4330" transparent opacity={0.55} depthWrite={false} />
          </mesh>
        ))}
      </group>
    ))}
  </group>
);
const Estrada: React.FC = () => (
  <group position={[0, 0.012, 16]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[200, 7]} />
      <meshStandardMaterial color="#4A4A50" roughness={0.95} />
    </mesh>
    {Array.from({ length: 30 }).map((_, i) => (
      <mesh key={i} position={[-90 + i * 6, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.6, 0.16]} />
        <meshStandardMaterial color="#E8C547" />
      </mesh>
    ))}
  </group>
);
const campoDia = (extra?: React.ReactNode) => <Campo3D marcas={1} rodasNovas filhos={<><MarcasPneu /><Estrada />{extra}</>} />;

// 14 · Os agentes tinham sumido. O campo, vazio.
export const E14_Vazio: React.FC = () => {
  const { p, f } = useP();
  const cam = orbita([CEN[0], 1, CEN[1]], lerp(-140, -100, p), lerp(10, 8, p), lerp(3.4, 2.4, p), 48, 1.0);
  const fecha = interpolate(p, [0, 0.35], [1.4, 0], clamp);
  return (
    <Plano3D id="e14" clima="manha" cam={cam} cenario={campoDia()} desfoque={0.8} mato="ambos"
      fundo2D={<FendaChao cam={cam} x={CEN[0]} z={CEN[1]} raio={fecha} />}
      atores={[
        { quem: "chede", x: CH[0], z: CH[1], vista: "tresQuartos", expr: "espanto", espelhar: encarar(cam, CH, KA), pose: { olharX: Math.sin(f / 12) } },
        { quem: "kaik", x: KA[0], z: KA[1], vista: "tresQuartos", expr: "espanto", espelhar: !encarar(cam, CH, KA), pose: { olharX: -Math.sin(f / 13) } },
      ]}
      html={<Info rotulo="AGENTES" valor="0" y={170} cor={AMARELO} tam={180} de={14} />}
    />
  );
};

// celular na mão (close), com o campo de dia desfocado atrás
const Celular: React.FC<{ children: React.ReactNode; inclina?: number }> = ({ children, inclina = 0 }) => (
  <div style={{ position: "absolute", left: 190, top: 430, width: 700, height: 1380, transform: `rotate(${inclina}deg)` }}>
    {/* palma (atrás do aparelho, embaixo) */}
    <div style={{ position: "absolute", left: 90, top: 980, width: 560, height: 620, borderRadius: 280, background: CORES_CHEDE.peleSombra }} />
    <div style={{ position: "absolute", inset: 0, borderRadius: 80, background: "#121216", padding: 24, boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 58, overflow: "hidden", background: "#F4F2EE", position: "relative" }}>
        {children}
      </div>
    </div>
    {/* pontas dos dedos aparecendo na borda direita */}
    {[0, 1, 2, 3].map((i) => (
      <div key={i} style={{ position: "absolute", left: 664, top: 760 + i * 118, width: 74, height: 100, borderRadius: 40, background: i % 2 ? CORES_CHEDE.peleSombra : CORES_CHEDE.pele }} />
    ))}
    {/* polegar por cima da borda esquerda */}
    <div style={{ position: "absolute", left: -34, top: 860, width: 96, height: 270, borderRadius: 48, background: CORES_CHEDE.pele, transform: "rotate(-14deg)" }} />
  </div>
);
const FundoDia: React.FC = () => {
  const cam = orbita([CEN[0], 1, CEN[1]], -110, 6, 1.6, 46, 1.1);
  return <Plano3D id="fd" clima="manha" cam={cam} cenario={campoDia()} desfoque={16} />;
};

// 15 · 87 chamadas perdidas
export const E15_Chamadas: React.FC = () => {
  const { p, f } = useP();
  const { fps } = useVideoConfig();
  const itens: [string, number, string][] = [["Mãe", 34, "#E35D4F"], ["Mãe do Kaik", 21, "#3D7DD8"], ["Pai", 12, "#59A85A"], ["Desconhecido", 11, "#7D8A99"], ["Faculdade", 9, "#F2B33D"]];
  const total = Math.round(interpolate(p, [0.1, 0.6], [0, 87], clamp));
  return (
    <AbsoluteFill>
      <FundoDia />
      <Celular inclina={lerp(-4, -1, p)}>
        <div style={{ padding: "70px 50px", ...fonte }}>
          <div style={{ fontSize: 46, color: "#888" }}>CHAMADAS PERDIDAS</div>
          <div style={{ fontSize: 150, color: VERMELHO, lineHeight: 1.1 }}>{total}</div>
          {itens.map(([n, c, cor], i) => {
            const sp = spring({ frame: f - 6 - i * 5, fps, config: { damping: 14 } });
            return (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 26, marginTop: 34, transform: `translateX(${(1 - sp) * 400}px)`, opacity: sp }}>
                <div style={{ width: 96, height: 96, borderRadius: 48, background: cor, color: "#fff", fontSize: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>{n[0]}</div>
                <div style={{ flex: 1, fontSize: 50, color: "#222" }}>{n}</div>
                <div style={{ fontSize: 50, color: VERMELHO }}>({c})</div>
              </div>
            );
          })}
        </div>
      </Celular>
    </AbsoluteFill>
  );
};

// 16 · A data: uma semana depois
export const E16_Data: React.FC = () => {
  const { p } = useP();
  const dia = Math.round(interpolate(p, [0.15, 0.65], [8, 15], clamp));
  return (
    <AbsoluteFill>
      <FundoDia />
      <Celular inclina={lerp(-1, 2, p)}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#2A3560, #6A4A7A)", ...fonte, color: "#fff", textAlign: "center" }}>
          <div style={{ marginTop: 160, fontSize: 56, letterSpacing: 4 }}>SEXTA-FEIRA</div>
          <div style={{ fontSize: 260, lineHeight: 1, color: dia === 15 ? AMARELO : "#fff" }}>{dia}</div>
          <div style={{ fontSize: 60, letterSpacing: 6 }}>DE NOVEMBRO</div>
          <div style={{ marginTop: 120, fontSize: 200 }}>07:12</div>
        </div>
      </Celular>
      <Info rotulo="PASSOU" valor="+7 DIAS" y={150} cor={AMARELO} tam={170} de={16} centro />
    </AbsoluteFill>
  );
};

// 17 · O tempo lá dentro anda devagar: 5 min lá, 7 dias aqui
export const E17_Tempo: React.FC = () => {
  const { p, f } = useP();
  const ang = interpolate(p, [0.1, 0.9], [0, 30], clamp); // ponteiro de minutos anda 5 min
  const dias = interpolate(p, [0.1, 0.9], [0, 7], clamp);
  const ciclo = (dias % 1);
  const ceu = ciclo < 0.5 ? "#7FB2E8" : "#16204A";
  return (
    <AbsoluteFill style={{ background: "#0D0920" }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        {/* metade de cima: lá dentro */}
        <rect x={0} y={0} width={1080} height={960} fill="#1A1238" />
        <g stroke="#7B5CFF" strokeWidth={2} opacity={0.3}>
          {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={i * 100} y1={0} x2={i * 100} y2={960} />)}
          {Array.from({ length: 10 }).map((_, i) => <line key={`h${i}`} x1={0} y1={i * 100} x2={1080} y2={i * 100} />)}
        </g>
        <g transform="translate(540,560)">
          <circle r={230} fill="#241A4A" stroke="#C9A6FF" strokeWidth={10} />
          {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={0} y1={-200} x2={0} y2={-180} stroke="#C9A6FF" strokeWidth={8} transform={`rotate(${i * 30})`} />)}
          <line x1={0} y1={0} x2={0} y2={-120} stroke="#fff" strokeWidth={14} strokeLinecap="round" transform="rotate(60)" />
          <line x1={0} y1={0} x2={0} y2={-185} stroke={ROXO_CLARO} strokeWidth={10} strokeLinecap="round" transform={`rotate(${ang})`} />
          <circle r={14} fill="#fff" />
        </g>
        {/* metade de baixo: aqui fora — dias passando */}
        <rect x={0} y={960} width={1080} height={960} fill={ceu} />
        {(() => {
          const a = ciclo * Math.PI * 2 - Math.PI / 2;
          const x = 540 + Math.cos(a) * 420, y = 1560 + Math.sin(a) * 420;
          return ciclo < 0.5 ? <circle cx={x} cy={y} r={70} fill="#FFD86A" /> : <circle cx={x} cy={y} r={56} fill="#E8EEFF" />;
        })()}
        <rect x={0} y={1640} width={1080} height={280} fill="#3E5A2E" />
        <line x1={0} y1={960} x2={1080} y2={960} stroke="#fff" strokeWidth={6} />
      </svg>
      <div style={{ position: "absolute", top: 120, width: "100%", textAlign: "center", ...fonte }}>
        <div style={{ fontSize: 50, color: "#fff", letterSpacing: 4, ...contorno(6) }}>LÁ DENTRO</div>
        <div style={{ fontSize: 150, color: ROXO_CLARO, lineHeight: 1, ...contorno(10) }}>5 MIN</div>
      </div>
      <div style={{ position: "absolute", top: 1010, width: "100%", textAlign: "center", ...fonte }}>
        <div style={{ fontSize: 50, color: "#fff", letterSpacing: 4, ...contorno(6) }}>AQUI FORA</div>
        <div style={{ fontSize: 150, color: AMARELO, lineHeight: 1, ...contorno(10) }}>{Math.min(7, Math.floor(dias) + 1)} {Math.floor(dias) + 1 > 1 ? "DIAS" : "DIA"}</div>
      </div>
      {f < 0 && null}
    </AbsoluteFill>
  );
};

// 18 · O gato preto tinha voltado junto
export const E18_GatoJunto: React.FC = () => {
  const { p, f } = useP();
  const cam = camEntre({ pos: [KA[0] + 1.6, 0.45, KA[1] + 2.4], alvo: [KA[0], 0.4, KA[1]], fov: 40 }, { pos: [KA[0] + 1.3, 0.42, KA[1] + 2.0], alvo: [KA[0], 0.38, KA[1]], fov: 38 }, p);
  const sai = interpolate(p, [0.1, 0.55], [0, 1], clamp);
  const gx = lerp(KA[0] - 0.25, KA[0] + 0.18, sai);
  return (
    <Plano3D id="e18" clima="manha" cam={cam} cenario={campoDia()} desfoque={2} mato="esq"
      fundo2D={gatoEm(cam, gx, KA[1] - 0.15, sai > 0 && sai < 1 ? "andando" : "sentado", f, { olharX: 0.6 })}
      atores={[{ quem: "kaik", x: KA[0], z: KA[1], vista: "tresQuartos", expr: "espanto", pose: { olharY: 1, olharX: 0.6, cabeca: 10 } }]}
    />
  );
};

// silhueta de contraluz posicionada no 3D
const Silhueta: React.FC<{ cam: Cam; x: number; z: number }> = ({ cam, x, z }) => {
  const q = projetarP(cam, [x, 0, z]);
  if (q.pxPorMetro <= 0) return null;
  const s = (q.pxPorMetro * 1.75) / 1500;
  return (
    <g>
      <defs>
        <filter id="silhueta" x="-30%" y="-30%" width="160%" height="160%">
          <feFlood floodColor="#07060A" result="c" />
          <feComposite in="c" in2="SourceAlpha" operator="in" result="m" />
          <feMorphology in="SourceAlpha" operator="dilate" radius={3} result="d" />
          <feFlood floodColor="#FFE2A8" result="l" />
          <feComposite in="l" in2="d" operator="in" result="borda" />
          <feGaussianBlur in="borda" stdDeviation={4} result="bb" />
          <feMerge><feMergeNode in="bb" /><feMergeNode in="m" /></feMerge>
        </filter>
        <radialGradient id="sol19">
          <stop offset="0" stopColor="#FFFBEA" stopOpacity={1} />
          <stop offset="0.25" stopColor="#FFE2A0" stopOpacity={0.8} />
          <stop offset="1" stopColor="#FFB060" stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* sol baixo bem atrás da pessoa */}
      <circle cx={q.x + 0.15 * q.pxPorMetro} cy={q.y - 1.3 * q.pxPorMetro} r={Math.max(120, 2.2 * q.pxPorMetro)} fill="url(#sol19)" style={{ mixBlendMode: "screen" }} />
      <g transform={`translate(${q.x},${q.y}) scale(${s})`} filter="url(#silhueta)">
        <AparenciaCtx.Provider value={APARENCIA_SILHUETA}>
          <Vivo quem="chede" x={0} y={0} s={1} vista="frente" pose={{ bracoE: 6, bracoD: 6 }} parado semSombra />
        </AparenciaCtx.Provider>
      </g>
      <ellipse cx={q.x} cy={q.y + 4} rx={0.6 * q.pxPorMetro} ry={0.06 * q.pxPorMetro} fill="#000" opacity={0.5} />
    </g>
  );
};
const ESP: [number, number] = [1.2, 15.2]; // onde a pessoa espera, na beira da estrada

// 19 · O gato correu até a estrada... alguém esperando os dois
export const E19_Esperando: React.FC = () => {
  const { p, f } = useP();
  const cam = camEntre({ pos: [-0.6, 1.5, -3.2], alvo: [0.8, 1.1, 14], fov: 42 }, { pos: [-0.4, 1.45, -1.4], alvo: [0.9, 1.15, 14], fov: 36 }, p);
  const corre = interpolate(p, [0.05, 0.85], [0, 1], clamp);
  const gx = lerp(KA[0], ESP[0] - 0.4, corre), gz = lerp(KA[1] + 0.4, ESP[1] - 0.3, corre);
  return (
    <Plano3D id="e19" clima="manha" cam={cam} cenario={campoDia()} desfoque={0.8} mato="ambos"
      fundo2D={<>
        <Silhueta cam={cam} x={ESP[0]} z={ESP[1]} />
        {gatoEm(cam, gx, gz, corre < 1 ? "correndo" : "sentado", f, { espelhar: projetar(cam, [ESP[0], 0, ESP[1]]).x < projetar(cam, [KA[0], 0, KA[1]]).x })}
      </>}
      atores={[
        { quem: "chede", x: CH[0], z: CH[1], vista: "costas" },
        { quem: "kaik", x: KA[0], z: KA[1], vista: "costas" },
      ]}
    />
  );
};

// 20 · Na parte 6: quem estava esperando? Segue pra ver!
export const E20_Final: React.FC = () => {
  const { p } = useP();
  const cam = camEntre({ pos: [0.4, 1.45, 8.5], alvo: [ESP[0], 1.2, ESP[1]], fov: 34 }, { pos: [0.7, 1.4, 10.2], alvo: [ESP[0], 1.25, ESP[1]], fov: 30 }, Math.min(1, p * 1.5));
  const escurece = interpolate(p, [0.35, 0.5], [0, 0.55], clamp);
  return (
    <AbsoluteFill>
      <Plano3D id="e20" clima="manha" cam={cam} cenario={campoDia()} desfoque={1.2}
        fundo2D={<><Silhueta cam={cam} x={ESP[0]} z={ESP[1]} />{gatoEm(cam, ESP[0] - 0.4, ESP[1] - 0.3, "sentado", 0, { espelhar: true })}</>}
      />
      {p > 0.35 && (
        <AbsoluteFill style={{ background: `rgba(10,6,14,${escurece})` }}>
          <div style={{ position: "absolute", top: 660, width: "100%", textAlign: "center", ...fonte }}>
            <div style={{ fontSize: 200, color: AMARELO, ...contorno(14), transform: `rotate(-4deg) scale(${interpolate(p, [0.35, 0.45], [0.4, 1], clamp)})` }}>PARTE 6</div>
            <div style={{ fontSize: 66, color: "#fff", marginTop: 30, ...contorno(8) }}>QUEM ESTAVA ESPERANDO?</div>
          </div>
          <SeloSegue top={1140} parte={6} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
