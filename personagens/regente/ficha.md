# O Regente — Otávio Regis (vilão) · ficha

> Regra obrigatória: em todo vídeo o Regente segue esta ficha. Personagem original.

| Item | Definição |
|---|---|
| Quem é | Otávio Regis, **35 anos**. Em público é um assessor discreto do governo que ninguém nota; na verdade é ele quem manda. Apelido entre os agentes: **o Regente** (quem governa no lugar do rei). |
| Personalidade | Calmo, educado, nunca levanta a voz. Sorri pouco. Acha que pessoas com poder são "recursos" que ele precisa catalogar ou controlar. |
| Pele | Clara `#E3B993` (sombra `#C29673`) |
| Barba | Preta, curta e bem aparada, contornando o queixo, com bigode fino |
| Cabelo | Preto `#17140F`, lambido / penteado para trás |
| Roupa | Terno grafite `#2B2E38`, camisa branca, **gravata âmbar** `#E8A317`, broche triangular âmbar na lapela, sapato social preto |
| Poder | **Controle mental.** Olhos ficam âmbar brilhante `#FFB21E` e saem ondas âmbar da cabeça (`efeitos/ControleMental.tsx`). |

## Regras do poder (aprovadas pelo usuário em 07/11)
1. **Gatilho:** só controla quem olha nos olhos dele ou ouve a voz dele.
2. **Limite:** controlar muita gente cansa. Por isso controla poucos no topo do governo e eles mandam no resto.
3. **Sinal:** quem está sob controle tem um **anel âmbar na íris** (pose `controlado: 1`). O público aprende a reconhecer.
4. **Fraquezas possíveis:** o Kaik é mais rápido que o comando chegar ao cérebro (tempo de reação); o "outro lugar"
   do Chede pode ser fora do alcance da mente dele.

## Como usar no código
- `estudio/src/personagens/Regente.tsx`: `<Regente/>`, `<CabecaRegente/>`, `APARENCIA_REGENTE`, `COR_PODER_REGENTE`.
- Olhos com poder: `pose={{ olhosPoder: 1 }}`. Pessoa controlada (qualquer personagem): `pose={{ controlado: 1 }}`.
- Ondas: `<OndasMentais x y forca escala />` em `estudio/src/efeitos/ControleMental.tsx`.
- Na Parte 3: mostrar só silhueta, olhos âmbar e voz; rosto inteiro mais tarde (revelação).

Imagem: `ficha.png`.
