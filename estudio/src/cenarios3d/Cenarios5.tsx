import React, { useMemo } from "react";
import * as THREE from "three";
import { Caixa, Carro, tex } from "./Cenarios4";
import { Bicicleta } from "./Detalhes4";
import { rnd } from "./Kit3D";

// ---------- Carro dos agentes com faróis acesos (cone de luz na neblina) ----------
export const CarroAgente: React.FC<{ p: [number, number, number]; rotY?: number; farol?: number; porta?: number }> = ({ p, rotY = 0, farol = 1, porta = 0 }) => (
  <group position={p} rotation={[0, rotY, 0]}>
    <Carro p={[0, 0, 0]} rodasNovas />
    {farol > 0 &&
      [-0.6, 0.6].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.72, 2.18]}>
            <boxGeometry args={[0.36, 0.14, 0.03]} />
            <meshBasicMaterial color="#FFF6DC" toneMapped={false} />
          </mesh>
          {/* cone de luz: aberto para a frente, aditivo */}
          <mesh position={[x * 1.6, 0.55, 2.2 + 4.5]} rotation={[Math.PI / 2 + 0.06, 0, 0]}>
            <coneGeometry args={[1.9, 9, 20, 1, true]} />
            <meshBasicMaterial color="#FFF1C8" transparent opacity={0.028 * farol} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} fog={false} />
          </mesh>
        </group>
      ))}
    {/* lanternas traseiras */}
    {[-0.62, 0.62].map((x) => (
      <mesh key={`t${x}`} position={[x, 0.72, -2.17]}>
        <boxGeometry args={[0.3, 0.1, 0.03]} />
        <meshBasicMaterial color="#FF2A2A" toneMapped={false} />
      </mesh>
    ))}
    {/* porta do motorista abrindo */}
    {porta > 0 && (
      <group position={[0.9, 0.2, 0.9]} rotation={[0, porta * 1.1, 0]}>
        <Caixa p={[0.02, 0.55, -0.65]} s={[0.06, 0.8, 1.3]} cor="#121318" rough={0.35} />
      </group>
    )}
  </group>
);

// 6 carros em círculo em volta do centro (x, z), entrando de longe conforme "chegada" 0..1 (cada um com atraso)
export const CARROS5 = Array.from({ length: 6 }).map((_, i) => {
  const a = (i / 6) * Math.PI * 2 + 0.35;
  return { a, x: Math.cos(a), z: Math.sin(a) };
});
export const CirculoCarros: React.FC<{ c: [number, number]; r: number; chegada: number; n?: number; farol?: number; porta?: number }> = ({ c, r, chegada, n = 6, farol = 1, porta = 0 }) => (
  <group>
    {CARROS5.slice(0, n).map((k, i) => {
      const t = Math.min(1, Math.max(0, chegada * 6 - i)); // um depois do outro
      const e = 1 - Math.pow(1 - t, 3);
      const rr = r + (1 - e) * 40;
      if (t <= 0) return null;
      // de frente para o centro: o carro olha para +z local
      const rotY = Math.atan2(-k.x, -k.z);
      return <CarroAgente key={i} p={[c[0] + k.x * rr, 0, c[1] + k.z * rr]} rotY={rotY} farol={farol} porta={porta} />;
    })}
  </group>
);

// ---------- O "outro lugar": chão de pedra infinito, neblina, pilhas de coisas guardadas ----------
const Pilha: React.FC<{ p: [number, number, number]; semente: number; alt?: number }> = ({ p, semente, alt = 1 }) => {
  const itens = useMemo(() => {
    const out: { y: number; s: [number, number, number]; r: number; cor: string; x: number; z: number }[] = [];
    let y = 0;
    const n = 4 + Math.floor(rnd(semente) * 5 * alt);
    for (let i = 0; i < n; i++) {
      const w = 0.4 + rnd(semente + i) * 0.9;
      const h = 0.15 + rnd(semente + i + 0.3) * 0.5;
      out.push({
        y: y + h / 2, s: [w, h, 0.3 + rnd(semente + i + 0.6) * 0.7], r: (rnd(semente + i + 0.9) - 0.5) * 0.8,
        cor: ["#4B4458", "#5A5060", "#3E3A4C", "#6A5E58", "#4E5866", "#5C4A44"][i % 6],
        x: (rnd(semente + i + 1.2) - 0.5) * 0.25, z: (rnd(semente + i + 1.5) - 0.5) * 0.25,
      });
      y += h * 0.95;
    }
    return out;
  }, [semente, alt]);
  return (
    <group position={p}>
      {itens.map((o, i) => (
        <Caixa key={i} p={[o.x, o.y, o.z]} s={o.s} cor={o.cor} r={[0, o.r, (rnd(semente + i) - 0.5) * 0.1]} rough={0.9} />
      ))}
    </group>
  );
};

export const Vazio3D: React.FC<{ fendaAcima?: number; rachaduras?: boolean }> = ({ fendaAcima = 0 }) => {
  const pedra = useMemo(
    () =>
      tex(512, 512, (g) => {
        g.fillStyle = "#2A2636";
        g.fillRect(0, 0, 512, 512);
        // lajes irregulares
        for (let i = 0; i < 70; i++) {
          g.fillStyle = ["#302B3E", "#262232", "#2E2A3A", "#35304A"][i % 4];
          const x = rnd(i) * 512, y = rnd(i + 1) * 512, w = 40 + rnd(i + 2) * 110, h = 40 + rnd(i + 3) * 110;
          g.fillRect(x, y, w, h);
        }
        g.strokeStyle = "rgba(10,8,16,0.8)";
        g.lineWidth = 3;
        for (let i = 0; i < 40; i++) {
          g.beginPath();
          let x = rnd(i + 7) * 512, y = rnd(i + 8) * 512;
          g.moveTo(x, y);
          for (let k = 0; k < 4; k++) { x += (rnd(i * 4 + k) - 0.5) * 120; y += (rnd(i * 4 + k + 2) - 0.5) * 120; g.lineTo(x, y); }
          g.stroke();
        }
        // poeira clara
        for (let i = 0; i < 2500; i++) {
          g.fillStyle = `rgba(190,180,230,${0.04 + rnd(i + 11) * 0.08})`;
          g.fillRect(rnd(i + 12) * 512, rnd(i + 13) * 512, 2, 2);
        }
      }, [20, 20]),
    [],
  );
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[220, 220]} />
        <meshStandardMaterial map={pedra} roughness={1} />
      </mesh>
      {/* pilhas de coisas guardadas, cada vez mais longe na neblina */}
      {Array.from({ length: 34 }).map((_, i) => {
        const a = rnd(i + 40) * Math.PI * 2;
        const d = 4.5 + rnd(i + 41) * 30;
        return <Pilha key={i} p={[Math.cos(a) * d, 0, Math.sin(a) * d - 4]} semente={i * 7 + 3} alt={0.8 + rnd(i + 42) * 1.8} />;
      })}
      {/* as coisas do Chede (Parte 1) numa pilha perto: caixa do despertador, cesto, louça */}
      <Pilha p={[2.2, 0, -2.5]} semente={901} alt={1.2} />
      <Bicicleta p={[-3.2, 0, -5.5]} rotY={0.6} cor="#5A6B8A" />
      {/* pedras soltas */}
      {Array.from({ length: 40 }).map((_, i) => (
        <mesh key={`r${i}`} position={[(rnd(i + 90) - 0.5) * 30, 0.06, (rnd(i + 91) - 0.5) * 30 - 4]} castShadow>
          <icosahedronGeometry args={[0.08 + rnd(i + 92) * 0.2, 0]} />
          <meshStandardMaterial color="#3A3548" flatShading />
        </mesh>
      ))}
      {/* fenda aberta no alto (saída): luz roxa vinda de cima */}
      {fendaAcima > 0 && (
        <group position={[0, 9, -1]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} scale={[fendaAcima, fendaAcima * 0.5, 1]}>
            <circleGeometry args={[1.6, 32]} />
            <meshBasicMaterial color="#D9C6FF" toneMapped={false} fog={false} />
          </mesh>
          <mesh position={[0, -4.5, 0]}>
            <cylinderGeometry args={[1.4 * fendaAcima, 3.2 * fendaAcima, 9, 24, 1, true]} />
            <meshBasicMaterial color="#B49CFF" transparent opacity={0.08} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} fog={false} />
          </mesh>
          <pointLight position={[0, -3, 0]} color="#C7B2FF" intensity={30 * fendaAcima} distance={18} />
        </group>
      )}
    </group>
  );
};
