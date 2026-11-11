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
