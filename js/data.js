/* Edit album content here. Paths are relative to index.html. Durations use seconds. */
window.ALBUM_DATA = {
  title: "Two Of Us",
  artist: "Nome do artista",
  subtitle: "Nosso primeiro disco, de muitos · Gravado entre maio e setembro de 2026",
  images: {
    logo: "assets/img/logo-two-of-us.png",
    cover: "assets/img/cover-front.jpg",
    disc: "assets/img/disc-label.jpg",
    pageBackground: "assets/img/page-paper.png",
    backInlay: "assets/img/back-inlay.png",
    bonusArtwork: "assets/img/bonus-art.jpg"
  },
  polaroid: {
    photo: "assets/img/polaroid-photo.jpg",
    photoAlt: "Foto no polaroid",
    notes: [
      "Gravado em: maio a setembro de 2026",
      "Lançado em: 13 de outubro de 2026",
      "Compositores: Gabriel K & Ana Paula"
    ]
  },
  /* Public tracks only. The bonus object is appended by the player, exactly once. */
  tracks: [
    { id: "track-01", title: "Master Of None", file: "assets/audio/01-master-of-none.mp3", durationHint: 199, artist: "Beach House", description: "Conheci essa graças a você, e é o sample de The Party & The After Party, do Abel. Uma música noturna e distante, abafada. Como o amanhecer depois de uma festa." },
    { id: "track-02", title: "Scott Street", file: "assets/audio/02-scott-street.mp3", durationHint: 305, artist: "Phoebe Bridgers", description: "Essa eu salvei da sua playlist, sem saber que, na mesma época, você estava salvando uma da minha. Escutei numa caminhada noturna, e ela me fazia lembrar de você o tempo todo. Reflexiva." },
    { id: "track-03", title: "Two Ghosts", file: "assets/audio/03-two-ghosts.mp3", durationHint: 230, artist: "Harry Styles", description: "Uma das nossas favoritas do primeiro álbum do Harry. Leve, romântica, como estar bebendo um vinho juntos." },
    { id: "track-04", title: "Daylight", file: "assets/audio/04-daylight.mp3", durationHint: 213, artist: "David Kushner", description: "Um dos maiores hits de 2023. Sufocante, sombria, definitivamente triste." },
    { id: "track-05", title: "In My Room", file: "assets/audio/05-in-my-room.mp3", durationHint: 178, artist: "Chance Peña", description: "E essa é a que você salvou da minha. Ao escutar pela primeira vez, me senti em uma viagem. Introspectiva, íntima, quase como um sonho distante." },
    { id: "track-06", title: "Two Of Us", file: "assets/audio/06-two-of-us.mp3", durationHint: 217, artist: "The Beatles", description: "Quando escutei essa música em Devoradores de Estrelas, senti imediatamente um ar de alegria e leveza, e ela se tornou minha favorita da banda rapidamente. Era perfeita pra dar nome ao nosso disco." },
    { id: "track-07", title: "Wonderwall", file: "assets/audio/07-wonderwall.mp3", durationHint: 259, artist: "Oasis", description: "Me sinto emocionado toda vez que escuto. Imagino um coro de pessoas cantando, como se fosse alguém cantando pra pessoa que ama." },
    { id: "track-08", title: "THE GREATEST", file: "assets/audio/08-the-greatest.mp3", durationHint: 294, artist: "Billie Eilish", description: "Uma música que vai crescendo aos poucos e te destrói lentamente. É a que mais mexe comigo, a ponto de me causar reações físicas. Devastadora, quase épica." },
    { id: "track-09", title: "Style (Taylor's Version)", file: "assets/audio/09-style-taylors-version.mp3", durationHint: 231, artist: "Taylor Swift", description: "Coloquei porque acho que combina com a gente: duas pessoas que nunca saem de moda. Toda vez que escuto, sinto como se estivesse correndo de mãos dadas com alguém num gramado. Leve, alegre, eufórica." },
    { id: "track-10", title: "Midnight Pretenders", file: "assets/audio/10-midnight-pretenders.mp3", durationHint: 345, artist: "Tomoko Aran", description: "City pop dos anos 80. Uma música leve e noturna, como as luzes de uma cidade à noite." },
    { id: "track-11", title: "As You Are", file: "assets/audio/11-as-you-are.mp3", durationHint: 341, artist: "The Weeknd", description: "Uma das que eu mais gosto dele. É sobre amar a pessoa sem medo, aceitar ela do jeito que é, mesmo sem saber qual vai ser o fim disso tudo. Entrega, coragem." },
    { id: "track-12", title: "Scared To Live", file: "assets/audio/12-scared-to-live.mp3", durationHint: 191, artist: "The Weeknd", description: "Uma música de esperança, sobre desejar o melhor pro outro. Esperançosa, com um pingo de culpa." },
    { id: "track-13", title: "After Hours", file: "assets/audio/13-after-hours.mp3", durationHint: 361, artist: "The Weeknd", description: "Minha favorita de toda a discografia do Abel. Uma música que causa emoções diferentes. Arrependimento, culpa, vulnerabilidade, desejo." },
    { id: "track-14", title: "Nothing's Gonna Hurt You Baby", file: "assets/audio/14-nothings-gonna-hurt-you-baby.mp3", durationHint: 286, artist: "Cigarettes After Sex", description: "Um som lento e envolvente. Me faz sentir como se estivesse dançando colado e devagar perto de alguém. Íntimo, calmo." },
    { id: "track-15", title: "Unknown Delight", file: "assets/audio/15-unknown-delight.mp3", durationHint: 258, artist: "George Harrison", description: "Uma música muito alegre e leve. Quase como um pai vendo o filho feliz, brincando com os amigos, ou uma mãe vendo o filho correr livre e crescer. Alegria contida, leveza, felicidade." },
    { id: "track-16", title: "Somebody", file: "assets/audio/16-somebody.mp3", durationHint: 179, artist: "Justin Bieber", description: "Todo mundo precisa de alguém. Todo mundo precisa de ajuda. Todo mundo precisa de uma mão pra segurar, de um porto seguro. É o que a música diz, e eu acho que encontrei." },
    { id: "track-17", title: "Guilty as Sin?", file: "assets/audio/17-guilty-as-sin.mp3", durationHint: 254, artist: "Taylor Swift", description: "Tocou em repeat durante dias e dias. Voz maravilhosa, e pra mim é a música que mais tem a sua cara." },
    { id: "track-18", title: "Fallen Star", file: "assets/audio/18-fallen-star.mp3", durationHint: 225, artist: "The Neighbourhood", description: "Você me recomendou em agosto, e eu, preguiçoso, demorei a escutar. Mas quando escutei, me apaixonei. Imersiva, noturna, fantasiosa." },
    { id: "track-19", title: "Small Worlds", file: "assets/audio/19-small-worlds.mp3", durationHint: 272, artist: "Mac Miller", description: "Uma música crua e triste. Sinto como se fosse quase o cantor só falando e desabafando, sem muita estrutura." },
    { id: "track-20", title: "Better in the Dark", file: "assets/audio/20-better-in-the-dark.mp3", durationHint: 151, artist: "Jordana, TV Girl", description: "Um som noturno e leve, que te faz viajar na mente, refletindo. Sobre insegurança. Uma pessoa escutando isso deitada, num quarto escuro, é a melhor definição." },
    { id: "track-21", title: "Lovely Rita", file: "assets/audio/21-lovely-rita.mp3", durationHint: 162, artist: "The Beatles", description: "Senti humor, alegria. Uma sensação despreocupada de um dia de sol." },
    { id: "track-22", title: "Grapejuice", file: "assets/audio/22-grapejuice.mp3", durationHint: 192, artist: "Harry Styles", description: "Alegria, leveza, como crianças brincando e correndo pela casa." },
    { id: "track-23", title: "There Is a Light That Never Goes Out", file: "assets/audio/23-there-is-a-light-that-never-goes-out.mp3", durationHint: 245, artist: "The Smiths", description: "Uma música quase teatral sobre amar o outro sem limites, sobre estar perdidamente apaixonado. Dramática e leve ao mesmo tempo." },
    { id: "track-24", title: "Halley's Comet", file: "assets/audio/24-halleys-comet.mp3", durationHint: 235, artist: "Billie Eilish", description: "Paixão. Se sentir desnorteado, ansioso, sem rumo diante de um sentimento tão grande." },
    { id: "track-25", title: "Head Over Heels", file: "assets/audio/25-head-over-heels.mp3", durationHint: 301, artist: "Tears for Fears", description: "Senti saudade e vulnerabilidade. Como alguém que fala o que sente, sem saber o que vai receber." },
    { id: "track-26", title: "Supercut", file: "assets/audio/26-supercut.mp3", durationHint: 278, artist: "Lorde", description: "Eu já conhecia esse álbum, mas foi você que me fez prestar atenção nessa faixa. Quando prestei, me senti em um carro, à noite, olhando nos seus olhos." },
    { id: "track-27", title: "Wildest Dreams", file: "assets/audio/27-wildest-dreams.mp3", durationHint: 220, artist: "Taylor Swift", description: "Leve, nostálgica. Ao ouvir, me senti em uma viagem de carro ensolarada." },
    { id: "track-28", title: "Can't Take My Eyes Off You", file: "assets/audio/28-cant-take-my-eyes-off-you.mp3", durationHint: 204, artist: "Frankie Valli", description: "Uma paixão intensa e admiração pela pessoa que ama." },
    { id: "track-29", title: "Dancing In The Flames", file: "assets/audio/29-dancing-in-the-flames.mp3", durationHint: 312, artist: "The Weeknd", description: "Uma música sobre um amor que enfrenta e atravessa até mesmo a dor." },
    { id: "track-30", title: "The Craving", file: "assets/audio/30-the-craving.mp3", durationHint: 174, artist: "Twenty One Pilots", description: "Uma música sobre pensar se é o suficiente e se vai atender o desejo da outra pessoa." },
    { id: "track-31", title: "Nothing's Gonna Stop Us Now", file: "assets/audio/31-nothings-gonna-stop-us-now.mp3", durationHint: 270, artist: "Starship", description: "Uma música completamente eufórica dos anos 80, sobre um amor que não acaba e não desiste. Sobre um casal resiliente. Dançante." },
    { id: "track-32", title: "cherry flavoured love inside your heart", file: "assets/audio/32-cherry-flavoured-love-inside-your-heart.mp3", durationHint: 269, artist: "wave to earth", description: "Calma, leve, suave. Como se estivesse flutuando no espaço." },
    { id: "track-33", title: "Make You Mine", file: "assets/audio/33-make-you-mine.mp3", durationHint: 233, artist: "PUBLIC", description: "Senti paixão, calor. Toda vez que escuto, é como se eu fosse transportado pro momento em que peguei sua mão." }
  ],
  bonusTrack: {
    id: "bonus-track", title: "this is what falling in love feels like", file: "assets/audio/34-this-is-what-falling-in-love-feels-like.mp3", durationHint: 120,
    artist: "JVKE",
    description: "Não há descrição melhor dos meus sentimentos. É o que eu sinto agora. Super clichê, eu sei."
  },
  credits: [
    { role: "Composição e voz", name: "[Nome / nomes]" },
    { role: "Instrumentos", name: "[Músicos e instrumentos]" },
    { role: "Produção e gravação", name: "[Nome / estúdio]" },
    { role: "Mixagem e masterização", name: "[Nome / estúdio]" },
    { role: "Fotografia e arte", name: "[Nome / nomes]" }
  ],
  photos: [
    { id: "photo-01", file: "assets/img/photo-01.svg", alt: "Espaço reservado para a primeira fotografia", caption: "[Foto 01 · legenda provisória]" },
    { id: "photo-02", file: "assets/img/photo-02.svg", alt: "Espaço reservado para a segunda fotografia", caption: "[Foto 02 · legenda provisória]" }
  ],
  /* Add, remove or reorder normal pages. A single bonus page always stays last. */
  booklet: {
    pages: [
      { type: "tracks", eyebrow: "AS CANÇÕES · FAIXAS 01–03", title: "Por onde\ncomeça", trackIds: ["track-01", "track-02", "track-03"] },
      { type: "tracks", eyebrow: "AS CANÇÕES · FAIXAS 04–06", title: "O que\npermanece", trackIds: ["track-04", "track-05", "track-06"] },
      { type: "tracks", eyebrow: "AS CANÇÕES · FAIXAS 07–09", title: "Sem\nmedida", trackIds: ["track-07", "track-08", "track-09"] },
      { type: "tracks", eyebrow: "AS CANÇÕES · FAIXAS 10–12", title: "Mesmo\nassim", trackIds: ["track-10", "track-11", "track-12"] },
      { type: "tracks", eyebrow: "AS CANÇÕES · FAIXAS 13–15", title: "Nosso\nabrigo", trackIds: ["track-13", "track-14", "track-15"] },
      { type: "tracks", eyebrow: "AS CANÇÕES · FAIXAS 16–18", title: "Querer\nperto", trackIds: ["track-16", "track-17", "track-18"] },
      { type: "tracks", eyebrow: "AS CANÇÕES · FAIXAS 19–21", title: "Vida\nmiúda", trackIds: ["track-19", "track-20", "track-21"] },
      { type: "tracks", eyebrow: "AS CANÇÕES · FAIXAS 22–24", title: "Sem\nchão", trackIds: ["track-22", "track-23", "track-24"] },
      { type: "tracks", eyebrow: "AS CANÇÕES · FAIXAS 25–27", title: "Ainda\nlembro", trackIds: ["track-25", "track-26", "track-27"] },
      { type: "tracks", eyebrow: "AS CANÇÕES · FAIXAS 28–30", title: "Me\nentrego", trackIds: ["track-28", "track-29", "track-30"] },
      { type: "tracks", eyebrow: "AS CANÇÕES · FAIXAS 31–33", title: "Mãos\ndadas", trackIds: ["track-31", "track-32", "track-33"] },
      {
        // Set enabled to true (or remove this flag) to restore the photos page.
        enabled: false,
        type: "photos", eyebrow: "FRAGMENTOS DO CAMINHO", title: "Entre\ninstantes", photoIds: ["photo-01", "photo-02"], text: "[Texto provisório] Fotos, lembranças e pequenos registros que acompanham as canções."
      },
      { type: "note", eyebrow: "UMA ÚLTIMA FALA...", title: "Antes da\nsurpresa", paragraphs: ["Construí esse site com muita dedicação e carinho, me inspirando especialmente na estética do Rubber Soul para algumas coisas. Senti que nossa playlist precisava de mais do que um simples lugar no Spotify, e sim de algo feito pra durar. Espero que você goste."], signature: "Gabriel Henrique K." }
    ],
    bonusPage: { eyebrow: "VOCÊ CHEGOU ATÉ AQUI", title: "Ainda\nhá música." }
  }
};
