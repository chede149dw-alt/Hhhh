// Sombra de contato: mancha suave no chão debaixo do personagem (ancora no piso, some quando ele sobe).
import * as THREE from 'three';

let _tex;
function texturaMancha() {
  if (_tex) return _tex;
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(0,0,0,0.55)'); gr.addColorStop(0.55, 'rgba(0,0,0,0.25)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  _tex = new THREE.CanvasTexture(c); return _tex;
}

export function criarSombraContato(boneco, { raio = null, forca = 1 } = {}) {
  const r = raio ?? boneco.medidas.H * 0.2;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: texturaMancha(), transparent: true, depthWrite: false, opacity: forca, toneMapped: false }));
  m.rotation.x = -Math.PI / 2; m.renderOrder = 1; m.scale.set(r * 2, r * 1.6, 1);
  const v = new THREE.Vector3();
  return {
    malha: m,
    atualizar(chaoY = 0) {   // segue o quadril; mais fraca e maior quando o corpo sobe
      boneco.juntas.quadril.getWorldPosition(v);
      const altura = Math.max(0, v.y - boneco.medidas.pernaComp * 0.6);
      m.position.set(v.x, chaoY + 0.004, v.z);
      m.rotation.z = -boneco.raiz.rotation.y;
      const k = Math.max(0.15, 1 - altura * 1.2);
      m.material.opacity = forca * k; m.scale.set(r * 2 * (2 - k), r * 1.6 * (2 - k), 1);
      m.visible = boneco.raiz.visible;
    },
  };
}
