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
  const jewelCase = document.querySelector("#jewel-case");
  function sizeOpenCase() {
    const size = parseFloat(getComputedStyle(jewelCase).width);
    const shadow = parseFloat(getComputedStyle(experience).getPropertyValue("--case-shadow-outset"));
    /* Two squares plus their outer shadows, with 12px of clear space per side.
       A numeric ratio also works on browsers without CSS length division. */
    const scale = (experience.clientWidth - 24) / (2 * (size + shadow));
    experience.style.setProperty("--case-open-scale", Math.max(.1, scale));
  }
  sizeOpenCase();
  new ResizeObserver(sizeOpenCase).observe(experience);
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
  polaroidPhoto.alt = data.polaroid.photoAlt || "";
  polaroidPhoto.decoding = "async";
  let polaroidPhotoRequested = false;
  let polaroidPhotoReady = false;
  let polaroidPhotoOpened = false;
  let polaroidPhotoSettled = false;
  let polaroidPhotoDevelop = false;
  let polaroidPhotoTimer;

  function revealPolaroidPhoto() {
    if (!polaroidPhotoReady || !polaroidPhotoSettled || !polaroidDialog.open || polaroidClosing) return;
    polaroidPhoto.classList.toggle("is-photo-developing", polaroidPhotoDevelop && !polaroidMotion.matches);
    polaroidPhoto.classList.add("is-photo-visible");
  }

  function failPolaroidPhoto() {
    polaroidPhotoReady = false;
    polaroidPhoto.hidden = true;
    polaroidPhoto.classList.remove("is-photo-visible", "is-photo-developing");
  }

  /* Assign src only when the case opens; the hidden dialog still preloads it. */
  function preloadPolaroidPhoto() {
    if (!data.polaroid.photo || polaroidPhotoRequested) return;
    polaroidPhotoRequested = true;
    polaroidPhoto.src = data.polaroid.photo;
  }
  polaroidPhoto.addEventListener("load", async () => {
    try {
      await polaroidPhoto.decode();
      polaroidPhotoReady = true;
      polaroidPhoto.hidden = false;
      revealPolaroidPhoto();
    } catch { failPolaroidPhoto(); }
  });
  polaroidPhoto.addEventListener("error", failPolaroidPhoto);
  polaroidPhoto.addEventListener("animationend", event => {
    if (event.animationName === "polaroid-develop") polaroidPhoto.classList.remove("is-photo-developing");
  });

  function preparePolaroidPhoto() {
    clearTimeout(polaroidPhotoTimer);
    polaroidPhotoDevelop = !polaroidPhotoOpened && !polaroidMotion.matches;
    polaroidPhotoOpened = true;
    polaroidPhotoSettled = !polaroidPhotoDevelop;
    polaroidPhoto.classList.remove("is-photo-visible", "is-photo-developing");
    if (polaroidPhotoSettled) revealPolaroidPhoto();
    else {
      /* Match the existing 560 ms print entrance before developing the film. */
      polaroidPhotoTimer = setTimeout(() => {
        polaroidPhotoSettled = true;
        revealPolaroidPhoto();
      }, 560);
    }
  }
  polaroidMotion.addEventListener("change", () => {
    if (!polaroidMotion.matches) return;
    clearTimeout(polaroidPhotoTimer);
    polaroidPhotoDevelop = false;
    polaroidPhotoSettled = true;
    revealPolaroidPhoto();
  });

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
    clearTimeout(polaroidPhotoTimer);
    polaroidPhotoSettled = false;
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
    preparePolaroidPhoto();
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
    clearTimeout(polaroidPhotoTimer);
    polaroidPhotoSettled = false;
    polaroidPhoto.classList.remove("is-photo-developing");
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

  const discRotation = document.querySelector("#disc-rotation");
  const discMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const normalDiscSpeed = 360 / 9;
  let discAngle = 0;
  let discSpeed = normalDiscSpeed;
  let discFrame = 0;
  let discFrameTime = 0;
  let discPlaying = false;
  let discGesture = null;
  let suppressDiscClick = false;

  function paintDisc() {
    discRotation.style.transform = `rotate(${discAngle}deg)`;
  }
  function stopDiscFrames() {
    cancelAnimationFrame(discFrame);
    discFrame = 0;
    discFrameTime = 0;
  }
  function runDiscFrame(now) {
    discFrame = 0;
    if (!discPlaying || discGesture || discMotion.matches || document.hidden) {
      discFrameTime = 0;
      return;
    }
    const seconds = discFrameTime ? Math.min((now - discFrameTime) / 1000, .05) : 0;
    discFrameTime = now;
    /* Integrate the decaying speed exactly so refresh rate does not change inertia. */
    const decay = Math.exp(-3 * seconds);
    discAngle += normalDiscSpeed * seconds + (discSpeed - normalDiscSpeed) * (1 - decay) / 3;
    discSpeed = normalDiscSpeed + (discSpeed - normalDiscSpeed) * decay;
    paintDisc();
    discFrame = requestAnimationFrame(runDiscFrame);
  }
  function startDiscFrames() {
    if (!discFrame && discPlaying && !discGesture && !discMotion.matches && !document.hidden) {
      discFrame = requestAnimationFrame(runDiscFrame);
    }
  }
  function syncDiscMotion(player) {
    discPlaying = player.isPlaying;
    if (discPlaying) startDiscFrames();
    else {
      stopDiscFrames();
      if (!player.pending) discSpeed = normalDiscSpeed;
    }
  }

  const discPlayer = new window.AlbumPlayer(document.querySelector("#disc-audio"), [...data.tracks, data.bonusTrack], player => {
    syncDiscMotion(player);
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
    if (open) preloadPolaroidPhoto();
    if (!open) { cancelDiscGesture(); discPlayer.pause(); bonusPlayer.pause(); }
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
  function canTouchDisc() {
    return !caseBusy && headphonesAccepted && experience.classList.contains("is-open");
  }
  function touchDisc() {
    experience.classList.add("hints-dismissed");
  }
  function releaseDiscCapture(pointer) {
    if (discButton.hasPointerCapture(pointer)) discButton.releasePointerCapture(pointer);
    discButton.classList.remove("is-dragging");
  }
  function cancelDiscGesture() {
    if (!discGesture) return;
    const pointer = discGesture.pointer;
    discGesture = null;
    releaseDiscCapture(pointer);
    discSpeed = normalDiscSpeed;
    startDiscFrames();
  }
  function moveDisc(event) {
    const gesture = discGesture;
    if (!gesture || gesture.pointer !== event.pointerId) return;
    const x = event.clientX - gesture.centerX;
    const y = event.clientY - gesture.centerY;
    const pointerAngle = Math.atan2(y, x) * 180 / Math.PI;
    /* Crossing the spindle must not create a false half-turn or flick. */
    if (Math.hypot(x, y) >= gesture.deadZone) {
      if (gesture.pointerAngle !== null) {
        const delta = ((pointerAngle - gesture.pointerAngle + 540) % 360) - 180;
        gesture.angle += delta;
      }
      gesture.pointerAngle = pointerAngle;
    } else gesture.pointerAngle = null;
    gesture.distance = Math.max(gesture.distance, Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y));
    if (gesture.distance >= 8) {
      gesture.dragging = true;
      discButton.classList.add("is-dragging");
      if (!discMotion.matches) { discAngle = gesture.startAngle + gesture.angle; paintDisc(); }
    }
    const now = performance.now();
    gesture.samples.push({ time: now, angle: gesture.angle });
    gesture.samples = gesture.samples.filter(sample => now - sample.time <= 100);
  }
  discButton.addEventListener("pointerdown", event => {
    if (!canTouchDisc() || discGesture || !event.isPrimary || event.button !== 0) return;
    const rect = discButton.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deadZone = Math.max(10, rect.width * .1);
    const now = performance.now();
    suppressDiscClick = true;
    stopDiscFrames();
    discGesture = {
      pointer: event.pointerId, x: event.clientX, y: event.clientY, centerX, centerY, deadZone,
      pointerAngle: Math.hypot(event.clientX - centerX, event.clientY - centerY) < deadZone ? null : Math.atan2(event.clientY - centerY, event.clientX - centerX) * 180 / Math.PI,
      startAngle: discAngle, angle: 0, distance: 0, dragging: false, time: now,
      samples: [{ time: now, angle: 0 }]
    };
    discButton.setPointerCapture(event.pointerId);
    discButton.focus({ preventScroll: true });
    touchDisc();
  });
  discButton.addEventListener("pointermove", moveDisc);
  discButton.addEventListener("pointerup", event => {
    if (!discGesture || discGesture.pointer !== event.pointerId) return;
    moveDisc(event);
    const gesture = discGesture;
    discGesture = null;
    releaseDiscCapture(event.pointerId);
    const last = gesture.samples[gesture.samples.length - 1];
    const first = gesture.samples[0];
    const elapsed = last.time - first.time;
    const speed = elapsed >= 8 ? (last.angle - first.angle) * 1000 / elapsed : 0;
    const flick = gesture.dragging && Math.abs(speed) >= 60;
    if (flick) {
      discSpeed = discMotion.matches ? normalDiscSpeed : Math.sign(speed) * Math.min(1080, Math.max(160, Math.abs(speed)));
      /* play() reaches audio.play() synchronously, before its first await.
         Do not defer this user-gesture authorization to an animation frame. */
      if (!discPlayer.isPlaying) discPlayer.play();
    } else {
      discSpeed = normalDiscSpeed;
      if (!gesture.dragging && performance.now() - gesture.time <= 250) discPlayer.toggle();
    }
    startDiscFrames();
  });
  discButton.addEventListener("pointercancel", cancelDiscGesture);
  discButton.addEventListener("lostpointercapture", event => {
    if (event.target === discButton && discGesture?.pointer === event.pointerId) cancelDiscGesture();
  });
  /* Pointer taps were handled on release; retain keyboard/assistive activation. */
  discButton.addEventListener("click", event => {
    if (event.detail !== 0 && suppressDiscClick) { suppressDiscClick = false; return; }
    if (!canTouchDisc()) return;
    touchDisc();
    discPlayer.toggle();
  });
  discMotion.addEventListener("change", () => {
    cancelDiscGesture();
    stopDiscFrames();
    discSpeed = normalDiscSpeed;
    startDiscFrames();
  });
  window.addEventListener("blur", cancelDiscGesture);
  window.addEventListener("resize", cancelDiscGesture);
  bookletButton.addEventListener("click", () => {
    if (caseBusy) return;
    experience.classList.add("hints-dismissed");
    booklet.open();
  });
  /* Pause when navigating away; no persisted or automatic playback on a later visit. */
  window.addEventListener("pagehide", () => { discPlayer.pause(); bonusPlayer.pause(); });
  /* Refresh controls after the browser resumes a suspended/locked tab. */
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { cancelDiscGesture(); stopDiscFrames(); }
    if (!document.hidden) { discPlayer.emit(); bonusPlayer.emit(); }
  });
})();
