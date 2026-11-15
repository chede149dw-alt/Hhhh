# Cenário 3D (Valdor3D) com personagens 2D dentro — referência

## Sumário
1. Como funciona
2. A função `noite()` que monta a cena (copie de `roteiros/nova/ep02.js`)
3. `Valdor3D` — opções
4. Câmeras
5. Magia, luzes, fumaça
6. Cuidados (erros que o autor já apontou)

## 1. Como funciona

- `cenarios/valdor-3d.js` desenha o mundo em WebGL (three.js r160, `motor/vendor/three-r160.min.js`) num canvas
  próprio e copia para o quadro. A câmera do three é montada **igual** à do motor (`Cena3D.camera` / `api.orbita`:
  X direita, Y cima, Z para dentro da tela, sem inclinação, horizonte em `cam.cy`, `yaw` para os lados, horizonte fora
  do centro via `makePerspective`). Por isso `cam.p(X, Y, Z)` bate com o 3D e os efeitos 2D caem no lugar certo.
- **Personagens 2D dentro do 3D:** cada personagem é desenhado numa camada, recortado e enviado ao 3D como uma placa
  em pé, virada para a câmera, na profundidade dos pés (`figuras`). Resultado: a grama mais perto passa na frente das
  pernas, os muros/postes na frente escondem, e a luz principal projeta a **sombra da silhueta** no chão
  (alphaTest no material da placa). Uma sombra de contato macia fica embaixo dos pés.
- **Árvores 2D** (copa de bolas em 3 verdes, como nas referências) também são placas viradas para a câmera.
- Passadas por quadro: fundo além do foco (desfocado) → plano dos personagens (nítido) → personagens/efeitos 2D →
  primeiro plano perto da lente (desfocado) → luz da cena (feixes de luar, vinheta).
- Mundo (fixo em todos os planos): trilha de lajes em `x = Valdor3D.trilhaX(z)` (largura `trilhaW(z)`), muros de
  tijolo nas laterais, postes com tocha fora do caminho, rochas, rio em Z ≈ 19–22 com ponte (`Valdor3D.RIO`,
  `rioZ(x)`, `PONTE`), espadas antigas gigantes, castelo e montanhas ao fundo. Chão plano (y = 0) na área da ação
  (|X| < 10, −12 < Z < 30). **Ninguém na água:** personagens em Z < 17.

## 2. A função `noite()` (copie de `roteiros/nova/ep02.js`, junto com `camFx`, `camNoite`, `maoMundo`, `orbe`, `expr`)

```js
noite(ctx, api, cam, entradas, o)
// entradas: [{ f: () => api.personagem3d(cam, item, X, Z, alturaM, opts), cor?, alfa? }, { pos: [X, Z], alt, f: () => desenho2D() }, ...]
//   cada entrada com personagem3d (ou pos) vira placa no 3D; sem posição (close em tela) fica 2D por cima.
// o = {
//   noite: 0..1 (0 pôr do sol, 1 noite)  | dia: true (dia claro)
//   forca: 0..1 primeiro plano (0 = sem primeiro plano: use em closes em tela)
//   perto: m (padrão 1,2; ajustado sozinho para ficar na frente do personagem mais perto)
//   bokeh: px do desfoque do fundo (padrão 5; 0 desliga), folgaFoco: m além do personagem mais longe (padrão 3)
//   desfoque: px — fundo inteiro desfocado (closes em tela com api.personagem)
//   luzes: [{ x, y, z, cor, forca, raio }] — tochas na mão, luz vermelha da lâmina...
//   magias: (rigs) => [{ tipo: 'circulo', x, z, raio, k, cor } | orbe(maoMundo(cam, rig, 'mao_d', X, Z), k)]
//   chao: () => {...} + chaoEm: [X, Z] — efeito 2D de chão numa placa logo atrás de quem está em cima
//   depois: (rigs) => {...} efeitos 2D por cima (raios, números, tochas na mão, barras de vida)
//   fx: { zoom, rolo, borrao: [dx, dy], cx, cy } — zoom-soco, câmera holandesa, borrão de movimento
//   fim: () => {...} HUD/títulos por cima de tudo
// }
```

Exemplo (plano de luta com magia 3D):

```js
luta(ctx, u, d, api) {
  const cam = api.orbita({ alvo: [-0.9, 1.15, 4.3], raio: 2.4, ang: -1.9 + u * 0.15, altura: 1.2, f: 1150, ySalvo: 960, nevoa: V().nevoa(1) });
  noite(ctx, api, cam, [{ f: () => api.personagem3d(cam, { ...DAVIL, pose: 'conjurando', expressao: 'determinado' }, -0.9, 4.3, 1.76, { olhaPara: [1.7, 5.6] }) }], {
    magias: ([rig]) => [{ tipo: 'circulo', x: -0.9, z: 4.3, raio: 1.0, k: api.fase(0, 1) }, orbe(maoMundo(cam, rig, 'mao_d', -0.9, 4.3), 1)],
    depois: ([rig]) => { const m = rig.pontoMundo('mao_d', [0, 0.28]); Combate.maoEletrica(ctx, m.x, m.y, 30, api.t, 1); },
  });
},
```

## 3. `Valdor3D` — opções

| Chamada | O que faz |
|---|---|
| `Valdor3D.desenhar(ctx, cam, { t, noite, dia, perto, luzes, figuras, foco, bokeh, magias })` | fundo 3D (a `noite()` chama) |
| `Valdor3D.frente(ctx, cam, { t, noite, dia, perto, forca, luzes, magias })` | primeiro plano desfocado + luz da cena |
| `Valdor3D.luz(ctx, cam, { t, noite, dia })` | só feixes de luar, tom e vinheta |
| `Valdor3D.nevoa(n, dia)` | cor da névoa (passe em `nevoa` da câmera) |
| `Valdor3D.paraMundo(cam, sx, sy, dz)` | ponto da tela na profundidade dz → mundo {x, y, z} (mão → magia 3D) |
| `Valdor3D.trilhaX(z)`, `trilhaW(z)`, `rioZ(x)`, `RIO`, `PONTE`, `altura(x, z)` | traçado do lugar |

`figuras`: `[{ canvas, x0, y0, w, h, dz, X, Z, y, alt, sombra }]` (a `noite()` monta). Hora: `dia: true` = dia,
`noite: 0` = pôr do sol (tochas acendendo, lua nascendo), `noite: 1` = noite. Luz principal: sol baixo vindo da frente
da câmera de dia; de noite a luz da lua que faz sombra vem mais do alto que a lua desenhada (sombra legível).

## 4. Câmeras

- `camNoite(api, { x, y, z, yaw, cy, f, noite })` — câmera fixa com dolly (`z: base + u * 0.15`).
- `api.orbita({ alvo, raio, ang, altura, f, ySalvo, nevoa })` — órbita em volta de quem conjura/luta.
- Câmera de luta: chicote com borrão (`fx.borrao`), zoom-soco no impacto (`fx.zoom: soco(u - t0, 0.1)`), tremor no
  centro do `camFx` (nunca `ctx.translate` antes das camadas), câmera lenta com `o.t` remapeado.
- Em órbita, o rosto só aparece se a câmera ficar do lado para onde o personagem olha.

## 5. Magia, luzes, fumaça

- **Magia 3D** (`magias`): `circulo` = selo mágico no chão em perspectiva (2 anéis girando, runas, hexagrama), um
  pouco acima da grama, com luz azul de verdade; `orbe` = faíscas 3D girando em volta da mão + luz. Raios, arcos e
  mãos elétricas continuam 2D por cima (`Combate.*`).
- **Tochas:** postes do cenário acendem sozinhos no pôr do sol; tocha na mão de personagem = `Noite.tocha` 2D no
  `depois` + `luzes: [{ x, y: 1.7, z, cor: '#FFB066', forca: 0.9 }]` (luz real no chão e na grama).
- **Fumaça/poeira:** `Noite.fumaca(ctx, q.x, q.y, raio * q.s, k, {...})` no `depois` (transformação, salto, rugido).
- **Brilho de chamas** e vaga-lumes são automáticos.

## 6. Cuidados (erros que o autor já apontou)

- Cenário pintado em 2D "gruda" na câmera: use o 3D (o autor percebe na hora).
- Personagem por cima da grama / sem sombra: use sempre `noite()` (placas no 3D), nunca `personagem3d` direto.
- Pernas cruzadas em X na vista tq/frente (coxas com sinais trocados) e personagem em cima da água.
- Objeto na mão desenhado por cima dos dedos, ou lâmina passando por dentro da máscara: objeto como peça do boneco
  (cabo abaixo da mão, lâmina acima de tudo).
- Som alto na troca para a noite: ambiente curto (`corte` + `entra`/`sai`) e trilha com ganho menor no trecho.
- Ao mudar a câmera de sombra (left/right/top/bottom) chame `updateProjectionMatrix()`; sombra fina deitada some na
  grama alta — luz vindo da frente faz a sombra correr pelo caminho.
- Render ~1h30 para ~88 s: confira tudo na folha de teste e em quadros soltos antes.
