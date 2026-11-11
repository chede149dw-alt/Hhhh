// Esqueleto de recorte (cut-out): peças com pivô, hierarquia pai→filho e ordem de desenho.
// Cada peça é desenhada no seu próprio sistema de coordenadas (unidades H), com a origem no pivô.
// A pose é um mapa { nomeDaPeca: ânguloEmGraus }. Ângulo positivo gira no sentido horário da tela.
(function () {
  const E = () => window.Estilo;

  // Ferramentas de desenho entregues a cada peça (já com a matriz da peça aplicada)
  // modo: 'normal' (preenche + contorna), 'contorno' (só o contorno, em largura dobrada,
  // para membros desenhados em grupo), 'preenchimento' (só cor, sombra e linhas internas)
  function criarPincel(ctx, matriz, linha, modo = 'normal') {
    // direção da luz convertida para as coordenadas locais da peça,
    // para a sombra ficar sempre do lado oposto à luz, mesmo com a peça girada
    const inv = matriz.inverse();
    const [lx, ly] = E().luzViaja;
    const p0 = inv.transformPoint(new DOMPoint(0, 0));
    const p1 = inv.transformPoint(new DOMPoint(lx, ly));
    let dx = p1.x - p0.x, dy = p1.y - p0.y;
    const n = Math.hypot(dx, dy) || 1; dx /= n; dy /= n;

    const contorno = linha;
    const interno = linha * E().fatorInterno;

    return {
      ctx, contorno, interno, luzLocal: [dx, dy], modo,

      // Peça chapada: base + sombra de corte único (crescente do lado oposto à luz) + contorno
      peca(path, tom, o = {}) {
        if (modo === 'contorno') {
          if (o.contorno !== false) this.contornar(path, (o.espessura || contorno) * 2, true);
          return;
        }
        ctx.fillStyle = tom.base;
        ctx.fill(path);
        const k = o.sombra === undefined ? 0.1 : o.sombra;
        if (k) {
          ctx.save();
          ctx.clip(path);
          ctx.fillStyle = tom.sombra;
          ctx.fill(path);
          ctx.translate(-dx * k, -dy * k);
          ctx.fillStyle = tom.base;
          ctx.fill(path);
          ctx.restore();
        }
        if (o.contorno !== false && modo === 'normal') this.contornar(path, o.espessura || contorno);
      },
      // Mancha de sombra extra, recortada dentro de uma peça
      sombraDentro(pecaPath, sombraPath, cor) {
        if (modo === 'contorno') return;
        ctx.save(); ctx.clip(pecaPath); ctx.fillStyle = cor; ctx.fill(sombraPath); ctx.restore();
      },
      contornar(path, esp = contorno, forcar = false) {
        if (modo === 'contorno' && !forcar) return;
        ctx.lineWidth = esp; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        ctx.strokeStyle = E().base.tinta; ctx.stroke(path);
      },
      linha(path, esp = interno, cor = E().base.tinta) {
        if (modo === 'contorno') return;
        ctx.lineWidth = esp; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        ctx.strokeStyle = cor; ctx.stroke(path);
      },
      preencher(path, cor) { if (modo === 'contorno') return; ctx.fillStyle = cor; ctx.fill(path); },
    };
  }

  class Rig {
    constructor(def) {
      this.def = def;
      this.partes = {};
      for (const p of def.partes) this.partes[p.nome] = p;
      this.pose = { ...(def.poses && def.poses.parado) };
      this.expressao = { ...(def.expressoes && def.expressoes.neutro) };
    }
    usarPose(nomeOuMapa) {
      const p = typeof nomeOuMapa === 'string' ? this.def.poses[nomeOuMapa] : nomeOuMapa;
      this.pose = { ...p };
    }
    usarExpressao(nomeOuMapa) {
      const e = typeof nomeOuMapa === 'string' ? this.def.expressoes[nomeOuMapa] : nomeOuMapa;
      this.expressao = { ...e };
    }
    // Matrizes de mundo de todas as peças (cinemática direta)
    matrizes(raiz) {
      const m = {};
      const calc = (p) => {
        if (m[p.nome]) return m[p.nome];
        const pai = p.pai ? calc(this.partes[p.pai]) : raiz;
        // a peça-raiz (sem pai) pode ser deslocada pela pose: _desloca = [dx, dy] em H
        const [dx, dy] = (!p.pai && this.pose._desloca) || [0, 0];
        m[p.nome] = pai.translate(p.pivo[0] + dx, p.pivo[1] + dy).rotate(this.pose[p.nome] || 0);
        return m[p.nome];
      };
      for (const p of this.def.partes) calc(p);
      return m;
    }
    // Ponto de uma peça em coordenadas da tela (depois de desenhar). Ex.: mão para ancorar um efeito.
    pontoMundo(nome, [x, y] = [0, 0]) {
      return this.ultimas[nome].transformPoint(new DOMPoint(x, y));
    }
    // x, ySola: posição dos pés na tela (px); alturaPx: altura total do personagem na tela
    // o.espelhar: true vira o personagem para o outro lado (vistas de 3/4 e perfil olham para a direita)
    desenhar(ctx, x, ySola, alturaPx, o = {}) {
      const A = this.def.alturaEmH;
      const H = alturaPx / A;
      const raiz = new DOMMatrix().translate(x, ySola).scale(o.espelhar ? -H : H, H).translate(0, -A);
      const m = this.matrizes(raiz);
      this.ultimas = m;
      this.escalaPx = H;
      const linha = E().contorno(A) * (this.def.fatorContorno || 1);

      // sombra no chão (seção 6)
      ctx.save();
      ctx.setTransform(new DOMMatrix().translate(x, ySola).scale(o.espelhar ? -H : H, H));
      ctx.filter = `blur(${12}px)`;
      ctx.fillStyle = E().sombraChao;
      ctx.beginPath();
      // _sombra: [fator de largura, deslocamento x em H] (ex.: personagem deitado tem sombra comprida)
      const [fs, sxH] = this.pose._sombra || [1, 0];
      ctx.ellipse(sxH, 0, (this.def.larguraOmbrosH * 1.1 * fs) / 2, 0.09, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Peças com o mesmo "grupo" (ex.: braço + antebraço) são desenhadas juntas em duas passadas:
      // primeiro o contorno de todas, depois o preenchimento. Assim a emenda da articulação some
      // e a silhueta do membro continua contornada mesmo dobrado.
      const ordem = [...this.def.partes].sort((a, b) => a.z - b.z);
      const feitos = new Set();
      const desenharPeca = (p, modo) => {
        const md = p.espelho === -1 ? m[p.nome].scale(-1, 1) : m[p.nome];
        ctx.save();
        ctx.setTransform(md);
        p.desenhar(criarPincel(ctx, md, linha, modo), this);
        ctx.restore();
      };
      for (const p of ordem) {
        if (feitos.has(p.nome)) continue;
        if (!p.grupo) { desenharPeca(p, 'normal'); feitos.add(p.nome); continue; }
        const grupo = ordem.filter((q) => q.grupo === p.grupo);
        for (const q of grupo) desenharPeca(q, 'contorno');
        for (const q of grupo) { desenharPeca(q, 'preenchimento'); feitos.add(q.nome); }
      }
    }
  }

  window.Rig = Rig;
})();
