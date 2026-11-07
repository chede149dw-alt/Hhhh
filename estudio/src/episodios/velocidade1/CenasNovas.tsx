import React from "react";
import { AbsoluteFill, interpolate, spring, useVideoConfig } from "remotion";
import { Pose, Vista, Expressao } from "../../personagens/Chede";
import { Kaik } from "../../personagens/Kaik";
import { corridaForte } from "../../personagens/poses";
import { Quarto } from "../../cenarios/Quarto";
import { Banheiro, Cozinha } from "../../cenarios/Cenarios";
import { Rua3D, projetar, janelaVigia, Cam } from "../../cenarios3d/Rua3D";
import { Eletricidade, Faiscas } from "../../efeitos/Eletricidade";
import { LinhasVento } from "../../efeitos/Velocidade";
import { Fenda } from "../../efeitos/Fenda";
import { Escova, Mesa, Passaro } from "../../objetos/Objetos";
import { Acab, Camera, Flash, FPS, Tela, Vivo, alcançar, lerp, useP } from "../comum";
import { Gradacao, Grao, Poeira } from "../../estilo/Acabamento";

const CIANO = "#59D8FF";
const PAREDE_KAIK: [string, string] = ["#7E93AB", "#566A82"];
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Kaik com eletricidade em volta (x,y = pés na tela; s = escala do boneco)
export const KaikEletrico: React.FC<{
  x: number;
  y: number;
  s: number;
  vista?: Vista;
  expr?: Expressao;
  pose?: Pose;
  espelhar?: boolean;
  forca?: number;
  faiscas?: boolean;
  id?: string;
}> = ({ x, y, s, vista = "frente", expr = "determinado", pose = {}, espelhar, forca = 1, faiscas, id = "k" }) => {
  const corpo = { x: x - 300 * s, y: y - 1750 * s, w: 600 * s, h: 1750 * s };
  return (
    <g>
      <Vivo quem="kaik" x={x} y={y} s={s} vista={vista} expr={expr} pose={pose} espelhar={espelhar} semSombra={faiscas} />
      {forca > 0 && <Eletricidade corpo={corpo} n={Math.round(4 + 4 * forca)} intensidade={forca} id={id} />}
      {faiscas && <Faiscas x={x + (espelhar ? 40 : -40) * s} y={y} dir={espelhar ? 1 : -1} escala={Math.max(0.8, s * 2.2)} n={30} />}
    </g>
  );
};

// mão fechada segurando algo (desenhada por cima da cabeça quando o objeto vai à boca)
const MaoFechada: React.FC<{ x: number; y: number; s: number; ang?: number }> = ({ x, y, s, ang = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${ang}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={40} ry={44} fill="#F1CBAE" />
    <ellipse cx={14} cy={4} rx={20} ry={36} fill="#D7A786" opacity={0.6} />
    {[-24, -8, 8, 24].map((dx) => (
      <ellipse key={dx} cx={dx} cy={-30} rx={10} ry={14} fill="#F1CBAE" stroke="#D7A786" strokeWidth={3} />
    ))}
    <ellipse cx={-36} cy={6} rx={14} ry={24} fill="#F1CBAE" stroke="#D7A786" strokeWidth={3} />
  </g>
);

const Contador: React.FC<{ valor: number; unidade: string }> = ({ valor, unidade }) => (
  <div style={{ position: "absolute", top: 110, left: 70, fontFamily: "'Roboto Condensed'", fontWeight: 800, color: "#FFD23F",
    fontSize: 150, WebkitTextStroke: "10px #000", paintOrder: "stroke fill" }}>
    {valor}
    <span style={{ fontSize: 60, color: "#fff" }}> {unidade}</span>
  </div>
);

// Cena de corrida na rua 3D, câmera lateral acompanhando
const Corrida3D: React.FC<{ v?: number; expr?: Expressao; contador?: boolean; onibus?: boolean; id: string }> = ({
  v = 0.9,
  expr = "determinado",
  contador,
  onibus = true,
  id,
}) => {
  const { f } = useP();
  const zK = 8 - f * v;
  const cam: Cam = { pos: [-3.6, 0.7, zK + 0.9], alvo: [0, 1.15, zK - 0.3], fov: 55 };
  const p = projetar(cam, [0, 0, zK]);
  const s = (p.pxPorMetro * 1.75) / 1700;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Rua3D cam={cam} onibusZ={onibus ? -40 - f * 0.2 : undefined} />
      <Tela>
        <LinhasVento dir={1} n={16} />
        <KaikEletrico x={p.x} y={p.y} s={s} vista="perfil" expr={expr} pose={corridaForte(f)} espelhar faiscas id={id} />
      </Tela>
      <Gradacao />
      <Grao />
      {contador && <Contador valor={Math.round(interpolate(f, [0, 45], [40, 300], clamp))} unidade="km/h" />}
    </AbsoluteFill>
  );
};

export const N0_Capa: React.FC = () => {
  const { f } = useP();
  const { fps } = useVideoConfig();
  const pop = (d: number) => spring({ frame: f - d, fps, config: { damping: 11, stiffness: 140 } });
  return (
    <AbsoluteFill>
      <Corrida3D id="capa" expr="espanto" />
      <AbsoluteFill style={{ fontFamily: "'Roboto Condensed'", fontWeight: 800, textAlign: "center", textTransform: "uppercase" }}>
        <div style={{ position: "absolute", top: 120, width: "100%", fontSize: 86, color: "#fff", WebkitTextStroke: "10px #000", paintOrder: "stroke fill", transform: `scale(${pop(0)})` }}>
          E se você acordasse
        </div>
        <div style={{ position: "absolute", top: 220, width: "100%", fontSize: 118, lineHeight: 1.05, color: "#fff", WebkitTextStroke: "12px #000", paintOrder: "stroke fill", transform: `scale(${pop(5)}) rotate(-3deg)` }}>
          com super
          <br />
          <span style={{ color: "#BFF4FF", textShadow: `0 0 30px ${CIANO}, 0 0 60px ${CIANO}` }}>velocidade?</span>
        </div>
        <div style={{ position: "absolute", top: 1560, right: 70, fontSize: 130, color: "#FFD23F", WebkitTextStroke: "12px #000", paintOrder: "stroke fill", transform: `scale(${pop(14)}) rotate(-6deg)` }}>
          Parte 2
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Escovando: a escova presa na mão e o braço se mexendo (escovação rápida)
export const N2_Escova: React.FC<{ quadroInicio: number }> = ({ quadroInicio }) => {
  const { f } = useP();
  const g = f - quadroInicio;
  const S = 1.9;
  const X = 540;
  const Y = 3400;
  const alvoX = -20 + Math.sin(g * 1.6) * 40; // vai e volta rápido
  const alvoY = -1300;
  const ik = alcançar("frente", 1, alvoX + 40, alvoY);
  const pose: Pose = { bracoD: ik.braco, antebracoD: ik.antebraco, olharX: -0.2 };
  const maoX = X + (alvoX + 40) * S;
  const maoY = Y + alvoY * S;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1.05, 1.12]} tremor={0.3}>
        <Banheiro desfoque={8} />
        <Tela>
          <KaikEletrico x={X} y={Y} s={S} expr="espanto" pose={pose} forca={0.5} id="esc" />
          {/* escova na mão, apontando para a boca */}
          <g transform={`translate(${maoX + 60},${maoY}) rotate(-90) scale(1.3)`}>
            <Escova />
          </g>
          {/* antebraço visível ligando a mão ao cotovelo */}
          {(() => {
            const o = (ik.braco * Math.PI) / 180;
            const cx = X + (150 + 286 * Math.sin(o)) * S;
            const cy = Y + (-1150 + 286 * Math.cos(o)) * S;
            return <line x1={cx} y1={cy} x2={maoX + 110} y2={maoY + 30} stroke="#F1CBAE" strokeWidth={42 * S} strokeLinecap="round" />;
          })()}
          <MaoFechada x={maoX + 100} y={maoY + 10} s={S * 0.9} ang={-90} />
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={X - 40 * S + i * 30 + Math.sin(g + i) * 20} cy={Y - 1290 * S + Math.cos(g * 2 + i) * 20} r={14} fill="#fff" opacity={0.85} />
          ))}
        </Tela>
      </Camera>
      <Flash cor={CIANO} quadros={5} de={quadroInicio} />
      <Acab />
    </AbsoluteFill>
  );
};

// Montagem: banho, roupa, café — com o objeto sempre na mão
export const N3_Montagem: React.FC = () => {
  const { f, p } = useP();
  const parte = Math.min(2, Math.floor(p * 3));
  const S = 1.2;
  let cena: React.ReactNode;
  if (parte === 0) {
    const ik = alcançar("frente", -1, -80, -1500 + Math.sin(f * 1.8) * 40);
    cena = (
      <>
        <Banheiro desfoque={10} />
        <Tela>
          {Array.from({ length: 34 }).map((_, i) => (
            <line key={i} x1={260 + ((i * 37) % 560)} x2={260 + ((i * 37) % 560)} y1={((f * 50 + i * 90) % 1500) + 100} y2={((f * 50 + i * 90) % 1500) + 170} stroke="#BFE6FF" strokeWidth={6} opacity={0.7} />
          ))}
          <KaikEletrico x={540} y={2400} s={S} expr="feliz" pose={{ bracoE: ik.braco, antebracoE: ik.antebraco, bracoD: 30 + Math.sin(f * 2) * 25, antebracoD: 60 }} id="m0" />
        </Tela>
      </>
    );
  } else if (parte === 1) {
    const a = Math.sin(f * 1.5);
    cena = (
      <>
        <Quarto desfoque={10} parede={PAREDE_KAIK} doKaik />
        <Tela>
          <KaikEletrico x={540} y={2400} s={S} expr="determinado" pose={{ bracoE: 150 + a * 20, antebracoE: 10, bracoD: 150 - a * 20, antebracoD: 10, tronco: a * 5 }} forca={1.2} id="m1" />
        </Tela>
      </>
    );
  } else {
    const k = Math.abs(Math.sin(f * 0.6));
    const alvo = { x: lerp(260, 60, k), y: lerp(-980, -1290, k) };
    const ik = alcançar("frente", -1, -alvo.x, alvo.y);
    const mx = 540 - alvo.x * S;
    const my = 2400 + alvo.y * S;
    cena = (
      <>
        <Cozinha desfoque={10} />
        <Tela>
          <KaikEletrico x={540} y={2400} s={S} expr="feliz" pose={{ bracoE: ik.braco, antebracoE: ik.antebraco }} id="m2" />
          <g transform={`translate(${mx},${my})`}>
            <rect x={-46} y={-60} width={92} height={110} rx={16} fill="#F2F4F8" />
            <path d="M -46 -20 Q -86 0 -46 30" stroke="#F2F4F8" strokeWidth={14} fill="none" />
            {[0, 1].map((i) => (
              <path key={i} d={`M ${-14 + i * 28} -76 q 16 -30 0 -60`} stroke="#fff" strokeWidth={7} fill="none" opacity={0.6} />
            ))}
          </g>
          <MaoFechada x={mx + 40} y={my + 10} s={S * 0.85} ang={90} />
        </Tela>
      </>
    );
  }
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1, 1.1]} tremor={0.4}>
        {cena}
      </Camera>
      <AbsoluteFill style={{ fontFamily: "'Roboto Condensed'", fontWeight: 800 }}>
        <div style={{ position: "absolute", top: 160, width: "100%", textAlign: "center", fontSize: 150, color: "#BFF4FF", WebkitTextStroke: "12px #000", paintOrder: "stroke fill" }}>
          00:0{Math.min(2, Math.floor(p * 3))}
        </div>
      </AbsoluteFill>
      <Acab />
    </AbsoluteFill>
  );
};

// Fome: braço indo e voltando da geladeira em alta velocidade
export const N6_Fome: React.FC<{ Geladeira: React.FC<{ comida?: number }> }> = ({ Geladeira }) => {
  const { f, p } = useP();
  const k = (Math.sin(f * 1.4) + 1) / 2;
  const ik = alcançar("tresQuartos", 1, lerp(120, 520, k), lerp(-1290, -1050, k));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1, 1.08]} tremor={0.3}>
        <Cozinha desfoque={6} />
        <Tela>
          <g transform="translate(760,1160) scale(0.9)">
            <Geladeira comida={1 - p} />
          </g>
          <KaikEletrico x={300} y={1980} s={0.95} vista="tresQuartos" expr={p < 0.8 ? "determinado" : "rindo"} pose={{ bracoD: ik.braco, antebracoD: ik.antebraco, olharX: 1 }} forca={0.8} id="fome" />
          {p > 0.2 && [0, 1, 2, 3, 4].map((i) => (
            <circle key={i} cx={330 + i * 26} cy={1720 + (i % 2) * 24} r={8} fill="#B5651D" />
          ))}
        </Tela>
      </Camera>
      <Acab feixe />
    </AbsoluteFill>
  );
};

// Corrida até a casa do Chede: vista aérea da rua 3D (drone), contador de velocidade
export const N9_Aereo: React.FC = () => {
  const { f, p } = useP();
  const zK = 4 - f * 1.4;
  const cam: Cam = { pos: [0, 16, zK + 16 - p * 4], alvo: [0, 0, zK - 14], fov: 50 };
  const k = projetar(cam, [-2.5, 0, zK]);
  const s = (k.pxPorMetro * 1.75) / 1700;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Rua3D cam={cam} onibusZ={-60 + f * 0.25} />
      <Tela>
        {/* rastro de luz no asfalto */}
        {Array.from({ length: 10 }).map((_, i) => {
          const r = projetar(cam, [-2.5, 0.05, zK + 1 + i * 1.2]);
          return <circle key={i} cx={r.x} cy={r.y} r={22 - i * 1.8} fill={CIANO} opacity={0.5 - i * 0.045} />;
        })}
        <KaikEletrico x={k.x} y={k.y} s={s} vista="costas" expr="determinado" pose={{ ...corridaForte(f), tronco: 0 }} faiscas id="aer" />
      </Tela>
      <Gradacao />
      <Grao />
      <Contador valor={Math.round(interpolate(f, [0, 40], [120, 300], clamp))} unidade="km/h" />
    </AbsoluteFill>
  );
};

// Mundo parado: rua 3D congelada, câmera girando devagar em volta do Kaik
const RuaParada: React.FC<{ children?: (c: Cam) => React.ReactNode; orbita?: [number, number] }> = ({ children, orbita = [-0.5, 0.3] }) => {
  const { p } = useP();
  const ang = lerp(orbita[0], orbita[1], p);
  const cam: Cam = { pos: [-2 + Math.sin(ang) * 5, 1.4, -10 + Math.cos(ang) * 5], alvo: [-2, 1.2, -10], fov: 50 };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Rua3D cam={cam} onibusZ={-22} sol={0.85} />
      <Tela>{children?.(cam)}</Tela>
      <AbsoluteFill style={{ background: "#7FB8FF", mixBlendMode: "color", opacity: 0.35 }} />
      <Gradacao />
      <Grao />
    </AbsoluteFill>
  );
};

export const N10_Parado: React.FC = () => (
  <RuaParada>
    {(cam) => {
      const k = projetar(cam, [-2, 0, -10]);
      const s = (k.pxPorMetro * 1.75) / 1700;
      return (
        <g>
          {[0, 1, 2].map((i) => {
            const fo = projetar(cam, [-4 + i * 2.5, 1.2 + (i % 2) * 0.8, -12 + i]);
            return <ellipse key={i} cx={fo.x} cy={fo.y} rx={16} ry={8} fill="#6E8A3E" transform={`rotate(${i * 40} ${fo.x} ${fo.y})`} />;
          })}
          <KaikEletrico x={k.x} y={k.y} s={s} expr="espanto" pose={{ olharX: -1, cabeca: -6 }} forca={0.35} id="par" />
        </g>
      );
    }}
  </RuaParada>
);

export const N11_Passaro: React.FC = () => {
  const { f, p } = useP();
  const toque = p > 0.55;
  return (
    <RuaParada orbita={[0.3, 0.6]}>
      {(cam) => {
        const k = projetar(cam, [-2, 0, -10]);
        const s = (k.pxPorMetro * 1.75) / 1700;
        const ik = alcançar("tresQuartos", 1, 470, -1580);
        const mx = k.x + 470 * s;
        const my = k.y - 1580 * s;
        const pa = projetar(cam, [-3.2, 2.6, -11]);
        return (
          <g>
            {Array.from({ length: 50 }).map((_, i) => {
              const gp = projetar(cam, [-6 + ((i * 1.37) % 9), 0.5 + ((i * 0.53) % 3.5), -14 + ((i * 0.91) % 8)]);
              return <ellipse key={i} cx={gp.x} cy={gp.y} rx={5} ry={14} fill="#D6F0FF" opacity={0.8} />;
            })}
            <g transform={`translate(${pa.x},${pa.y}) scale(${pa.pxPorMetro / 160})`}>
              <Passaro />
            </g>
            <KaikEletrico x={k.x} y={k.y} s={s} vista="tresQuartos" expr={toque ? "rindo" : "espanto"} pose={{ bracoD: ik.braco, antebracoD: ik.antebraco, olharX: 1, olharY: -0.6 }} forca={0.35} id="pas" />
            <g transform={`translate(${mx + 30 * s * 10},${my - 10}) scale(${toque ? 1 + Math.sin(f) * 0.15 : 1},${toque ? 1 - Math.sin(f) * 0.15 : 1})`}>
              <ellipse rx={30} ry={42} fill="#BFE6FF" stroke="#fff" strokeWidth={4} />
            </g>
          </g>
        );
      }}
    </RuaParada>
  );
};

export const N12_Entra: React.FC = () => {
  const { p } = useP();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1, 1.06]}>
        <Quarto desfoque={7} />
        <Tela>
          <rect x={-40} y={700} width={260} height={860} fill="#3E2A1C" />
          <rect x={-20} y={720} width={220} height={840} fill="#2A1C12" />
          <KaikEletrico x={lerp(-200, 360, p * 1.6)} y={1960} s={0.95} vista="tresQuartos" expr="feliz" pose={corridaForte(p * 60, 0.75, 0.5)} forca={p < 0.6 ? 1 : 0.3} id="ent" />
        </Tela>
      </Camera>
      <AbsoluteFill style={{ background: "#7FB8FF", mixBlendMode: "color", opacity: 0.35 }} />
      <Acab feixe />
    </AbsoluteFill>
  );
};

export const N15_Puxa: React.FC = () => {
  const { p } = useP();
  const k = Math.min(1, p * 1.6);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1.05, 1.1]} tremor={1.2}>
        <Quarto desfoque={9} />
        <Tela>
          <g transform="translate(560,1340) scale(1.1)">
            <Mesa />
          </g>
          <Fenda x={890} y={1345} tamanho={lerp(0.5, 0.2, k)} />
          <Vivo quem="chede" x={lerp(560, 420, k)} y={2060} s={0.85} vista="tresQuartos" expr="espanto" pose={{ tronco: -18, bracoD: lerp(30, 80, k), antebracoD: 0 }} />
          <KaikEletrico x={lerp(320, 200, k)} y={2060} s={0.85} vista="tresQuartos" expr="determinado" pose={{ tronco: -20, bracoD: 70, antebracoD: 10, bracoE: -60, antebracoE: -30 }} forca={1.4} id="pux" />
        </Tela>
      </Camera>
      <Flash cor={CIANO} />
      <Acab feixe />
    </AbsoluteFill>
  );
};

// Vigia: câmera 3D saindo da casa do Chede e subindo até a janela escura do prédio da frente
const Vigia3D: React.FC<{ de: number; ate: number; vigia: boolean; escuro?: boolean }> = ({ de, ate, vigia, escuro }) => {
  const { f, p } = useP();
  const j = janelaVigia();
  const zoom = lerp(de, ate, p); // 0 = longe (rua), 1 = colado na janela
  const longe: [number, number, number] = [-6, 2.5, -12];
  const perto: [number, number, number] = [j[0] - 4, j[1], j[2]];
  const cam: Cam = {
    pos: [lerp(longe[0], perto[0], zoom), lerp(longe[1], perto[1], zoom), lerp(longe[2], perto[2], zoom)],
    alvo: j,
    fov: 45,
  };
  const w = projetar(cam, j);
  const esc = w.pxPorMetro / 100;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ filter: escuro ? "brightness(0.45)" : undefined }}>
        <Rua3D cam={cam} predio sol={0.9} />
        <Tela>
          {vigia && (
            <g transform={`translate(${w.x},${w.y}) scale(${esc})`}>
              <ellipse cx={0} cy={-20} rx={34} ry={38} fill="#050507" />
              <rect x={-45} y={10} width={90} height={70} rx={30} fill="#050507" />
              <rect x={8} y={-20} width={30} height={46} rx={6} fill="#22232B" />
              <circle cx={23} cy={-12} r={6} fill="#FF3B30" opacity={Math.floor(f / 10) % 2 ? 1 : 0.3} />
            </g>
          )}
        </Tela>
      </AbsoluteFill>
      <Poeira n={30} />
      <Gradacao />
      <Grao forca={0.16} />
    </AbsoluteFill>
  );
};

export const N19_Sozinhos: React.FC = () => <Vigia3D de={-0.3} ate={0.2} vigia={false} />;
export const N20_Filmava: React.FC = () => (
  <AbsoluteFill>
    <Vigia3D de={0.2} ate={0.85} vigia />
    <Flash cor="#FF4A3D" quadros={5} de={Math.round(FPS * 0.6)} />
  </AbsoluteFill>
);
export const N21_Parte3: React.FC = () => {
  const { f } = useP();
  const { fps } = useVideoConfig();
  const sp = spring({ frame: f - 10, fps, config: { damping: 10 } });
  return (
    <AbsoluteFill>
      <Vigia3D de={0.85} ate={0.92} vigia escuro />
      <AbsoluteFill style={{ fontFamily: "'Roboto Condensed'", fontWeight: 800, textAlign: "center" }}>
        <div style={{ position: "absolute", top: 1450, width: "100%", fontSize: 190, color: "#FFD23F", WebkitTextStroke: "14px #000", paintOrder: "stroke fill", transform: `scale(${sp}) rotate(-4deg)` }}>
          PARTE 3
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
