# Aprendizados

Regras que valem para todos os vídeos. Cada uma com o motivo.

- **Estilo = vídeo de referência** (luz de janela, fundo desfocado, grão, legenda condensada com
  palavra-chave amarela). Motivo: o usuário quer a animação "exatamente igual" à referência.
- **Personagem principal: Chede** (23 anos, pele morena, cabelo preto, camiseta laranja, bermuda preta;
  corajoso, às vezes inseguro, esperto). Motivo: definido pelo usuário.
- **Poder inspirado em anime vira versão original** (fenda dimensional na mão, sem nome, olho ou espiral
  do anime). Motivo: o curso proíbe copiar poder famoso (risco de remoção/strike).
- **Roteiro no estilo da referência**: cada etapa mistura humor do dia a dia com uma consequência real
  (lei, ciência, tecnologia). Motivo: é o que segura a atenção na referência.

- **Chede aprovado como versão oficial** (cabelo ondulado e volumoso). Motivo: aprovado pelo usuário;
  a ficha `personagens/chede/ficha.png` é regra obrigatória em todos os vídeos.

## Técnico
- Whisper: usar `HF_HUB_DISABLE_XET=1` e passar o áudio como array (wav 16 kHz), não o caminho.
- Render: `npx remotion ... --browser-executable=/opt/pw-browsers/chromium`.
- Voz provisória gratuita: `espeak-ng -v pt-br`.
- **Bermuda presa às pernas**: cada perna da bermuda é desenhada junto com a coxa (não no tronco).
  Motivo: correndo, a perna saía da bermuda e parecia que o Chede estava pelado.
- **Série 1 = poder de sumir com as coisas (inspirado no kamui, versão original)**. Motivo: escolha do usuário.
- **Roteiro da Parte 1 aprovado** pelo usuário ("ficou muito top"). Não alterar o texto.
- **Voz: ElevenLabs direto quando o roteiro já está aprovado** (o texto não muda mais; só as cenas mudam).
- **Legenda do vídeo não aparece durante a capa** (a capa já mostra a premissa em letras grandes).
- **Música corta na virada** ("…segurou") e entra um impacto grave. Na "dimensão", a música fica mais baixa.

## Técnico (vídeo)
- Episódio = `estudio/src/episodios/<nome>/`: `falas.json` (fala por linha; *amarelo*, !vermelho!),
  `timing.json` (gerado por `scripts/alinhar.py`), uma cena por fala em `<Nome>.tsx`.
- Trilha/efeitos sintetizados: `scripts/gerar_trilha_sumir1.py` (usa o timing).
- Prévia rápida: `--scale=0.5` (~4 min). Final: `--crf=18` (~10–15 min, 4 núcleos).
- ElevenLabs: baixar os takes de `elevenlabsusercontent.com`; escolher o take com maior "acerto" no alinhamento.
- **Parte 1 aprovada** ("ficou legal") sem correções. Motivo: aprovação do usuário; o estilo da Parte 1 é o padrão da série.
- **Foto de perfil**: Chede espantado + fenda na mão, fundo roxo escuro com brilho; tudo dentro do círculo.
  Arquivo `prontos/foto-perfil-instagram.png` (código `estudio/src/personagens/FotoPerfil.tsx`).
- **Todo vídeo sai com capa + descrição do Instagram**, salvas em `prontos/` e `roteiros/<serie>-parte-N-post.md`,
  e enviadas ao usuário junto com o vídeo. Formato da descrição (modelo enviado pelo usuário):
  1. Emoji(s) + TÍTULO EM CAIXA ALTA com a premissa + " | PARTE N"
  2. Parágrafo 1: o que acontece no episódio (2–3 frases)
  3. Parágrafo 2: a virada, terminando em suspense ("Só que…", "…") + 😳
  4. "🔥 " + pergunta para os comentários
  5. 5 hashtags em CamelCase, terminando com #ReelsBrasil
- **Personagens novos usam o mesmo boneco** (`Chede.tsx`) com outra aparência (`AparenciaCtx`): cores,
  cabelo e estampa. Motivo: mesmo estilo e proporções entre todos os personagens do canal.
- **Séries se cruzam**: manter `roteiros/universo.md` atualizado a cada episódio (o que aconteceu e o que ficou em aberto).
- **Kaik aprovado** (versão oficial) e **roteiro da Parte 1 da série de velocidade aprovado**. Não alterar o texto.
- **Se o ElevenLabs estiver ocupado**: fazer a prévia com `espeak-ng -v pt-br -s 165` e trocar a voz depois;
  as cenas se reajustam sozinhas porque o tempo vem do alinhamento (`timing.json`).
- **Corrida de perfil**: usar a função `corrida(f)` (pernas e braços alternando) + `Rastro` ciano + `LinhasVento`.
- **Prévia do Kaik aprovada** ("ficou top") → voz final ElevenLabs e render final em `prontos/`.
- **Numeração única da história**: os episódios do Chede e do Kaik são uma história só e seguem a mesma
  contagem (Parte 1 = Chede, Parte 2 = Kaik, Parte 3 = próxima). A capa mostra a parte atual e o final chama a próxima.
  Motivo: o usuário achou estranho o episódio do Kaik começar como "Parte 1" se continua a do Chede.
- **Render final travando por tempo** (quadros pesados: muitas cópias com blur em resolução cheia):
  a causa foi o desfoque (feGaussianBlur) nas cópias do `Rastro`; removido. Usar `--timeout=120000`.
  Testar antes um trecho curto: `--frames=0-120`.
- **Novo padrão visual (referência 2)**: cenários de rua em **3D de verdade** (`estudio/src/cenarios3d/Rua3D.tsx`,
  three.js via @remotion/three) com o personagem 2D por cima (`projetar()` dá posição e escala na tela),
  poder com **raios ramificados + brilho + faíscas** (`efeitos/Eletricidade.tsx`), corrida com passada longa
  (`personagens/poses.ts`) e câmera colada no personagem. Objetos sempre presos à mão que se mexe.
- **Render com 3D**: usar `--gl=swangle` (os outros modos não criam WebGL aqui). ~2 s por quadro.
- **Raios do Kaik em ciano** (decisão do usuário). Objeto levado à boca: desenhar a mão e o antebraço por cima da cabeça (`MaoFechada`).
- **Render longo = `scripts/render_partes.sh`** (blocos de 300 quadros + áudio separado). O container pode reiniciar e matar o processo; os blocos prontos ficam em `estudio/out/`.

- **Áudio do render em blocos: montar no ffmpeg.** O render só de áudio do Remotion (`--codec=wav`) estourou o tempo nas cenas 3D e não gerou o arquivo. Motivo: ele ainda passa pelos quadros. Como a composição só soma narração + trilha sem ajuste de volume, o `render_partes.sh` agora mistura direto com `ffmpeg amix` (narração e trilha de `public/<episodio>/`).

## Regras vindas do vídeo de referência 3 (pedido do usuário, 07/11)

- **Sempre pedir engajamento.** Todo vídeo tem chamada para seguir: no fim, junto com o gancho
  ("Segue aí pra ver a parte 3!"), e de preferência também no meio, escrita dentro do cenário (placa, tela de
  celular, muro) ou como selo discreto com o @ do canal. Motivo: o usuário pediu, e é o que segura o público
  da série de uma parte para a outra.
- **Todo poder tem lógica e consequência.** Nenhum poder é de graça: cada episódio explica pelo menos uma regra
  física simples do poder (com números e um infográfico na tela) e mostra o custo dele (cansaço, calor, fome,
  parede de ar, risco). Motivo: o usuário pediu, e é o que deixa a história crível e viciante, como na referência.
- **Infográficos no estilo da referência 3**: número grande + rótulo pequeno em caixa alta, linha fina até o
  objeto, contador que sobe; metáforas visuais (raio-X da cabeça, moléculas de ar, elefante = força).
- Vídeo que o usuário manda acelerado serve igual para estudar: desacelerar o áudio com `atempo=0.5` antes de
  transcrever.
- **A ameaça da série é um vilão com poder (controle mental) que controla o governo.** Decisão do usuário (07/11).
  Detalhes e propostas de regras do poder em `roteiros/universo.md`. Motivo: dá um inimigo à altura e explica
  os agentes, a ficha confidencial e quem filmou do prédio.
- **Vilão criado e aprovado para criar: "o Regente" (Otávio Regis), controle mental, cor âmbar.** As 4 regras do
  poder (gatilho olhar/voz, limite, anel âmbar nos controlados, fraquezas) foram aprovadas pelo usuário (07/11).
  Âmbar foi escolhido para não confundir com o ciano do Kaik nem com o roxo da fenda do Chede: cada poder tem sua cor.
- **Correção do usuário no visual do Regente:** adulto de **35 anos**, **barba** e **cabelo preto lambido para trás**
  (antes eu tinha feito ~55 anos, grisalho e com rugas). Motivo: é assim que o usuário imagina o vilão. Barba feita
  curta e aparada; a primeira versão, cheia, pesou o rosto e cobria a nuca nas vistas de lado.
- **O Regente não aparece por enquanto** — nem rosto, nem silhueta, nem voz — até o usuário liberar. Motivo:
  decisão do usuário (07/11), para guardar o vilão para episódios futuros. Nos próximos episódios a ameaça fica só
  nos agentes / em quem filmou do prédio.
- **Roteiro da Parte 3 aprovado** (07/11). Não alterar o texto.
- **Engajamento sem @**: o usuário não quer o @ do canal escrito; usar só "SEGUE PRA VER A PARTE N" / "Segue aí pra não perder!".
- **Medo e trauma contam como custo do poder.** Correção do usuário (07/11): depois de quase ser puxado pela fenda
  (Parte 2), o Chede tem que ter medo de abrir de novo — medo de ser puxado ou de ver o que tem do outro lado. Mostrar
  com: mão tremendo + batida de coração, lembrança em cores lavadas/roxo, rosto com medo e sombras de mãos nas bordas.
  Motivo: o que aconteceu num episódio tem que pesar nos próximos; deixa o personagem humano e a fenda assustadora.
- **Parte 3 aprovada para a versão final** (07/11), já com o trecho do medo do Chede.
- **O estilo das referências 4 e 5 é 2D, NÃO é 3D.** Correção do usuário (07/11): tentei dar "volume 3D" aos
  personagens (filtro de relevo/brilho em cada parte) e o usuário reprovou — ficou plástico e estragou os personagens.
  Desfeito. O que os exemplos fazem é 2D chapado (formas simples, sem contorno) e a "profundidade" vem da cena:
  luz do ambiente tingindo o personagem (azul à noite, laranja no pôr do sol), sombra grande e suave de um lado,
  fundo desfocado (profundidade de campo), neblina/atmosfera e câmera lenta e suave. Motivo: o usuário quer manter
  o desenho 2D dos personagens; melhorar a qualidade sem mudar a natureza do traço.
- **Duração liberada até 2min15** (usuário, 07/11): o episódio pode ter ~2 min (máx. 2min15) — antes era ~66–75 s.
  Motivo: dá tempo de contar a história com calma (escola, conversa, testes) sem cortar a lógica dos poderes.
- **Visual das referências 4 e 5 = cenário 3D + personagem 2D** (usuário, 07/11: "tenta fazer exatamente igual").
  Cenário 3D de verdade com sombra e neblina, personagem 2D recortado dentro (com sombra no chão e luz da cena),
  câmera 3D sempre se movendo suave (voo do alto, descida do céu, giro em volta) e fundo desfocado.
  Ver `referencias/analise-video-referencia-4-5.md`.
- **Chede e Kaik estão na faculdade** (usuário, 07/11). Motivo: o Chede tem 23 anos — escola não combinava.
- **Roteiro da Parte 4 aprovado** (07/11) com pedidos do usuário: **testes de ataque criativos** — o Kaik corre em
  círculo para fazer um **tornado**; o Chede pede pro Kaik jogar pedras e tenta abrir a fenda **só com o olhar**, sem as
  mãos. Pode acrescentar trechinhos se precisar. Motivo: o usuário gosta de ver os poderes sendo explorados de jeitos
  novos, sempre com lógica e custo (tontura, olho vermelho de esforço).
- **Qualidade acima de prazo** (usuário, 07/11): "não importa se demorar" — fazer no nível das referências 4 e 5.
- **Figurantes são personagens 2D de verdade, nunca bonecos de cápsula 3D** (correção do usuário, 07/11: "esses
  bonecos feios de fundo"). Criar pessoas aleatórias no estilo do Chede/Kaik, variadas: moletom, camisa, camiseta,
  calça, boné, óculos, mochila nas costas, tons de pele e cabelos diferentes. Motivo: dá vida ao cenário e mantém o
  estilo dos personagens.
- **Cenários precisam de muito mais detalhe** (usuário, 07/11: "ficaram muito feios"; "não tem problema se demorar").
  Referência: cidades/campos das refs 4 e 5 — muitos objetos, placas, toldos, plantas, carros, nuvens, céu com sol.
  Nada de caixa lisa: toda superfície com textura, borda, janela, sombra.
- **Nenhuma parte do corpo pode faltar** (usuário, 07/11: "cuidado para as partes do corpo não ficar faltando").
  Erros que achei e corrigi: sentados cortados na altura da mesa (tronco flutuando), braço levantado de costas
  parecendo solto, Chede "nas costas" do Kaik voando separado. Regras: sentado usa a pose `sentar()` (coxa e canela
  dobradas) e nunca corte no meio do corpo; de costas, braço abre para o lado; poses compostas (carregar alguém)
  se testam isoladas no `Debug` antes de entrar na cena; conferir quadros em resolução alta (zoom) antes de enviar.
- **Voz final mais longa que o limite (2min15)**: acelerar com `ffmpeg -af atempo=1.09` (tom igual) antes do
  alinhamento. Parte 4: 144,6 s → 132,6 s. Motivo: limite de duração pedido pelo usuário.
- **ElevenLabs "Unusual activity / Free Tier disabled" ou "busy"**: nada é cobrado; tentar de novo alguns minutos
  depois (na Parte 4 passou na 4ª tentativa, ~15 min depois). Um dos 2 takes pode falhar e o outro sair.
- **Proporção 2.0 dos personagens (aprovada 08/11)**: cabeça menor (≈1/5 da altura) e braços/pernas ~1,7× mais
  grossos, como na referência 5. Fica no rig (`Corpo2Ctx`, padrão ligado). Motivo: o usuário quer "essa qualidade,
  essa animação bonita" — os nossos pareciam bonecos de palito com cabeção.
- **Cor única por cena** (`Gradacao` no `Plano3D`, cor em `CLIMAS[clima].grade`) e **mato desfocado no primeiro plano**
  (`PrimeiroPlano`, padrão nas cenas de pôr do sol). Motivo: referência 5 — tudo mergulha numa cor só.
- **Close de objeto com fundo desfocado**: o objeto em 2D detalhado na frente e `desfoqueAtores` para borrar também
  os personagens lá atrás (ex.: câmera de segurança da Parte 4).
- **Efeito no rosto (sangue, marcas) vai DENTRO do rig** (ex.: `pose.sangueNariz`), nunca numa camada por cima
  calculada pela projeção. Motivo: o sangue saiu embaixo do olho em vez do nariz (correção do usuário).
- **Quem joga/entrega algo olha para o outro na tela**: usar `encarar(cam, eu, outro)` para escolher o espelhar.
  Motivo: o Kaik jogou a pedra olhando para a câmera (correção do usuário).
- **Tronco curvado (> 30°) dobra pela cintura**, com o quadril fixo — senão o tronco solta da bermuda (correção do usuário).
- **Gancho final tem que ser legível**: as marcas de mão pretas sumiam no carro escuro; agora têm brilho roxo em volta.
- **Revisar o vídeo inteiro (1 quadro por segundo) antes de entregar**, não só alguns quadros.

## Rodas e personagens 2D atrás de objetos 3D (08/11, varredura final da Parte 4)
- Roda de carro em close: pneu cinza-escuro (#38363A) com aro e calota claros (`rodasNovas` no `Carro`). Cilindro preto chapado vira um "bloco preto" de perto e parece glitch.
  Motivo: no gancho final da Parte 4 as rodas pretas tapavam as marcas de mão.
- Personagem 2D é sempre desenhado POR CIMA do 3D. Se ele fica atrás de um carro/muro no ângulo da câmera, parece que está em cima do objeto.
  Regra: escolher ângulo com o personagem na frente do objeto, ou tirar o personagem do plano.
- Marcas/detalhes num lado do objeto: a câmera orbita mostrando ESSE lado, nunca a traseira.
- **Parte 4 refeita aprovada** (usuário, 08/11: "Bora para a próxima parte"). Motivo: o padrão da referência 5 (proporção 2.0, cor única, primeiro plano desfocado, closes de objeto) é o padrão da série daqui pra frente.
- **Duração volta ao tempo normal (~60–75 s)** (usuário, 08/11: "coloquei 2 minutos de vídeo, demoro muito pra gerar"). Motivo: o render de 2 min no visual novo leva ~10 h. Roteiros novos com ≈200 palavras.
- **Premissa da Parte 5: "E se você se escondesse dentro do seu poder?"** (usuário, 08/11). "E se você entrasse na sua própria fenda?" ficou estranho. O nome "Kamui" foi descartado porque é o poder de Naruto. O poder continua sem nome próprio.
- **Roteiro da Parte 5 aprovado** (08/11). Não alterar o texto. Referências 4 e 5 reenviadas pelo usuário como padrão de qualidade/animação ("pode copiar até o estilo de animação"). Na Parte 5, usar delas: close de celular na mão, interior do carro dos agentes, câmera térmica/visão noturna, holograma em grade, noite azul com halo e bokeh.
- **Miado sintetizado ficou feio** (usuário, 08/11: "miado de gato ficou muito feio"). Sons de bicho (miado, latido, voz) não se sintetizam com seno: gerar no ElevenLabs (efeito sonoro, `eleven_text_to_sound_v2`, custa ~17 créditos) e carregar o arquivo na trilha. Miado da série: `audio/sfx-miado-gato.mp3`.
- **Personagens mais parecidos com a referência 5** (pedido do usuário, 09/11). `Rosto3Ctx` no rig (padrão ligado):
  - olhos pequenos (bolinha) que só ficam grandes no susto/medo;
  - boca e nariz menores, sobrancelha curta e grossa, língua rosa na boca aberta;
  - polegar e linhas dos dedos marcados, antebraço afinando;
  - tronco com ombro arredondado e cintura mais fina, manga arredondada, sombra em degradê suave.
  Rodada 3 (09/11, com a referência 6): cabeça oval e menor (0,66 com 0,86 de largura), rosto um pouco mais alto, braços e pernas mais finos (1,3), camiseta reta até o quadril, contorno de luz fino em volta do corpo (`contornoLuz3`). Rodada 2: cabeça menor (0,68), camiseta mais larga e comprida até o quadril, olho normal = oval escura (branco só no susto), sombra em degradê no rosto, braços e pernas, braços/pernas um pouco mais finos, mãos maiores, manga sem ombreira. Comparação em `previas/teste-rosto-3.png`. Usuário: "reajustar até pegar o resultado que eu goste".
- **Imagem de comparação com quadros de referência NUNCA vai para o Git** (bloqueio de 09/11). A folha `Comparar` (quadros da referência + nossos personagens) é renderizada só no rascunho; os quadros ficam em `estudio/public/tmp-ref*/` (ignorados). Motivo: material de terceiros fica só local.
- **Modelo oficial do Chede = boneco da imagem do usuário** (09/11, "crie um personagem 3D seguindo exatamente as proporções"): cabeça grande e redonda (escala 0,93, centro em −1346), olhos ovais pretos sem brilho, sobrancelhas em barra grossa, sem nariz, boca pequena, orelhas à mostra, cabelo curto em "bolinhas" (`CabeloBolinhas`), pescoço curto, tronco comprido e fino (`TRONCO3`), braços longos e finos (k 1,0), pernas longas e retas sem joelho marcado (k 1,15), bermuda estreita, tênis grande branco visto de frente com faixa preta, sombra suave em degradê e contorno de luz. Comparação lado a lado no rascunho (`Alvo`, imagem do usuário fica fora do Git em `estudio/public/tmp-alvo/`).
- **Chede tem que ser 3D de verdade, igual ao modelo do usuário** (09/11: "pega o meu design… esse modelo que eu te mandei é 3D"). O desenho 2D imitando o modelo foi recusado ("design feio"). Novo personagem em `estudio/src/personagens/Boneco3D.tsx` (esferas, cápsulas e caixas arredondadas, material fosco; cores tiradas da imagem do usuário). Teste lado a lado: still `TesteBoneco3D` (imagem do usuário fica fora do Git).
- **Personagens oficiais voltam ao desenho de antes nos episódios** (usuário, 09/11: "se ficar feio esquece tudo… vamos voltar para o nosso"). `Rosto3Ctx` agora vem DESLIGADO; as rodadas 2D ficam guardadas no código só como teste. O Chede 3D (`Boneco3D`) segue só como teste até o usuário aprovar.
- **Novo motor: skill "Animação do Chede"** (usuário, 12/11: "essa skill melhora a animação, use ela"; escolheu "Chede e Kaik no motor novo"). Projeto em `animacao-do-chede/` (motor 2D em Canvas, modo suave, cenários em perspectiva). Render ~4 min para 70 s (o Remotion levava ~5 h). Chede e Kaik recriados em `animacao-do-chede/personagens/{chede,kaik}` com a mesma identidade (camiseta laranja com bolso + bermuda preta; camiseta azul com faixa branca + bermuda vermelha). Foi preciso ensinar ao motor: bermuda, cabelo cacheado, bolso e faixa no peito.
- **Cabelo cacheado tem que ficar colado na cabeça e cobrir a testa e as têmporas** (usuário, 12/11: "o cabelo ficou fora da cabeça", "meio careca, o cabelo saindo pra fora"). Linha do cabelo baixa (−0,55, perto da sobrancelha), lateral descendo até a orelha (−0,3) e `estufa` baixa (0,05), senão a curva cria "asas" soltas com buraco entre o cabelo e o rosto. No motor da skill, o estilo `cacheado` agora usa topo com raio 0,53 (cabeça 0,47) e caracóis pequenos (amplitude 0,06); a nuca de costas desce até −0,2 para não sobrar faixa de pele.
- **Gato no colo, desenhado de frente, parece estampa no moletom** (usuário, 12/11). O gato fica no pé da personagem, encostado na perna e desenhado depois dela; a fala virou "O gato se enroscou no pé dela".
- **Parte 6 no motor da skill:** roteiro `animacao-do-chede/roteiros/chede/ep06.{json,js}`, Lia em `personagens/lia/lia.js`, fenda em `efeitos/fenda.js`. Prévia (voz grátis) renderiza em ~2 min. Infográficos ficam embaixo (y ≈ 1560), porque a legenda do motor fica no alto.
- **Troca de vista sem transparência e personagens em ordem de profundidade** (usuário, 12/11: "o Kaik fica por cima da personagem"; "quando trocam de 3/4, frente, lado, fica meio transparente"). No motor da skill, `personagemGirando` agora troca a vista direto (a mistura só volta com `window.MISTURA_VISTAS = true`). Nos planos, todo grupo de personagens passa por `emOrdem(cam, …)`, que desenha do mais longe para o mais perto da câmera.
- **Padrão de capa (usuário, 12/11: "toda vez que gerar esse estilo de capa")**, com a imagem de referência guardada só localmente em `referencias/capa-referencia-anime.jpg`. A capa segue sempre este modelo:
  - protagonista grande no centro, olhando para a câmera, com o poder na mão vindo para a frente;
  - dois personagens atrás, nas laterais, menores e mais escuros;
  - fundo roxo dramático com círculo de runas e silhueta da cidade;
  - título grande embaixo em letras metálicas (prata, com a palavra-chave em dourado) e brilho roxo;
  - selo "PARTE N" em moldura hexagonal com linhas laterais.
  Modelo pronto: plano `capaReels` em `animacao-do-chede/roteiros/chede/ep06.js`; gerar com `node motor/quadro.js roteiros/chede/capa-reels.json roteiros/chede/ep06.js capaReels <saida.png>`.
- **Voz final no motor da skill:** gerar a narração inteira de uma vez (tom igual), alinhar com `estudio/scripts/alinhar.py` e cortar por fala em `animacao-do-chede/audio/<serie>/<ep>/vozes/final/<id>.wav`. Não usar `afade=t=out:st=0` no corte (deixa o arquivo mudo). Falas maiores que 3 s ganham `duracao` = fala + 0,25 s.
- **Nome da série: FENDA** (escolha do usuário, 12/11). Daqui pra frente:
  - na capa, o logo "FENDA" fica no alto (y ≈ 330), com o rasgo roxo atrás do texto, nunca cobrindo as letras;
  - na descrição, o título começa com "🌀 FENDA ·" e a hashtag #Fenda entra primeiro.
- **Skill "Animação do Chede" atualizada** (usuário, 12/11: "atualiza a skill e me passa"). A versão nova fica em `skill-animacao-do-chede/` e no zip `prontos/skill-animacao-do-chede.zip`. Ela traz:
  - o motor com as correções (troca de vista direta, bermuda, cacheado, bolso, faixa);
  - Chede, Kaik e Lia com fichas, e o efeito `fenda`;
  - a Parte 6 como modelo e o padrão de capa;
  - as regras novas no SKILL.md.
  Ela foi testada instalando do zero (folha de teste e capa geradas). A cópia sincronizada em `/root/.claude/skills/synced/` não foi alterada; para trocar a skill da conta, o usuário sobe o zip.
- **Final de temporada pode ter 2min40 a 3min** (usuário, 14/11). Vale só para o final da temporada; os episódios normais continuam com até 1min15. Com o motor da skill o render é rápido, então a duração não pesa.
- **Lesão em cena de luta = raio-X, sem sangue** (pedido do usuário: "o osso trincando"). Mostrar o impacto em câmera lenta e o osso trincando num infográfico de raio-X, no estilo das referências.
