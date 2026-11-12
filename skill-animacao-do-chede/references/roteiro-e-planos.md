# Roteiro e planos — referência

## Sumário
1. Roteiro em JSON
2. Planos em JS e a `api`
3. Personagens (poses, expressões, vistas, opções)
4. Cenários 3D
5. Efeitos
6. Receitas (close, reação em 3 tempos, câmera, capa e final)

## 1. Roteiro em JSON (`roteiros/<serie>/<ep>.json`)

```json
{ "serie": "E se você acordasse controlando a terra?", "episodio": 1, "parte": 1,
  "planos": [
    { "id": "capa", "duracao": 2.0, "fala": { "texto": "E se você acordasse controlando a terra?", "voz": "narrador", "velocidade": 185 }, "destaque": ["TERRA?"] },
    { "id": "treme", "fala": { "texto": "e o quarto inteiro treme.", "voz": "narrador" }, "destaque": ["TREME."] },
    { "id": "parte", "duracao": 3.0, "fala": { "texto": "Segue pra ver a parte dois!", "voz": "narrador" } } ] }
```

- `id` liga o plano à função de mesmo nome em `window.PLANOS`. `capa` e `parte` ficam sem legenda.
- Duração: se não tiver `duracao`, o plano dura o tempo da fala + 0,3 s, entre 2 e 3 s.
- Vozes de prévia (espeak-ng): `narrador`, `mae`, `amigo`/`rafael`, `lucas`. `velocidade` em palavras por minuto (padrão 175).
- `cinema` (opcional): ajusta o pós do plano, ex. `{ "quente": 0.1, "vinheta": 0.9, "bloom": 0.6 }` (cena fria/escura).
- `camera` (opcional): a câmera na mão é automática em todo plano (deriva lenta, giro pequeno, aproximação e
  acomodação depois do corte, como nas referências do autor). `{ "forca": 0.5 }` suaviza, `{ "parada": true }` desliga.
- `sfx` (opcional): lista de efeitos sonoros do plano — `{ "tipo": "coracao", "bpm": 80, "bpmFim": 140, "de": 0, "ate": 2 }`
  (batidas; o plano recebe os mesmos tempos em `api.batidas` para pulsar a imagem junto),
  `{ "tipo": "impacto", "em": 0.45, "volume": 1 }` (estrondo grave) e `{ "tipo": "ronco", "de": 0, "ate": 2, "volume": 1.4 }` (tremor grave).
- Um plano com id `despertador` ganha bipe de despertador automaticamente.
- O motor gera a legenda (blocos de até 3 palavras, quebrando na pontuação), mixa o áudio a -16 LUFS e renderiza.

## 2. Planos em JS (`roteiros/<serie>/<ep>.js`)

```js
(function () {
  const LUCAS = { fabrica: 'criarLucas', registroPoses: 'LUCAS_POSES' };
  window.PLANOS = {
    treme(ctx, u, d, api) {           // u = segundos desde o início do plano; d = duração do plano
      const cam = api.camera({ f: 1300, x: 0, y: 1.3, z: 0.3 + u * 0.1, cy: 950, nevoa: Cenarios3D.quarto.nevoa });
      Cenarios3D.quarto.desenhar(ctx, cam, { t: api.t, tremor: 1 });
      api.personagem3d(cam, { ...LUCAS, pose: 'parado', expressao: 'espanto' }, 0.05, 2.0, 1.75, { luz: { lado: -1 } });
    },
  };
})();
```

O quadro é 1080×1920. O pós de cinema e a legenda são aplicados depois, automaticamente.

### `api`
| Função | O que faz |
|---|---|
| `api.t`, `api.u`, `api.dur` | tempo total, tempo no plano, duração do plano |
| `api.orbita({ alvo: [X, Y, Z], raio, ang, altura, f, ySalvo, nevoa })` | câmera que gira em volta de um ponto (ang em rad; 0 = olhando para +Z; ySalvo = altura na tela onde o alvo fica) |
| `api.desde(id)` | segundos desde o início do plano `id` (uma tomada contínua usa a mesma câmera em vários planos) |
| `api.personagemGirando(item, x, y, alt, rel, o)` | personagem 2D na tela com a vista do ângulo `rel` (para closes que giram) |
| `api.batidas` | tempos (no plano) das batidas de coração do `sfx`, para a imagem pulsar junto com o som |
| `api.fase(a, b, curva)` | 0→1 entre os segundos `a` e `b` do plano; curvas `linear`, `suave`, `entra`, `sai`, `volta` (passa e volta) |
| `api.lerp(a, b, k)`, `api.clamp` | interpolação |
| `api.camera({ f, x, y, z, yaw, cx, cy, nevoa, distNevoa })` | câmera em metros (f = lente em px; yaw = giro) |
| `api.personagem(item, x, ySola, alturaPx, o)` | personagem na tela (pés em x, ySola) — devolve o rig |
| `api.personagem3d(cam, item, X, Z, alturaM, o)` | personagem no chão do cenário, com sombra |
| `api.invisivel(item, x, y, alt, progresso, o)` | personagem sumindo (halo, anel, faíscas) |
| `api.camada()` + `api.desfocar(camada, px)` | desenhar numa camada e desfocar (fundo, primeiro plano) |
| `api.texto(txt, x, y, tam, { cor })` | texto grande com contorno (capa e cartela) |
| `api.rosto(x, y, r)` | marca um rosto extra para a legenda desviar |
| `api.tremor(forca)` | deslocamento [dx, dy] de câmera tremendo |

Opções extras de `personagem3d`: `rumo` (para onde o personagem está virado, rad; 0 = para −Z, de frente para a câmera
padrão) ou `olhaPara: [X, Z]` — a vista (frente / 3/4 / perfil / costas, com espelho) sai do ângulo da câmera, com
mistura suave na troca; `y` (altura do chão, para flutuar ou subir numa coluna).

Tomada contínua: planos seguidos chamam a mesma função (`tomadaX(ctx, api)`), que usa `T = api.desde('primeiroPlano')`
e chaves de animação (`chave(T, [[0, v0], [2.5, v1], ...])`) para câmera, posições, rumos e expressões. No roteiro,
marque `"camera": { "tomada": true }` no primeiro plano e `{ "tomada": true, "continua": true }` nos seguintes.
Cuidados: o quarto não tem parede da frente (câmera olhando para +Z, |ang| ≤ ~1); na rua, não passe a câmera por cima
dos carros estacionados (lado +X); ao trocar de pose num salto, cubra com poeira.

Opções `o` de personagem: `luz: { lado: -1|1 }` (contraluz/rim de janela), `vida` (intensidade da respiração e
balanço, padrão 1), `parado`, `caminhar: t` (perfil), `caminharFrontal: t` (de frente ou de costas), `velocidade`,
`semente`, `semRosto`.

Campos do `item`: `fabrica`, `registroPoses`, `pose` (nome ou mapa de ângulos), `pose2` + `mistura` (0–1, mistura de
poses), `expressao`, `vista`, `vistaCabeca` (cabeça em outra vista que o corpo: virada de cabeça), `cabecaEsquerda`,
`espelhar`, `voz` (id de quem fala: mexe a boca com o áudio).

O rig devolvido tem `rig.pontoMundo('mao_d', [0, 0.3])` (ponto da mão, para pôr efeitos e objetos perto dela) e
`rig.escalaPx`.

## 3. Personagens

- **Chede / Kaik / Lia** (série FENDA): `POSES_PADRAO` e `EXPRESSOES_PADRAO`. Fábricas `criarChede`, `criarKaik`, `criarLia`.
- Opções novas da base (`motor/personagem-base.js`): `cabelo.estilo: 'cacheado'`, `calca.tipo: 'bermuda'`,
  `top.bolso: true` (bolso no peito), `top.listra: '<cor>'` (faixa larga no peito). Cores novas no guia: `laranja`,
  `azulKaik`, `vermelhoKaik`, `pretoBermuda`, `musgo`, `jeansClaro`.

- **Lucas** — poses `LUCAS_POSES`: `parado` (frente), `andando` (perfil), `correndo` (perfil), `apontando` (3/4),
  `poder` (3/4, com efeito de terra), `caido`. Expressões: neutro, feliz, espanto, medo, raiva, determinado,
  cansado, rindo, curioso, triste. Vistas: `frente`, `tq` (3/4, olha para a direita), `perfil`, `costas`.
  Para olhar para a esquerda: `espelhar: true`.
- **Mãe / Rafael** — `POSES_PADRAO`: parado, andando, acenando, …; expressões de `EXPRESSOES_PADRAO`
  (neutro, feliz, espanto, medo, raiva, determinado, preocupado, cansado, rindo).
- Mão detalhada para closes: `Maos.desenhar(ctx, x, y, escala, { curl: [5 valores], abre, ang, espelhar, pele, manga, faixa })`.

## 4. Cenários 3D (`Cenarios3D.<nome>.desenhar(ctx, cam, opções)`, cada um com `.nevoa` e `.pontos`)

| Cenário | Opções úteis |
|---|---|
| `quarto` | `t`, `tremor`, `livrosCaindo` (0–1), `vasoTerra` (0–1), `despertadorTocando`, `portaAberta`; `pontos.vaso` |
| `rua` | `t`, `arvoreX`, `desfoque`, `semFrente` |
| `escola` | `t`, `armarioAberto` |
| `patio` | `t`, `arvoreX` (tem bueiro em x 0.6, z 3.2) |

Objetos 2D extras em `cenarios/objetos/` (cama, despertador, mochila).

## 5. Efeitos (`efeitos/`)

- `Efeitos['poder-terra'](ctx, x, y, H, { t })` — esfera de terra com rachaduras brilhando, pedras orbitando.
- `efeitos/terra-cena.js` (assinaturas no topo do arquivo): `terraPoeira`, `terraSubindo`, `terraCaindo`,
  `rachadura`, `ondaPedras`, `colunaTerra`, `poeiraTeto`, `impacto`, `ondaTerra`, `erupcao`, `fluxoTerra`.
- `Efeitos.invisibilidade` e `Efeitos['poder-energia']` (de outras séries).
Cores da terra (guia): terra `#8B5E3C`, pedra `#7A7480`, rachadura `#FFB347` com miolo `#FFE2B0`.

- `Efeitos.fenda(ctx, x, y, larguraPx, { t, abre (0..1), achata (0..1), semente })`: fenda roxa da série FENDA (rasgo
  escuro com estrelas, borda violeta/ciano, halo, anéis e partículas sugadas).

## 6. Receitas

- **Vários personagens no chão:** `emOrdem(cam, [[X, Z, () => api.personagem3d(...)], ...])` desenha do mais longe
  para o mais perto (copie a função de `roteiros/chede/ep06.js`).
- **Duração com voz final:** fala de mais de 3 s ganha `"duracao"` = fala + 0,25 s no roteiro; as tomadas contínuas usam
  `tempoTomada(...)` com as durações nominais e continuam batendo com as falas.

- **Nada rente à câmera:** ponto 3D a menos de ~1 m da câmera vira forma gigante (quadrado preto/branco num quadro).
  O motor já recorta paredes/caixas e pula efeitos rentes, mas ao mover a câmera para frente não desenhe pisões,
  rachaduras ou personagens que a câmera já passou (ex.: `if (Zp < cam.z + 1.3) return`).

- **Close (cintura para cima):** `api.personagem(item, cx, cy - 0.47 * H + A * H, A * H)` com `A = alturaEmH` da
  vista (`window.criarLucas({}, 'frente').alturaEmH`) e `H` = altura da cabeça em px (ex.: 520).
- **Fundo desfocado:** desenhe o cenário numa `api.camada()` e chame `api.desfocar(camada, 8–18)`.
- **Reação em 3 tempos:** 0–0,4 s só os olhos (expressão com olhar), 0,4–0,9 s `vistaCabeca`/`cabecaEsquerda` e
  troca de expressão, depois a câmera chega um pouco mais perto (`z` ou zoom de 3–6%).
- **Câmera viva:** sempre um movimento lento (`z: base + u * 0.1`, zoom `lerp(1, 1.06, u/d)`, giro `yaw`).
- **Capa** e **cartela final:** copie `capa` e `parte` de `roteiros/exemplo/teste.js`.
