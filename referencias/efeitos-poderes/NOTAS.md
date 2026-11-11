# Referências: efeitos de poderes

**O que agradou:** os efeitos especiais de poderes — muito brilhantes, coloridos e com energia.

| Arquivo | O que mostra | Pontos a aproveitar |
|---|---|---|
| `01-explosao-arco-iris-cristais-sequencia.jpg` | Sequência de um poder: cometa → impacto no chão → vórtice → explosão/chama → onda curvada | Cores arco-íris saturadas sobre preto, lascas/cristais, faíscas em estrela, reflexo no chão; mostra as etapas (lançar, impactar, explodir, dissipar) |
| `02-brilho-roxo-aneis-estrela-spritesheet.jpg` | Spritesheet quadro a quadro de um brilho roxo | Núcleo branco + aura violeta, anéis girando, estrela de 4 pontas, e o efeito encolhendo até sumir num ponto |
| `03-poderes-magia-escudos-tornado-runas.jpg` | Silhuetas usando poderes: esferas, cúpula/escudo rosa, tornado azul, nuvem de impacto, círculo de runas, rajadas com anéis | Efeito ligado à pose do personagem; círculos mágicos no chão; tornado de anéis; poeira no chão; rosa e azul ciano |
| `04-projeteis-fogo-raio-veneno.jpg` | Três projéteis: fogo laranja, raio azul, veneno verde | Cabeça brilhante + cauda que se desfaz, partículas soltas, raios em zigue-zague no azul, brilho em volta (bloom) |

## Como isso entra no motor
- Efeitos montados em camadas com mistura aditiva: núcleo branco, cor principal, aura desfocada e partículas.
- Cada poder em etapas: carregar → lançar (projétil com cauda) → impacto (flash + onda + faíscas) → dissipar.
- Peças reutilizáveis: anel girando, estrela de 4 pontas, cauda de partículas, raio em zigue-zague, círculo de runas, tornado de anéis, cúpula de escudo, nuvem de poeira, lascas em arco-íris.
- Paletas por elemento: fogo (laranja), raio (azul ciano), veneno (verde), arcano (roxo/rosa), arco-íris.
