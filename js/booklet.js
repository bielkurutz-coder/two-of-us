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
      this.cover = document.querySelector("#reader-cover");
      this.previous = document.querySelector("#page-prev");
      this.next = document.querySelector("#page-next");
      this.counter = document.querySelector("#page-counter");
      this.trigger = document.querySelector("#booklet-trigger");
      this.experience = document.querySelector("#experience");
      this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      this.previous.addEventListener("click", () => this.turn(-1));
      this.next.addEventListener("click", () => this.turn(1));
      document.querySelector("#booklet-close").addEventListener("click", () => this.close());
      this.dialog.addEventListener("cancel", event => { event.preventDefault(); this.close(); });
      this.dialog.addEventListener("keydown", event => {
        if (event.target.matches("input, textarea")) return;
        if (event.key === "ArrowLeft") { event.preventDefault(); this.turn(-1); }
        if (event.key === "ArrowRight") { event.preventDefault(); this.turn(1); }
      });
      this.page.addEventListener("pointerdown", event => {
        this.gesture = null;
        if (!event.isPrimary || event.target.closest("button, input, a")) return;
        this.gesture = { x: event.clientX, y: event.clientY, pointer: event.pointerId, at: Date.now() };
        this.page.setPointerCapture(event.pointerId);
      });
      this.page.addEventListener("pointerup", event => {
        const start = this.gesture;
        this.gesture = null;
        if (!start || start.pointer !== event.pointerId) return;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) {
          this.turn(dx < 0 ? 1 : -1);
        } else if (Math.abs(dx) < 9 && Math.abs(dy) < 9 && Date.now() - start.at < 500) {
          const box = this.page.getBoundingClientRect();
          const position = (event.clientX - box.left) / box.width;
          if (position < .19) this.turn(-1);
          if (position > .81) this.turn(1);
        }
      });
      this.page.addEventListener("pointercancel", () => { this.gesture = null; });
    }
    open() {
      if (this.busy || this.dialog.open) return;
      this.busy = true;
      this.origin = this.trigger.getBoundingClientRect();
      this.experience.classList.add("is-extracting");
      this.openTimer = setTimeout(() => {
        this.render();
        this.dialog.showModal();
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
    close() {
      if (!this.dialog.open || this.closing) return;
      this.closing = true;
      this.busy = true;
      clearTimeout(this.animationTimer);
      clearTimeout(this.turnTimer);
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
    turn(direction) {
      const target = this.index + direction;
      if (this.busy || target < 0 || target >= this.pages.length) return;
      this.busy = true;
      if (this.pages[this.index].type === "bonus") this.player.pause();
      const oldPage = this.page.cloneNode(true);
      this.index = target;
      this.render();
      const face = direction > 0 ? oldPage : this.page.cloneNode(true);
      face.removeAttribute("id");
      face.removeAttribute("tabindex");
      face.querySelectorAll("[id]").forEach(node => node.removeAttribute("id"));
      face.inert = true;
      this.leaf.replaceChildren(face);
      this.leaf.className = `turning-leaf ${direction > 0 ? "turn-forward" : "turn-back"}`;
      this.leaf.hidden = false;
      this.turnTimer = setTimeout(() => {
        this.leaf.hidden = true;
        this.leaf.replaceChildren();
        this.busy = false;
      }, this.reducedMotion.matches ? 0 : 500);
    }
    render() {
      const definition = this.pages[this.index];
      this.dialog.classList.toggle("is-bonus-page", definition.type === "bonus");
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
        player.querySelector(".bonus-art").src = this.data.images.bonusArtwork;
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
      fragment.append(element("p", "page-mark", String(this.index + 1).padStart(2, "0")));
      this.page.replaceChildren(fragment);
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
