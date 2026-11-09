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
  olhosPoder?: number; // 0..1 — olhos brilhando (vilão usando o controle mental)
  controlado?: number; // 0..1 — anel âmbar na íris (pessoa sob controle mental)
  sangueNariz?: number; // 0..1 — fio de sangue saindo do nariz
  oculos?: number; // 0 sem óculos .. 1 óculos escuros no rosto (entre 0 e 1: tirando)
};

export type Cores = typeof CORES_CHEDE;
export type Aparencia = {
  cores: Cores;
  cabelo: "ondulado" | "cacheado" | "penteado" | "raspado";
  estampa: "bolso" | "faixa" | "terno";
  // só para estampa "terno": camisa social e gravata (o paletó usa cores.camisa, a calça usa cores.bermuda)
  camisaSocial?: string;
  gravata?: string;
  gravataSombra?: string;
  corPoder?: string; // cor do brilho dos olhos / anel de controle
  rugas?: boolean;
  barba?: boolean;
  // figurantes (tudo opcional; o Chede e o Kaik não usam)
  roupa?: "camiseta" | "moletom" | "camisa"; // moletom = manga longa + capuz; camisa = gola e botões
  calca?: boolean; // calça comprida (usa cores.bermuda)
  bone?: string; // cor do boné
  oculosGrau?: boolean;
  mochila?: string; // cor da mochila
  // Lia
  cabeloLongo?: "tranca" | "solto"; // trança lateral (ombro esquerdo da tela) ou cabelo comprido solto
  sardas?: boolean;
  maos?: string; // cor das mãos (ex.: poeira preta do outro lugar)
  dedosLongos?: boolean;
  geada?: boolean; // pontinhos de gelo no cabelo
};
export const APARENCIA_CHEDE: Aparencia = { cores: CORES_CHEDE, cabelo: "ondulado", estampa: "bolso" };
export const AparenciaCtx = React.createContext<Aparencia>(APARENCIA_CHEDE);
const useA = () => React.useContext(AparenciaCtx);
// Proporção 2.0 (estilo da referência 5, aprovada 08/11): cabeça menor e braços/pernas mais grossos. Padrão: ligada.
export const Corpo2Ctx = React.createContext(true);
// Rosto 3 (estilo da referência 5, pedido do usuário 09/11): olhos pequenos (bolinha) que só crescem no susto,
// boca/nariz menores, sobrancelha curta e grossa, língua na boca aberta, dedos marcados, braço afinando. Padrão: DESLIGADO (usuário recusou, 09/11).
export const Rosto3Ctx = React.createContext(false);

// ---------- Rosto ----------
const Olho: React.FC<{
  x: number;
  esp: number; // escala do olho (1 normal, >1 arregalado)
  piscar: number;
  ox: number;
  oy: number;
  lado: 1 | -1;
  semicerrado?: number;
  poder?: number;
  controlado?: number;
}> = ({ x, esp, piscar, ox, oy, lado, semicerrado = 0, poder = 0, controlado = 0 }) => {
  const A = useA();
  const C = A.cores;
  const cor = A.corPoder ?? "#FFB21E";
  const r3 = React.useContext(Rosto3Ctx);
  const grande = esp >= 1.15; // susto/medo: olho redondo grande
  const k3 = r3 ? (grande ? 0.95 : 0.7) : 1;
  const rx = 25 * esp * k3;
  const ry = 29 * esp * k3 * (r3 && !grande ? 1.3 : 1) * (1 - piscar * 0.95);
  const rp = r3 ? (grande ? 12 : rx * 0.9) : 12 * Math.min(esp, 1.15);
  const mv = r3 ? (grande ? 9 : 4) : 9;
  const fechamento = Math.min(1, semicerrado);
  return (
    <g transform={`translate(${x},0)`}>
      <ellipse cx={0} cy={0} rx={rx} ry={ry} fill={r3 && !grande && !poder && !controlado ? C.pupila : C.olhoBranco} />
      {ry > 4 && (
        <>
          {poder > 0 && <ellipse cx={0} cy={0} rx={rx} ry={ry} fill={cor} opacity={0.35 * poder} />}
          <circle cx={ox * mv} cy={oy * mv} r={rp} fill={C.pupila} />
          {poder > 0 && <circle cx={ox * mv} cy={oy * mv} r={rp} fill={cor} opacity={poder} />}
          {poder > 0 && <circle cx={ox * mv} cy={oy * mv} r={5} fill="#FFF6D8" opacity={poder} />}
          {controlado > 0 && (
            <circle cx={ox * mv} cy={oy * mv} r={rp * 1.3} fill="none" stroke={cor} strokeWidth={r3 ? 4 : 5} opacity={controlado} />
          )}
          {!(r3 && !grande) && <circle cx={ox * mv - rp * 0.35} cy={oy * mv - rp * 0.4} r={r3 ? 3 : 3.5} fill="#fff" opacity={controlado > 0 ? 1 - controlado * 0.8 : 1} />}
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
      {poder > 0 && (
        <g opacity={poder}>
          <ellipse cx={0} cy={0} rx={rx * 2.1} ry={ry * 1.6} fill={cor} opacity={0.18} />
          <ellipse cx={0} cy={0} rx={rx * 1.4} ry={ry * 1.15} fill={cor} opacity={0.22} />
        </g>
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
}) => {
  const C = useA().cores;
  return (
    <g transform={`translate(${x},${y}) rotate(${-ang * lado})`}>
      {React.useContext(Rosto3Ctx)
        ? <rect x={-36} y={-2} width={72} height={24} rx={5} fill={C.cabelo} />
        : <rect x={-34} y={-10} width={68} height={20} rx={10} fill={C.cabelo} />}
    </g>
  );
};

const Boca: React.FC<{ tipo: Expressao }> = ({ tipo }) => {
  const C = useA().cores;
  switch (tipo) {
    case "feliz":
      return <path d="M -38 0 Q 0 34 38 0" stroke={C.boca} strokeWidth={9} fill="none" strokeLinecap="round" />;
    case "rindo":
      return (
        <g>
          <path d="M -46 -6 Q 0 70 46 -6 Z" fill={C.boca} />
          <ellipse cx={0} cy={36} rx={18} ry={9} fill="#E8869A" />
          <path d="M -34 -2 Q 0 8 34 -2 L 30 6 Q 0 14 -30 6 Z" fill="#fff" />
        </g>
      );
    case "espanto":
      return (
        <g>
          <ellipse cx={0} cy={8} rx={20} ry={28} fill={C.boca} />
          <ellipse cx={0} cy={24} rx={13} ry={10} fill="#E8869A" />
        </g>
      );
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
  const A = useA();
  const C = A.cores;
  const e = EXPRESSOES[expressao];
  const ox = pose.olharX ?? (vista === "frente" ? 0 : 0.6);
  const oy = pose.olharY ?? 0;
  const piscar = pose.piscar ?? 0;
  const fx = GIRO[vista];
  const costas = vista === "costas";
  const perfil = vista === "perfil";
  const tres = vista === "tresQuartos";
  const r3 = React.useContext(Rosto3Ctx);
  const ex = r3 ? 56 : 74; // distância dos olhos ao centro
  return (
    <g>
      <defs>
        <clipPath id={`clipCabeca-${vista}`}>
          <ellipse cx={0} cy={0} rx={212} ry={205} />
        </clipPath>
      </defs>
      {/* cabelo comprido solto: atrás da cabeça, caindo até os ombros */}
      {A.cabeloLongo === "solto" && (
        <path
          d={costas
            ? "M -230 -40 C -250 200 -240 470 -200 600 Q 0 640 200 600 C 240 470 250 200 230 -40 Z"
            : "M -228 -30 C -262 180 -270 430 -236 590 Q -190 610 -150 590 C -140 400 -130 220 -120 120 L 120 120 C 130 220 140 400 150 590 Q 190 610 236 590 C 270 430 262 180 228 -30 Z"}
          fill={C.cabeloSombra}
        />
      )}
      {A.cabeloLongo === "solto" && !costas && (
        <g stroke={C.cabeloBrilho} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.7}>
          {[-240, -205, -170, 170, 205, 240].map((x, i) => (
            <path key={i} d={`M ${x * 0.95} 40 C ${x * 1.05} 220 ${x * 0.9} 380 ${x * 0.98} 570`} />
          ))}
        </g>
      )}
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
      {r3 ? (
        <g>
          {/* sombra suave em degradê (estilo da referência 5): luz em cima à esquerda, sombra embaixo à direita */}
          <defs>
            <radialGradient id="rostoSuave3" cx="0.36" cy="0.3" r="0.82">
              <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.16} />
              <stop offset="0.5" stopColor="#000000" stopOpacity={0} />
              <stop offset="1" stopColor="#000000" stopOpacity={0.34} />
            </radialGradient>
          </defs>
          <ellipse cx={0} cy={0} rx={212} ry={205} fill="url(#rostoSuave3)" />
          <g clipPath={`url(#clipCabeca-${vista})`}>
            {/* sombra do cabelo na testa, desfocada */}
            <ellipse cx={0} cy={-170} rx={230} ry={80} fill="#000" opacity={0.12} />
          </g>
        </g>
      ) : (
        <g clipPath={`url(#clipCabeca-${vista})`}>
          <path d="M 60 -260 C 170 -150 190 80 60 260 L 300 260 L 300 -260 Z" fill={C.peleSombra} opacity={0.55} />
          <ellipse cx={-90} cy={-90} rx={70} ry={40} fill={C.peleLuz} opacity={0.35} />
          <path d="M -212 -60 C -230 40 -170 160 -90 200 C -170 150 -200 60 -196 -40 Z" fill="#FFD9A8" opacity={0.35} />
        </g>
      )}
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
            {A.cabeloLongo ? (
              <>
                {/* cabelo liso com risca no meio (Lia) */}
                <path d="M -228 150 C -256 -150 -132 -252 0 -252 C 132 -252 256 -150 228 150 L 198 150 C 204 10 172 -66 120 -98 Q 44 -136 0 -104 Q -44 -136 -120 -98 C -172 -66 -204 10 -198 150 Z" fill={C.cabelo} />
                <path d="M 0 -104 Q 60 -150 150 -110 C 190 -80 214 0 214 80 L 198 150 C 204 10 172 -66 120 -98 Q 44 -136 0 -104 Z" fill={C.cabeloSombra} opacity={0.5} />
                {["M -40 -200 Q -150 -170 -200 -40", "M 40 -200 Q 150 -170 200 -40", "M -10 -236 Q -120 -220 -180 -120", "M 10 -236 Q 120 -220 180 -120"].map((d, i) => (
                  <path key={i} d={d} stroke={C.cabeloBrilho} strokeWidth={7} fill="none" strokeLinecap="round" />
                ))}
              </>
            ) : r3 && A.cabelo === "ondulado" ? (
              <CabeloBolinhas cor={C.cabelo} sombra={C.cabeloSombra} brilho={C.cabeloBrilho} />
            ) : A.cabelo === "raspado" ? (
              <>
                <path d={CABELO_RASPADO} fill={C.cabelo} opacity={0.9} />
              </>
            ) : A.cabelo === "penteado" ? (
              <>
                <path d={CABELO_PENTEADO} fill={C.cabelo} />
                <path d={CABELO_SOMBRA} fill={C.cabeloSombra} opacity={0.6} />
                {PENTEADO_FIOS.map((d, i) => (
                  <path key={i} d={d} stroke={C.cabeloBrilho} strokeWidth={8} fill="none" strokeLinecap="round" />
                ))}
              </>
            ) : A.cabelo === "cacheado" ? (
              <>
                <path d={CABELO_CACHEADO} fill={C.cabelo} />
                <path d={CABELO_SOMBRA} fill={C.cabeloSombra} />
                {CACHOS.map(([x, y], i) => (
                  <path key={i} d={`M ${x - 14} ${y} a 14 14 0 1 1 14 14`} stroke={C.cabeloBrilho} strokeWidth={6} fill="none" strokeLinecap="round" />
                ))}
              </>
            ) : (
              <>
                <path d={CABELO} fill={C.cabelo} />
                <path d={CABELO_SOMBRA} fill={C.cabeloSombra} />
                {MECHAS.map((d, i) => (
                  <path key={i} d={d} stroke={C.cabeloBrilho} strokeWidth={7} fill="none" strokeLinecap="round" />
                ))}
              </>
            )}
          </g>
        </g>
      )}
      {/* trança lateral: cai sobre o ombro do lado esquerdo da tela */}
      {A.cabeloLongo === "tranca" && (
        <g>
          {Array.from({ length: 7 }).map((_, i) => {
            const x = (costas ? 150 : -150) + (costas ? 1 : -1) * Math.sin(i * 0.5) * 18;
            const y = 150 + i * 62;
            const r = 46 - i * 3;
            return (
              <g key={i}>
                <ellipse cx={x} cy={y} rx={r} ry={38} fill={C.cabelo} />
                <path d={`M ${x - r * 0.7} ${y - 10} Q ${x} ${y + 26} ${x + r * 0.7} ${y - 10}`} stroke={C.cabeloBrilho} strokeWidth={6} fill="none" strokeLinecap="round" />
              </g>
            );
          })}
          <rect x={(costas ? 150 : -150) - 20} y={560} width={40} height={20} rx={8} fill={A.cores.camisaDetalhe} />
          <path d={`M ${(costas ? 150 : -150) - 26} 578 Q ${costas ? 150 : -150} 640 ${(costas ? 150 : -150) + 26} 578 Z`} fill={C.cabelo} />
        </g>
      )}
      {A.geada && (
        <g fill="#EAF6FF" opacity={0.85}>
          {[[-150, -150], [-60, -210], [40, -200], [130, -160], [180, -80], [-190, -60], [-90, -180], [90, -220], [200, 60], [-210, 120], [210, 300], [-220, 380]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={6 + (i % 3) * 3} />
          ))}
        </g>
      )}
      {/* boné (figurantes) */}
      {A.bone && (
        <g>
          {costas ? (
            <path d="M -222 -40 C -230 -200 -120 -262 0 -262 C 120 -262 230 -200 222 -40 Q 0 -80 -222 -40 Z" fill={A.bone} />
          ) : (
            <g transform={`translate(${fx * 0.25},0)`}>
              <path d="M -220 -50 C -226 -205 -118 -262 0 -262 C 118 -262 226 -205 220 -50 Q 0 -96 -220 -50 Z" fill={A.bone} />
              <path d="M -220 -50 Q 0 -96 220 -50 L 214 -30 Q 0 -76 -214 -30 Z" fill="#000" opacity={0.25} />
              {vista === "frente" ? (
                <path d="M -200 -52 Q 0 -120 200 -52 Q 0 -20 -200 -52 Z" fill={A.bone} />
              ) : (
                <path d="M 80 -70 Q 260 -110 330 -40 Q 220 -30 90 -40 Z" fill={A.bone} />
              )}
              <circle cx={0} cy={-258} r={14} fill="#000" opacity={0.25} />
            </g>
          )}
        </g>
      )}
      {/* barba (contorno do queixo + bigode, boca livre) */}
      {A.barba && !costas && (
        <g clipPath={`url(#clipCabeca-${vista})`}>
          <g transform={`translate(${fx},0)`}>
            <path
              fillRule="evenodd"
              fill={C.cabelo}
              d={
                vista === "frente"
                  ? `M -214 -20 L 214 -20 L 214 300 L -214 300 Z
                     M -194 -20 C -186 90 -150 140 -90 150 Q 0 138 90 150 C 150 140 186 90 194 -20 Z
                     M -48 134 A 48 20 0 1 0 48 134 A 48 20 0 1 0 -48 134 Z`
                  : `M -150 -20 L 214 -20 L 214 300 L -40 300 C -100 220 -150 120 -150 -20 Z
                     M -128 -20 C -120 90 -110 140 -70 150 Q 0 138 90 150 C 150 140 186 90 194 -20 Z
                     M -48 134 A 48 20 0 1 0 48 134 A 48 20 0 1 0 -48 134 Z`
              }
            />
            <path d="M -60 116 Q 0 98 60 116 L 54 126 Q 0 112 -54 126 Z" fill={C.cabelo} />
          </g>
        </g>
      )}
      {/* rosto */}
      {!costas && (
        <g transform={`translate(${fx},${r3 ? 24 : 20})`}>
          {!perfil && <Sobrancelha x={-ex} y={e.sobY} ang={e.sobAng} lado={-1} />}
          <g transform={tres ? "translate(74,0) scale(0.8,1) translate(-74,0)" : undefined}>
            <Sobrancelha x={perfil ? 10 : ex} y={e.sobY} ang={e.sobAng} lado={1} />
          </g>
          {!perfil && <Olho x={-ex} esp={e.olho} piscar={piscar} ox={ox} oy={oy} lado={-1} semicerrado={e.semicerrado} poder={pose.olhosPoder} controlado={pose.controlado} />}
          <g transform={tres ? "translate(74,0) scale(0.8,1) translate(-74,0)" : undefined}>
            <Olho x={perfil ? 10 : ex} esp={e.olho} piscar={piscar} ox={ox} oy={oy} lado={1} semicerrado={e.semicerrado} poder={pose.olhosPoder} controlado={pose.controlado} />
          </g>
          {A.sardas && !perfil && (
            <g fill={C.peleSombra} opacity={0.75}>
              {[[-70, 70], [-50, 84], [-88, 86], [-62, 100], [70, 70], [50, 84], [88, 86], [62, 100], [-20, 58], [22, 60]].map(([x, y], i) => (
                <circle key={i} cx={x + (tres ? 30 : 0)} cy={y} r={5} />
              ))}
            </g>
          )}
          {A.rugas && !perfil && (
            <g stroke={C.peleSombra} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7}>
              <path d="M -40 70 Q -60 100 -54 130" />
              <path d="M 44 70 Q 64 100 58 130" />
              <path d="M -30 -100 Q 0 -108 30 -100" />
            </g>
          )}
          {/* nariz */}
          {!perfil && (r3
            ? null
            : <path d="M 6 36 Q 22 58 2 66" stroke={C.peleSombra} strokeWidth={8} fill="none" strokeLinecap="round" />)}
          {/* sangue escorrendo do nariz (0..1 = comprimento) */}
          {(pose.sangueNariz ?? 0) > 0 && (() => {
            const L = 14 + (pose.sangueNariz ?? 0) * 95;
            const nx = perfil ? 48 : 8;
            const ny = perfil ? 54 : 66;
            return (
              <path d={`M ${nx - 9} ${ny} C ${nx - 12} ${ny + L * 0.5} ${nx - 9} ${ny + L} ${nx - 2} ${ny + L + 8} C ${nx + 6} ${ny + L + 8} ${nx + 8} ${ny + L * 0.6} ${nx + 5} ${ny} Z`} fill="#C81E1E" />
            );
          })()}
          <g transform={`translate(${perfil ? 10 : 0},${r3 ? 96 : 112}) scale(${(perfil ? 0.6 : tres ? 0.85 : 1) * (r3 ? 0.95 : 1)},${r3 ? 0.9 : 1})`}>
            <Boca tipo={expressao} />
          </g>
          {A.oculosGrau && (
            <g fill="none" stroke="#1A1A1E" strokeWidth={9}>
              {!perfil && <circle cx={-74} cy={0} r={46} />}
              <g transform={tres ? "translate(74,0) scale(0.8,1) translate(-74,0)" : undefined}>
                <circle cx={perfil ? 10 : 74} cy={0} r={46} />
              </g>
              {!perfil && <path d="M -28 -6 Q 0 -18 28 -6" />}
              {perfil && <path d="M -36 -6 L -150 -10" />}
            </g>
          )}
          {(pose.oculos ?? 0) > 0 && (
            <g transform={`translate(0,${(1 - (pose.oculos ?? 0)) * 150})`} opacity={Math.min(1, (pose.oculos ?? 0) * 2)}>
              <g transform={tres ? "translate(74,0) scale(0.85,1) translate(-74,0)" : undefined}>
                {!perfil && <rect x={-128} y={-30} width={108} height={64} rx={22} fill="#0B0C10" />}
                <rect x={perfil ? -44 : 20} y={-30} width={108} height={64} rx={22} fill="#0B0C10" />
                {!perfil && <rect x={-24} y={-12} width={48} height={12} rx={6} fill="#0B0C10" />}
                {!perfil && <path d="M -110 -16 L -70 -16 L -96 16 Z" fill="#FFFFFF" opacity={0.18} />}
                <path d={`M ${perfil ? -26 : 38} -16 L ${perfil ? 14 : 78} -16 L ${perfil ? -12 : 52} 16 Z`} fill="#FFFFFF" opacity={0.18} />
              </g>
            </g>
          )}
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

// Cacheado (Kaik): mais volume em cima, cachos pequenos na franja.
const contornoCacheado = () => {
  const pts: string[] = [];
  const n = 70;
  for (let i = 0; i <= n; i++) {
    const a = ((194 - (208 * i) / n) * Math.PI) / 180;
    const R = 232 + 20 * Math.abs(Math.sin(i * 1.7));
    const y = -Math.sin(a) * R * (Math.sin(a) > 0 ? 1.14 : 1) - 4;
    pts.push(`${(Math.cos(a) * R).toFixed(1)} ${y.toFixed(1)}`);
  }
  let d = `M ${pts[0]} `;
  for (let i = 1; i < pts.length; i++) d += `L ${pts[i]} `;
  const fr: [number, number][] = [];
  for (let i = 0; i <= 12; i++) fr.push([206 - i * 34.3, i % 2 ? -112 : -84]);
  fr.push([-206, 10]);
  for (let i = 0; i < fr.length - 1; i++) {
    const [x1, y1] = fr[i];
    const [x2, y2] = fr[i + 1];
    d += `L ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2 + 22} ${x2} ${y2} `;
  }
  return d + "Z";
};
const CABELO_CACHEADO = contornoCacheado();
const CACHOS: [number, number][] = [];
for (let i = 0; i < 26; i++) {
  const x = -170 + ((i * 67) % 340);
  const y = -260 + Math.floor(i / 5) * 32 + ((i * 13) % 20);
  if (Math.hypot(x, y + 60) < 220) CACHOS.push([x, y]);
}
// Penteado para trás (vilão): sem franja, entradas altas, fios penteados para trás.
const contornoPenteado = () => {
  const pts: string[] = [];
  const n = 48;
  for (let i = 0; i <= n; i++) {
    const a = ((192 - (204 * i) / n) * Math.PI) / 180;
    const R = 226 + 6 * Math.abs(Math.sin(i * 0.5));
    pts.push(`${(Math.cos(a) * R).toFixed(1)} ${(-Math.sin(a) * R * 1.06 - 4).toFixed(1)}`);
  }
  let d = `M ${pts[0]} `;
  for (let i = 1; i < pts.length; i++) d += `L ${pts[i]} `;
  // linha do cabelo: alta, com entradas nas têmporas e um bico no meio
  d += "L 212 0 C 206 -60 190 -110 150 -128 C 110 -120 80 -150 40 -158 L 0 -146 L -40 -158 C -80 -150 -110 -120 -150 -128 C -190 -110 -206 -60 -212 0 Z";
  return d;
};
const CABELO_PENTEADO = contornoPenteado();
const CABELO_RASPADO =
  "M -214 10 C -224 -140 -120 -214 0 -214 C 120 -214 224 -140 214 10 C 206 -60 190 -110 150 -126 C 80 -140 -80 -140 -150 -126 C -190 -110 -206 -60 -214 10 Z";
const PENTEADO_FIOS = [
  "M -120 -150 Q -150 -200 -110 -236",
  "M -60 -170 Q -70 -220 -30 -250",
  "M 0 -160 Q 10 -214 50 -246",
  "M 60 -168 Q 90 -214 130 -222",
  "M 140 -140 Q 180 -170 196 -140",
  "M -180 -100 Q -206 -150 -186 -170",
];
const CABELO_SOMBRA =
  "M 120 -200 C 190 -160 230 -80 222 10 L 206 20 L 196 -60 C 180 -80 160 -90 150 -92 C 170 -130 160 -170 120 -200 Z";
const CABELO_COSTAS =
  // de costas o cabelo cobre a nuca quase toda (antes sobrava pele e parecia um rosto sem olhos)
  "M -226 40 C -250 -140 -140 -250 0 -252 C 140 -250 250 -140 226 40 C 222 120 190 172 130 188 C 60 172 -60 172 -130 188 C -190 172 -222 120 -226 40 Z";
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
  const A = useA();
  const C = A.cores;
  const terno = A.estampa === "terno";
  const mangaLonga = terno || A.roupa === "moletom";
  const pele = sombra ? C.peleSombra : C.pele;
  const manga = sombra ? C.camisaSombra : C.camisa;
  const r3b = React.useContext(Rosto3Ctx);
  const k = React.useContext(Corpo2Ctx) ? (r3b ? 1.0 : 1.75) : 1;
  return (
    <g transform={`rotate(${-ombro * lado})`}>
      {/* braço */}
      <rect x={-23 * k} y={0} width={46 * k} height={300} rx={23 * k} fill={pele} />
      {r3b && <rect x={-23 * k} y={0} width={46 * k} height={300} rx={23 * k} fill="url(#sombraSuave3)" />}
      {mangaLonga ? (
        <path d={`M ${-40 * k} -20 Q 0 -40 ${40 * k} -20 L ${38 * k} 300 Q 0 312 ${-38 * k} 300 Z`} fill={manga} />
      ) : (
        <>
          {/* manga curta (estilo 3: ombro arredondado e degradê suave) */}
          {React.useContext(Rosto3Ctx) ? (
            <>
              <path d={`M ${-40 * k} 10 Q ${-38 * k} -22 0 -26 Q ${38 * k} -22 ${40 * k} 10 L ${44 * k} 110 Q 0 122 ${-44 * k} 110 Z`} fill={manga} />
              <path d={`M ${-40 * k} 10 Q ${-38 * k} -22 0 -26 Q ${38 * k} -22 ${40 * k} 10 L ${44 * k} 110 Q 0 122 ${-44 * k} 110 Z`} fill="url(#sombraSuave3)" />
            </>
          ) : (
            <path d={`M ${-40 * k} -20 Q 0 -40 ${40 * k} -20 L ${44 * k} 100 Q 0 112 ${-44 * k} 100 Z`} fill={manga} />
          )}
          <path d={`M ${-44 * k} 92 Q 0 104 ${44 * k} 92 L ${44 * k} 100 Q 0 112 ${-44 * k} 100 Z`} fill={C.camisaDetalhe} />
        </>
      )}
      <g transform={`translate(0,286) rotate(${-cotovelo * lado})`}>
        {React.useContext(Rosto3Ctx)
          ? <>
              <path d={`M ${-21 * k} 0 Q ${-21 * k} -10 0 -10 Q ${21 * k} -10 ${21 * k} 0 L ${16 * k} 262 Q 0 272 ${-16 * k} 262 Z`} fill={pele} />
              <path d={`M ${-21 * k} 0 Q ${-21 * k} -10 0 -10 Q ${21 * k} -10 ${21 * k} 0 L ${16 * k} 262 Q 0 272 ${-16 * k} 262 Z`} fill="url(#sombraSuave3)" />
            </>
          : <rect x={-21 * k} y={-10} width={42 * k} height={270} rx={21 * k} fill={pele} />}
        {mangaLonga && (
          <>
            <rect x={-36 * k} y={-24} width={72 * k} height={250} rx={30 * k} fill={manga} />
            {terno ? (
              <rect x={-30} y={214} width={60} height={22} rx={6} fill={A.camisaSocial ?? "#F2F2EE"} />
            ) : (
              <rect x={-32} y={206} width={64} height={30} rx={10} fill={C.camisaDetalhe} />
            )}
          </>
        )}
        {/* mão */}
        <ellipse cx={0} cy={272} rx={34 * Math.sqrt(k) * (r3b ? 1.2 : 1)} ry={40 * Math.sqrt(k) * (r3b ? 1.15 : 1)} fill={A.maos ?? pele} />
        <ellipse cx={-26 * lado} cy={256} rx={12} ry={24} fill={A.maos ?? pele} transform={`rotate(${-25 * lado} ${-26 * lado} 256)`} />
        {React.useContext(Rosto3Ctx) && !A.maos && (
          <g stroke={C.peleSombra} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.85}>
            {/* polegar destacado e linhas dos dedos (como na referência) */}
            <path d={`M ${-30 * lado} 238 Q ${-44 * lado} 262 ${-30 * lado} 290`} />

          </g>
        )}
        {A.dedosLongos &&
          [-22, -7, 8, 23].map((dx, i) => (
            <ellipse key={i} cx={dx} cy={340 + Math.abs(dx) * -0.6} rx={9} ry={52} fill={A.maos ?? pele} transform={`rotate(${dx * 0.4} ${dx} 300)`} />
          ))}
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
  const A = useA();
  const C = A.cores;
  const terno = A.estampa === "terno" || !!A.calca;
  const pe = paraDireita ? 1 : lado;
  const pele = sombra ? C.peleSombra : C.pele;
  const r3 = React.useContext(Rosto3Ctx);
  const k = React.useContext(Corpo2Ctx) ? (r3 ? 1.15 : 1.6) : 1;
  return (
    <g transform={`rotate(${-quadril * lado})`}>
      {/* coxa */}
      {r3
        ? <rect x={-26 * k} y={0} width={52 * k} height={390} rx={24 * k} fill={pele} />
        : <rect x={-34 * k} y={0} width={68 * k} height={390} rx={30 * k} fill={pele} />}
      <g transform={`translate(0,376) rotate(${-joelho * lado})`}>
        <rect x={-26 * k} y={-14} width={52 * k} height={360} rx={24 * k} fill={pele} />
        {r3 && <rect x={-26 * k} y={-14} width={52 * k} height={360} rx={24 * k} fill="url(#sombraSuave3)" />}
        {terno && <path d={`M ${-50 * k} -30 L ${50 * k} -30 L ${42 * k} 340 L ${-42 * k} 340 Z`} fill={sombra ? C.bermudaSombra : C.bermuda} />}
        {/* tênis */}
        {r3 && !paraDireita ? (
          <g transform="translate(0,368)">
            {/* tênis grande visto de frente (estilo boneco) */}
            <path d="M -76 -2 Q -82 -84 -34 -92 L 34 -92 Q 82 -84 76 -2 Z" fill={sombra ? C.tenisSombra : C.tenis} />
            <path d="M -38 -70 L 38 -70 M -34 -56 L 34 -56" stroke={C.tenisSombra} strokeWidth={5} strokeLinecap="round" />
            <rect x={-76} y={-16} width={152} height={18} rx={8} fill={C.tenisSola} />
          </g>
        ) : (
          <g transform={`translate(${12 * pe},364) ${r3 ? "scale(1.2)" : ""}`}>
            <path d={`M ${-46} -26 Q ${-46} -50 ${-10} -48 L ${30} -44 Q ${78} -36 ${82} 0 L ${-50} 0 Z`} transform={pe === -1 ? "scale(-1,1)" : undefined} fill={sombra ? C.tenisSombra : C.tenis} />
            <rect x={-52} y={-6} width={136} height={16} rx={7} fill={C.tenisSola} transform={pe === -1 ? "scale(-1,1)" : undefined} />
          </g>
        )}
      </g>
      {/* perna da bermuda: acompanha a coxa */}
      {terno ? (
        <path d={`M ${-56 * k} -40 L ${56 * k} -40 L ${50 * k} 396 L ${-50 * k} 396 Z`} fill={sombra ? C.bermudaSombra : C.bermuda} />
      ) : (
        <>
          {r3 ? (
            <>
              <path d={`M ${-50 * k} -40 L ${50 * k} -40 L ${54 * k} 236 L ${-54 * k} 236 Z`} fill={sombra ? C.bermudaSombra : C.bermuda} />
              <path d={`M ${-50 * k} -40 L ${50 * k} -40 L ${54 * k} 236 L ${-54 * k} 236 Z`} fill="url(#sombraSuave3)" />
            </>
          ) : <path d={`M ${-62 * k} -40 L ${62 * k} -40 L ${70 * k} 290 L ${-70 * k} 290 Z`} fill={sombra ? C.bermudaSombra : C.bermuda} />}
          {r3
            ? null
            : !sombra && <path d={`M ${20 * k} -40 L ${62 * k} -40 L ${70 * k} 290 L ${34 * k} 290 Z`} fill={C.bermudaSombra} />}
        </>
      )}
    </g>
  );
};

const TRONCO3 = "M -112 -1158 Q 0 -1170 112 -1158 Q 140 -1148 142 -1112 L 110 -1070 L 108 -762 Q 0 -754 -108 -762 L -110 -1070 L -142 -1112 Q -140 -1148 -112 -1158 Z";

// Cabelo curto e cacheado em "bolinhas" (estilo boneco 3D, Chede no Rosto 3)
const BOLINHAS = (() => {
  const out: [number, number, number][] = [];
  // contorno: das têmporas, por cima (sem cobrir as orelhas)
  for (let i = 0; i <= 16; i++) {
    const ang = Math.PI * (1.1 + (i / 16) * 0.8);
    out.push([Math.cos(ang) * 206, Math.sin(ang) * 214 - 4, 34 + ((i * 7) % 3) * 4]);
  }
  // segundo anel por dentro (cabelo cheio, sem buracos)
  for (let i = 0; i <= 13; i++) {
    const ang = Math.PI * (1.12 + (i / 13) * 0.76);
    out.push([Math.cos(ang) * 170, Math.sin(ang) * 178 - 6, 36]);
  }
  // laterais curtas (acima da orelha)
  [[-204, -30], [204, -30], [-198, 0], [198, 0]].forEach(([x, y]) => out.push([x, y, 30]));
  // franja: bolinhas na testa
  for (let i = 0; i < 8; i++) out.push([-154 + i * 44, -126 + (i % 2) * 8, 30]);
  // miolo
  for (let i = 0; i < 10; i++) out.push([-150 + (i % 5) * 75, -205 + Math.floor(i / 5) * 46, 36]);
  return out;
})();
const CabeloBolinhas: React.FC<{ cor: string; sombra: string; brilho: string }> = ({ cor, sombra, brilho }) => (
  <g>
    <path d="M -214 10 C -234 -150 -126 -240 0 -242 C 126 -240 234 -150 214 10 L 196 0 C 192 -50 168 -100 120 -112 Q 0 -130 -120 -112 C -168 -100 -192 -50 -196 0 Z" fill={cor} />
    {BOLINHAS.map(([x, y, r], i) => (
      <g key={i}>
        <circle cx={x} cy={y} r={r * 0.96} fill={cor} />
        <circle cx={x + r * 0.2} cy={y + r * 0.25} r={r * 0.6} fill={sombra} opacity={0.3} />
        <circle cx={x - r * 0.25} cy={y - r * 0.3} r={r * 0.26} fill={brilho} opacity={0.35} />
      </g>
    ))}
  </g>
);

// ---------- Corpo inteiro ----------
export const Chede: React.FC<{ expressao?: Expressao; pose?: Pose; vista?: Vista; semSombra?: boolean }> = ({
  expressao = "neutro",
  pose = {},
  vista = "frente",
  semSombra,
}) => {
  const C = useA().cores;
  const c2 = React.useContext(Corpo2Ctx);
  const r3 = React.useContext(Rosto3Ctx);
  const sx = vista === "perfil" ? 0.58 : vista === "tresQuartos" ? 0.84 : 1;
  const ombroX = vista === "perfil" ? 20 : (r3 ? 126 : 150) * sx;
  const quadrilX = vista === "perfil" ? 16 : (r3 ? 52 : c2 ? 78 : 62) * sx;
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
      {r3 && (
        <defs>
          {/* contorno de luz fino em volta do corpo (acabamento das referências 5 e 6) */}
          <filter id="contornoLuz3" x="-25%" y="-8%" width="150%" height="116%">
            <feMorphology in="SourceAlpha" operator="dilate" radius={4.5} result="d" />
            <feComposite in="d" in2="SourceAlpha" operator="out" result="anel" />
            <feFlood floodColor="#FFE9B8" floodOpacity={0.85} />
            <feComposite in2="anel" operator="in" result="borda" />
            <feGaussianBlur in="borda" stdDeviation={1.6} result="bb" />
            <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="bb" /></feMerge>
          </filter>
        </defs>
      )}
      <g filter={r3 ? "url(#contornoLuz3)" : undefined}>
      {/* pernas */}
      <g transform={`translate(${-quadrilX},-760)`}>
        <Perna lado={-1} quadril={P.pernaE} joelho={P.joelhoE} paraDireita={lateral} />
      </g>
      <g transform={`translate(${quadrilX},-760)`}>
        <Perna lado={1} quadril={P.pernaD} joelho={P.joelhoD} sombra paraDireita={lateral} />
      </g>
      {/* curvado (tronco > 30°): dobra pela cintura, com o quadril fixo em cima das pernas (sem buraco) */}
      {Math.abs(P.tronco ?? 0) > 30 && (
        <path d={`M ${-150 * sx} -790 L ${150 * sx} -790 L ${156 * sx} -690 Q 0 -660 ${-156 * sx} -690 Z`} fill={C.bermuda} />
      )}
      <g transform={`rotate(${P.tronco ?? 0} 0 ${Math.abs(P.tronco ?? 0) > 30 ? -760 : -560}) translate(0,${-resp * 6})`}>
        {/* bermuda */}
        <g transform={`scale(${sx},1)`}>
        <g transform={r3 ? "scale(0.72,1)" : undefined}>
        <path d="M -150 -790 L 150 -790 L 156 -690 Q 0 -660 -156 -690 Z" fill={C.bermuda} />
        <path d="M 40 -790 L 150 -790 L 156 -690 Q 100 -676 60 -672 Z" fill={C.bermudaSombra} />
        <rect x={-152} y={-800} width={304} height={26} rx={6} fill={C.bermudaSombra} />
        </g>
        </g>
        {useA().mochila && (vista === "perfil" || vista === "tresQuartos") && (
          <g transform={`scale(${sx},1)`}>
            <rect x={-250} y={-1150} width={150} height={320} rx={50} fill={useA().mochila} />
            <rect x={-240} y={-960} width={100} height={110} rx={30} fill="#000" opacity={0.2} />
          </g>
        )}
        {/* braço de trás (direita da tela) */}
        <g transform={`translate(${ombroX},${r3 ? -1128 : -1150})`}>
          <Braco lado={1} ombro={P.bracoD} cotovelo={P.antebracoD} sombra />
        </g>
        <g transform={`scale(${sx},1)`}>
        {/* tronco / camisa */}
        {r3 ? (
          <>
            {/* estilo da referência: ombro arredondado, cintura mais fina e sombra suave (degradê) */}
            <defs>
              <linearGradient id="sombraSuave3" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.10} />
                <stop offset="0.45" stopColor="#000000" stopOpacity={0} />
                <stop offset="1" stopColor="#000000" stopOpacity={0.30} />
              </linearGradient>
            </defs>
            <path d={TRONCO3} fill={C.camisa} />
            <path d={TRONCO3} fill="url(#sombraSuave3)" />
          </>
        ) : (
          <>
            <path
              d="M -150 -1176 Q 0 -1206 150 -1176 Q 172 -1160 170 -1120 L 158 -780 L -158 -780 L -170 -1120 Q -172 -1160 -150 -1176 Z"
              fill={C.camisa}
            />
            <path d="M 60 -1190 Q 150 -1180 170 -1120 L 158 -780 L 70 -780 Q 100 -980 60 -1190 Z" fill={C.camisaSombra} />
          </>
        )}
        {r3
          ? <path d="M -109 -782 Q 0 -774 109 -782 L 108 -762 Q 0 -754 -108 -762 Z" fill={C.camisaDetalhe} />
          : <path d="M -158 -800 L 158 -800 L 158 -780 L -158 -780 Z" fill={C.camisaDetalhe} />}
        {/* pescoço + gola */}
        {r3 ? <rect x={-30} y={-1196} width={60} height={50} rx={16} fill={C.peleSombra} /> : <rect x={-42} y={-1232} width={84} height={70} rx={20} fill={C.peleSombra} />}
        {costas ? (
          <path d="M -60 -1196 Q 0 -1186 60 -1196" stroke={C.camisaDetalhe} strokeWidth={14} fill="none" strokeLinecap="round" />
        ) : useA().estampa === "terno" ? null : r3 ? (
          <path d="M -40 -1160 Q 0 -1132 40 -1160" stroke={C.camisaDetalhe} strokeWidth={10} fill="none" strokeLinecap="round" />
        ) : (
          <path d="M -62 -1188 Q 0 -1130 62 -1188" stroke={C.camisaDetalhe} strokeWidth={14} fill="none" strokeLinecap="round" />
        )}
        {/* terno: barra do paletó, camisa, gravata, lapelas */}
        {useA().estampa === "terno" && (
          <g>
            <path d="M -158 -800 L 158 -800 L 164 -712 Q 0 -700 -164 -712 Z" fill={C.camisa} />
            <path d="M 60 -800 L 158 -800 L 164 -712 Q 110 -706 70 -704 Z" fill={C.camisaSombra} />
            {!costas && (
              <>
                <path d="M -70 -1186 L 70 -1186 L 0 -960 Z" fill={useA().camisaSocial ?? "#F2F2EE"} />
                <path d="M -18 -1170 L 18 -1170 L 12 -1146 L -12 -1146 Z" fill={useA().gravata ?? "#E8A317"} />
                <path d="M -12 -1148 L 12 -1148 L 22 -1000 L 0 -972 L -22 -1000 Z" fill={useA().gravata ?? "#E8A317"} />
                <path d="M 2 -1148 L 12 -1148 L 22 -1000 L 0 -972 Z" fill={useA().gravataSombra ?? "#B97F0E"} />
                <path d="M -70 -1186 L -100 -1130 L -60 -1100 L -86 -1070 L 0 -940 Z" fill={C.camisaDetalhe} />
                <path d="M 70 -1186 L 100 -1130 L 60 -1100 L 86 -1070 L 0 -940 Z" fill={C.camisaDetalhe} />
                {[-900, -830].map((y) => (
                  <circle key={y} cx={0} cy={y} r={9} fill={C.camisaDetalhe} />
                ))}
                <rect x={60} y={-1080} width={70} height={10} rx={3} fill={C.camisaDetalhe} />
                <path d="M 70 -1080 L 82 -1102 L 94 -1080 Z" fill={useA().gravata ?? "#E8A317"} />
              </>
            )}
          </g>
        )}
        {/* bolso */}
        {useA().estampa === "faixa" && (
          <g>
            <rect x={-170} y={-1060} width={340} height={44} fill={C.camisaDetalhe} />
            <rect x={-170} y={-1052} width={340} height={28} fill="#F2F4F8" />
          </g>
        )}
        {useA().estampa === "bolso" && (vista === "frente" || vista === "tresQuartos") && (
          <g transform={`${vista === "tresQuartos" ? "translate(40,0)" : ""} ${r3 ? "translate(36,10)" : ""} ${r3 ? "translate(-86,-1070) scale(0.78) translate(86,1070)" : ""}`}>
            <path d="M -118 -1100 L -54 -1100 L -54 -1040 Q -86 -1028 -118 -1040 Z" fill={C.camisaSombra} />
            <rect x={-118} y={-1104} width={64} height={10} rx={3} fill={C.camisaDetalhe} />
          </g>
        )}
        </g>
        {/* figurantes: moletom (capuz, cordão, bolso canguru), camisa (gola e botões), alças da mochila */}
        <g transform={`scale(${sx},1)`}>
          {useA().roupa === "moletom" && !costas && (
            <g>
              <path d="M -110 -1200 Q 0 -1150 110 -1200 Q 120 -1150 80 -1130 Q 0 -1100 -80 -1130 Q -120 -1150 -110 -1200 Z" fill={C.camisaSombra} />
              <path d="M -24 -1132 L -30 -1040 M 24 -1132 L 30 -1040" stroke="#F2F2EE" strokeWidth={9} strokeLinecap="round" />
              <path d="M -100 -930 L 100 -930 L 120 -820 L -120 -820 Z" fill={C.camisaSombra} />
              <path d="M -100 -930 L 100 -930" stroke={C.camisaDetalhe} strokeWidth={6} />
            </g>
          )}
          {useA().roupa === "moletom" && costas && (
            <path d="M -130 -1200 Q 0 -1220 130 -1200 Q 140 -1080 0 -1040 Q -140 -1080 -130 -1200 Z" fill={C.camisaSombra} />
          )}
          {useA().roupa === "camisa" && !costas && (
            <g>
              <path d="M -66 -1190 L -10 -1130 L -20 -1180 Z M 66 -1190 L 10 -1130 L 20 -1180 Z" fill={C.camisaDetalhe} />
              <path d="M 0 -1140 L 0 -790" stroke={C.camisaDetalhe} strokeWidth={6} />
              {[-1080, -1000, -920, -840].map((y) => (
                <circle key={y} cx={0} cy={y} r={8} fill={C.camisaDetalhe} />
              ))}
            </g>
          )}
          {useA().mochila && !costas && vista !== "perfil" && (
            <g fill={useA().mochila}>
              <path d="M -120 -1180 L -84 -1180 L -96 -900 L -128 -900 Z" />
              <path d="M 84 -1180 L 120 -1180 L 128 -900 L 96 -900 Z" />
            </g>
          )}
          {useA().mochila && costas && (
            <g>
              <rect x={-130} y={-1150} width={260} height={330} rx={60} fill={useA().mochila} />
              <rect x={-100} y={-960} width={200} height={110} rx={30} fill="#000" opacity={0.2} />
              <path d="M -60 -1150 Q 0 -1200 60 -1150" stroke="#000" strokeWidth={14} fill="none" opacity={0.35} />
            </g>
          )}
        </g>
        {/* braço da frente (esquerda da tela) */}
        <g transform={`translate(${-ombroX},${r3 ? -1128 : -1150})`}>
          <Braco lado={-1} ombro={P.bracoE} cotovelo={P.antebracoE} />
        </g>
        {/* cabeça */}
        <g transform={`translate(0,${r3 ? -1346 : c2 ? -1372 : -1420}) rotate(${P.cabeca ?? 0} 0 190) scale(${r3 ? 0.93 : c2 ? 0.76 : 1})`}>
          <Cabeca expressao={expressao} pose={P} vista={vista} />
        </g>
      </g>
      </g>
    </g>
  );
};
