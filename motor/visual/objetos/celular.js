// Celular com tela desenhada por código (CanvasTexture). A tela é emissiva: aparece no escuro.
// Telas: 'apagada' | 'bloqueio' | 'alerta'. O alerta é genérico (não imita nenhum órgão real).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { materialChapado } from '../estilo/chapado.js';

const L = 0.072, A = 0.152, E = 0.009;                  // metros
const PX = 540, PY = 1140;                              // resolução da tela

function quebrar(g, texto, largura) {
  const linhas = [];
  for (const par of texto.split('\n')) {
    let atual = '';
    for (const p of par.split(' ')) {
      const t = atual ? atual + ' ' + p : p;
      if (g.measureText(t).width > largura && atual) { linhas.push(atual); atual = p; } else atual = t;
    }
    linhas.push(atual);
  }
  return linhas;
}
function retRed(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }

export function desenharTela(canvas, { tipo = 'alerta', hora = '03:02', titulo = 'ALERTA EXTREMO', texto = '' } = {}) {
  const g = canvas.getContext('2d');
  g.fillStyle = tipo === 'apagada' ? '#050506' : '#0d1018'; g.fillRect(0, 0, PX, PY);
  if (tipo === 'apagada') return;
  // papel de parede: degradê escuro
  const fundo = g.createLinearGradient(0, 0, 0, PY); fundo.addColorStop(0, '#1b2236'); fundo.addColorStop(1, '#07090f');
  g.fillStyle = fundo; g.fillRect(0, 0, PX, PY);
  g.fillStyle = '#e9ecf2'; g.textAlign = 'center';
  g.font = '600 26px sans-serif'; g.fillText(hora, PX / 2, 46);
  g.font = '300 150px sans-serif'; g.fillText(hora, PX / 2, 300);
  g.font = '500 30px sans-serif'; g.fillStyle = '#b9c0cf'; g.fillText('sexta-feira', PX / 2, 350);
  if (tipo !== 'alerta') return;
  // cartão do alerta
  const x = 26, y = 420, w = PX - 52;
  g.textAlign = 'left';
  g.font = '500 33px sans-serif';
  const linhas = quebrar(g, texto, w - 60);
  const h = 130 + linhas.length * 44 + 30;
  g.fillStyle = 'rgba(245,246,250,0.96)'; retRed(g, x, y, w, h, 34); g.fill();
  g.fillStyle = '#d92b2b'; retRed(g, x, y, w, 96, [34, 34, 0, 0]); g.fill();
  // ícone de aviso (triângulo com !)
  g.fillStyle = '#fff'; g.beginPath(); g.moveTo(x + 58, y + 22); g.lineTo(x + 92, y + 78); g.lineTo(x + 24, y + 78); g.closePath(); g.fill();
  g.fillStyle = '#d92b2b'; g.fillRect(x + 55, y + 40, 6, 22); g.fillRect(x + 55, y + 67, 6, 6);
  g.fillStyle = '#fff'; g.font = '800 34px sans-serif'; g.fillText(titulo, x + 112, y + 62);
  g.fillStyle = '#16181d'; g.font = '500 33px sans-serif';
  linhas.forEach((l, i) => g.fillText(l, x + 30, y + 150 + i * 44));
  g.fillStyle = '#6b7080'; g.font = '500 24px sans-serif'; g.fillText('agora', x + w - 100, y + h - 24);
}

export function criarCelular(opcoes = {}) {
  const raiz = new THREE.Group(); raiz.name = 'celular';
  const corpo = new THREE.Mesh(new RoundedBoxGeometry(L, A, E, 3, 0.0045), materialChapado('#17181c', { volume: false }));
  corpo.castShadow = true; raiz.add(corpo);
  const canvas = document.createElement('canvas'); canvas.width = PX; canvas.height = PY;
  const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const tela = new THREE.Mesh(new THREE.PlaneGeometry(L * 0.92, A * 0.93), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  tela.position.z = E / 2 + 0.0003; raiz.add(tela);
  const definirTela = (o) => { desenharTela(canvas, { ...opcoes, ...o }); tex.needsUpdate = true; };
  definirTela({});
  return { raiz, tela, definirTela, medidas: { L, A, E } };
}

// 1ª pessoa: apoia o celular na frente da mão (a mão fica atrás), tela virada para os olhos.
// acima: quanto o centro do celular fica acima do pulso; frente: quanto fica à frente da palma (rumo à câmera).
export function segurarNaFrente(celular, mao, camera, { acima = 0.09, frente = 0.055, lado = -0.01, inclina = 0.12 } = {}) {
  const pulso = mao.getWorldPosition(new THREE.Vector3());
  const cima = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
  const direita = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
  const paraCam = camera.position.clone().sub(pulso).normalize();
  const p = pulso.addScaledVector(cima, acima).addScaledVector(paraCam, frente).addScaledVector(direita, lado);
  celular.raiz.position.copy(p);
  celular.raiz.quaternion.copy(camera.quaternion);                    // tela de frente para a câmera
  celular.raiz.rotateX(-inclina);                                     // leve inclinação, como na mão
  celular.raiz.updateMatrixWorld();
}
