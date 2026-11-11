# Guia de estilo

Estilo próprio para os vídeos do motor: **animação 2D flat em recorte, personagens jovens de
roupa larga, contorno escuro médio, sombra de corte único e poderes neon em camadas.**

Ele nasceu do que se repete nas 15 imagens de `referencias/`, mas **não reproduz nenhuma delas**:
nenhum personagem, combinação de cores ou roupa das referências deve ser copiado (ver seção 9).

Todas as medidas de personagem usam **H = altura da cabeça** (do topo do crânio ao queixo, sem o
cabelo). Medidas em px valem para o quadro 1080×1920 com o personagem em tamanho padrão
(altura total 1100 px → **H = 200 px**). Em outros tamanhos, escale proporcionalmente.

---

## 1. O que as referências têm em comum (base das regras)

| Aspecto | O que se repete | Medido / observado |
|---|---|---|
| Formas | Silhueta simples e legível, cabeça arredondada com queixo pequeno, cabelo volumoso em mechas pontudas, mãos pequenas, tênis grandes | 6 de 7 personagens |
| Proporções | Jovem/adolescente com **5 a 5,5 cabeças**; pernas ≈ metade da altura; olhos grandes. Uma exceção chibi (≈ 3,3 cabeças) | Estimado nas imagens 01–07 |
| Roupa | Peças **largas**: moletom, mangas sobrando, calça larga com barra embolada, camadas (manga longa sob manga curta) | 01, 02, 04, 05, 06, 07 |
| Paleta (personagens) | Muitos **neutros escuros** (preto/grafite/marrom), **um acento forte** (vermelho, coral ou turquesa), um off-white e pele pêssego | Roupas escuras em 20–50% dos pixels; acento em 9–17% |
| Pele | Pêssego claro a médio | `#E2A17F` – `#F0CCB8` em todas |
| Contorno | Escuro, nunca cinza claro. Espessura varia de fino a grosso | 1,5‰ a 8,8‰ da altura da figura (mediana ≈ 2,5‰) |
| Sombra | Majoritariamente **um único tom de sombra com borda dura** (cel shading); duas usam degradê suave | 02, 06, 07 duras; 03, 05 suaves |
| Textura | Praticamente nenhuma: cores chapadas | Todas |
| Fundo de efeitos | **Escuro**: preto, grafite neutro ou índigo | Luminância 0–20% em 8 de 8 |
| Efeitos | Núcleo **quase branco** + cor saturada + aura; formas chapadas de borda recortada; faíscas; anéis; poeira cinza no chão | Branco = 0,4–6% dos pixels; cores vivas = 5–14% |
| Cores de poder | Roxo/violeta é a mais frequente; depois ciano/azul, vermelho, laranja, verde, rosa | 6 de 8 têm roxo ou violeta |

---

## 2. Paleta

### 2.1 Regra de uso
- Cada personagem usa **no máximo 5 cores-base** (sem contar sombra/luz): 1 pele, 1 cabelo, 1–2 neutros, **1 acento**.
- O acento ocupa **10–20%** da área do personagem. Os neutros, 50–70%.
- **Proibido** `#000000` e `#FFFFFF` puros no personagem. Exceções: pupila pode ir até `#110E14`; brilho do olho pode ser `#FFFFFF`.
- **Cor-assinatura:** o briefing de um personagem pode definir uma cor-assinatura que ultrapassa o limite do acento (até 50% da área). Registrar na ficha do personagem.
- **Exceções do briefing** (cor-assinatura, tamanho dos olhos, largura da cabeça) valem só para aquele personagem e ficam anotadas na `ficha.md` dele.
- Cada cor tem 3 tons: **base**, **sombra** e **luz**. Não inventar tons intermediários.

### 2.2 Fórmula dos tons
- **Sombra** = base × `#C4B6DE` (mistura *multiply*, lavanda fria). Para **pele**, base × `#E8AFA2` (rosado quente).
- **Luz** = base com *screen* de `#FFF1CC` a 18%. Só em cabelo, bochecha e objetos brilhantes.

### 2.3 Cores do estilo

| Nome | Uso | Base | Sombra | Luz |
|---|---|---|---|---|
| Tinta | Contorno e linhas internas | `#211B26` | — | — |
| Grafite | Roupa escura | `#38343F` | `#2B2537` | `#5C575B` |
| Pedra | Roupa média, detalhes | `#6A6573` | `#514864` | `#857F87` |
| Linho | Off-white (camisetas, solas, golas) | `#F2EDE6` | `#BAA9C8` | `#F4F0EA` |
| Denim | Calças | `#55708C` | `#41507A` | `#74889D` |
| Marinho | Cor-assinatura do protagonista | `#2B3B66` | `#212A59` | `#515C7C` |
| **Brasa** | Acento | `#D23A42` | `#A12939` | `#DA5C5D` |
| **Coral** | Acento | `#F28A5E` | `#BA6252` | `#F49E75` |
| **Turquesa** | Acento | `#3DB5B0` | `#2F8199` | `#60C2BB` |
| **Lilás** | Acento | `#A487DE` | `#7E60C1` | `#B49BE3` |
| **Mostarda** | Acento | `#EBC25A` | `#B58A4E` | `#EFCC72` |
| Pele 1 | Pele | `#F6D6C0` | `#E0937A` | `#F8DDC9` |
| Pele 2 | Pele | `#EAB28E` | `#D57A5A` | `#EEBF9E` |
| Pele 3 | Pele | `#C98B63` | `#B75F3F` | `#D39F79` |
| Pele 4 | Pele | `#8F5B3E` | `#823E27` | `#A3775A` |
| Cabelo Café | Cabelo | `#4A3536` | `#39262F` | `#6B5753` |
| Cabelo Noite | Cabelo | `#2C2936` | `#221D2F` | `#524D53` |
| Cabelo Castanho | Cabelo | `#73493A` | `#583432` | `#8C6856` |
| Cabelo Cobre | Cabelo | `#BC673C` | `#914A34` | `#C88158` |

Extras:
- Blush: `#F09A8C` a 35% de opacidade, elipse sem contorno.
- Íris (escolher 1): Azul `#4F9BE0`, Âmbar `#D9902F`, Verde `#4FAF7A`, Violeta `#8B63D9`, Castanho `#6A4330`.

### 2.4 Fundos

| Cena | Cor | Uso |
|---|---|---|
| Ficha de personagem | `#F4F2EE` | Vistas e testes |
| Noite/poder | `#14122B` (Índigo) | Cenas de efeito "mágico" |
| Grafite frio | `#2A2933` | Cenas de efeito neutras |
| Breu | `#0B0A12` | Clímax, explosões grandes |

Em cenas com poderes, o fundo deve ter **luminância ≤ 20%**: o brilho só aparece sobre fundo escuro.

---

## 3. Proporções do corpo (padrão: 5,5 H)

Alturas medidas **a partir do topo da cabeça**. Valem para **todas as vistas** (frente, três
quartos, perfil, costas): as linhas-guia são as mesmas.

| Ponto | Altura | px (H=200) |
|---|---|---|
| Topo do cabelo (volume) | −0,15 a −0,30 H | −30 a −60 |
| Topo do crânio | 0 | 0 |
| Linha dos olhos (centro) | 0,58 H | 116 |
| Queixo | 1,00 H | 200 |
| Ombros | 1,20 H | 240 |
| Axilas / peito | 1,60 H | 320 |
| Cintura | 2,30 H | 460 |
| Virilha (quadril) | 2,75 H | 550 |
| Pulso (braço solto) | 2,85 H | 570 |
| Joelho | 4,00 H | 800 |
| Tornozelo | 5,15 H | 1030 |
| Sola | 5,50 H | 1100 |

Larguras (vista de frente):

| Parte | Largura |
|---|---|
| Cabeça | 0,85 H |
| Ombros | 1,50 H (ombros largos) / 1,35 H (ombros estreitos) |
| Cintura | 0,85 H |
| Quadril | 1,05 H (estreito) / 1,20 H (largo) |
| Pescoço | 0,28 H; comprimento visível 0,15–0,20 H |
| Braço (dentro da manga larga) | 0,30 H; a manga tem 1,3× a largura do braço |
| Mão | 0,50 H de comprimento; dedos simplificados (máx. 4 visíveis) |
| Tênis | 0,95 H de comprimento × 0,35 H de altura; sola em Linho com 0,08 H |

Variações permitidas (só estas):
- **Compacto** (criança): 4,5 H. Multiplicar as alturas abaixo do queixo por 0,79.
- **Chibi** (piada, reação exagerada): 3,2 H, cabeça 1,1× maior, olhos 1,3× maiores. Usar no máximo por 2 s.

---

## 4. Cabeça e rosto

| Elemento | Regra |
|---|---|
| Formato | Círculo com a parte de baixo afinando para um queixo pequeno e arredondado (não pontudo). Bochecha mais larga na linha dos olhos |
| Olhos | Altura 0,24 H, largura 0,20 H, distância entre eles 0,22 H; centro em 0,58 H |
| Íris | 70% da altura do olho; pupila 45% da íris, cor `#110E14` |
| Brilho do olho | 1 círculo grande (25% da íris) no alto do lado da luz + 1 pequeno (10%) embaixo do lado oposto |
| Sobrancelha | Traço único de 0,18 H, espessura 1,2× o contorno, cor do cabelo escurecida |
| Nariz | Frente: só uma marca curta ou nada. Perfil: pequena saliência de 0,06 H |
| Boca | 0,12 H de largura em 0,82 H; neutra = linha levemente curva |
| Orelha | Topo na linha das sobrancelhas, base na linha do nariz |
| Cabelo | 5–9 mechas grandes em forma de cunha com pontas para fora; volume extra de 15–30% acima do crânio; 1–2 mechas soltas no topo |

**Expressões obrigatórias** (cada personagem precisa das 6): neutro, feliz, sério/bravo, surpreso,
triste, determinado. Mudam só sobrancelhas, pálpebras, boca e o tamanho da pupila (surpreso: 60%).

---

## 5. Vistas e giro

- Vistas obrigatórias: **frente (0°)**, **três quartos (45°)**, **perfil (90°)**, **costas (180°)**. O outro lado é espelhado.
- Três quartos: olho do lado de lá com 70% da largura; linha do centro do rosto desloca 0,15 H; ombro de lá encolhe 25%.
- No giro em cena, passar **sempre** pela vista intermediária (frente → 3/4 → perfil), com 2 a 3 quadros em cada vista.
- Acessórios (mochila, colar, corrente, fone) são presos a uma parte do corpo e trocam de desenho conforme a vista.

---

## 6. Contorno, sombra e luz

### Contorno
| Item | Regra |
|---|---|
| Cor | Tinta `#211B26` (nunca preto puro) |
| Silhueta externa | **4‰ da altura do personagem** → 4,5 px no tamanho padrão (mín. 2 px) |
| Linhas internas (dobras, separação de peças) | 55% da externa → 2,5 px |
| Detalhes do rosto | Olhos e sobrancelhas: 1,2× a externa; boca: igual às internas |
| Pontas | Arredondadas (`lineCap = 'round'`, `lineJoin = 'round'`) |
| Efeitos e partículas | **Sem contorno** |

### Sombra (no personagem)
- **Um único tom de sombra, borda dura** (cel shading). Sem degradê no preenchimento.
- Luz principal **de cima à esquerda, a 45°**. A sombra fica do lado direito e embaixo de cada peça.
- A sombra cobre **20–35%** de cada peça. Lugares fixos: embaixo do queixo (0,15 H no pescoço), embaixo da franja na testa, dobra do cotovelo, entre as pernas, embaixo da barra do moletom.
- **Sombra no chão**: elipse com 1,1× a largura dos ombros e 0,18 H de altura, `rgba(17,14,20,0.22)`, desfoque de 12 px.

### Luz
- Luz (tom "luz" da paleta) só em: **1 faixa no cabelo**, ponta do nariz/bochecha (opcional), objetos brilhantes.
- **Contraluz de poder**: quando há efeito perto, o lado do personagem virado para ele recebe uma borda de 3–6 px na cor principal do efeito, mais um tom sobre o personagem a 10–20% de opacidade (mistura *screen*).

### Textura
- Nenhuma textura nos personagens e nos objetos.
- Opcional: granulado no quadro inteiro a 2–3% de opacidade.

---

## 7. Efeitos e poderes

### Estrutura em camadas (de baixo para cima)
1. **Aura**: cor de aura do elemento, 35–50% de opacidade, desfoque de 24–40 px. Raio = 2,5–4× a espessura do núcleo.
2. **Corpo**: formas chapadas na cor principal, bordas recortadas (lascas, gotas, labaredas). Sem degradê interno.
3. **Miolo**: cor clara do elemento.
4. **Núcleo**: Creme-luz `#FFFDF2`. Ocupa **no máximo 6%** da área do efeito.
5. **Partículas**: estrelas de 4 pontas (12–40 px), pontos e gotas soltas na cor clara.

Camadas 1, 3, 4 e 5 usam mistura **aditiva** (`globalCompositeOperation = 'lighter'`).

### Cores por elemento

| Elemento | Núcleo | Miolo (clara) | Principal | Aura |
|---|---|---|---|---|
| Arcano (padrão do estilo) | `#FFFDF2` | `#E9C9FF` | `#8A3CF0` | `#4A1FB8` |
| Energia/raio | `#FFFDF2` | `#CDF6FF` | `#3FC3F0` | `#2A6FD6` |
| Fogo | `#FFFDF2` | `#FFE6A8` | `#FF7A2A` | `#D6332A` |
| Sangue/sombrio | `#FFFDF2` | `#FFE2D6` | `#F2232F` | `#8C0F22` |
| Veneno | `#FFFDF2` | `#D8FFC4` | `#3BEA2A` | `#128A3A` |
| Água | `#FFFDF2` | `#D6ECFF` | `#5B8EF0` | `#2B3FB0` |
| Escudo/rosa | `#FFFDF2` | `#FFD6F4` | `#F15FD8` | `#9B2FB8` |
| **Terra** (poder do Lucas) | `#FFE2B0` (rachadura) | `#FFB347` | `#8B5E3C` (pedra `#7A7480`) | poeira `#B07A4E` translúcida |
| Prisma (arco-íris) | `#FFFDF2` | — | Sequência `#FF4F6D` → `#FF9A3C` → `#FFE15A` → `#4FE38A` → `#3FC3F0` → `#8A3CF0` | `#4A1FB8` |

### Peças de efeito do estilo
- **Projétil**: cabeça arredondada + cauda que afina e se quebra em pedaços; comprimento da cauda 3–6× a cabeça.
- **Laser**: núcleo branco de 30% da espessura, borda na cor principal, faixas internas mais claras; **anéis de choque em "C"** a cada 1,5–2 espessuras.
- **Golpe em crescente**: arco grosso que afina nas pontas, principal → clara do centro para fora.
- **Impacto**: flash de 2 quadros (núcleo cobrindo 25% do quadro, a 60% de opacidade) + anel que expande + 12–24 faíscas + poeira.
- **Círculo de runas**: 2 anéis concêntricos + símbolos geométricos **inventados** (traços, triângulos, pontos). Nada de símbolos reais ou religiosos.
- **Recuo do disparo**: labaredas em Linho `#F2EDE6`, sem brilho, atrás de quem dispara.
- **Poeira de chão**: nuvens chapadas em `#8A8790` a 70%, sem contorno; aparecem em lançamento, impacto e pouso.

### Ritmo de um poder
Carregar (0,3–0,6 s) → disparar (2–4 quadros) → viajar → impactar (flash de 2 quadros + tremida de câmera) → dissipar (0,4–0,8 s, encolhendo até um ponto, como uma estrela que some).

---

## 8. Roupa e silhueta

- Peça de cima **larga**: ombro caído, manga 10–20% mais longa que o braço, punho embolado.
- Calça larga ou cargo, com a barra **embolada ou dobrada** sobre o tênis.
- Tênis grandes, sempre com sola clara (Linho).
- Camadas são bem-vindas: manga longa por baixo de manga curta; moletom com capuz e cordões.
- Estampas: só formas geométricas simples (faixa, triângulo, círculo). **Sem logotipos e sem marcas.**
- No máximo **2 acessórios** por personagem.

---

## 9. Para manter o estilo próprio (não copiar)

- Não reproduzir nenhum personagem das referências: nem rosto, nem cabelo, nem roupa, nem a combinação de cores.
- Combinações **proibidas**, porque são próximas demais das referências:
  - moletom preto com faixas vermelhas + mecha vermelha no cabelo;
  - camiseta vermelha sobre manga longa branca + calça cargo preta;
  - cabelo laranja/ruivo + roupa turquesa com degradê pastel;
  - camisa xadrez vermelha + calça jeans;
  - camisa laranja aberta + bermuda azul + mochila amarela;
  - moletom marrom com degradê + cabelo cacheado escuro + olhos azuis.
- Cada personagem novo é montado com **as cores da seção 2** e **as proporções da seção 3**, nunca a partir de uma imagem de referência.
- Efeitos: usar as cores da seção 7. Não copiar a forma exata de nenhum efeito das imagens (ex.: o pentagrama da referência vira o círculo de runas inventado).

---

## 10. Checklist antes de aprovar um quadro

- [ ] Personagem com 5,5 H (ou uma das variações), linhas de altura batendo entre as vistas
- [ ] Máximo de 5 cores-base, 1 acento entre 10–20% da área
- [ ] Contorno em Tinta, 4‰ na silhueta e 55% disso nas linhas internas
- [ ] Um tom de sombra de borda dura, luz vindo de cima à esquerda
- [ ] Sem preto ou branco puros no personagem; sem textura
- [ ] Efeitos com núcleo creme ≤ 6%, mistura aditiva, sem contorno, sobre fundo com luminância ≤ 20%
- [ ] Nenhuma combinação proibida da seção 9

---

## 11. Cenários e objetos

- Formato vertical 1080 × 1920, câmera frontal (ou leve perspectiva de um ponto no chão).
- **Planos e contorno:** primeiro plano (onde o personagem pisa) 4 px · plano médio 2,5 px · fundo distante sem contorno, com cor clareada.
- **Luz:** a mesma do guia, de cima à esquerda. Sol e janelas ficam à esquerda. Feixes de luz são polígonos chapados `rgba(255,241,204,0.28–0.32)` sem contorno.
- **Sombra:** mesma regra de corte único (seção 6); em px, deslocamento de 4–14 px conforme o tamanho da peça.
- **Céu:** 4 faixas chapadas (Céu → Céu luz → Horizonte clareado → Horizonte), sem degradê contínuo.
- **Objetos:** desenhados em H (mesma unidade dos personagens), base no chão, com sombra elíptica no chão.
- **Cores de cenário** (tons calculados pela fórmula da seção 2.2):

| Nome | Base | Sombra | Luz |
|---|---|---|---|
| ceu | `#BFE3F2` | `#93A2D3` | `#CBE8F4` |
| ceuHorizonte | `#FBE3C8` | `#C1A2AE` | `#FCE8D0` |
| sol | `#FFE6A8` | `#C4A492` | `#FFEAB5` |
| nuvem | `#F7F4EE` | `#BEAECF` | `#F8F6F0` |
| parede | `#E9DCCB` | `#B39DB1` | `#EDE2D2` |
| paredeEscola | `#D8E6E2` | `#A6A4C5` | `#DFEAE6` |
| madeira | `#B98563` | `#8E5F56` | `#C69A79` |
| madeiraClara | `#D6A77F` | `#A4776F` | `#DDB691` |
| telhado | `#B5544A` | `#8B3C40` | `#C27164` |
| casaAreia | `#E8C9A0` | `#B28F8B` | `#ECD2AE` |
| casaCeu | `#9FB7C9` | `#7A83AF` | `#B0C3D1` |
| casaRosa | `#D9A6A0` | `#A7768B` | `#E0B5AE` |
| asfalto | `#5A5866` | `#453F59` | `#78747C` |
| calcada | `#CFC8C0` | `#9F8FA7` | `#D8D1C9` |
| grama | `#86B46E` | `#678060` | `#9CC183` |
| folhagem | `#5E9E5A` | `#48714E` | `#7BAF72` |
| tronco | `#7A5A44` | `#5E403B` | `#92765F` |
| armario | `#5E7FA8` | `#485B92` | `#7B95B5` |
| vidro | `#CFEAF5` | `#9FA7D5` | `#D8EEF6` |

- Os cenários não usam o Marinho nem o Turquesa em áreas grandes, para não competir com o Lucas.

### Efeitos em cena clara
A seção 7 pede fundo escuro para brilho aditivo. Em cena de dia (ex.: invisibilidade no quarto), o efeito usa partículas **chapadas** em mistura normal, com aura em opacidade baixa; o aditivo só entra com fundo escuro.

---

## 12. Cenários cinematográficos (vídeos)

Referência: `referencias/videos/ref-cenario-01.mp4` (só a linguagem de cenário e câmera; nunca os personagens).

- **Perspectiva real:** cenários de vídeo usam a câmera 3D (`motor/cena3d.js`, mundo em metros), com ponto de fuga e câmera baixa (olho a 0,9–1,5 m).
- **Profundidade:** névoa que clareia o que está longe; contorno que afina com a distância e some depois de ~30 m.
- **Luz de fim de tarde/manhã:** sol baixo à esquerda, céu em degradê azul → pêssego, feixes de luz chapados.
- **Profundidade de campo:** em close, fundo desfocado (10–18 px); primeiro plano (copa de árvore) bem desfocado.
- **Pós-processamento** (`motor/cinema.js`) em todo quadro: cor quente (soft-light), bloom leve, vinheta, granulado.
- **Personagens continuam flat** (seções 3–6): só o cenário e a luz ganham profundidade.
- **Legenda:** Inter 900, caixa alta, branca com contorno Tinta (20% do tamanho), palavra-chave em Mostarda; até 3 palavras; na faixa mais longe dos rostos.

---

## 13. Direção de cena (referências 2, 3 e 4)

- **Câmera perto:** a maior parte dos planos da cintura para cima (rosto no terço de cima). Plano aberto só para situar, e curto. Usar lente mais fechada (focal 1050–1500 px) para o fundo comprimir.
- **Câmera viva:** além do deslize lento, usar giro (yaw) com pequena passada do ponto e acomodação, e inclinação leve (até 2°) nas viradas e revelações.
- **Reação em três tempos:** os olhos vão primeiro; a cabeça vira (troca para a vista de 3/4 ou perfil) e a expressão muda; a câmera faz um ajuste curto (empurrão ou deslize de 4–6%).
- **Interiores:** penumbra com a luz principal entrando pela janela (degradê em cada face, sombras roxo-azuladas), feixes chapados com poeira e sombra de contato nos cantos e embaixo dos móveis. O personagem recebe contraluz quente no lado da janela.
- **Objetos de cena:** volume com degradê (não cor única), textura simples projetada (veios, xadrez, juntas) e borda que afina com a distância.
- **Poderes:** sempre em camadas: halo, corpo com textura ou partículas, anel ou rastro de movimento e faíscas em estrela.
- **Cenário cheio:** cada plano tem pelo menos 3 objetos de cena além da arquitetura (ex.: carro, lixeira, arbusto, cartaz, banco).

---

## 14. Modo de render "suave" (padrão)

Pedido: deixar os vídeos menos cartunescos, mais perto das referências. Vale para personagens, objetos e cenários
(`Estilo.modo = 'suave'` em `motor/estilo.js`; o modo `'classico'` continua disponível). Substitui, onde houver conflito, as seções 6 e 11:

- **Sem contorno preto.** A borda de cada peça é fina (42% da espessura clássica) e na cor da própria peça: tom de sombra × `#9A8EAA`.
- **Sombra em degradê** (não mais corte único): a sombra entra suave do lado oposto à luz.
- **Sombra de contato entre peças:** cada peça escurece de leve o que está atrás dela (`rgba(28,18,42,0.16)`), dando volume (cabeça no pescoço, braço no corpo).
- **Linhas internas discretas:** `rgba(48,32,56,0.62)`, 85% da espessura.
- **Blush leve:** `rgba(232,140,128,0.16)`.
- **Cenários 3D:** borda 40% da espessura, na cor da face escurecida; nada de Tinta pura.
- Cores, proporções, roupas e rostos dos personagens **não mudam**.

---

## 15. Efeitos de terra, mão em close e chamada final

- **Terra** (referências em `referencias/efeitos-terra/`): anel no chão com rachaduras incandescentes âmbar, anéis de choque brancos, espinhos escuros em leque, poeira em bolhas cor de areia, brasas e jatos verticais de poeira. A esfera do poder tem placas de terra separadas por rachaduras que emitem luz.
- **Linhas de energia:** quando o Lucas controla a terra à distância, linhas âmbar curvas ligam a mão ao alvo, com grãos brilhando viajando por elas.
- **Mão em close** (`motor/mao-detalhe.js`): nos momentos de poder, um plano da mão grande na tela, dedos articulados mexendo e fechando, punho do moletom com a faixa.
- **Objetos redondos** usam cilindro com degradê (`Cena3D.cilindro`), nunca caixa.
- **Final de todo episódio:** "PARTE X" + "SEGUE PRA VER A PARTE X+1", botão de seguir pulsando de leve (sem mão clicando) e fala do narrador (cartela de 3 s).
- **Duração:** no máximo 1 min 15 s por episódio.
