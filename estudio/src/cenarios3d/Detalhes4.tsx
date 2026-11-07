import React, { useMemo } from "react";
import * as THREE from "three";
const rnd = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// Peças de detalhe para deixar os cenários vivos (estilo low-poly das referências 4 e 5).

const P3 = (x: number, y: number, z: number): [number, number, number] => [x, y, z];

const texRadial = (cor: string) => {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, cor);
  gr.addColorStop(0.25, cor);
  gr.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
};

// Sol com halo (sprite), longe, na direção da luz
export const Sol: React.FC<{ p: [number, number, number]; cor?: string; tam?: number }> = ({ p, cor = "#FFE2A0", tam = 60 }) => {
  const t = useMemo(() => texRadial(cor), [cor]);
  return (
    <group position={p}>
      <sprite scale={[tam * 4, tam * 4, 1]}>
        <spriteMaterial map={t} transparent opacity={0.55} depthWrite={false} fog={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <mesh>
        <sphereGeometry args={[tam * 0.35, 24, 16]} />
        <meshBasicMaterial color="#FFF4D6" fog={false} />
      </mesh>
    </group>
  );
};

// Nuvens low-poly (bolhas achatadas)
export const Nuvens: React.FC<{ n?: number; cor?: string; y?: number; z?: number; semente?: number; larg?: number }> = ({
  n = 7, cor = "#FFFFFF", y = 55, z = -170, semente = 1, larg = 320,
}) => (
  <group>
    {Array.from({ length: n }).map((_, i) => {
      const x = -larg / 2 + rnd(i + semente) * larg;
      const yy = y + rnd(i + semente + 3) * 25;
      const zz = z - rnd(i + semente + 5) * 60;
      const s = 6 + rnd(i + semente + 7) * 8;
      return (
        <group key={i} position={[x, yy, zz]} scale={[s * 1.8, s * 0.7, s]}>
          {[[0, 0, 0, 1], [0.9, -0.1, 0.2, 0.8], [-0.9, -0.15, -0.1, 0.75], [0.4, 0.35, 0, 0.7], [-0.4, 0.3, 0.2, 0.65]].map(([a, b, c, r], k) => (
            <mesh key={k} position={[a, b, c]}>
              <icosahedronGeometry args={[r, 1]} />
              <meshStandardMaterial color={cor} emissive={cor} emissiveIntensity={0.35} flatShading fog={false} />
            </mesh>
          ))}
        </group>
      );
    })}
  </group>
);

export const Arbusto: React.FC<{ p: [number, number, number]; s?: number; cor?: string; flores?: string }> = ({ p, s = 1, cor = "#4F8A3E", flores }) => (
  <group position={p} scale={s}>
    {[[0, 0.45, 0, 0.6], [0.45, 0.35, 0.1, 0.45], [-0.42, 0.35, -0.05, 0.48], [0.1, 0.75, 0, 0.4]].map(([x, y, z, r], k) => (
      <mesh key={k} position={[x, y, z]} castShadow receiveShadow>
        <icosahedronGeometry args={[r, 0]} />
        <meshStandardMaterial color={k % 2 ? cor : new THREE.Color(cor).multiplyScalar(0.82).getStyle()} flatShading />
      </mesh>
    ))}
    {flores &&
      Array.from({ length: 9 }).map((_, i) => (
        <mesh key={`f${i}`} position={[(rnd(i) - 0.5) * 1.1, 0.5 + rnd(i + 2) * 0.5, (rnd(i + 4) - 0.5) * 0.8]}>
          <sphereGeometry args={[0.07, 6, 4]} />
          <meshStandardMaterial color={flores} emissive={flores} emissiveIntensity={0.15} />
        </mesh>
      ))}
  </group>
);

export const Canteiro: React.FC<{ p: [number, number, number]; w: number; d: number; flores?: string[] }> = ({ p, w, d, flores = ["#E35D7A", "#F2D25A", "#F6F2EA", "#B268D9"] }) => (
  <group position={p}>
    <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
      <boxGeometry args={[w, 0.3, d]} />
      <meshStandardMaterial color="#BDB3A3" />
    </mesh>
    <mesh position={[0, 0.31, 0]} receiveShadow>
      <boxGeometry args={[w - 0.2, 0.04, d - 0.2]} />
      <meshStandardMaterial color="#5A3E2B" />
    </mesh>
    {Array.from({ length: Math.floor(w * d * 4) }).map((_, i) => {
      const x = (rnd(i + w) - 0.5) * (w - 0.4);
      const z = (rnd(i + d + 9) - 0.5) * (d - 0.4);
      return (
        <group key={i} position={[x, 0.33, z]}>
          <mesh position={[0, 0.15, 0]}>
            <coneGeometry args={[0.12, 0.3, 4]} />
            <meshStandardMaterial color="#4F8A3E" flatShading />
          </mesh>
          <mesh position={[0, 0.33, 0]}>
            <sphereGeometry args={[0.07, 6, 4]} />
            <meshStandardMaterial color={flores[i % flores.length]} />
          </mesh>
        </group>
      );
    })}
  </group>
);

export const Luminaria: React.FC<{ p: [number, number, number]; acesa?: boolean; alt?: number }> = ({ p, acesa = false, alt = 4.2 }) => (
  <group position={p}>
    <mesh position={[0, alt / 2, 0]} castShadow>
      <cylinderGeometry args={[0.06, 0.09, alt, 8]} />
      <meshStandardMaterial color="#2B2E36" metalness={0.4} roughness={0.5} />
    </mesh>
    <mesh position={[0, alt + 0.15, 0]}>
      <cylinderGeometry args={[0.25, 0.15, 0.3, 8]} />
      <meshStandardMaterial color="#2B2E36" />
    </mesh>
    <mesh position={[0, alt - 0.02, 0]}>
      <sphereGeometry args={[0.16, 10, 8]} />
      <meshStandardMaterial color="#FFF2D0" emissive="#FFE0A0" emissiveIntensity={acesa ? 2.5 : 0.4} />
    </mesh>
  </group>
);

export const Banco: React.FC<{ p: [number, number, number]; rotY?: number }> = ({ p, rotY = 0 }) => (
  <group position={p} rotation={[0, rotY, 0]}>
    {[0, 1, 2].map((i) => (
      <mesh key={i} position={[0, 0.45, -0.15 + i * 0.15]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.05, 0.12]} />
        <meshStandardMaterial color="#9A6A42" />
      </mesh>
    ))}
    {[0, 1].map((i) => (
      <mesh key={`e${i}`} position={[0, 0.72 + i * 0.16, -0.26]} castShadow>
        <boxGeometry args={[1.8, 0.1, 0.04]} />
        <meshStandardMaterial color="#9A6A42" />
      </mesh>
    ))}
    {[-0.8, 0.8].map((x) => (
      <mesh key={x} position={[x, 0.3, -0.05]} castShadow>
        <boxGeometry args={[0.06, 0.6, 0.5]} />
        <meshStandardMaterial color="#2B2E36" />
      </mesh>
    ))}
  </group>
);

export const Lixeira: React.FC<{ p: [number, number, number]; cor?: string }> = ({ p, cor = "#3E7A3E" }) => (
  <group position={p}>
    <mesh position={[0, 0.45, 0]} castShadow>
      <cylinderGeometry args={[0.28, 0.24, 0.9, 12]} />
      <meshStandardMaterial color={cor} />
    </mesh>
    <mesh position={[0, 0.92, 0]}>
      <cylinderGeometry args={[0.3, 0.3, 0.06, 12]} />
      <meshStandardMaterial color="#2B2E36" />
    </mesh>
  </group>
);

export const Bicicleta: React.FC<{ p: [number, number, number]; rotY?: number; cor?: string }> = ({ p, rotY = 0, cor = "#C93A32" }) => (
  <group position={p} rotation={[0, rotY, 0]}>
    {[-0.5, 0.5].map((x) => (
      <mesh key={x} position={[x, 0.34, 0]} castShadow>
        <torusGeometry args={[0.32, 0.03, 6, 20]} />
        <meshStandardMaterial color="#1B1B1D" />
      </mesh>
    ))}
    <mesh position={[0, 0.55, 0]} rotation={[0, 0, 0.1]}>
      <boxGeometry args={[0.9, 0.05, 0.05]} />
      <meshStandardMaterial color={cor} />
    </mesh>
    <mesh position={[-0.15, 0.5, 0]} rotation={[0, 0, 1.1]}>
      <boxGeometry args={[0.5, 0.05, 0.05]} />
      <meshStandardMaterial color={cor} />
    </mesh>
    <mesh position={[-0.25, 0.82, 0]}>
      <boxGeometry args={[0.22, 0.05, 0.1]} />
      <meshStandardMaterial color="#1B1B1D" />
    </mesh>
    <mesh position={[0.45, 0.85, 0]}>
      <boxGeometry args={[0.05, 0.05, 0.45]} />
      <meshStandardMaterial color="#1B1B1D" />
    </mesh>
  </group>
);

const texTexto = (linhas: string[], fundo: string, cor: string, w = 512, h = 256, fonte = 64) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = fundo;
  g.fillRect(0, 0, w, h);
  g.fillStyle = cor;
  g.textAlign = "center";
  g.textBaseline = "middle";
  linhas.forEach((l, i) => {
    g.font = `bold ${i === 0 ? fonte : fonte * 0.55}px 'Roboto Condensed', Arial`;
    g.fillText(l, w / 2, (h / (linhas.length + 1)) * (i + 1));
  });
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 8;
  return t;
};

// Placa com texto (só a frente tem texto)
export const Placa: React.FC<{ p: [number, number, number]; w: number; h: number; linhas: string[]; fundo?: string; cor?: string; rotY?: number; brilho?: number }> = ({
  p, w, h, linhas, fundo = "#1F3B5C", cor = "#F2E9D8", rotY = 0, brilho = 0,
}) => {
  const t = useMemo(() => texTexto(linhas, fundo, cor, 512, Math.round((512 * h) / w)), [linhas.join("|"), fundo, cor, w, h]);
  return (
    <mesh position={p} rotation={[0, rotY, 0]} castShadow>
      <boxGeometry args={[w, h, 0.08]} />
      {[0, 1, 2, 3, 5].map((k) => (
        <meshStandardMaterial key={k} attach={`material-${k}`} color={fundo} />
      ))}
      <meshStandardMaterial attach="material-4" map={t} emissive="#ffffff" emissiveMap={t} emissiveIntensity={brilho} />
    </mesh>
  );
};

export const Toldo: React.FC<{ p: [number, number, number]; w: number; cores?: [string, string]; rotY?: number }> = ({ p, w, cores = ["#C93A32", "#F2EDE4"], rotY = 0 }) => (
  <group position={p} rotation={[0, rotY, 0]}>
    {Array.from({ length: Math.round(w / 0.5) }).map((_, i) => (
      <mesh key={i} position={[-w / 2 + 0.25 + i * 0.5, 0, 0.5]} rotation={[0.45, 0, 0]} castShadow>
        <boxGeometry args={[0.5, 0.04, 1.2]} />
        <meshStandardMaterial color={cores[i % 2]} />
      </mesh>
    ))}
  </group>
);

// Postes de luz com fios entre eles
export const PostesFios: React.FC<{ pts: [number, number][]; alt?: number }> = ({ pts, alt = 8.5 }) => (
  <group>
    {pts.map(([x, z], i) => (
      <group key={i} position={[x, 0, z]}>
        <mesh position={[0, alt / 2, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.16, alt, 6]} />
          <meshStandardMaterial color="#6B5A48" />
        </mesh>
        <mesh position={[0, alt - 0.4, 0]}>
          <boxGeometry args={[1.8, 0.1, 0.1]} />
          <meshStandardMaterial color="#6B5A48" />
        </mesh>
      </group>
    ))}
    {pts.slice(1).map(([x, z], i) => {
      const [x0, z0] = pts[i];
      return [-0.8, 0, 0.8].map((o) => {
        const a: THREE.Vector3[] = [];
        for (let k = 0; k <= 10; k++) {
          const t = k / 10;
          a.push(new THREE.Vector3(x0 + (x - x0) * t + o, alt - 0.35 - Math.sin(t * Math.PI) * 0.6, z0 + (z - z0) * t));
        }
        const g = new THREE.BufferGeometry().setFromPoints(a);
        return (
          <line key={`${i}${o}`}>
            <primitive object={g} attach="geometry" />
            <lineBasicMaterial color="#2A2420" />
          </line>
        );
      });
    })}
  </group>
);

// Prédios ao longe (silhueta com janelas)
export const Skyline: React.FC<{ z: number; x0?: number; x1?: number; semente?: number; cor?: string; acesas?: boolean }> = ({
  z, x0 = -150, x1 = 150, semente = 3, cor = "#B9A99A", acesas = false,
}) => {
  const itens = useMemo(() => {
    const out: { x: number; w: number; h: number; d: number }[] = [];
    let x = x0;
    let i = 0;
    while (x < x1) {
      const w = 6 + rnd(i + semente) * 10;
      out.push({ x: x + w / 2, w, h: 8 + rnd(i + semente + 4) * 30, d: 6 + rnd(i + 8) * 8 });
      x += w + 1 + rnd(i + 2) * 3;
      i++;
    }
    return out;
  }, [z, x0, x1, semente]);
  return (
    <group>
      {itens.map((b, k) => (
        <group key={k} position={[b.x, b.h / 2, z - rnd(k + 30) * 15]}>
          <mesh>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial color={new THREE.Color(cor).multiplyScalar(0.85 + rnd(k) * 0.3).getStyle()} />
          </mesh>
          {acesas &&
            Array.from({ length: 6 }).map((_, j) => (
              <mesh key={j} position={[(rnd(k * 9 + j) - 0.5) * b.w * 0.8, (rnd(k * 9 + j + 1) - 0.5) * b.h * 0.8, b.d / 2 + 0.02]}>
                <planeGeometry args={[0.8, 1]} />
                <meshBasicMaterial color="#FFD58A" />
              </mesh>
            ))}
        </group>
      ))}
    </group>
  );
};

// Cerca de madeira
export const Cerca: React.FC<{ de: [number, number]; ate: [number, number]; quebrada?: boolean }> = ({ de, ate, quebrada }) => {
  const L = Math.hypot(ate[0] - de[0], ate[1] - de[1]);
  const ang = Math.atan2(ate[1] - de[1], ate[0] - de[0]);
  const n = Math.floor(L / 0.6);
  return (
    <group position={[de[0], 0, de[1]]} rotation={[0, -ang, 0]}>
      {Array.from({ length: n }).map((_, i) =>
        quebrada && rnd(i + 3) < 0.2 ? null : (
          <mesh key={i} position={[i * 0.6, 0.6, 0]} rotation={[0, 0, quebrada ? (rnd(i) - 0.5) * 0.25 : 0]} castShadow>
            <boxGeometry args={[0.12, 1.2 + rnd(i + 1) * 0.15, 0.05]} />
            <meshStandardMaterial color={rnd(i + 5) < 0.5 ? "#8A6A4A" : "#7A5A3C"} />
          </mesh>
        ),
      )}
      {[0.35, 0.9].map((y) => (
        <mesh key={y} position={[L / 2, y, 0.04]} castShadow>
          <boxGeometry args={[L, 0.08, 0.04]} />
          <meshStandardMaterial color="#6E5236" />
        </mesh>
      ))}
    </group>
  );
};

// Lixo espalhado (garrafas, caixas, latas)
export const Lixo: React.FC<{ area: [number, number, number, number]; n?: number; semente?: number }> = ({ area, n = 30, semente = 5 }) => (
  <group>
    {Array.from({ length: n }).map((_, i) => {
      const x = area[0] + rnd(i + semente) * (area[1] - area[0]);
      const z = area[2] + rnd(i + semente + 50) * (area[3] - area[2]);
      const tipo = i % 3;
      return (
        <mesh key={i} position={[x, tipo === 1 ? 0.12 : 0.05, z]} rotation={[tipo === 0 ? Math.PI / 2 : 0, rnd(i) * 6, 0]} castShadow>
          {tipo === 0 ? <cylinderGeometry args={[0.04, 0.04, 0.25, 6]} /> : tipo === 1 ? <boxGeometry args={[0.35, 0.24, 0.3]} /> : <cylinderGeometry args={[0.035, 0.035, 0.1, 8]} />}
          <meshStandardMaterial color={tipo === 0 ? "#3E8A5A" : tipo === 1 ? "#B58A5A" : "#C93A32"} roughness={0.6} />
        </mesh>
      );
    })}
  </group>
);

export const Pinheiro: React.FC<{ p: [number, number, number]; s?: number; cor?: string }> = ({ p, s = 1, cor = "#3F6E3A" }) => (
  <group position={p} scale={s}>
    <mesh position={[0, 0.8, 0]} castShadow>
      <cylinderGeometry args={[0.12, 0.18, 1.6, 6]} />
      <meshStandardMaterial color="#5E4330" />
    </mesh>
    {[0, 1, 2].map((k) => (
      <mesh key={k} position={[0, 1.8 + k * 1.1, 0]} castShadow>
        <coneGeometry args={[1.5 - k * 0.4, 1.8, 7]} />
        <meshStandardMaterial color={k % 2 ? cor : new THREE.Color(cor).multiplyScalar(0.85).getStyle()} flatShading />
      </mesh>
    ))}
  </group>
);

export { P3 };
