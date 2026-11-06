import React from "react";

// Chede — personagem principal do canal.
// Desenhado em partes articuladas para animar depois.
// Origem (0,0) = entre os pés, no chão. Altura total ~1430 unidades.

export const CORES_CHEDE = {
  pele: "#9A6340",
  peleSombra: "#7A4A2E",
  peleLuz: "#B07752",
  cabelo: "#1C1817",
  cabeloSombra: "#0F0C0C",
  cabeloBrilho: "#3A3230",
  camisa: "#F07C28",
  camisaSombra: "#C85F18",
  camisaDetalhe: "#B65412",
  bermuda: "#232327",
  bermudaSombra: "#141417",
  tenis: "#EFEDE8",
  tenisSombra: "#C9C5BD",
  tenisSola: "#2A2A2E",
  olhoBranco: "#FAF7F0",
  pupila: "#16110F",
  boca: "#4A2416",
};

export type Expressao =
  | "neutro"
  | "feliz"
  | "espanto"
  | "medo"
  | "raiva"
  | "determinado"
  | "cansado"
  | "rindo";

export type Vista = "frente" | "tresQuartos" | "perfil" | "costas";

export type Pose = {
  cabeca?: number; // inclinação da cabeça (graus)
  tronco?: number; // inclinação do tronco
  bracoE?: number; // ombro esquerdo (lado esquerdo da tela)
  antebracoE?: number;
  bracoD?: number;
  antebracoD?: number;
  pernaE?: number;
  joelhoE?: number;
  pernaD?: number;
  joelhoD?: number;
  olharX?: number; // -1..1
  olharY?: number; // -1..1
  piscar?: number; // 0 aberto .. 1 fechado
  respiracao?: number; // 0..1
};

const C = CORES_CHEDE;

// ---------- Rosto ----------
const Olho: React.FC<{
  x: number;
  esp: number; // escala do olho (1 normal, >1 arregalado)
  piscar: number;
  ox: number;
  oy: number;
  lado: 1 | -1;
  semicerrado?: number;
}> = ({ x, esp, piscar, ox, oy, lado, semicerrado = 0 }) => {
  const rx = 25 * esp;
  const ry = 29 * esp * (1 - piscar * 0.95);
  const fechamento = Math.min(1, semicerrado);
  return (
    <g transform={`translate(${x},0)`}>
      <ellipse cx={0} cy={0} rx={rx} ry={ry} fill={C.olhoBranco} />
      {ry > 4 && (
        <>
          <circle cx={ox * 9} cy={oy * 9} r={12 * Math.min(esp, 1.15)} fill={C.pupila} />
          <circle cx={ox * 9 - 4} cy={oy * 9 - 5} r={3.5} fill="#fff" />
        </>
      )}
      {/* pálpebra superior (semicerrado / cansado) */}
      {fechamento > 0 && (
        <rect
          x={-rx - 2}
          y={-ry - 2}
          width={rx * 2 + 4}
          height={(ry * 2 + 4) * fechamento * 0.55}
          fill={C.pele}
        />
      )}
      {piscar > 0.6 && (
        <path
          d={`M ${-rx} 0 Q 0 ${8 * lado * 0 + 8} ${rx} 0`}
          stroke={C.peleSombra}
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
        />
      )}
    </g>
  );
};

const Sobrancelha: React.FC<{ x: number; y: number; ang: number; lado: 1 | -1 }> = ({
  x,
  y,
  ang,
  lado,
}) => (
  <g transform={`translate(${x},${y}) rotate(${-ang * lado})`}>
    <rect x={-34} y={-10} width={68} height={20} rx={10} fill={C.cabelo} />
  </g>
);

const Boca: React.FC<{ tipo: Expressao }> = ({ tipo }) => {
  switch (tipo) {
    case "feliz":
      return <path d="M -38 0 Q 0 34 38 0" stroke={C.boca} strokeWidth={9} fill="none" strokeLinecap="round" />;
    case "rindo":
      return (
        <g>
          <path d="M -46 -6 Q 0 70 46 -6 Z" fill={C.boca} />
          <path d="M -34 -2 Q 0 8 34 -2 L 30 6 Q 0 14 -30 6 Z" fill="#fff" />
        </g>
      );
    case "espanto":
      return <ellipse cx={0} cy={8} rx={20} ry={28} fill={C.boca} />;
    case "medo":
      return <path d="M -36 10 Q -18 -6 0 8 Q 18 -6 36 10" stroke={C.boca} strokeWidth={8} fill="none" strokeLinecap="round" />;
    case "raiva":
      return <path d="M -34 14 Q 0 -10 34 14" stroke={C.boca} strokeWidth={9} fill="none" strokeLinecap="round" />;
    case "determinado":
      return <path d="M -30 4 L 30 0" stroke={C.boca} strokeWidth={9} strokeLinecap="round" />;
    case "cansado":
      return <path d="M -26 6 Q 0 0 26 6" stroke={C.boca} strokeWidth={8} fill="none" strokeLinecap="round" />;
    default:
      return <path d="M -26 0 Q 0 10 26 0" stroke={C.boca} strokeWidth={8} fill="none" strokeLinecap="round" />;
  }
};

const EXPRESSOES: Record<
  Expressao,
  { olho: number; sobY: number; sobAng: number; semicerrado?: number }
> = {
  neutro: { olho: 1, sobY: -52, sobAng: 0 },
  feliz: { olho: 0.95, sobY: -58, sobAng: -6 },
  rindo: { olho: 0.8, sobY: -60, sobAng: -8, semicerrado: 0.5 },
  espanto: { olho: 1.35, sobY: -82, sobAng: -10 },
  medo: { olho: 1.2, sobY: -72, sobAng: -18 },
  raiva: { olho: 0.95, sobY: -40, sobAng: 20 },
  determinado: { olho: 0.95, sobY: -44, sobAng: 12, semicerrado: 0.25 },
  cansado: { olho: 0.95, sobY: -46, sobAng: -8, semicerrado: 0.6 },
};

const GIRO: Record<Vista, number> = { frente: 0, tresQuartos: 75, perfil: 150, costas: 0 };

export const Cabeca: React.FC<{ expressao: Expressao; pose: Pose; vista?: Vista }> = ({
  expressao,
  pose,
  vista = "frente",
}) => {
  const e = EXPRESSOES[expressao];
  const ox = pose.olharX ?? (vista === "frente" ? 0 : 0.6);
  const oy = pose.olharY ?? 0;
  const piscar = pose.piscar ?? 0;
  const fx = GIRO[vista];
  const costas = vista === "costas";
  const perfil = vista === "perfil";
  const tres = vista === "tresQuartos";
  return (
    <g>
      <defs>
        <clipPath id={`clipCabeca-${vista}`}>
          <ellipse cx={0} cy={0} rx={212} ry={205} />
        </clipPath>
      </defs>
      {/* orelhas */}
      {(vista === "frente" || costas) && (
        <>
          <ellipse cx={-206} cy={22} rx={30} ry={38} fill={C.pele} />
          <ellipse cx={206} cy={22} rx={30} ry={38} fill={C.peleSombra} />
        </>
      )}
      {tres && <ellipse cx={-196} cy={22} rx={26} ry={38} fill={C.pele} />}
      {/* nariz de perfil (sai do contorno) */}
      {perfil && <path d="M 196 10 Q 236 50 214 70 Q 204 74 190 66 Z" fill={C.pele} />}
      {/* cabeça com sombra em faces */}
      <ellipse cx={0} cy={0} rx={212} ry={205} fill={C.pele} />
      <g clipPath={`url(#clipCabeca-${vista})`}>
        <path d="M 60 -260 C 170 -150 190 80 60 260 L 300 260 L 300 -260 Z" fill={C.peleSombra} opacity={0.55} />
        <ellipse cx={-90} cy={-90} rx={70} ry={40} fill={C.peleLuz} opacity={0.35} />
        <path d="M -212 -60 C -230 40 -170 160 -90 200 C -170 150 -200 60 -196 -40 Z" fill="#FFD9A8" opacity={0.35} />
      </g>
      {perfil && <ellipse cx={-20} cy={22} rx={30} ry={40} fill={C.peleSombra} />}
      {/* cabelo */}
      {costas ? (
        <g>
          <path d={CABELO_COSTAS} fill={C.cabelo} />
          {MECHAS.map((d, i) => (
            <path key={i} d={d} stroke={C.cabeloBrilho} strokeWidth={7} fill="none" strokeLinecap="round" transform="translate(0,60)" />
          ))}
        </g>
      ) : (
        <g>
          {(perfil || tres) && <path d={perfil ? CABELO_NUCA_PERFIL : CABELO_NUCA_TRES} fill={C.cabelo} />}
          <g transform={`translate(${fx * 0.25},0)`}>
            <path d={CABELO} fill={C.cabelo} />
            <path d={CABELO_SOMBRA} fill={C.cabeloSombra} />
            {MECHAS.map((d, i) => (
              <path key={i} d={d} stroke={C.cabeloBrilho} strokeWidth={7} fill="none" strokeLinecap="round" />
            ))}
          </g>
        </g>
      )}
      {/* rosto */}
      {!costas && (
        <g transform={`translate(${fx},20)`}>
          {!perfil && <Sobrancelha x={-74} y={e.sobY} ang={e.sobAng} lado={-1} />}
          <g transform={tres ? "translate(74,0) scale(0.8,1) translate(-74,0)" : undefined}>
            <Sobrancelha x={perfil ? 10 : 74} y={e.sobY} ang={e.sobAng} lado={1} />
          </g>
          {!perfil && <Olho x={-74} esp={e.olho} piscar={piscar} ox={ox} oy={oy} lado={-1} semicerrado={e.semicerrado} />}
          <g transform={tres ? "translate(74,0) scale(0.8,1) translate(-74,0)" : undefined}>
            <Olho x={perfil ? 10 : 74} esp={e.olho} piscar={piscar} ox={ox} oy={oy} lado={1} semicerrado={e.semicerrado} />
          </g>
          {/* nariz */}
          {!perfil && (
            <path d="M 6 36 Q 22 58 2 66" stroke={C.peleSombra} strokeWidth={8} fill="none" strokeLinecap="round" />
          )}
          <g transform={`translate(${perfil ? 10 : 0},112) scale(${perfil ? 0.6 : tres ? 0.85 : 1},1)`}>
            <Boca tipo={expressao} />
          </g>
        </g>
      )}
    </g>
  );
};

// ---------- Cabelo (gerado) ----------
const contorno = () => {
  const pts: string[] = [];
  const n = 56;
  for (let i = 0; i <= n; i++) {
    const a = ((196 - (212 * i) / n) * Math.PI) / 180;
    const R = 230 + 13 * Math.abs(Math.sin(i * 0.9));
    pts.push(`${(Math.cos(a) * R).toFixed(1)} ${(-Math.sin(a) * R - 6).toFixed(1)}`);
  }
  // franja: da têmpora direita à esquerda, caindo para a esquerda
  const fr: [number, number][] = [
    [206, 20], [196, -60], [150, -92], [104, -96], [70, -78], [30, -96], [-10, -80],
    [-52, -96], [-96, -70], [-140, -66], [-178, -30], [-206, 30],
  ];
  let d = `M ${pts[0]} `;
  for (let i = 1; i < pts.length; i++) d += `L ${pts[i]} `;
  for (let i = 0; i < fr.length - 1; i++) {
    const [x1, y1] = fr[i];
    const [x2, y2] = fr[i + 1];
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2 + 16;
    d += `L ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2} `;
  }
  return d + "Z";
};
const CABELO = contorno();
const CABELO_SOMBRA =
  "M 120 -200 C 190 -160 230 -80 222 10 L 206 20 L 196 -60 C 180 -80 160 -90 150 -92 C 170 -130 160 -170 120 -200 Z";
const CABELO_COSTAS =
  "M -226 40 C -250 -140 -140 -250 0 -252 C 140 -250 250 -140 226 40 C 220 110 170 150 120 150 C 60 120 -60 120 -120 150 C -170 150 -220 110 -226 40 Z";
const CABELO_NUCA_PERFIL =
  "M -230 0 C -250 -150 -140 -250 0 -250 L 40 -100 C -40 -60 -90 0 -60 90 C -110 130 -170 130 -210 100 Z";
const CABELO_NUCA_TRES =
  "M -228 20 C -250 -150 -140 -250 0 -250 L 20 -100 C -80 -80 -150 -20 -150 60 C -180 90 -210 80 -228 20 Z";
const MECHAS = [
  "M -150 -170 Q -110 -200 -60 -200",
  "M -40 -220 Q 10 -236 60 -222",
  "M -180 -110 Q -160 -140 -120 -150",
  "M 40 -170 Q 80 -184 120 -168",
  "M -90 -140 Q -60 -160 -20 -158",
];

// ---------- Membros ----------
const Braco: React.FC<{
  lado: 1 | -1;
  ombro: number;
  cotovelo: number;
  sombra?: boolean;
}> = ({ lado, ombro, cotovelo, sombra }) => {
  const pele = sombra ? C.peleSombra : C.pele;
  const manga = sombra ? C.camisaSombra : C.camisa;
  return (
    <g transform={`rotate(${-ombro * lado})`}>
      {/* braço */}
      <rect x={-23} y={0} width={46} height={300} rx={23} fill={pele} />
      {/* manga curta */}
      <path d="M -40 -20 Q 0 -40 40 -20 L 44 100 Q 0 112 -44 100 Z" fill={manga} />
      <path d="M -44 92 Q 0 104 44 92 L 44 100 Q 0 112 -44 100 Z" fill={C.camisaDetalhe} />
      <g transform={`translate(0,286) rotate(${-cotovelo * lado})`}>
        <rect x={-21} y={-10} width={42} height={270} rx={21} fill={pele} />
        {/* mão */}
        <ellipse cx={0} cy={272} rx={34} ry={40} fill={pele} />
        <ellipse cx={-26 * lado} cy={256} rx={12} ry={24} fill={pele} transform={`rotate(${-25 * lado} ${-26 * lado} 256)`} />
      </g>
    </g>
  );
};

const Perna: React.FC<{ lado: 1 | -1; quadril: number; joelho: number; sombra?: boolean; paraDireita?: boolean }> = ({
  lado,
  quadril,
  joelho,
  sombra,
  paraDireita,
}) => {
  const pe = paraDireita ? 1 : lado;
  const pele = sombra ? C.peleSombra : C.pele;
  return (
    <g transform={`rotate(${-quadril * lado})`}>
      {/* coxa (coberta pela bermuda) */}
      <rect x={-34} y={0} width={68} height={390} rx={30} fill={pele} />
      <g transform={`translate(0,376) rotate(${-joelho * lado})`}>
        <rect x={-26} y={-14} width={52} height={360} rx={24} fill={pele} />
        {/* tênis */}
        <g transform={`translate(${12 * pe},364)`}>
          <path d={`M ${-46} -26 Q ${-46} -50 ${-10} -48 L ${30} -44 Q ${78} -36 ${82} 0 L ${-50} 0 Z`} transform={pe === -1 ? "scale(-1,1)" : undefined} fill={sombra ? C.tenisSombra : C.tenis} />
          <rect x={-52} y={-6} width={136} height={16} rx={7} fill={C.tenisSola} transform={pe === -1 ? "scale(-1,1)" : undefined} />
        </g>
      </g>
    </g>
  );
};

// ---------- Corpo inteiro ----------
export const Chede: React.FC<{ expressao?: Expressao; pose?: Pose; vista?: Vista; semSombra?: boolean }> = ({
  expressao = "neutro",
  pose = {},
  vista = "frente",
  semSombra,
}) => {
  const sx = vista === "perfil" ? 0.58 : vista === "tresQuartos" ? 0.84 : 1;
  const ombroX = vista === "perfil" ? 20 : 150 * sx;
  const quadrilX = vista === "perfil" ? 16 : 62 * sx;
  const costas = vista === "costas";
  const lateral = vista === "perfil" || vista === "tresQuartos";
  const resp = pose.respiracao ?? 0;
  const P = {
    bracoE: 10,
    antebracoE: -6,
    bracoD: 10,
    antebracoD: -6,
    pernaE: 4,
    joelhoE: -4,
    pernaD: 4,
    joelhoD: -4,
    ...pose,
  };
  return (
    <g>
      {/* sombra no chão */}
      {!semSombra && <ellipse cx={0} cy={6} rx={200} ry={26} fill="#000" opacity={0.18} />}
      {/* pernas */}
      <g transform={`translate(${-quadrilX},-760)`}>
        <Perna lado={-1} quadril={P.pernaE} joelho={P.joelhoE} paraDireita={lateral} />
      </g>
      <g transform={`translate(${quadrilX},-760)`}>
        <Perna lado={1} quadril={P.pernaD} joelho={P.joelhoD} sombra paraDireita={lateral} />
      </g>
      <g transform={`rotate(${P.tronco ?? 0} 0 -560) translate(0,${-resp * 6})`}>
        {/* bermuda */}
        <g transform={`scale(${sx},1)`}>
        <path d="M -150 -790 L 150 -790 L 172 -470 L 18 -456 L 0 -560 L -18 -456 L -172 -470 Z" fill={C.bermuda} />
        <path d="M 40 -790 L 150 -790 L 172 -470 L 90 -462 Z" fill={C.bermudaSombra} />
        <rect x={-152} y={-800} width={304} height={26} rx={6} fill={C.bermudaSombra} />
        </g>
        {/* braço de trás (direita da tela) */}
        <g transform={`translate(${ombroX},-1150)`}>
          <Braco lado={1} ombro={P.bracoD} cotovelo={P.antebracoD} sombra />
        </g>
        <g transform={`scale(${sx},1)`}>
        {/* tronco / camisa */}
        <path
          d="M -150 -1176 Q 0 -1206 150 -1176 Q 172 -1160 170 -1120 L 158 -780 L -158 -780 L -170 -1120 Q -172 -1160 -150 -1176 Z"
          fill={C.camisa}
        />
        <path d="M 60 -1190 Q 150 -1180 170 -1120 L 158 -780 L 70 -780 Q 100 -980 60 -1190 Z" fill={C.camisaSombra} />
        <path d="M -158 -800 L 158 -800 L 158 -780 L -158 -780 Z" fill={C.camisaDetalhe} />
        {/* pescoço + gola */}
        <rect x={-42} y={-1232} width={84} height={70} rx={20} fill={C.peleSombra} />
        {costas ? (
          <path d="M -60 -1196 Q 0 -1186 60 -1196" stroke={C.camisaDetalhe} strokeWidth={14} fill="none" strokeLinecap="round" />
        ) : (
          <path d="M -62 -1188 Q 0 -1130 62 -1188" stroke={C.camisaDetalhe} strokeWidth={14} fill="none" strokeLinecap="round" />
        )}
        {/* bolso */}
        {(vista === "frente" || vista === "tresQuartos") && (
          <g transform={vista === "tresQuartos" ? "translate(40,0)" : undefined}>
            <path d="M -118 -1100 L -54 -1100 L -54 -1040 Q -86 -1028 -118 -1040 Z" fill={C.camisaSombra} />
            <rect x={-118} y={-1104} width={64} height={10} rx={3} fill={C.camisaDetalhe} />
          </g>
        )}
        </g>
        {/* braço da frente (esquerda da tela) */}
        <g transform={`translate(${-ombroX},-1150)`}>
          <Braco lado={-1} ombro={P.bracoE} cotovelo={P.antebracoE} />
        </g>
        {/* cabeça */}
        <g transform={`translate(0,-1420) rotate(${P.cabeca ?? 0} 0 190)`}>
          <Cabeca expressao={expressao} pose={P} vista={vista} />
        </g>
      </g>
    </g>
  );
};
