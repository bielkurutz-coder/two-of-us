(() => {
  "use strict";
  const data = window.ALBUM_DATA;
  const experience = document.querySelector("#experience");
  const discButton = document.querySelector("#disc");
  const bookletButton = document.querySelector("#booklet-trigger");
  const openButton = document.querySelector("#case-open");
  const listeningPanel = document.querySelector("#listening-panel");
  const announcer = document.querySelector("#announcer");
  const polaroidTrigger = document.querySelector("#polaroid-trigger");
  const polaroidDialog = document.querySelector("#polaroid-dialog");
  const polaroidStage = polaroidDialog.querySelector(".polaroid-stage");
  const polaroidMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let polaroidClosing = false;
  let polaroidHistoryOwned = false;
  let polaroidBackPending = false;
  let polaroidCloseTimer;
  let polaroidBackdropStart = false;
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

  /* The keepsake is independent of both audio players and the booklet. */
  const polaroidNotes = document.querySelector("#polaroid-notes");
  data.polaroid.notes.forEach((text, index) => {
    const line = document.createElement("p");
    line.textContent = text;
    line.style.setProperty("--note-index", index);
    polaroidNotes.append(line);
  });
  const polaroidPhoto = document.querySelector("#polaroid-photo");
  if (data.polaroid.photo) {
    polaroidPhoto.addEventListener("load", () => { polaroidPhoto.hidden = false; });
    polaroidPhoto.addEventListener("error", () => { polaroidPhoto.hidden = true; });
    polaroidPhoto.src = data.polaroid.photo;
  }

  function clearPolaroidHistoryMarker() {
    const state = { ...history.state };
    delete state.twoOfUsPolaroid;
    history.replaceState(state, "");
  }
  if (history.state?.twoOfUsPolaroid) clearPolaroidHistoryMarker();

  function releasePolaroidHistory() {
    if (polaroidHistoryOwned && history.state?.twoOfUsPolaroid) {
      polaroidBackPending = true;
      history.back();
    }
    polaroidHistoryOwned = false;
  }

  function closePolaroid(fromHistory = false) {
    if (!polaroidDialog.open || polaroidClosing) return;
    polaroidClosing = true;
    const printStyle = getComputedStyle(polaroidDialog.querySelector(".polaroid-print"));
    polaroidStage.style.setProperty("--polaroid-close-transform", printStyle.transform);
    polaroidStage.style.setProperty("--polaroid-close-opacity", printStyle.opacity);
    if (fromHistory) polaroidHistoryOwned = false;
    else releasePolaroidHistory();
    polaroidDialog.classList.add("is-closing");
    polaroidCloseTimer = setTimeout(() => {
      polaroidDialog.close();
    }, polaroidMotion.matches ? 140 : 300);
  }

  polaroidTrigger.addEventListener("click", () => {
    if (!headphonesAccepted || caseBusy || !experience.classList.contains("is-open") || polaroidDialog.open || polaroidClosing || polaroidBackPending) return;
    polaroidDialog.showModal();
    const logo = polaroidTrigger.getBoundingClientRect();
    const target = polaroidStage.getBoundingClientRect();
    /* Keep the upward entrance near the logo and inside narrow viewports. */
    const originX = Math.max(-target.width * .18, Math.min(target.width * .18, logo.left + logo.width / 2 - target.left - target.width / 2));
    const originY = Math.max(32, logo.bottom + 12 - target.top);
    polaroidStage.style.setProperty("--polaroid-origin-x", `${originX}px`);
    polaroidStage.style.setProperty("--polaroid-origin-y", `${originY}px`);
    history.pushState({ ...history.state, twoOfUsPolaroid: true }, "");
    polaroidHistoryOwned = true;
  });
  document.querySelector("#polaroid-close").addEventListener("click", () => closePolaroid());
  polaroidDialog.addEventListener("pointerdown", event => {
    polaroidBackdropStart = event.target === polaroidDialog;
  });
  polaroidDialog.addEventListener("click", event => {
    if (polaroidBackdropStart && event.target === polaroidDialog) closePolaroid();
    polaroidBackdropStart = false;
  });
  polaroidDialog.addEventListener("cancel", event => {
    event.preventDefault();
    closePolaroid();
  });
  polaroidDialog.addEventListener("close", () => {
    clearTimeout(polaroidCloseTimer);
    releasePolaroidHistory();
    polaroidDialog.classList.remove("is-closing");
    polaroidClosing = false;
    polaroidBackdropStart = false;
    polaroidTrigger.focus({ preventScroll: true });
  });
  window.addEventListener("popstate", () => {
    polaroidBackPending = false;
    if (polaroidDialog.open && !history.state?.twoOfUsPolaroid) closePolaroid(true);
    else if (!polaroidDialog.open && history.state?.twoOfUsPolaroid) clearPolaroidHistoryMarker();
  });

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
    polaroidTrigger.disabled = !open;
    polaroidTrigger.tabIndex = open ? 0 : -1;
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
