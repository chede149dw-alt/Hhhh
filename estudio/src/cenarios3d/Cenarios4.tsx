import React, { useMemo } from "react";
import * as THREE from "three";
import { rnd } from "./Kit3D";

// Cenários 3D da Parte 4: faculdade (portão, anfiteatro, cantina), campo baldio e objetos.
// Low-poly com sombra, no estilo das referências 4 e 5. Unidades em metros.

const tex = (w: number, h: number, desenha: (g: CanvasRenderingContext2D) => void, rep?: [number, number]) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  desenha(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  if (rep) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rep[0], rep[1]);
  }
  t.anisotropy = 8;
  return t;
};

const Caixa: React.FC<{ p: [number, number, number]; s: [number, number, number]; cor: string; r?: [number, number, number]; sombra?: boolean; rough?: number; mat?: React.ReactNode }> = ({
  p, s, cor, r, sombra = true, rough = 0.9, mat,
}) => (
  <mesh position={p} rotation={r} castShadow={sombra} receiveShadow>
    <boxGeometry args={s} />
    {mat ?? <meshStandardMaterial color={cor} roughness={rough} />}
  </mesh>
);

export const Arvore: React.FC<{ p: [number, number, number]; s?: number; cor?: string }> = ({ p, s = 1, cor = "#5E9A4A" }) => (
  <group position={p} scale={s}>
    <mesh position={[0, 1.6, 0]} castShadow>
      <cylinderGeometry args={[0.16, 0.24, 3.2, 6]} />
      <meshStandardMaterial color="#6B4A32" />
    </mesh>
    {[
      [0, 4.0, 0, 1.8],
      [0.9, 3.5, 0.4, 1.3],
      [-0.8, 3.6, -0.3, 1.4],
      [0.1, 4.8, -0.2, 1.1],
    ].map(([x, y, z, r], k) => (
      <mesh key={k} position={[x, y, z]} castShadow>
        <icosahedronGeometry args={[r, 0]} />
        <meshStandardMaterial color={k % 2 ? cor : new THREE.Color(cor).multiplyScalar(0.85).getStyle()} flatShading roughness={0.9} />
      </mesh>
    ))}
  </group>
);

// ---------- Carros ----------
export const Carro: React.FC<{ p: [number, number, number]; rotY?: number; cor?: string; velho?: boolean; marcas?: number; escala?: number }> = ({
  p, rotY = 0, cor = "#121318", velho = false, marcas = 0, escala = 1,
}) => {
  const tMarcas = useMemo(
    () =>
      tex(512, 256, (g) => {
        g.clearRect(0, 0, 512, 256);
        g.fillStyle = "rgba(8,6,10,0.92)";
        const mao = (x: number, y: number, a: number, s: number) => {
          g.save();
          g.translate(x, y);
          g.rotate(a);
          g.scale(s, s);
          g.beginPath();
          g.ellipse(0, 0, 22, 26, 0, 0, Math.PI * 2);
          g.fill();
          [[-16, -38, 7, 22], [-5, -46, 7, 26], [7, -44, 7, 25], [18, -34, 6, 20], [28, 4, 6, 16]].forEach(([fx, fy, rx, ry], i) => {
            g.beginPath();
            g.ellipse(fx, fy, rx, ry, i === 4 ? 1 : 0.12 * (i - 1.5), 0, Math.PI * 2);
            g.fill();
          });
          g.restore();
        };
        mao(90, 150, -0.3, 1.1);
        mao(190, 110, 0.15, 1.2);
        mao(280, 160, -0.1, 1.0);
        mao(370, 105, 0.35, 1.15);
        mao(440, 170, -0.4, 1.0);
      }),
    [],
  );
  const corpo = velho ? "#8C5A3C" : cor;
  const vidro = velho ? "#2B2A2A" : "#1D2633";
  return (
    <group position={p} rotation={[0, rotY, 0]} scale={escala}>
      <Caixa p={[0, 0.62, 0]} s={[1.8, 0.62, 4.3]} cor={corpo} rough={velho ? 0.95 : 0.35} />
      <Caixa p={[0, 1.18, -0.2]} s={[1.6, 0.55, 2.3]} cor={corpo} rough={velho ? 0.95 : 0.35} />
      {[-1, 1].map((l) => (
        <Caixa key={l} p={[l * 0.81, 1.18, -0.2]} s={[0.02, 0.42, 2.0]} cor={vidro} rough={0.2} />
      ))}
      <Caixa p={[0, 1.18, 0.96]} s={[1.5, 0.42, 0.02]} cor={vidro} rough={0.2} />
      <Caixa p={[0, 1.18, -1.36]} s={[1.5, 0.42, 0.02]} cor={vidro} rough={0.2} />
      {[-1, 1].map((l) =>
        [-1.35, 1.35].map((zz) => (
          <mesh key={`${l}${zz}`} position={[l * 0.86, 0.36, zz]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.36, 0.36, 0.26, 14]} />
            <meshStandardMaterial color="#141416" />
          </mesh>
        )),
      )}
      {!velho && (
        <>
          <Caixa p={[0.6, 0.72, 2.16]} s={[0.35, 0.12, 0.02]} cor="#FFF4D6" mat={<meshStandardMaterial color="#FFF4D6" emissive="#FFF0C8" emissiveIntensity={0.6} />} />
          <Caixa p={[-0.6, 0.72, 2.16]} s={[0.35, 0.12, 0.02]} cor="#FFF4D6" mat={<meshStandardMaterial color="#FFF4D6" emissive="#FFF0C8" emissiveIntensity={0.6} />} />
        </>
      )}
      {velho && (
        <>
          {/* ferrugem e amassados */}
          <Caixa p={[0.91, 0.55, 0.9]} s={[0.02, 0.35, 0.9]} cor="#5E3A26" />
          <Caixa p={[-0.91, 0.7, -1.2]} s={[0.02, 0.3, 0.7]} cor="#6A4129" />
          <Caixa p={[0, 0.95, 1.6]} s={[1.6, 0.04, 0.9]} cor="#7A4C31" r={[0.12, 0, 0]} />
        </>
      )}
      {marcas > 0 && (
        <mesh position={[0.915, 0.75, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[3.6, 1.0]} />
          <meshStandardMaterial map={tMarcas} transparent opacity={marcas} depthWrite={false} roughness={0.9} />
        </mesh>
      )}
    </group>
  );
};

// ---------- Faculdade: portão e fachada ----------
const texFachada = () =>
  tex(1024, 512, (g) => {
    g.fillStyle = "#E7DCCB";
    g.fillRect(0, 0, 1024, 512);
    for (let a = 0; a < 4; a++)
      for (let i = 0; i < 16; i++) {
        const x = 20 + i * 63;
        const y = 30 + a * 120;
        g.fillStyle = "#C9BBA6";
        g.fillRect(x - 4, y - 4, 50, 82);
        g.fillStyle = rnd(a * 31 + i) > 0.8 ? "#F6E3B0" : "#4E6A80";
        g.fillRect(x, y, 42, 74);
        g.fillStyle = "rgba(255,255,255,0.25)";
        g.fillRect(x, y, 12, 74);
      }
  });

const texPlaca = (texto: string) =>
  tex(1024, 160, (g) => {
    g.fillStyle = "#1F3B5C";
    g.fillRect(0, 0, 1024, 160);
    g.fillStyle = "#F2E9D8";
    g.font = "bold 84px 'Roboto Condensed', Arial";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(texto, 512, 84);
  });

export const CameraSeguranca: React.FC<{ p: [number, number, number]; giro: number; luz?: number }> = ({ p, giro, luz = 0 }) => (
  <group position={p}>
    <Caixa p={[0, -0.25, 0]} s={[0.08, 0.5, 0.08]} cor="#C9C9C9" />
    <group rotation={[0.25, giro, 0]}>
      <Caixa p={[0, 0, 0.22]} s={[0.22, 0.2, 0.55]} cor="#EDEDED" rough={0.4} />
      <mesh position={[0, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.03, 14]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0.07, 0.07, 0.5]}>
        <sphereGeometry args={[0.025, 8, 6]} />
        <meshStandardMaterial color="#FF2A20" emissive="#FF2A20" emissiveIntensity={luz * 4} />
      </mesh>
    </group>
  </group>
);

export const Faculdade3D: React.FC<{ giroCamera?: number; luzCamera?: number; carroPreto?: number }> = ({ giroCamera = 0, luzCamera = 0, carroPreto }) => {
  const fachada = useMemo(() => texFachada(), []);
  const placa = useMemo(() => texPlaca("UNIVERSIDADE"), []);
  const grama = useMemo(
    () =>
      tex(256, 256, (g) => {
        g.fillStyle = "#86A85E";
        g.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 900; i++) {
          g.fillStyle = rnd(i) > 0.5 ? "#7A9C54" : "#93B46A";
          g.fillRect(rnd(i + 1) * 256, rnd(i + 2) * 256, 2, 5);
        }
      }, [30, 30]),
    [],
  );
  return (
    <group>
      {/* chão: grama, calçada e rua (rua corre no eixo x, em z = 6..14) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, -30]}>
        <planeGeometry args={[220, 80]} />
        <meshStandardMaterial map={grama} roughness={1} />
      </mesh>
      <Caixa p={[0, 0.06, 3]} s={[220, 0.12, 6]} cor="#D8D2C6" sombra={false} />
      <Caixa p={[0, 0.01, 10]} s={[220, 0.02, 8]} cor="#4A4C52" sombra={false} />
      {[-60, -40, -20, 0, 20, 40, 60].map((x) => (
        <Caixa key={x} p={[x, 0.025, 10]} s={[6, 0.01, 0.18]} cor="#F2D25A" sombra={false} />
      ))}
      <Caixa p={[0, 0.03, 14.5]} s={[220, 0.06, 1]} cor="#D8D2C6" sombra={false} />
      {/* caminho até o prédio */}
      <Caixa p={[0, 0.05, -9]} s={[5, 0.1, 18]} cor="#CFC6B6" sombra={false} />
      {/* muro com grade + portão */}
      {[-1, 1].map((l) => (
        <group key={l}>
          <Caixa p={[l * 28, 0.5, 0]} s={[46, 1, 0.4]} cor="#DDD3C3" />
          {Array.from({ length: 70 }).map((_, i) => (
            <Caixa key={i} p={[l * (5.6 + i * 0.65), 1.55, 0]} s={[0.06, 1.1, 0.06]} cor="#2B2E36" sombra={false} />
          ))}
          <Caixa p={[l * 28, 2.12, 0]} s={[46, 0.08, 0.08]} cor="#2B2E36" />
          <Caixa p={[l * 3.6, 2.2, 0]} s={[0.9, 4.4, 0.9]} cor="#CBBFAE" />
          <Caixa p={[l * 3.6, 4.5, 0]} s={[1.1, 0.25, 1.1]} cor="#B6AA98" />
        </group>
      ))}
      <mesh position={[0, 4.9, 0]} castShadow>
        <boxGeometry args={[8.4, 1.2, 0.5]} />
        {[0, 1, 2, 3].map((k) => (
          <meshStandardMaterial key={k} attach={`material-${k}`} color="#1F3B5C" />
        ))}
        <meshStandardMaterial attach="material-4" map={placa} />
        <meshStandardMaterial attach="material-5" color="#1F3B5C" />
      </mesh>
      <CameraSeguranca p={[3.6, 4.2, 0.6]} giro={giroCamera} luz={luzCamera} />
      {/* prédio principal */}
      <mesh position={[0, 7, -24]} castShadow receiveShadow>
        <boxGeometry args={[46, 14, 12]} />
        <meshStandardMaterial attach="material-0" color="#D9CDBA" />
        <meshStandardMaterial attach="material-1" color="#D9CDBA" />
        <meshStandardMaterial attach="material-2" color="#BDB09C" />
        <meshStandardMaterial attach="material-3" color="#BDB09C" />
        <meshStandardMaterial attach="material-4" map={fachada} />
        <meshStandardMaterial attach="material-5" color="#D9CDBA" />
      </mesh>
      {/* entrada com colunas e escada */}
      <Caixa p={[0, 6.4, -17.4]} s={[12, 0.6, 2.6]} cor="#EFE7DA" />
      {[-5, -2.5, 0, 2.5, 5].map((x) => (
        <mesh key={x} position={[x, 3.1, -17.2]} castShadow>
          <cylinderGeometry args={[0.32, 0.36, 6.2, 12]} />
          <meshStandardMaterial color="#F2EBDF" />
        </mesh>
      ))}
      {[0, 1, 2].map((i) => (
        <Caixa key={i} p={[0, 0.15 + i * 0.3, -16 + i * 0.5]} s={[12, 0.3, 1.2]} cor="#E5DCCD" />
      ))}
      {/* árvores e postes */}
      {[-16, -10, 10, 16, -24, 24].map((x, i) => (
        <Arvore key={x} p={[x, 0, -7 - (i % 2) * 3]} s={0.9 + rnd(i) * 0.4} />
      ))}
      {[-40, -32, 32, 40].map((x, i) => (
        <Arvore key={`b${x}`} p={[x, 0, 17]} s={1 + rnd(i + 9) * 0.3} cor="#6AA350" />
      ))}
      {carroPreto !== undefined && <Carro p={[carroPreto, 0, 12]} rotY={Math.PI / 2} />}
    </group>
  );
};

// ---------- Anfiteatro da faculdade (por dentro) ----------
// Fileiras sobem para o fundo (+z). Quadro em z = -9. Janelas na parede x = +9 (lá fora: rua com carro preto).
export const Anfiteatro3D: React.FC<{ carroPreto?: boolean }> = ({ carroPreto = true }) => {
  const quadro = useMemo(
    () =>
      tex(1024, 400, (g) => {
        g.fillStyle = "#24443A";
        g.fillRect(0, 0, 1024, 400);
        g.strokeStyle = "rgba(240,240,230,0.8)";
        g.lineWidth = 5;
        g.font = "bold 54px 'Roboto Condensed', Arial";
        g.fillStyle = "rgba(240,240,230,0.85)";
        g.fillText("F = m · a", 80, 110);
        g.fillText("E = ½ m v²", 80, 210);
        g.beginPath();
        g.moveTo(560, 320);
        g.quadraticCurveTo(720, 40, 900, 320);
        g.stroke();
        g.fillText("v = Δs / Δt", 560, 370);
      }),
    [],
  );
  return (
    <group>
      <Caixa p={[0, -0.1, 4]} s={[18, 0.2, 30]} cor="#7A5A42" sombra={false} />
      {/* fileiras em degraus */}
      {Array.from({ length: 8 }).map((_, r) => (
        <group key={r} position={[0, r * 0.38, -4 + r * 1.7]}>
          <Caixa p={[0, 0.19, 0.5]} s={[17.6, 0.38, 1.7]} cor="#8A6A50" />
          {[-1, 1].map((l) => (
            <group key={l}>
              <Caixa p={[l * 4.6, 1.12, 0]} s={[6.8, 0.08, 0.55]} cor="#C89A6C" />
              <Caixa p={[l * 4.6, 0.75, 0.24]} s={[6.8, 0.7, 0.06]} cor="#A97E58" />
              {Array.from({ length: 6 }).map((_, k) => (
                <Caixa key={k} p={[l * (1.8 + k * 1.1), 0.65, 0.7]} s={[0.5, 0.08, 0.5]} cor="#3D4A66" />
              ))}
            </group>
          ))}
        </group>
      ))}
      {/* paredes */}
      <Caixa p={[0, 4, -10]} s={[18, 8, 0.3]} cor="#E6DACA" />
      <Caixa p={[0, 3, -9.8]} s={[9, 3, 0.05]} cor="#24443A" mat={<meshStandardMaterial map={quadro} />} />
      <Caixa p={[-9, 4, 4]} s={[0.3, 8, 30]} cor="#DCCFBE" />
      <Caixa p={[0, 8, 4]} s={[18, 0.3, 30]} cor="#EFE8DD" sombra={false} />
      {/* parede das janelas: montantes e vãos abertos */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Caixa key={i} p={[9, 4, -8 + i * 4.4]} s={[0.3, 8, 1.2]} cor="#DCCFBE" />
      ))}
      <Caixa p={[9, 0.8, 4]} s={[0.3, 1.6, 30]} cor="#DCCFBE" />
      <Caixa p={[9, 7.2, 4]} s={[0.3, 1.6, 30]} cor="#DCCFBE" />
      {/* luminárias */}
      {[-4, 2, 8].map((z) => (
        <group key={z}>
          <Caixa p={[0, 7.7, z]} s={[10, 0.08, 0.4]} cor="#FFF8E8" mat={<meshStandardMaterial color="#FFF8E8" emissive="#FFF2D0" emissiveIntensity={1} />} />
          <pointLight position={[0, 6.8, z]} intensity={14} distance={14} color="#FFE9C6" />
        </group>
      ))}
      {/* lá fora: chão, rua, casas e o carro preto */}
      <Caixa p={[30, -0.2, 4]} s={[40, 0.2, 80]} cor="#9DB078" sombra={false} />
      <Caixa p={[24, -0.1, 4]} s={[8, 0.05, 80]} cor="#4A4C52" sombra={false} />
      {[-12, 0, 12, 24].map((z, i) => (
        <Caixa key={z} p={[34, 3, z]} s={[6, 6, 9]} cor={["#E8C07A", "#D98E73", "#C9D7DF", "#F0E6CF"][i]} />
      ))}
      {carroPreto && <Carro p={[24, 0, 4]} />}
      <Arvore p={[18, 0, -6]} s={1.2} />
      <Arvore p={[19, 0, 14]} s={1.1} />
    </group>
  );
};

// ---------- Cantina / pátio ----------
const ALUNOS_CORES = ["#E35D4F", "#3D7DD8", "#F2B33D", "#59A85A", "#9A5BD1", "#EDEDED", "#2C2C34", "#E58BB0"];
const Aluno: React.FC<{ p: [number, number, number]; i: number; sentado?: boolean }> = ({ p, i, sentado }) => (
  <group position={p}>
    {!sentado &&
      [-0.1, 0.1].map((x) => (
        <mesh key={x} position={[x, 0.42, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.07, 0.84, 6]} />
          <meshStandardMaterial color={["#2E3A55", "#3B3B42", "#5A6C8A"][i % 3]} />
        </mesh>
      ))}
    <mesh position={[0, sentado ? 0.85 : 1.15, 0]} castShadow>
      <capsuleGeometry args={[0.23, sentado ? 0.3 : 0.45, 4, 8]} />
      <meshStandardMaterial color={ALUNOS_CORES[i % 8]} />
    </mesh>
    <mesh position={[0, sentado ? 1.32 : 1.68, 0]} castShadow>
      <sphereGeometry args={[0.2, 12, 10]} />
      <meshStandardMaterial color={["#9A6340", "#F1CBAE", "#C68B5E", "#6A432C"][i % 4]} />
    </mesh>
  </group>
);
export const Mesa: React.FC<{ p: [number, number, number]; guardaSol?: string }> = ({ p, guardaSol }) => (
  <group position={p}>
    <mesh position={[0, 0.76, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.75, 0.75, 0.06, 20]} />
      <meshStandardMaterial color="#EDE6D8" />
    </mesh>
    <Caixa p={[0, 0.38, 0]} s={[0.08, 0.76, 0.08]} cor="#555" />
    {[-1, 1].map((l) => (
      <Caixa key={l} p={[l * 1.15, 0.45, 0]} s={[0.4, 0.06, 1.5]} cor="#B58A60" />
    ))}
    {guardaSol && (
      <>
        <Caixa p={[0, 1.4, 0]} s={[0.05, 1.4, 0.05]} cor="#666" />
        <mesh position={[0, 2.25, 0]} castShadow>
          <coneGeometry args={[1.5, 0.5, 8, 1, true]} />
          <meshStandardMaterial color={guardaSol} side={THREE.DoubleSide} />
        </mesh>
      </>
    )}
  </group>
);
export const Cantina3D: React.FC = () => {
  const piso = useMemo(
    () =>
      tex(256, 256, (g) => {
        g.fillStyle = "#B9A68A";
        g.fillRect(0, 0, 256, 256);
        g.strokeStyle = "#9E8B70";
        g.lineWidth = 3;
        for (let i = 0; i <= 256; i += 64) {
          g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke();
          g.beginPath(); g.moveTo(0, i); g.lineTo(256, i); g.stroke();
        }
      }, [40, 40]),
    [],
  );
  const alunos = useMemo(() => {
    const out: { p: [number, number, number]; i: number; s: boolean }[] = [];
    for (let i = 0; i < 46; i++) {
      const x = -22 + rnd(i) * 44;
      const z = -26 + rnd(i + 50) * 34;
      if (Math.hypot(x, z) < 4) continue;
      out.push({ p: [x, 0, z], i, s: rnd(i + 7) > 0.6 });
    }
    return out;
  }, []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial map={piso} roughness={0.95} />
      </mesh>
      {/* prédios em volta */}
      <Caixa p={[0, 6, -32]} s={[60, 12, 6]} cor="#C9A98A" />
      <Caixa p={[-30, 5, -6]} s={[6, 10, 50]} cor="#B7957A" />
      <Caixa p={[30, 5, -6]} s={[6, 10, 50]} cor="#B7957A" />
      {/* balcão da cantina */}
      <Caixa p={[-14, 1.5, -28.5]} s={[14, 3, 1]} cor="#C2573F" />
      <Caixa p={[-14, 3.4, -28.2]} s={[14, 0.8, 0.3]} cor="#F2D25A" />
      {[-12, -6, 0, 6, 12].map((x, i) =>
        [-16, -8].map((z, j) => <Mesa key={`${x}${z}`} p={[x + (j ? 2 : 0), 0, z]} guardaSol={["#E35D4F", "#3D7DD8", "#F2B33D", "#59A85A"][(i + j) % 4]} />),
      )}
      <Mesa p={[0, 0, 0]} />
      {alunos.map((a, k) => (
        <Aluno key={k} p={a.p} i={a.i} sentado={a.s} />
      ))}
      {[-20, 20, -10, 10].map((x, i) => (
        <Arvore key={x} p={[x, 0, -22 + (i % 2) * 6]} s={1.1} cor="#5F9C4C" />
      ))}
    </group>
  );
};

// ---------- Campo baldio (pôr do sol) ----------
const Mato: React.FC<{ n?: number; area?: [number, number, number, number]; semente?: number; livre?: (x: number, z: number) => boolean; deita?: number }> = ({
  n = 1600, area = [-30, 30, -40, 12], semente = 0, livre, deita = 0,
}) => {
  const ref = React.useRef<THREE.InstancedMesh>(null);
  const dados = useMemo(() => {
    const out: { x: number; z: number; h: number; r: number; c: number }[] = [];
    let i = 0;
    while (out.length < n && i < n * 4) {
      const x = area[0] + rnd(i + semente) * (area[1] - area[0]);
      const z = area[2] + rnd(i + semente + 999) * (area[3] - area[2]);
      i++;
      if (livre && livre(x, z)) continue;
      // em tufos
      if (Math.sin(x * 0.7) * Math.cos(z * 0.6) + rnd(i + 3) * 0.9 < 0.15) continue;
      out.push({ x, z, h: 0.4 + rnd(i + 5) * 1.0, r: rnd(i + 8) * Math.PI, c: rnd(i + 11) });
    }
    return out;
  }, [n, area, semente, livre]);
  React.useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const cor = new THREE.Color();
    dados.forEach((d, k) => {
      o.position.set(d.x, d.h / 2, d.z);
      o.rotation.set(deita * 1.2 * (0.6 + d.c * 0.4), d.r, 0.15 * (d.c - 0.5));
      o.scale.set(1, d.h, 1);
      o.updateMatrix();
      m.setMatrixAt(k, o.matrix);
      cor.set(d.c > 0.66 ? "#B9A35A" : d.c > 0.33 ? "#8E9A4A" : "#6F8A3E");
      m.setColorAt(k, cor);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [dados, deita]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, dados.length]} castShadow>
      <coneGeometry args={[0.07, 1, 3]} />
      <meshStandardMaterial roughness={1} flatShading />
    </instancedMesh>
  );
};

export const Campo3D: React.FC<{ carro?: boolean; marcas?: number; carroY?: number; porta?: boolean; deita?: number; carroEscala?: number; filhos?: React.ReactNode }> = ({
  carro = true, marcas = 0, carroY = 0, porta = true, deita = 0, carroEscala = 1, filhos,
}) => {
  const terra = useMemo(
    () =>
      tex(512, 512, (g) => {
        g.fillStyle = "#A07A55";
        g.fillRect(0, 0, 512, 512);
        for (let i = 0; i < 4000; i++) {
          const c = rnd(i);
          g.fillStyle = c > 0.66 ? "#8E6A48" : c > 0.33 ? "#B38B63" : "#977050";
          const s = 1 + rnd(i + 3) * 4;
          g.fillRect(rnd(i + 1) * 512, rnd(i + 2) * 512, s, s);
        }
      }, [12, 12]),
    [],
  );
  const livre = React.useCallback((x: number, z: number) => Math.abs(x) < 6 && z > -14 && z < 8, []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial map={terra} roughness={1} />
      </mesh>
      <Mato livre={livre} deita={deita} />
      {/* entulho */}
      {Array.from({ length: 14 }).map((_, i) => (
        <mesh key={i} position={[(rnd(i) - 0.5) * 40, 0.15, -18 - rnd(i + 4) * 18]} castShadow receiveShadow scale={[1, 0.5, 1]}>
          <icosahedronGeometry args={[0.6 + rnd(i + 2) * 1.2, 0]} />
          <meshStandardMaterial color={rnd(i + 6) > 0.5 ? "#9B948A" : "#857B70"} flatShading />
        </mesh>
      ))}
      {/* blocos e muro quebrado ao fundo */}
      {Array.from({ length: 22 }).map((_, i) => (
        <Caixa key={`m${i}`} p={[-22 + i * 2.05, 0.6 + (i % 3 === 0 ? 0 : 0.4 * rnd(i)), -42]} s={[2, 1.2 + (i % 4) * 0.5 * rnd(i + 1), 0.3]} cor="#B4AA9C" />
      ))}
      {/* pneus */}
      {[[8, -10], [9.2, -10.6], [-9, -6]].map(([x, z], i) => (
        <mesh key={`p${i}`} position={[x, 0.18, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.38, 0.16, 8, 16]} />
          <meshStandardMaterial color="#1B1B1D" />
        </mesh>
      ))}
      {porta && <Caixa p={[-7, 0.05, -2]} s={[0.9, 0.06, 2]} cor="#7C5A3E" r={[0, 0.5, 0]} />}
      {carro && carroEscala > 0.01 && <Carro p={[2.5, carroY, -9]} rotY={0.4} velho marcas={marcas} escala={carroEscala} />}
      {filhos}
      {/* fundo: casas, postes, árvores */}
      {Array.from({ length: 10 }).map((_, i) => (
        <Caixa key={`c${i}`} p={[-45 + i * 10, 2.5, -60 - rnd(i) * 8]} s={[8, 4 + rnd(i + 1) * 4, 7]} cor={["#D9B48C", "#C98E73", "#E6D6BA", "#B7A28A"][i % 4]} />
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <group key={`po${i}`} position={[-40 + i * 16, 0, -50]}>
          <Caixa p={[0, 4.5, 0]} s={[0.2, 9, 0.2]} cor="#5B4A3C" />
          <Caixa p={[0, 8.4, 0]} s={[2, 0.12, 0.12]} cor="#5B4A3C" />
        </group>
      ))}
      {[-30, -18, 22, 34, 46].map((x, i) => (
        <Arvore key={`a${x}`} p={[x, 0, -36 - (i % 2) * 8]} s={1.2 + rnd(i) * 0.6} cor="#6F8F45" />
      ))}
    </group>
  );
};

// ---------- Tornado (poeira girando) ----------
export const Tornado3D: React.FC<{ p: [number, number, number]; t: number; forca: number; porta?: boolean }> = ({ p, t, forca, porta = true }) => {
  const H = 12 * forca;
  return (
    <group position={p}>
      {/* funil: anéis semitransparentes girando */}
      {Array.from({ length: 16 }).map((_, i) => {
        const y = (i / 16) * H;
        const r = 0.6 + (y / Math.max(H, 0.01)) * 3.4 * forca;
        return (
          <mesh key={i} position={[Math.sin(t * 3 + i) * 0.15, y, 0]} rotation={[Math.PI / 2, 0, t * (6 + i * 0.3)]}>
            <torusGeometry args={[r, 0.25 + r * 0.18, 6, 20]} />
            <meshStandardMaterial color="#C8A47E" transparent opacity={0.16 * forca} depthWrite={false} />
          </mesh>
        );
      })}
      {/* detritos */}
      {Array.from({ length: 70 }).map((_, i) => {
        const fase = rnd(i) * Math.PI * 2;
        const y = ((rnd(i + 3) * H + t * (1.5 + rnd(i + 5) * 2)) % Math.max(H, 0.01));
        const r = 0.8 + (y / Math.max(H, 0.01)) * 3.6 * forca;
        const a = fase + t * (7 - y * 0.2);
        const folha = i % 3 !== 0;
        return (
          <mesh key={`d${i}`} position={[Math.cos(a) * r, y, Math.sin(a) * r]} rotation={[a, a * 1.3, a * 0.7]} castShadow>
            {folha ? <planeGeometry args={[0.18, 0.12]} /> : <boxGeometry args={[0.16, 0.12, 0.14]} />}
            <meshStandardMaterial color={folha ? (i % 2 ? "#8E9A4A" : "#B9A35A") : "#857B70"} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
      {porta && forca > 0.3 && (() => {
        const a = t * 4;
        const y = Math.min(10, (forca - 0.3) * 14);
        return (
          <mesh position={[Math.cos(a) * 2.6, y, Math.sin(a) * 2.6]} rotation={[a * 1.4, a, a * 0.6]} castShadow>
            <boxGeometry args={[0.9, 2, 0.06]} />
            <meshStandardMaterial color="#7C5A3E" />
          </mesh>
        );
      })()}
    </group>
  );
};

// ---------- Pedras voando ----------
export const Pedra3D: React.FC<{ p: [number, number, number]; r?: number; giro?: number }> = ({ p, r = 0.09, giro = 0 }) => (
  <mesh position={p} rotation={[giro, giro * 1.3, 0]} castShadow>
    <icosahedronGeometry args={[r, 0]} />
    <meshStandardMaterial color="#8C847A" flatShading />
  </mesh>
);
