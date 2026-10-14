# Two Of Us · pacote completo v04

Base estática de uma experiência de álbum em CD. HTML, CSS e JavaScript puros; sem instalação, compilação, serviços externos ou fontes remotas.

## Abrir e publicar

Este é o **pacote completo v04**: `two-of-us-v04-completo.zip`. Extraia o ZIP inteiro em uma pasta nova e abra `two-of-us-v04/index.html` no navegador. Feche a aba da versão anterior antes de abrir esse arquivo. Esta versão inclui as 34 músicas reais e o livreto ampliado, com a mesma capa, disco laranja e bandeja creme. Não é necessário aplicar nenhum ZIP incremental. Mantenha `css`, `js` e `assets` junto do HTML. A pasta `js` precisa conter `data.js`, `player.js`, `booklet.js` e `app.js`: sem os dois scripts intermediários, a capa pode aparecer, mas o estojo não abre.

O HTML usa `?v=20261013-v04` nos caminhos de CSS e scripts para solicitar esta versão desses arquivos. Em futuras entregas, atualize esse identificador e os nomes do ZIP e da pasta principal, mantendo os caminhos relativos.

Neste projeto, todas as próximas entregas devem incluir o pacote completo atualizado, mesmo quando a alteração envolver poucos arquivos.

Para testar por HTTP, execute `python3 -m http.server 8000` dentro da pasta e abra `http://localhost:8000`.

Para o GitHub Pages, coloque **o conteúdo** desta pasta na raiz da pasta que você publicar, com `index.html` no nível inicial. Todos os recursos usam caminhos relativos e funcionam em uma URL de subpasta. O arquivo `.nojekyll` acompanha o projeto. Nada foi publicado por esta entrega.

## Arquivos

```text
two-of-us-v04/
├── index.html
├── README.md
├── ARTWORK_PROMPTS.md
├── .nojekyll
├── css/
│   └── style.css
├── js/
│   ├── data.js
│   ├── app.js
│   ├── player.js
│   └── booklet.js
└── assets/
    ├── img/
    │   ├── cover.png
    │   ├── cover-front.jpg
    │   ├── logo-two-of-us.png
    │   ├── disc-print.png
    │   ├── disc-label.jpg
    │   ├── page-paper.png
    │   ├── back-inlay.png
    │   ├── photo-01.svg
    │   ├── photo-02.svg
    │   └── favicon.svg
    └── audio/
        ├── 01-master-of-none.mp3
        ├── 02-scott-street.mp3
        ├── 03-two-ghosts.mp3
        ├── 04-daylight.mp3
        ├── 05-in-my-room.mp3
        ├── 06-two-of-us.mp3
        ├── 07-wonderwall.mp3
        ├── 08-the-greatest.mp3
        ├── 09-style-taylors-version.mp3
        ├── 10-midnight-pretenders.mp3
        ├── 11-as-you-are.mp3
        ├── 12-scared-to-live.mp3
        ├── 13-after-hours.mp3
        ├── 14-nothings-gonna-hurt-you-baby.mp3
        ├── 15-unknown-delight.mp3
        ├── 16-somebody.mp3
        ├── 17-guilty-as-sin.mp3
        ├── 18-fallen-star.mp3
        ├── 19-small-worlds.mp3
        ├── 20-better-in-the-dark.mp3
        ├── 21-lovely-rita.mp3
        ├── 22-grapejuice.mp3
        ├── 23-there-is-a-light-that-never-goes-out.mp3
        ├── 24-halleys-comet.mp3
        ├── 25-head-over-heels.mp3
        ├── 26-supercut.mp3
        ├── 27-wildest-dreams.mp3
        ├── 28-cant-take-my-eyes-off-you.mp3
        ├── 29-dancing-in-the-flames.mp3
        ├── 30-the-craving.mp3
        ├── 31-nothings-gonna-stop-us-now.mp3
        ├── 32-cherry-flavoured-love-inside-your-heart.mp3
        ├── 33-make-you-mine.mp3
        └── 34-this-is-what-falling-in-love-feels-like.mp3
```

## Onde editar

Todo o conteúdo do álbum está em **`js/data.js`**:

| Campo | O que você altera |
| --- | --- |
| `title`, `artist`, `subtitle` | Nome do álbum, artista e subtítulo |
| `images` | Caminhos da logo, capa, disco, papel, encarte e miniatura da faixa extra |
| `tracks` | Ordem das faixas públicas, títulos, arquivos, duração e descrições |
| `bonusTrack` | A faixa extra, definida uma única vez e acrescentada automaticamente ao fim do disco |
| `credits` | Funções e nomes dos créditos |
| `photos` | Caminho, texto alternativo e legenda das fotografias |
| `booklet.pages` | Páginas comuns e sua ordem; tipos `tracks`, `photos`, `credits` e `note` |
| `booklet.bonusPage` | Texto de abertura da última página; ela é acrescentada automaticamente |

Exemplo de uma faixa:

```js
{ id: "track-01", title: "Your title", file: "assets/audio/your-song.mp3", durationHint: 187, description: "Your description." }
```

`durationHint` usa **segundos** e serve de indicação até o navegador ler a duração real. Coloque seus áudios em `assets/audio/`; MP3 é uma escolha prática para distribuição. Troque o caminho e a extensão em `file` quando necessário. Respeite maiúsculas e minúsculas dos nomes dos arquivos.

A ordem de `tracks` controla o disco. Cada página de músicas seleciona as faixas pelos respectivos `trackIds`: ao acrescentar faixas, inclua seus IDs nas páginas desejadas. Para manter a leitura confortável, use aproximadamente três descrições curtas por página. `photoIds` funciona da mesma forma para imagens. Você pode adicionar ou remover páginas normais livremente. **Não coloque a faixa extra em `tracks` nem em uma página comum.**

As imagens são arquivos independentes: substitua-as ou altere os caminhos em `images` e `photos`. A capa atual é `cover-front.jpg`, usada no estojo e no livreto; a logo do cabeçalho é `logo-two-of-us.png`; a arte laranja do disco é `disc-label.jpg`. As três imagens foram fornecidas por você e preservadas sem edição. `cover.png` permanece como arte provisória do player extra; `disc-print.png` é a arte anterior, sem uso na interface atual. O recorte circular e o furo do disco são feitos em CSS. O fundo das páginas é claro para preservar a leitura. A bandeja usa creme `#e5dbc3`; o encarte `back-inlay.png` está oculto por `display: none` em `.back-inlay`. Editar `title` muda o título da aba; o texto desenhado na logo e na capa faz parte das imagens.

## Fluxo e controles

- Toque no estojo para abri-lo. Livreto à esquerda, disco à direita.
- As setas desaparecem juntas ao tocar no disco ou no livreto pela primeira vez na visita. Recarregar faz elas reaparecerem. O pequeno ícone × abaixo da barra de tempo fecha o estojo.
- Toque no disco para reproduzir, pausar ou continuar. As faixas avançam automaticamente na ordem definida, incluindo a extra no final. Ao terminar, um novo toque recomeça o álbum.
- Toque no livreto para retirá-lo. Deslize horizontalmente, toque nas bordas ou use as setas. Textos longos permitem rolagem vertical dentro da página.
- A última página revela a faixa extra e seu player independente. Ele pausa o disco e possui play/pause, anterior/próxima, barra de posição e tempos. Como existe só uma faixa nesse player, **anterior e próxima reiniciam a mesma faixa**; não navegam pelo disco. A reprodução termina ao fim, sem repetição automática.
- Sair da página extra ou guardar o livreto pausa o áudio extra. Abrir o livreto enquanto o disco toca mantém o disco tocando até você iniciar o player extra. Fechar o estojo pausa ambos.
- Teclado: Tab, Enter/Espaço; setas esquerda/direita para páginas; Escape para guardar o livreto. O modal mantém o foco e o devolve ao botão de origem.
- O livreto lembra a página e os áudios lembram a posição durante a visita. Recarregar a página reinicia a experiência. Nenhuma reprodução começa sozinha.

## Escolhas provisórias desta fase

1. Identidade atual **Two Of Us**, logo e capa fornecidas por você. Subtítulo: **Nosso primeiro disco, de muitos · Gravado entre maio e setembro de 2026**. O nome de artista do álbum, os textos internos, as fotos e os créditos continuam provisórios; as 34 faixas já são reais.
2. 33 faixas públicas e uma extra, nos MP3 fornecidos por você. Correspondência conferida no `TRACKLIST.md` incluído no ZIP e nos metadados internos. Arquivos renomeados sem recodificação nem alteração de conteúdo; todos os sete WAV de demonstração foram removidos. As descrições continuam como `[Texto provisório]`.
3. 15 páginas internas: 11 páginas com três faixas cada, uma de fotos, uma de créditos, uma carta e a revelação final. Capa separada, duas vagas de fotografias e cinco funções de crédito.
4. Artes provisórias originais geradas por IA para páginas, encarte e miniatura extra; nenhuma fotografia ou capa dos Beatles foi usada. Prompts da geração inicial em `ARTWORK_PROMPTS.md`. A capa principal e a arte do disco foram substituídas pelas imagens fornecidas por você. A bandeja usa creme `#e5dbc3`, com encarte oculto e reflexos do disco suavizados.
5. Logo original renderizada como imagem; interface em Georgia e Arial/Helvetica do sistema. Sem downloads de fontes ou dependências externas.
6. Projeto orientado a retrato, ajustado a 390 × 844 e larguras menores. A proporção se adapta à altura disponível; não força matematicamente 9:16, pois 390 × 844 é mais alto que essa proporção. Desktop mantém uma coluna de até 480 px. Em paisagem, preserva a composição vertical com rolagem, sem tentar bloquear a orientação do aparelho.
7. Estojo fechado quadrado de até 310 px. Aberto, as duas metades são reduzidas para caber lado a lado. O livreto retirado cresce para facilitar a leitura; é uma página por vez.
8. Animações CSS de dobradiça, retirada, capa e páginas. A preferência `prefers-reduced-motion` remove os movimentos, inclusive o giro do disco.
9. Faixa extra ausente das listas públicas; é revelada na última página e também é o último áudio do disco. A tela do estojo mantém apenas logo, subtítulo, volume, setas iniciais, tempo e ícone de fechamento. Em um site estático, o código e os arquivos continuam inspecionáveis: a surpresa é narrativa.
10. Controles anterior/próxima do player extra repetem sua única faixa. O disco não tem botão de pular faixas nesta fase.
11. Não há persistência entre visitas, integração real com Spotify, contas, métricas, backend ou publicação. O mini player tem apenas uma linguagem visual semelhante.
12. Áudio ausente ou incompatível mostra uma mensagem e permite tentar novamente; não pula silenciosamente faixas da sequência. A duração real substitui a indicação provisória quando disponível.

## Conferência dos áudios nesta entrega

- Sequência de 34 entradas: `track-01` a `track-33`, seguidas de `bonusTrack` uma única vez. A montagem `[...data.tracks, data.bonusTrack]` permanece em `app.js`.
- A faixa extra não faz parte de `tracks` nem dos `trackIds` das páginas comuns; é revelada apenas na última página do livreto.
- Os 33 IDs públicos aparecem uma única vez, em ordem, nas 11 páginas de músicas. Fotos, créditos, carta e bônus continuam depois delas.
- Durações medidas com `ffprobe` e arredondadas ao segundo inteiro mais próximo para `durationHint`. O navegador usa a duração real assim que carrega os metadados.
- Pasta `assets/audio/`: **328.221.620 bytes (328,22 MB / 313,02 MiB)**. Maior arquivo: `13-after-hours.mp3`, **14.443.751 bytes (14,44 MB)**. Nenhum arquivo ultrapassa 100 MB, e o total está abaixo de 1 GB.
- Títulos preservados exatamente como você os forneceu. Apóstrofos são removidos apenas dos nomes de arquivo; os demais separadores viram hífens. Os MP3 e suas extensões foram mantidos.
- `app.js`, `player.js`, `booklet.js` e `style.css` preservados. O identificador de versão no HTML foi atualizado para evitar dados antigos em cache.

## Verificação manual após trocar arquivos

Nesta entrega, Chromium carregou os 34 MP3 e confirmou sua sequência usando o fim natural de cada áudio após avançar para os últimos instantes. Foram verificadas as 15 páginas do livreto, os 33 títulos públicos sem duplicação, a revelação final, a pausa do disco ao iniciar o player extra e a busca na faixa extra. Não houve erros de JavaScript nem arquivos ausentes. O livreto foi conferido em 390 × 844 e 320 × 568, incluindo movimento reduzido, sem transbordamento horizontal. Os testes não consistiram em ouvir integralmente todas as músicas.

Abra o estojo, reproduza o disco, confirme a passagem entre duas faixas, explore as 15 páginas e teste a faixa extra com o disco tocando. Verifique a barra de posição, as imagens e os nomes dos arquivos. Os testes automatizados são feitos em Chromium; aparelhos físicos iOS/Android e Brave não foram testados neste ambiente.
