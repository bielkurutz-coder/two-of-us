# Two Of Us

**Uma playlist que virou um CD. Um CD que virou uma forma de dizer o que sinto.**

Two Of Us é um presente digital feito com carinho: um site interativo que recria a experiência de abrir um estojo de CD, colocar o disco para tocar e folhear o encarte enquanto a música acompanha a leitura.

[Abrir a experiência](https://bielkurutz-coder.github.io/two-of-us/)

## Por que este site existe

Este projeto faz parte de uma surpresa para a garota que quero pedir em namoro. O pedido será feito por uma carta. Dentro do envelope, junto dela, haverá um pequeno papel com um QR Code que leva até este site.

As músicas vieram de uma playlist especial que construímos juntos enquanto nos conhecíamos. Cada uma guarda alguma coisa desse caminho: uma recomendação, uma conversa, uma descoberta ou um sentimento que passou a ter a voz de uma canção. Com o tempo, aquela seleção ganhou um significado que eu quis guardar de um jeito mais pessoal.

Foi daí que nasceu a ideia de transformar a playlist em um álbum que ela pudesse abrir, ouvir e explorar. Dediquei tempo aos detalhes para que a experiência tivesse o cuidado de um presente feito à mão. O estojo, o disco, as páginas e os pequenos textos fazem parte da mesma intenção: aquecer o coração dela e mostrar o quanto esse começo importa para mim.

Há também uma última surpresa no final do encarte: uma música escolhida para dizer um pouco mais sobre o que sinto. O nome fica guardado para quem chegar até lá.

## Um CD para abrir com calma

A experiência foi pensada principalmente para o celular na vertical, de preferência com fones de ouvido.

Tudo começa com um estojo fechado. Ao tocar na capa, ele se abre e revela o disco e o livreto. O disco gira enquanto as músicas tocam na ordem escolhida; o encarte pode ser retirado e folheado, com comentários sobre as faixas e uma mensagem pessoal perto do fim. Alguns detalhes convidam a explorar um pouco mais, como a Polaroid escondida na logo.

A direção visual se inspira no clima de *Rubber Soul*, dos Beatles: tons de outono, papel com textura, letras manuscritas e a sensação de um objeto que você teria vontade de guardar. A última página traz um pequeno player em forma de fita cassete para acompanhar a revelação final.

A ideia é que ela possa ouvir com calma, reconhecer a nossa história nas músicas e voltar a esse presente quando quiser.

## Se você encontrou este repositório por acaso

Talvez, para quem chega de fora, este seja apenas mais um projeto no GitHub. Para mim, ele faz parte de um momento muito importante: criar coragem para colocar sentimentos em palavras e preparar algo especial para alguém de quem gosto.

Por isso, deixo um pedido sincero: **por favor, trate este projeto e essa surpresa com carinho. Peço que não denuncie o repositório por impulso ou por brincadeira, sem considerar o contexto afetivo por trás dele.** Existe muita dedicação aqui, além da expectativa de entregar uma lembrança que possa fazer alguém sorrir.

Se você conhecer a pessoa que vai receber o presente, peço também que preserve a surpresa. Deixe que ela descubra o site pelo QR Code, no momento da carta.

Se houver alguma preocupação legítima com o conteúdo, você pode abrir uma issue neste repositório, sem expor informações pessoais, para que eu possa entender e buscar uma solução. Esse pedido de compreensão também vem acompanhado de respeito pelo trabalho de quem criou as músicas e as imagens presentes na experiência.

O projeto tem uma finalidade pessoal e afetiva, sem fins comerciais. As canções são dos respectivos artistas e compositores; aqui, elas acompanham lembranças e sentimentos que construímos ao ouvi-las.

Obrigado por olhar para este pequeno presente com gentileza e por ajudar a preservar o momento para o qual ele foi feito.

<details>
<summary>Informações técnicas e manutenção</summary>

## Como funciona

Site estático em HTML, CSS e JavaScript, publicado no GitHub Pages. Não exige compilação. Os caminhos são relativos, e as fontes ficam hospedadas no próprio projeto.

```text
two-of-us/
├── index.html
├── README.md
├── ARTWORK_PROMPTS.md
├── css/
│   └── style.css
├── js/
│   ├── data.js
│   ├── app.js
│   ├── player.js
│   └── booklet.js
└── assets/
    ├── audio/
    ├── fonts/
    └── img/
```

## Onde editar

- **Conteúdo:** `js/data.js` reúne textos, faixas, descrições, imagens, notas da Polaroid e organização do livreto.
- **Aparência:** `css/style.css` reúne os estilos, temas e animações.
- **Interações:** `js/app.js`, `js/booklet.js` e `js/player.js` controlam a experiência, o livreto e os áudios.
- **Arquivos:** músicas em `assets/audio/`, imagens em `assets/img/` e fontes locais em `assets/fonts/`.
- **Página de fotos:** para reativá-la, troque `enabled: false` por `enabled: true` (ou remova a flag) na entrada `type: "photos"` de `booklet.pages`, em `js/data.js`.
- **Faixa surpresa:** permanece apenas em `bonusTrack`; não deve ser duplicada em `tracks`.

Para testar localmente, execute `python3 -m http.server 8000` na pasta do projeto e abra `http://localhost:8000`.

As entregas deste projeto devem incluir o pacote completo atualizado, mantendo juntos o HTML e as pastas de estilos, scripts e recursos.

</details>
