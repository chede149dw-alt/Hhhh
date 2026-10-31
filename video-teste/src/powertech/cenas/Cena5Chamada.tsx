import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Fundo } from "../componentes/Fundo";
import { LinhasLuz } from "../componentes/LinhasLuz";
import { Marca } from "../componentes/Marca";
import { Rotulo, Titulo } from "../componentes/Texto";
import { ACELERA, CENAS, CLAMP, COR, E, ENTRA_SAI, FONTE_TITULO, W } from "../tema";

const INICIO = CENAS.cta[0];
const rel = (f: number) => f - INICIO;

/** Feixes que convergem para o centro e explodem em clarão na entrada da marca. */
const Convergencia: React.FC<{ inicio: number; fim: number; cy: number }> = ({ inicio, fim, cy }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [inicio, fim], [0, 1], { ...CLAMP, easing: ACELERA });
  const clarao = interpolate(frame, [fim - 1, fim + 2, fim + 18], [0, 1, 0], CLAMP);
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none" }}>
      {p > 0 && p < 1
        ? new Array(14).fill(0).map((_, i) => {
            const lado = i % 2 === 0 ? -1 : 1;
            const dy = (random(`cv${i}`) - 0.5) * 900 * (1 - p);
            const comp = 200 + random(`cvc${i}`) * 400;
            const x = lado === -1 ? -comp + (W / 2) * p : W - (W / 2) * p;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: x,
                  top: cy + dy,
                  width: comp,
                  height: 3,
                  background: `linear-gradient(${lado === -1 ? 90 : 270}deg, rgba(225,6,0,0), ${COR.vermelhoVivo} 70%, #fff)`,
                  boxShadow: "0 0 18px rgba(255,30,10,0.9)",
                  opacity: 0.4 + 0.6 * p,
                }}
              />
            );
          })
        : null}
      {clarao > 0 ? (
        <>
          <div
            style={{
              position: "absolute",
              left: W / 2 - 900,
              top: cy - 900,
              width: 1800,
              height: 1800,
              background: "radial-gradient(circle, rgba(255,230,220,0.95) 0%, rgba(255,40,20,0.6) 18%, rgba(0,0,0,0) 55%)",
              opacity: clarao,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: cy - 3,
              height: 6,
              background: "#fff",
              boxShadow: "0 0 40px #ff2a1f, 0 0 120px #e10600",
              opacity: clarao,
            }}
          />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

/** CENA 5 — Chamada para ação e assinatura final da marca. */
export const Cena5Chamada: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duracao = CENAS.cta[1] - INICIO;
  const marca = rel(E.marcaFinal);
  const final = rel(E.impactoFinal);
  const fimTextos = final - 12;

  // Movimento final da marca: do topo para o centro, maior
  const centraliza = spring({ frame: frame - final, fps, config: { damping: 200, mass: 0.9 } });
  const marcaY = interpolate(centraliza, [0, 1], [0, 400]);
  const marcaEscala = interpolate(centraliza, [0, 1], [1, 1.32]);
  const impacto = interpolate(frame, [final, final + 3, final + 26], [0, 1, 0], CLAMP);
  const tremor = impacto > 0 ? Math.sin(frame * 2.3) * 6 * impacto : 0;

  const entrada = interpolate(frame, [0, 10], [0, 1], CLAMP);
  const respiracao = 1 + 0.012 * Math.sin(frame / 18);

  return (
    <AbsoluteFill style={{ opacity: entrada, transform: `translate(${tremor}px, ${-tremor * 0.6}px)` }}>
      <Fundo
        brilho={interpolate(frame, [0, marca, final, final + 10], [0.2, 0.7, 0.7, 1], CLAMP)}
        brilhoY={interpolate(centraliza, [0, 1], [24, 46])}
        piso={0.55}
        velocidadePiso={interpolate(frame, [marca, marca + 30], [14, 3], CLAMP)}
        particulas={1}
        semente="c5"
      />
      <LinhasLuz inicio={marca + 6} repetir={70} quantidade={5} janela={50} semente="c5a" angulo={-14} intensidade={0.55} />
      <LinhasLuz inicio={final} quantidade={14} janela={10} semente="c5b" angulo={-14} />

      <Convergencia inicio={rel(E.convergencia)} fim={marca} cy={420} />

      {/* Marca */}
      <AbsoluteFill style={{ alignItems: "center", top: 280 }}>
        <div style={{ transform: `translateY(${marcaY}px) scale(${marcaEscala * respiracao})`, transformOrigin: "50% 0%" }}>
          <Marca inicio={marca} largura={660} reflexo={final + 4} brilho={1 + impacto} />
        </div>
      </AbsoluteFill>

      {/* Chamada principal */}
      <AbsoluteFill style={{ alignItems: "center", top: 690 }}>
        <Titulo
          inicio={rel(E.ctaPrincipal)}
          fim={fimTextos}
          atraso={6}
          linhas={[
            { texto: "Chegou a hora", estilo: "branco", tamanho: 118 },
            { texto: "de conquistar", estilo: "metal", tamanho: 118 },
            { texto: "seu PC!", estilo: "vermelho", tamanho: 170 },
          ]}
        />
      </AbsoluteFill>

      {/* Chamada secundária */}
      <AbsoluteFill style={{ alignItems: "center", top: 1150 }}>
        <Titulo
          inicio={rel(E.ctaSecundaria)}
          fim={fimTextos}
          atraso={5}
          peso={600}
          espacamento={0.04}
          altura={1.08}
          linhas={[
            { texto: "Entre em contato e conheça", estilo: "branco", tamanho: 58 },
            { texto: "as opções disponíveis.", estilo: "branco", tamanho: 58 },
          ]}
        />
      </AbsoluteFill>

      {/* Assinatura */}
      <AbsoluteFill style={{ alignItems: "center", top: 1352 }}>
        <Rotulo texto="Power Tech — Acreúna, Goiás." inicio={rel(E.assinatura)} fim={fimTextos} tamanho={36} />
      </AbsoluteFill>

      {/* Assinatura final, sob a marca centralizada */}
      <AbsoluteFill style={{ alignItems: "center", top: 1210 }}>
        <Rotulo texto="Acreúna — Goiás" inicio={final + 14} tamanho={44} cor={COR.branco} />
      </AbsoluteFill>

      {/* Clarão do impacto final */}
      <AbsoluteFill
        style={{
          mixBlendMode: "screen",
          opacity: impacto * 0.5,
          background: "radial-gradient(ellipse 70% 40% at 50% 46%, rgba(255,120,100,1), rgba(0,0,0,0) 70%)",
        }}
      />

      {/* Barra inferior discreta com o nome (fixação da marca) */}
      <AbsoluteFill style={{ alignItems: "center", top: 1430, opacity: interpolate(frame, [final + 24, final + 40], [0, 0.85], CLAMP) }}>
        <div
          style={{
            fontFamily: FONTE_TITULO,
            fontWeight: 600,
            fontSize: 30,
            letterSpacing: "0.5em",
            marginRight: "-0.5em",
            color: COR.prataEscura,
            textTransform: "uppercase",
          }}
        >
          Computadores · PCs gamers · Informática
        </div>
      </AbsoluteFill>

      {/* Escurecimento final suave */}
      <AbsoluteFill
        style={{
          backgroundColor: "#000",
          opacity: interpolate(frame, [duracao - 8, duracao], [0, 0.35], { ...CLAMP, easing: ENTRA_SAI }),
        }}
      />
    </AbsoluteFill>
  );
};
