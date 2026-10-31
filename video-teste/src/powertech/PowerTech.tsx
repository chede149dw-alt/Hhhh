import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Cena1Abertura } from "./cenas/Cena1Abertura";
import { Cena2Computadores } from "./cenas/Cena2Computadores";
import { Cena3Parcelamento } from "./cenas/Cena3Parcelamento";
import { Cena4Local } from "./cenas/Cena4Local";
import { Cena5Chamada } from "./cenas/Cena5Chamada";
import { TransicaoLuz } from "./componentes/LinhasLuz";
import { CENAS, COR } from "./tema";

const dur = ([a, b]: number[]) => b - a;

/**
 * Comercial POWER TECH — 1080×1920, 30 fps, 32 s.
 * Tempos das cenas e eventos sonoros: ./timing.json (compartilhado com scripts/gerar_trilha_powertech.py).
 */
export const PowerTech: React.FC<{ comAudio?: boolean }> = ({ comAudio = true }) => (
  <AbsoluteFill style={{ backgroundColor: COR.preto }}>
    <Sequence from={CENAS.abertura[0]} durationInFrames={dur(CENAS.abertura)} name="1 · Abertura">
      <Cena1Abertura />
    </Sequence>
    <Sequence from={CENAS.computadores[0]} durationInFrames={dur(CENAS.computadores)} name="2 · Computadores">
      <Cena2Computadores />
    </Sequence>
    <Sequence from={CENAS.parcelamento[0]} durationInFrames={dur(CENAS.parcelamento)} name="3 · Parcelamento">
      <Cena3Parcelamento />
    </Sequence>
    <Sequence from={CENAS.local[0]} durationInFrames={dur(CENAS.local)} name="4 · Localização">
      <Cena4Local />
    </Sequence>
    <Sequence from={CENAS.cta[0]} durationInFrames={dur(CENAS.cta)} name="5 · Chamada">
      <Cena5Chamada />
    </Sequence>

    {/* Transições de luz entre cenas */}
    <Sequence from={CENAS.computadores[0] - 8} durationInFrames={24} name="Transição 1→2">
      <TransicaoLuz semente="t12" />
    </Sequence>
    <Sequence from={CENAS.parcelamento[0] - 8} durationInFrames={24} name="Transição 2→3">
      <TransicaoLuz semente="t23" angulo={-24} />
    </Sequence>
    <Sequence from={CENAS.cta[0] - 8} durationInFrames={24} name="Transição 4→5">
      <TransicaoLuz semente="t45" angulo={-8} />
    </Sequence>

    {comAudio ? <Audio src={staticFile("powertech/trilha.wav")} /> : null}
  </AbsoluteFill>
);
