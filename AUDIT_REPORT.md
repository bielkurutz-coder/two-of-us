# Auditoria de polimento e desempenho — 16/10/2026

Comparação com o commit `88d84f2f17ca81369c12a2297eba1e13def2ad88`. Esta atualização preserva textos, faixas, ordem, agrupamento das páginas, fontes, cores e desenho das interações. As imagens foram recodificadas, sem novos recortes ou efeitos; os 34 MP3s permanecem idênticos.

## Problemas encontrados e correções

As linhas abaixo referem-se à versão entregue.

| Problema | Causa confirmada | Arquivo / linha | Correção | Situação |
|---|---|---|---|---|
| Cassette aparecia tarde, com área clara antes da imagem | PNG de 2.563.436 bytes dentro de um template; download começava apenas na página final | `index.html:121`, `js/booklet.js:78,416`, `css/style.css:354` | WebP com transparência, 95.424 bytes; preparo ao abrir o livreto e `decode()` antes de exibir imagem, texto e bobinas. O papel permanece visível durante a espera | Corrigido nos testes |
| A cassette era reconstruída ao terminar a virada | A página de destino era renderizada por baixo da folha e novamente no fim da animação | `js/booklet.js:358,431` | Reutilizar o conteúdo já decodificado, preservando controles e eventos | Corrigido |
| Download de imagem que nunca aparecia | `.back-inlay` tinha `display: none`, mas recebia `src` | `index.html:45`, `js/app.js:47`, `js/data.js:6` | Remover elemento, binding e campo sem uso; retirar arquivo de 2.432.231 bytes | Corrigido |
| Imagens muito maiores que o necessário | PNGs de papel/logo e artes antigas permaneciam no pacote | `assets/img/`, `js/data.js:6` | Recodificar os recursos usados e retirar quatro artes sem uso; preservar foto da Polaroid e SVGs da página de fotos desativada | Corrigido |
| Possibilidade de imagens e fonte aparecerem depois da interface | Ausência de aquecimento/decodificação antes de liberar as telas | `js/app.js:32,47–52,75–80`, `js/booklet.js:90` | Carregar imagens e pesos 400/600/700 da Caveat durante o aviso; aguardar recursos necessários antes de mostrar estojo/livreto. Nenhum áudio é pré-carregado no aviso | Corrigido nos cenários testados |
| Primeiro fundo podia ser branco antes do CSS | A cor do documento dependia exclusivamente da folha externa | `index.html:9` | Cor crítica clara/escura no próprio HTML, consistente com os temas existentes | Corrigido |
| Dimensões de imagens não eram explícitas no HTML | Dependência do carregamento da imagem para sua proporção intrínseca | `index.html:39–121`, `css/style.css:184,354` | Dimensões explícitas, proporção reservada para cassette; proporção original da logo mantida | Corrigido; CLS 0 |
| Espera de rede na troca de músicas | Próxima fonte só era aberta no evento `ended` | `js/player.js:51–90` | Buscar somente a próxima faixa nos últimos 90 s, quando a atual tem buffer suficiente; promover o Blob no mesmo elemento de áudio já autorizado. Descartar pedidos/URLs antigos | Corrigido quanto à espera de rede medida |
| Disco podia aparentar tocar durante falta de dados | `isPlaying` considerava apenas paused/ended/error, sem waiting/readyState | `js/player.js:19–27,47,118`, `js/app.js:282–289`, `js/booklet.js:451` | Tratar `waiting`/`stalled`, manter pausa/toggle coerentes e deixar o navegador retomar quando os dados chegam | Corrigido; retomada automática confirmada |
| Barra de progresso causava layout a cada atualização | Animação de `width` | `css/style.css:233`, `js/app.js:289` | Mesmo preenchimento visual com `transform: scaleX()` | Corrigido |
| Trabalho repetido na montagem das folhas | Inserção e `scrollTop` intercalados para cada uma das seis tiras | `js/booklet.js:258–283,315` | Inserir todas as tiras juntas; aplicar rolagem depois; reduzir escritas nos gradientes ocultos | Melhorado; 60 fps constantes ainda não atingidos |
| Toque no livreto podia falhar após um flick no disco | Sequência touch recebia pointerup, mas não o compatibility click | `js/app.js:423–443` | Aceitar também liberação de toque estacionário, com limite de movimento e deduplicação pelo estado do livreto | Corrigido e reproduzido com eventos touch |
| Toque duplo na logo abria e fechava a Polaroid | Segundo toque atingia o backdrop recém-aberto | `js/app.js:187,203` | Ignorar fechamento pelo backdrop durante a entrada; manter demais formas de fechar | Corrigido |
| Abertura pendente do livreto podia sobreviver ao fechamento do estojo | Espera por recursos/extrair livreto sem cancelamento | `js/booklet.js:86–129`, `js/app.js:302` | Invalidar abertura pendente e cancelar timer ao fechar | Corrigido; teste com fonte deliberadamente pendente |
| Foco podia ficar em seta desativada/oculta | Botão focado desaparecia na última página | `js/booklet.js:438–440` | Transferir foco para a página sem rolar | Corrigido |
| Cache podia combinar scripts e CSS de versões diferentes | Tokens antigos e diferentes entre os arquivos | `index.html:13–19` | Um mesmo token `20261016-polish-1` nos cinco recursos, com comentário para incrementá-lo na próxima atualização | Corrigido para novas navegações; veja limite sobre abas antigas |

## Medições antes e depois

Playwright/Chromium headless, viewport 390×844, DPR 3, tema claro; rede limitada a 200.000 bytes/s de download, 93.750 bytes/s de upload e 150 ms de latência; CPU 4×. Cache vazio no início. Os números abaixo são uma execução comparável por versão, não uma média de vários aparelhos. Bytes de transferência incluem os cabeçalhos contabilizados pelo navegador. LCP mede o aviso inicial, não todo o álbum.

| Medida | Antes | Depois |
|---|---:|---:|
| Transferência inicial, sem áudio | 5.932.962 bytes | 587.692 bytes |
| LCP do aviso | 908 ms | 1128 ms |
| CLS | 0 | 0 |
| Fonte do livreto pronta antes de sair do aviso | Não | Sim |
| Cassette pronta na chegada à página final | Não | Sim |
| Download da cassette em rede limitada | 12.979 ms | 626,5 ms |
| Imagens na pasta | 15.037.726 bytes | 609.283 bytes |
| FPS médio: abrir estojo | 60,00 | 59,51 |
| FPS médio: abrir livreto | 52,42 | 53,55 |
| FPS médio: sequência de 12 viradas | 50,65 | 52,12 |
| Tarefas >50 ms durante as viradas | 5; maior: 106 ms | 3; maior: 57 ms |
| Percentil 95 do intervalo entre quadros nas viradas | 33,4 ms | 33,4 ms |
| Erros JS, 404s e promises rejeitadas no fluxo testado | — | 0 |

A transferência inicial caiu aproximadamente **90,1%**, e a pasta de imagens, **95,9%**. O LCP desta execução aumentou 220 ms; não há alegação de melhora dessa métrica. O aquecimento da fonte e das imagens evita sua aparição tardia após o aviso. A diferença média por canal entre capturas antes/depois do aviso, da primeira página e da cassette ficou abaixo de 1 em uma escala 0–255; isso quantifica a pequena alteração de compressão, não significa identidade pixel a pixel.

As viradas mantêm as seis tiras, a textura, o relevo e os gradientes existentes. A montagem ficou mais barata, mas ainda houve quadros perdidos no renderizador de software sob CPU 4×. Não foi comprovado 60 fps constantes em aparelho intermediário real.

### Áudio

Em uma sessão dedicada, com a faixa atual já disponível localmente e a próxima vindo da rede limitada a 200.000 bytes/s / 150 ms:

| Transição | Antes | Depois |
|---|---:|---:|
| Faixa 01 → 02, intervalo de `ended` até `playing` | 487,1 ms | 4,8 ms |
| Faixa 33 → 34, incluindo a faixa oculta | Não medido | 3,8 ms |

A fonte seguinte foi confirmada como Blob já preparado. Os valores não medem silêncio presente na própria gravação, a latência da saída de som ou reprodução sample-accurate. Uma rede mais lenta que o consumo, uma busca direta ao fim da música ou falha no download ainda podem exigir carregamento normal. Em uma simulação de 10.000 bytes/s, o estado de espera foi detectado; restaurar a rede retomou o som sem novo toque, sem promises rejeitadas. O disco e os atributos acessíveis refletiram a espera e a retomada.

A implementação conserva o mesmo `HTMLAudioElement`, sem criar um segundo elemento que precisaria de nova autorização em alguns celulares. Há no máximo um próximo arquivo preparado e uma URL Blob atual; as URLs anteriores são revogadas. A playlist segue com 34 entradas, incluindo a faixa bônus somente uma vez no final. O final do álbum foi verificado.

### Lighthouse

O Lighthouse móvel executou parcialmente, mas o Chromium disponível não forneceu screenshots de trace (`NO_SCREENSHOTS`). Speed Index e a nota geral ficaram indisponíveis. No resultado parcial final: transferência 5.932.002 → 586.731 bytes; CLS 0 → 0; TBT 0 → 0; LCP simulado 1.501,9 → 3.829,6 ms. A divergência em relação ao LCP observado no Playwright exige uma execução completa em Chrome normal antes de concluir sobre o LCP simulado. Não se apresenta uma nota de desempenho válida nem se descarta esse resultado desfavorável.

## Inventário de imagens

Tamanhos em bytes. Medidas de apresentação em CSS pixels a 430px de largura; DPR 3 exige aproximadamente três pixels de imagem por CSS pixel. A rotação pode ampliar o retângulo envolvente sem ampliar a própria textura.

| Arquivo anterior → atual | Bytes antes → depois | Resolução antes → depois | Maior uso / decisão |
|---|---:|---|---|
| `cassette.png` → `cassette.webp` | 2.563.436 → 95.424 | 1536×1024 → 936×624 | 312×208; 936×624 atende 3×. Escolhidos 936px, em vez de ~700, ainda abaixo de 100 KB. |
| `logo-two-of-us.png` → `logo-two-of-us.webp` | 895.421 → 85.540 | 1352×1163 → 420×361 | 116×100; alvo ≈349×300. Alpha e bordas preservados, proporção CSS original. |
| `page-paper.png` → `page-paper.webp` | 2.039.482 → 155.944 | 1254×1254 → 1254×1254 | Papel no aviso até 430×932 e página 390×525. Mantida a resolução original para não perder mais grão; a escala preexistente em 3× continua. |
| `cover-front.jpg` → `cover-front.webp` | 413.262 → 124.094 | 2022×2048 → 1560×1580 | Estojo ≈302×302; capa animada do leitor até 390×525. Altura 1580 cobre o maior uso em 3×. |
| `disc-label.jpg` → `disc-label.webp` | 41.717 → 29.864 | 701×701 → 701×701 | Disco visível ≈160×160. Mantidos os 701px originais; a caixa oculta sob a tampa tem 262×262. |
| `polaroid-photo.jpg` → `polaroid-photo.jpg` | 116.752 → 116.752 | 900×900 → 900×900 | Foto ≈285×285, bbox rotacionado ≈300×300. JPEG original menor que o WebP testado; mantido. |
| `favicon.svg` → `favicon.svg` | 293 → 293 | vetorial → vetorial | SVG escalável; mantido. |
| `photo-01.svg` → `photo-01.svg` | 686 → 686 | vetorial → vetorial | Página desativada; não baixado no fluxo ativo. SVG escalável preservado para reativação. |
| `photo-02.svg` → `photo-02.svg` | 686 → 686 | vetorial → vetorial | Página desativada; não baixado no fluxo ativo. SVG escalável preservado para reativação. |
| `back-inlay.png` → removido | 2.432.231 → 0 | 1254×1254 → — | Oculto (0×0), mas era baixado. Removido. |
| `bonus-art.jpg` → removido | 163.674 → 0 | 736×736 → — | Sem elemento visível desde a cassette. Removido. |
| `cover.png` → removido | 3.157.775 → 0 | 1254×1254 → — | Arte antiga sem referência de execução. Removida. |
| `disc-print.png` → removido | 3.212.311 → 0 | 1254×1254 → — | Arte antiga sem referência de execução. Removida. |

Os únicos rasters novos com alpha são cassette e logo. Não foi mantido PNG duplicado: os navegadores-alvo do projeto suportam WebP com transparência. `ARTWORK_PROMPTS.md` permanece como histórico das artes originais; seus nomes antigos não são referências de execução. Os dois SVGs da página desativada continuam disponíveis.

## Inventário de áudio — sem recodificação

**Total: 328.221.620 bytes (328,22 MB decimais), 34 arquivos, 320 kbps por fluxo MP3.** Duração medida total: 8.204,54 s (aproximadamente 2h16min44s). Nenhum arquivo excede 100 MB; a pasta fica abaixo de 1 GB. `ffprobe` foi usado para ler codec, bitrate e duração. O maior arquivo é `13-after-hours.mp3`, com 14.443.751 bytes.

| Arquivo | Bytes | Bitrate do áudio | Duração (s) |
|---|---:|---:|---:|
| `01-master-of-none.mp3` | 7.978.971 | 320 kbps | 199.44 |
| `02-scott-street.mp3` | 12.202.450 | 320 kbps | 305.03 |
| `03-two-ghosts.mp3` | 9.195.229 | 320 kbps | 229.85 |
| `04-daylight.mp3` | 8.521.269 | 320 kbps | 213.00 |
| `05-in-my-room.mp3` | 7.107.536 | 320 kbps | 177.66 |
| `06-two-of-us.mp3` | 8.674.868 | 320 kbps | 216.84 |
| `07-wonderwall.mp3` | 10.351.924 | 320 kbps | 258.77 |
| `08-the-greatest.mp3` | 11.756.277 | 320 kbps | 293.88 |
| `09-style-taylors-version.mp3` | 9.242.263 | 320 kbps | 231.03 |
| `10-midnight-pretenders.mp3` | 13.813.687 | 320 kbps | 345.31 |
| `11-as-you-are.mp3` | 13.622.460 | 320 kbps | 340.53 |
| `12-scared-to-live.mp3` | 7.655.052 | 320 kbps | 191.35 |
| `13-after-hours.mp3` | 14.443.751 | 320 kbps | 361.06 |
| `14-nothings-gonna-hurt-you-baby.mp3` | 11.454.326 | 320 kbps | 286.33 |
| `15-unknown-delight.mp3` | 10.322.683 | 320 kbps | 258.04 |
| `16-somebody.mp3` | 7.179.621 | 320 kbps | 179.46 |
| `17-guilty-as-sin.mp3` | 10.177.438 | 320 kbps | 254.41 |
| `18-fallen-star.mp3` | 8.999.840 | 320 kbps | 224.97 |
| `19-small-worlds.mp3` | 10.872.291 | 320 kbps | 271.78 |
| `20-better-in-the-dark.mp3` | 6.039.641 | 320 kbps | 150.96 |
| `21-lovely-rita.mp3` | 6.486.854 | 320 kbps | 162.14 |
| `22-grapejuice.mp3` | 7.681.173 | 320 kbps | 192.00 |
| `23-there-is-a-light-that-never-goes-out.mp3` | 9.786.666 | 320 kbps | 244.64 |
| `24-halleys-comet.mp3` | 9.392.720 | 320 kbps | 234.79 |
| `25-head-over-heels.mp3` | 12.043.630 | 320 kbps | 301.06 |
| `26-supercut.mp3` | 11.103.204 | 320 kbps | 277.55 |
| `27-wildest-dreams.mp3` | 8.820.115 | 320 kbps | 220.47 |
| `28-cant-take-my-eyes-off-you.mp3` | 8.150.349 | 320 kbps | 203.73 |
| `29-dancing-in-the-flames.mp3` | 12.483.533 | 320 kbps | 312.06 |
| `30-the-craving.mp3` | 6.968.558 | 320 kbps | 174.18 |
| `31-nothings-gonna-stop-us-now.mp3` | 10.815.879 | 320 kbps | 270.37 |
| `32-cherry-flavoured-love-inside-your-heart.mp3` | 10.743.799 | 320 kbps | 268.56 |
| `33-make-you-mine.mp3` | 9.318.525 | 320 kbps | 232.93 |
| `34-this-is-what-falling-in-love-feels-like.mp3` | 4.815.038 | 320 kbps | 120.35 |

## Verificações e limites

- Fluxo completo em Chromium, em **360×640 e 390×844**, claro e escuro, DPR 3, rede limitada e CPU 4×: aviso → estojo → toque/flick no disco → livreto → nota → cassette → Polaroid.
- Nenhuma requisição de áudio antes do primeiro toque de reprodução. Imagens do estojo decodificadas e fontes prontas antes de liberar as telas correspondentes.
- Toques rápidos repetidos no estojo e no disco; flick enquanto toca sem pular faixa; abrir livreto logo após flick; três toques rápidos na seta; arrasto parcial que volta; rolagem vertical sem virar; fechar no meio da virada e reabrir.
- Todas as 13 páginas percorridas, limite final, setas ocultas somente no bônus; tocar cassette pausa disco, seek em 30 s, reinício e pausa ao deixar o bônus.
- Polaroid com toque duplo, fechamento por ×, Esc, backdrop e histórico/back; disco continua tocando. Rotação para paisagem e volta; suspensão/retomada de lifecycle via CDP.
- Falha HTTP 503 deliberada na cassette: a imagem e suas sobreposições ficam ocultas, preservando o papel; controles continuam disponíveis; nenhuma rejeição não tratada. Fechar o estojo durante uma espera deliberada pela fonte cancela a abertura do livreto.
- JavaScript passou por `node --check`; diff passou por `git diff --check`. Conteúdo de `ALBUM_DATA`, exceto campos de imagens, comparado integralmente com a versão inicial; MP3s não modificados.
- **WebKit não foi executado:** o navegador foi obtido, mas faltam bibliotecas compartilhadas GTK/GStreamer e outras; a instalação de dependências foi bloqueada pelo ambiente. Não há comprovação de Safari/iOS nesta rodada.
- **Não foi testado bloqueio físico de um telefone**, interrupção por chamada, Bluetooth, modo de economia de bateria ou políticas reais de segundo plano. Freeze/resume automatizado não substitui esses testes.
- As capturas e medições são de navegador headless com renderização de software; não representam garantia de 60 fps em todos os aparelhos ou redes. A nota Lighthouse ficou indisponível, conforme explicado acima.

## Propostas — não aplicadas

1. **Áudio mais leve:** oferecer uma versão de 192 kbps poderia reduzir aproximadamente 40% dos bytes (cerca de 131 MB no álbum), com possível alteração de qualidade. Os arquivos atuais continuam em 320 kbps.
2. **Reprodução estritamente sem intervalo:** agendamento/decodificação em Web Audio e análise dos silêncios de cada arquivo exigem outra implementação e mais memória; cortar silêncios ou usar crossfade alteraria a audição. Nada disso foi aplicado.
3. **60 fps sob carga maior:** avaliar em um Android intermediário real; reduzir tiras, blur, textura ou sombras poderia melhorar mais, mas alteraria a aparência. O efeito visual existente foi mantido.
4. **Publicação totalmente isolada por versão:** diretórios imutáveis com hashes e retenção de recursos antigos evitariam que uma aba já aberta antes do deploy peça um arquivo removido. O token novo protege as URLs da nova página; ele não reescreve uma aba antiga nem garante publicação atômica. Essa mudança na estratégia de releases não foi aplicada.
5. **LCP:** repetir Lighthouse completo em Chrome normal, com cache vazio, antes de decidir novas mudanças de prioridade de recursos. O resultado simulado parcial não foi tratado como prova de melhoria.

## Premissas

- Manter os navegadores-alvo já definidos (inclusive Safari iOS 16+), permitindo WebP sem duplicatas PNG.
- Preparar somente a próxima faixa, nos últimos 90 segundos e com buffer suficiente da atual, para limitar tráfego concorrente e memória.
- Interpretar “mesma aparência” como mesma composição, cores, proporções e efeitos, aceitando a compressão de imagem solicitada; não como igualdade byte a byte dos pixels.
- Preservar a página de fotos desativada, toda a redação pública e todo o conteúdo musical. Este relatório é documentação técnica adicional, não faz parte do fluxo do site.
