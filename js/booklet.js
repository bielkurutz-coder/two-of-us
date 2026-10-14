(() => {
  "use strict";
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  class AlbumBooklet {
    constructor(data, bonusPlayer) {
      this.data = data;
      this.player = bonusPlayer;
      this.pages = [...data.booklet.pages, { ...data.booklet.bonusPage, type: "bonus" }];
      this.index = 0;
      this.busy = false;
      this.closing = false;
      this.dialog = document.querySelector("#booklet-dialog");
      this.shell = document.querySelector("#book-shell");
      this.page = document.querySelector("#book-page");
      this.leaf = document.querySelector("#turning-leaf");
      this.shadow = document.querySelector("#page-turn-shadow");
      this.cover = document.querySelector("#reader-cover");
      this.previous = document.querySelector("#page-prev");
      this.next = document.querySelector("#page-next");
      this.counter = document.querySelector("#page-counter");
      this.trigger = document.querySelector("#booklet-trigger");
      this.experience = document.querySelector("#experience");
      this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      this.historyOwned = false;
      /* A reload must still start at the headphones notice, not inside a modal. */
      if (history.state?.twoOfUsBooklet) {
        const state = { ...history.state };
        delete state.twoOfUsBooklet;
        history.replaceState(state, "");
      }
      window.addEventListener("popstate", () => {
        if (this.dialog.open && !history.state?.twoOfUsBooklet) {
          this.historyOwned = false;
          this.close(true);
        } else if (!this.dialog.open && history.state?.twoOfUsBooklet) {
          const state = { ...history.state };
          delete state.twoOfUsBooklet;
          history.replaceState(state, "");
        }
      });
      this.previous.addEventListener("click", () => this.turn(-1));
      this.next.addEventListener("click", () => this.turn(1));
      document.querySelector("#booklet-close").addEventListener("click", () => this.close());
      this.dialog.addEventListener("cancel", event => { event.preventDefault(); this.close(); });
      this.dialog.addEventListener("keydown", event => {
        if (event.target.matches("input, textarea")) return;
        if (event.key === "ArrowLeft") { event.preventDefault(); this.turn(-1); }
        if (event.key === "ArrowRight") { event.preventDefault(); this.turn(1); }
      });
      this.page.addEventListener("pointerdown", event => this.startGesture(event));
      this.page.addEventListener("pointermove", event => this.moveGesture(event));
      this.page.addEventListener("pointerup", event => this.endGesture(event));
      this.page.addEventListener("pointercancel", () => this.cancelGesture());
      this.page.addEventListener("lostpointercapture", event => {
        /* Touch transfers implicit capture from the text node to the page. */
        if (event.target === this.page && !this.page.hasPointerCapture(event.pointerId)) this.cancelGesture();
      });
      this.page.addEventListener("scroll", () => {
        if (this.turnState) return;
        this.lastScrollAt = performance.now();
        this.cancelGesture();
      }, { passive: true });
      /* Interrupted gestures and background tabs must never strand a leaf. */
      const settle = () => { if (this.turnState) this.finishTurn(this.turnState.commit); this.gesture = null; };
      window.addEventListener("resize", settle);
      window.addEventListener("blur", settle);
      document.addEventListener("visibilitychange", () => { if (document.hidden) settle(); });
      this.reducedMotion.addEventListener("change", settle);
    }
    open() {
      if (this.busy || this.dialog.open) return;
      this.busy = true;
      this.origin = this.trigger.getBoundingClientRect();
      this.experience.classList.add("is-extracting");
      this.openTimer = setTimeout(() => {
        this.render();
        this.dialog.showModal();
        /* Back dismisses the reader without leaving the album. */
        history.pushState({ ...history.state, twoOfUsBooklet: true }, "");
        this.historyOwned = true;
        this.experience.classList.add("is-reading");
        this.experience.classList.remove("is-extracting");
        const target = this.shell.getBoundingClientRect();
        this.shell.style.setProperty("--origin-x", `${this.origin.x + this.origin.width / 2 - target.x - target.width / 2}px`);
        this.shell.style.setProperty("--origin-y", `${this.origin.y + this.origin.height / 2 - target.y - target.height / 2}px`);
        this.shell.style.setProperty("--origin-scale", this.origin.width / target.width);
        this.cover.hidden = false;
        this.shell.classList.add("is-entering");
        this.animationTimer = setTimeout(() => {
          this.cover.hidden = true;
          this.shell.classList.remove("is-entering");
          this.busy = false;
          this.page.focus({ preventScroll: true });
        }, this.reducedMotion.matches ? 0 : 1160);
      }, this.reducedMotion.matches ? 0 : 300);
    }
    close(fromHistory = false) {
      if (!this.dialog.open || this.closing) return;
      this.closing = true;
      if (!fromHistory && this.historyOwned && history.state?.twoOfUsBooklet) history.back();
      this.historyOwned = false;
      this.finishTurn(false);
      this.gesture = null;
      this.busy = true;
      clearTimeout(this.animationTimer);
      this.player.pause();
      this.leaf.hidden = true;
      this.shell.classList.remove("is-entering");
      this.cover.hidden = false;
      this.shell.classList.add("is-leaving");
      setTimeout(() => {
        this.dialog.close();
        this.shell.classList.remove("is-leaving");
        this.experience.classList.remove("is-reading");
        this.busy = false;
        this.closing = false;
        this.trigger.focus({ preventScroll: true });
      }, this.reducedMotion.matches ? 0 : 350);
    }
    startGesture(event) {
      if (this.busy || !event.isPrimary || event.button !== 0 || event.target.closest("button, input, a") || performance.now() - (this.lastScrollAt || 0) < 120) return;
      this.gesture = null;
      this.gesture = {
        x: event.clientX, y: event.clientY, pointer: event.pointerId,
        at: performance.now(), scrollTop: this.page.scrollTop,
        width: this.page.clientWidth, samples: [{ x: event.clientX, at: performance.now() }], horizontal: false
      };
    }
    moveGesture(event) {
      const gesture = this.gesture;
      if (!gesture || gesture.pointer !== event.pointerId) return;
      const dx = event.clientX - gesture.x;
      const dy = event.clientY - gesture.y;
      if (!gesture.horizontal) {
        if (Math.abs(this.page.scrollTop - gesture.scrollTop) > 2 || (Math.abs(dy) > 9 && Math.abs(dy) >= Math.abs(dx) / 1.5)) {
          this.gesture = null;
          return;
        }
        if (Math.abs(dx) < 12 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
        gesture.direction = dx < 0 ? 1 : -1;
        const target = this.index + gesture.direction;
        if (target < 0 || target >= this.pages.length) { this.gesture = null; return; }
        gesture.horizontal = true;
        this.page.setPointerCapture(event.pointerId);
        if (!this.reducedMotion.matches) this.beginTurn(gesture.direction);
      }
      event.preventDefault();
      const now = performance.now();
      gesture.samples.push({ x: event.clientX, at: now });
      gesture.samples = gesture.samples.filter(sample => now - sample.at <= 100);
      gesture.progress = Math.max(0, Math.min(1, -dx * gesture.direction / gesture.width));
      if (this.turnState) {
        this.turnState.progress = gesture.progress;
        if (!this.dragFrame) this.dragFrame = requestAnimationFrame(() => {
          this.dragFrame = 0;
          if (this.turnState) this.paintTurn(this.turnState.progress);
        });
      }
    }
    endGesture(event) {
      const gesture = this.gesture;
      if (!gesture || gesture.pointer !== event.pointerId) return;
      this.gesture = null;
      if (this.page.hasPointerCapture(event.pointerId)) this.page.releasePointerCapture(event.pointerId);
      const dx = event.clientX - gesture.x;
      const dy = event.clientY - gesture.y;
      if (gesture.horizontal) {
        const sample = gesture.samples[0];
        const velocity = sample ? -(event.clientX - sample.x) * gesture.direction / Math.max(1, performance.now() - sample.at) : 0;
        const distance = -dx * gesture.direction;
        const complete = distance >= gesture.width * .35 || (distance > 28 && velocity > .5);
        if (this.turnState) this.animateTurn(complete);
        else if (complete) this.turn(gesture.direction);
      } else if (Math.abs(this.page.scrollTop - gesture.scrollTop) <= 2 && Math.abs(dx) < 9 && Math.abs(dy) < 9 && performance.now() - gesture.at < 500) {
        const box = this.page.getBoundingClientRect();
        const position = (event.clientX - box.left) / box.width;
        if (position < .19) this.turn(-1);
        if (position > .81) this.turn(1);
      }
    }
    cancelGesture() {
      const gesture = this.gesture;
      this.gesture = null;
      if (gesture && this.page.hasPointerCapture(gesture.pointer)) this.page.releasePointerCapture(gesture.pointer);
      if (gesture?.horizontal && this.turnState) this.animateTurn(false);
    }
    snapshot(page) {
      const copy = page.cloneNode(true);
      copy.removeAttribute("id");
      copy.removeAttribute("tabindex");
      copy.querySelectorAll("[id]").forEach(node => node.removeAttribute("id"));
      copy.querySelectorAll("button, input, a").forEach(node => node.setAttribute("tabindex", "-1"));
      copy.inert = true;
      return copy;
    }
    beginTurn(direction) {
      const target = this.index + direction;
      if (this.busy || !this.dialog.open || target < 0 || target >= this.pages.length) return false;
      this.busy = true;
      const reduced = this.reducedMotion.matches;
      const width = this.page.clientWidth;
      const height = this.page.clientHeight;
      const scrollTop = this.page.scrollTop;
      const oldPage = this.snapshot(this.page);
      const state = this.turnState = { direction, target, progress: 0, scrollTop, width, height, reduced, strips: [], commit: false };
      let face = oldPage;
      if (direction < 0 && !reduced) {
        face = element("article", "book-page");
        this.renderPage(face, target);
        face = this.snapshot(face);
      } else {
        state.previousContent = document.createDocumentFragment();
        while (this.page.firstChild) state.previousContent.append(this.page.firstChild);
        this.renderPage(this.page, target);
        this.page.scrollTop = 0;
        this.updatePlayer();
      }
      this.leaf.className = `turning-leaf${reduced ? " is-crossfading" : ""}`;
      this.leaf.replaceChildren();
      this.leaf.style.setProperty("--leaf-width", `${width}px`);
      this.leaf.style.setProperty("--leaf-height", `${height}px`);
      this.leaf.hidden = false;
      this.shell.classList.add("is-turning");
      if (reduced) {
        this.leaf.append(face);
        face.scrollTop = scrollTop;
      } else {
        this.shadow.hidden = false;
        const count = 6;
        const stripWidth = width / count;
        for (let i = 0; i < count; i++) {
          const strip = element("div", "leaf-strip");
          strip.style.width = `${stripWidth + .4}px`;
          const front = element("div", "leaf-face leaf-front");
          const back = element("div", "leaf-face leaf-back");
          const reverse = element("div", "leaf-back-paper");
          const frontCopy = face.cloneNode(true);
          const backCopy = face.cloneNode(true);
          frontCopy.style.left = backCopy.style.left = `${-i * stripWidth}px`;
          reverse.append(backCopy);
          const shades = [element("div", "leaf-shade"), element("div", "leaf-shade")];
          const highlights = [element("div", "leaf-highlight"), element("div", "leaf-highlight")];
          shades.forEach(node => { node.style.left = `${-i * stripWidth}px`; });
          front.append(frontCopy, shades[0], highlights[0]);
          back.append(reverse, shades[1], highlights[1]);
          strip.append(front, back);
          this.leaf.append(strip);
          frontCopy.scrollTop = backCopy.scrollTop = direction > 0 ? scrollTop : 0;
          state.strips.push({ strip, shades, highlights });
        }
      }
      this.paintTurn(0);
      return true;
    }
    paintTurn(progress) {
      const state = this.turnState;
      if (!state) return;
      state.progress = Math.max(0, Math.min(1, progress));
      if (state.reduced) {
        this.leaf.style.opacity = String(1 - state.progress);
        return;
      }
      const phase = state.direction > 0 ? state.progress : 1 - state.progress;
      const lift = Math.sin(Math.PI * phase);
      /* The free edge leads the spine. A small ripple settles the paper flat. */
      const bend = 42 * lift + 2 * Math.sin(phase * Math.PI * 4) * lift;
      const stripWidth = state.width / state.strips.length;
      let x = 0;
      let z = 0;
      this.leaf.style.transform = `translateZ(0) rotateZ(${-lift * .65}deg)`;
      state.strips.forEach(({ strip, shades, highlights }, i) => {
        const angle = -180 * phase + bend * (1 - 2 * (i + .5) / state.strips.length);
        const radians = angle * Math.PI / 180;
        /* A shared camera per strip avoids flattened ancestor contexts in WebKit. */
        strip.style.transform = `translateX(${state.width / 2}px) perspective(1300px) translateX(${-state.width / 2}px) translate3d(${x}px, 0, ${z}px) rotateY(${angle}deg)`;
        /* Fade each surface, not the preserve-3d parent, near the far edge. */
        const opacity = Math.min(1, (1 - phase) / .12);
        /* Explicit face culling also covers WebKit's nested 3D compositing. */
        strip.firstChild.style.opacity = String(Math.cos(radians) >= 0 ? opacity : 0);
        strip.lastChild.style.opacity = String(Math.cos(radians) < 0 ? opacity : 0);
        const shade = Math.abs(Math.sin(radians));
        shades.forEach(node => { node.style.opacity = String(shade * .78); });
        highlights.forEach(node => { node.style.opacity = String(i === state.strips.length - 1 ? lift * .6 : 0); });
        x += stripWidth * Math.cos(radians);
        z -= stripWidth * Math.sin(radians);
      });
      this.shadow.style.opacity = String(lift * .68);
      this.shadow.style.transform = `translateX(${Math.max(0, x) * .32}px) scaleX(${.18 + lift * .7})`;
    }
    animateTurn(complete, automatic = false) {
      const state = this.turnState;
      if (!state) return;
      cancelAnimationFrame(this.dragFrame);
      cancelAnimationFrame(this.turnFrame);
      this.dragFrame = 0;
      state.commit = complete;
      const start = state.progress;
      const end = complete ? 1 : 0;
      const duration = state.reduced ? 160 : automatic ? 800 : complete ? Math.max(260, 800 * (1 - start)) : 380;
      const started = performance.now();
      const tick = now => {
        if (this.turnState !== state) return;
        const t = Math.min(1, (now - started) / duration);
        /* Automatic turns ease in/out; a released leaf settles from its current pose. */
        const eased = automatic ? t * t * (3 - 2 * t) : 1 - Math.pow(1 - t, 3);
        this.paintTurn(start + (end - start) * eased);
        if (t < 1) this.turnFrame = requestAnimationFrame(tick);
        else this.finishTurn(complete);
      };
      this.turnFrame = requestAnimationFrame(tick);
    }
    finishTurn(complete) {
      const state = this.turnState;
      if (!state) return;
      cancelAnimationFrame(this.dragFrame);
      cancelAnimationFrame(this.turnFrame);
      this.dragFrame = this.turnFrame = 0;
      this.turnState = null;
      this.gesture = null;
      if (complete) {
        if (this.pages[this.index].type === "bonus") this.player.pause();
        this.index = state.target;
        this.render();
      } else if (state.previousContent) {
        this.page.replaceChildren(state.previousContent);
        this.page.scrollTop = state.scrollTop;
        this.updatePlayer();
      }
      this.leaf.hidden = this.shadow.hidden = true;
      this.leaf.replaceChildren();
      this.leaf.className = "turning-leaf";
      this.leaf.removeAttribute("style");
      this.shadow.removeAttribute("style");
      this.shell.classList.remove("is-turning");
      this.busy = false;
    }
    turn(direction) {
      if (this.beginTurn(direction)) this.animateTurn(true, true);
    }
    renderPage(page, index) {
      const definition = this.pages[index];
      const fragment = document.createDocumentFragment();
      fragment.append(element("p", "page-eyebrow", definition.eyebrow), element("h2", "page-title", definition.title));
      if (definition.text) fragment.append(element("p", "page-copy", definition.text));
      if (definition.type === "tracks") {
        const list = element("ol", "track-list");
        definition.trackIds.forEach(id => {
          const position = this.data.tracks.findIndex(track => track.id === id);
          if (position < 0) return;
          const track = this.data.tracks[position];
          const item = element("li", "track-item");
          const copy = element("div");
          copy.append(element("h3", "", track.title), element("p", "track-artist", track.artist), element("p", "", track.description));
          item.append(element("span", "track-number", String(position + 1).padStart(2, "0")), copy);
          list.append(item);
        });
        fragment.append(list);
      } else if (definition.type === "photos") {
        const grid = element("div", "photo-grid");
        definition.photoIds.forEach(id => {
          const photo = this.data.photos.find(item => item.id === id);
          if (!photo) return;
          const figure = element("figure", "photo-slot");
          const image = element("img");
          image.src = photo.file;
          image.alt = photo.alt;
          image.draggable = false;
          figure.append(image, element("figcaption", "", photo.caption));
          grid.append(figure);
        });
        fragment.append(grid);
      } else if (definition.type === "credits") {
        const credits = element("dl", "credits-list");
        this.data.credits.forEach(credit => credits.append(element("dt", "", credit.role), element("dd", "", credit.name)));
        fragment.append(credits);
      } else if (definition.type === "bonus") {
        fragment.append(element("p", "page-copy", this.data.bonusTrack.description));
        const player = document.querySelector("#bonus-player-template").content.cloneNode(true);
        const artwork = player.querySelector(".bonus-art");
        if (artwork) artwork.src = this.data.images.bonusArtwork;
        player.querySelector(".bonus-title").textContent = this.data.bonusTrack.title;
        player.querySelector(".bonus-artist").textContent = this.data.bonusTrack.artist;
        player.querySelector(".bonus-toggle").addEventListener("click", () => this.player.toggle());
        player.querySelector(".bonus-previous").addEventListener("click", () => this.player.restart());
        player.querySelector(".bonus-next").addEventListener("click", () => this.player.restart());
        player.querySelector(".bonus-seek").addEventListener("input", event => this.player.seek(Number(event.target.value)));
        fragment.append(player);
      } else {
        (definition.paragraphs || []).forEach(paragraph => fragment.append(element("p", "page-copy", paragraph)));
        if (definition.signature) fragment.append(element("p", "signature", definition.signature));
      }
      fragment.append(element("p", "page-mark", String(index + 1).padStart(2, "0")));
      page.replaceChildren(fragment);
    }
    render() {
      this.renderPage(this.page, this.index);
      this.dialog.classList.toggle("is-bonus-page", this.pages[this.index].type === "bonus");
      this.page.scrollTop = 0;
      this.previous.disabled = this.index === 0;
      this.next.disabled = this.index === this.pages.length - 1;
      this.counter.textContent = `${String(this.index + 1).padStart(2, "0")} / ${String(this.pages.length).padStart(2, "0")}`;
      this.updatePlayer();
    }
    updatePlayer() {
      const panel = this.page.querySelector(".bonus-player");
      if (!panel) return;
      const player = this.player;
      const toggle = panel.querySelector(".bonus-toggle");
      toggle.classList.toggle("is-playing", player.isPlaying);
      panel.classList.toggle("is-playing", player.isPlaying);
      toggle.setAttribute("aria-pressed", String(player.isPlaying));
      toggle.setAttribute("aria-label", player.isPlaying ? "Pausar faixa extra" : "Reproduzir faixa extra");
      toggle.setAttribute("aria-busy", String(player.pending));
      const seek = panel.querySelector(".bonus-seek");
      seek.disabled = !player.canSeek;
      seek.max = player.duration || 1;
      seek.value = player.audio.currentTime || 0;
      seek.style.setProperty("--progress", `${player.duration ? player.audio.currentTime / player.duration * 100 : 0}%`);
      seek.setAttribute("aria-valuetext", `${window.formatTime(player.audio.currentTime)} de ${window.formatTime(player.duration)}`);
      panel.querySelector(".bonus-elapsed").textContent = window.formatTime(player.audio.currentTime);
      panel.querySelector(".bonus-duration").textContent = window.formatTime(player.duration);
      panel.querySelector(".bonus-error").textContent = player.error;
    }
  }
  window.AlbumBooklet = AlbumBooklet;
})();
