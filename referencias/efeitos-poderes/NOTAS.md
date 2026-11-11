# Referências: efeitos de poderes

**O que agradou:** os efeitos especiais de poderes — muito brilhantes, coloridos e com energia.

| Arquivo | O que mostra | Pontos a aproveitar |
|---|---|---|
| `01-explosao-arco-iris-cristais-sequencia.jpg` | Sequência de um poder: cometa → impacto no chão → vórtice → explosão/chama → onda curvada | Cores arco-íris saturadas sobre preto, lascas/cristais, faíscas em estrela, reflexo no chão; mostra as etapas (lançar, impactar, explodir, dissipar) |
| `02-brilho-roxo-aneis-estrela-spritesheet.jpg` | Spritesheet quadro a quadro de um brilho roxo | Núcleo branco + aura violeta, anéis girando, estrela de 4 pontas, e o efeito encolhendo até sumir num ponto |
| `03-poderes-magia-escudos-tornado-runas.jpg` | Silhuetas usando poderes: esferas, cúpula/escudo rosa, tornado azul, nuvem de impacto, círculo de runas, rajadas com anéis | Efeito ligado à pose do personagem; círculos mágicos no chão; tornado de anéis; poeira no chão; rosa e azul ciano |
| `04-projeteis-fogo-raio-veneno.jpg` | Três projéteis: fogo laranja, raio azul, veneno verde | Cabeça brilhante + cauda que se desfaz, partículas soltas, raios em zigue-zague no azul, brilho em volta (bloom) |
| `05-pixel-art-orbes-meteoros-explosoes-raios.jpg` | Catálogo em pixel art: orbes elétricos, cúpulas de explosão, meteoros, buraco negro, bola de fogo, caveira verde, raio caindo no chão | Contorno escuro/aura em volta de cada efeito, explosão dentro de cúpula, raios brancos finos por cima de orbes, variedade de elementos |
| `06-rajada-vermelha-circulo-runas-pentagrama.jpg` | Duas rajadas vermelhas: anéis de choque em "C" + laser fino com ponta de flecha; círculo de pentagrama com runas + explosão e fita vermelha | Estilo flat (sem degradê) com só um pouco de brilho; labaredas brancas/creme atrás (recuo do disparo); anéis de choque ao longo do raio; círculo mágico na frente da mão |
| `07-projeteis-cartoon-agua-fogo-laser-veneno.jpg` | Projéteis cartoon: bolha de água azul, rajada de fogo, laser rosa grosso, explosão de veneno verde | Formas chapadas com bordas recortadas e gotas soltas, núcleo claro, aura colorida; o laser com faixas internas mais claras |
| `08-raio-azul-laser-cortes-crescente-roxo.jpg` | Carga azul com faíscas → laser grosso branco-azulado; golpes em crescente roxo; lâminas de corte | Carga antes do disparo, laser com núcleo branco e borda azul, cortes em arco (slash) com gradiente roxo-ciano, poeira cinza no chão acompanhando o movimento |

## Como isso entra no motor
- Efeitos montados em camadas com mistura aditiva: núcleo branco, cor principal, aura desfocada e partículas.
- Cada poder em etapas: carregar → lançar (projétil com cauda) → impacto (flash + onda + faíscas) → dissipar.
- Peças reutilizáveis: anel girando, estrela de 4 pontas, cauda de partículas, raio em zigue-zague, círculo de runas, tornado de anéis, cúpula de escudo, nuvem de poeira, lascas em arco-íris.
- Paletas por elemento: fogo (laranja), raio (azul ciano), veneno (verde), arcano (roxo/rosa), sangue/demoníaco (vermelho + creme), água (azul), arco-íris.
- Mais peças: anel de choque em "C", laser com núcleo branco, golpe em crescente (slash), labareda de recuo, bolha/gota, cúpula de explosão, buraco negro.
- Estilo base flat: formas chapadas com bordas recortadas e pouco degradê, e o brilho só em volta (aura) — combina com o recorte (cut-out) dos personagens.
