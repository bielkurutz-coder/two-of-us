(() => {
  "use strict";
  const data = window.ALBUM_DATA;
  const experience = document.querySelector("#experience");
  const discButton = document.querySelector("#disc");
  const bookletButton = document.querySelector("#booklet-trigger");
  const openButton = document.querySelector("#case-open");
  const listeningPanel = document.querySelector("#listening-panel");
  const announcer = document.querySelector("#announcer");
  let booklet;
  let lastAnnouncement = "";
  let caseBusy = false;
  const headphonesGate = document.querySelector("#headphones-gate");
  const headphonesContinue = document.querySelector("#headphones-continue");
  let headphonesAccepted = false;
  /* Register the first user gesture before playback controls become reachable.
     Actual audio.play() calls stay inside the existing, later playback taps. */
  headphonesContinue.addEventListener("click", () => {
    if (headphonesAccepted) return;
    headphonesAccepted = true;
    headphonesContinue.disabled = true;
    headphonesGate.classList.add("is-dismissed");
    document.body.classList.remove("headphones-pending");
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 400;
    setTimeout(() => {
      headphonesGate.hidden = true;
      experience.inert = false;
      experience.removeAttribute("aria-hidden");
      openButton.focus({ preventScroll: true });
    }, delay);
  });
  document.title = `${data.title} — álbum interativo`;
  document.querySelector("#album-subtitle").textContent = data.subtitle;
  const imageBindings = { "album-logo": "logo", "cover-art": "cover", "booklet-art": "cover", "reader-cover-art": "cover", "disc-art": "disc", "back-inlay": "backInlay" };
  Object.entries(imageBindings).forEach(([id, key]) => { document.getElementById(id).src = data.images[key]; });
  /* Resolve against the document so CSS variables also work from a repo subpath. */
  const pageBackground = new URL(data.images.pageBackground, document.baseURI).href;
  document.documentElement.style.setProperty("--page-background", `url(${JSON.stringify(pageBackground)})`);

  const discPlayer = new window.AlbumPlayer(document.querySelector("#disc-audio"), [...data.tracks, data.bonusTrack], player => {
    discButton.classList.toggle("is-playing", player.isPlaying);
    discButton.setAttribute("aria-pressed", String(player.isPlaying));
    discButton.setAttribute("aria-label", player.isPlaying ? "Pausar álbum" : "Reproduzir álbum");
    discButton.setAttribute("aria-busy", String(player.pending));
    document.querySelector("#disc-error").textContent = player.error;
    experience.classList.toggle("has-disc-error", Boolean(player.error));
    if (!player.loaded) return;
    const state = player.error ? "ÁUDIO INDISPONÍVEL" : player.pending ? "PREPARANDO O SOM" : player.isPlaying ? "O DISCO ESTÁ GIRANDO" : player.finished ? "FIM DO ÁLBUM" : "EM PAUSA";
    document.querySelector("#disc-time").textContent = `${window.formatTime(player.audio.currentTime)} / ${window.formatTime(player.duration)}`;
    document.querySelector("#disc-progress-fill").style.width = `${player.duration ? Math.min(100, player.audio.currentTime / player.duration * 100) : 0}%`;
    const announcement = `${state}. ${player.track?.title || ""}.`;
    if (announcement !== lastAnnouncement) { announcer.textContent = announcement; lastAnnouncement = announcement; }
  });
  const bonusPlayer = new window.AlbumPlayer(document.querySelector("#bonus-audio"), [data.bonusTrack], () => booklet?.updatePlayer());
  discPlayer.onBeforePlay = () => bonusPlayer.pause();
  bonusPlayer.onBeforePlay = () => discPlayer.pause();
  booklet = new window.AlbumBooklet(data, bonusPlayer);

  function setCase(open) {
    if (caseBusy) return;
    caseBusy = true;
    if (!open) { discPlayer.pause(); bonusPlayer.pause(); }
    listeningPanel.hidden = !open;
    experience.classList.toggle("is-open", open);
    document.querySelector(".album-heading").setAttribute("aria-hidden", String(!open));
    openButton.tabIndex = open ? -1 : 0;
    openButton.setAttribute("aria-hidden", String(open));
    [discButton, bookletButton].forEach(button => { button.tabIndex = open ? 0 : -1; button.setAttribute("aria-hidden", String(!open)); });
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1250;
    setTimeout(() => {
      caseBusy = false;
      (open ? discButton : openButton).focus({ preventScroll: true });
      announcer.textContent = open ? "Estojo aberto. Livreto à esquerda, disco à direita." : "Estojo fechado.";
    }, delay);
  }
  openButton.addEventListener("click", () => setCase(true));
  document.querySelector("#case-close").addEventListener("click", () => setCase(false));
  discButton.addEventListener("click", () => {
    if (caseBusy || !headphonesAccepted) return;
    experience.classList.add("hints-dismissed");
    discPlayer.toggle();
  });
  bookletButton.addEventListener("click", () => {
    if (caseBusy) return;
    experience.classList.add("hints-dismissed");
    booklet.open();
  });
  /* Pause when navigating away; no persisted or automatic playback on a later visit. */
  window.addEventListener("pagehide", () => { discPlayer.pause(); bonusPlayer.pause(); });
  /* Refresh controls after the browser resumes a suspended/locked tab. */
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) { discPlayer.emit(); bonusPlayer.emit(); }
  });
})();
