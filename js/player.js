/* One HTMLAudioElement per listening context; never overlap the two sources. */
(() => {
  "use strict";
  class AlbumPlayer {
    constructor(audio, tracks, onChange) {
      this.audio = audio;
      this.tracks = tracks;
      this.index = 0;
      this.onChange = onChange;
      this.onBeforePlay = () => {};
      this.loaded = false;
      this.pending = false;
      this.finished = false;
      this.error = "";
      this.request = 0;
      ["loadedmetadata", "durationchange", "timeupdate", "play", "playing", "pause", "waiting", "seeked"].forEach(event => {
        audio.addEventListener(event, () => this.emit());
      });
      audio.addEventListener("error", () => {
        this.pending = false;
        this.error = "Não foi possível abrir o áudio. Confira o arquivo e toque para tentar novamente.";
        this.emit();
      });
      audio.addEventListener("ended", () => {
        if (this.index < this.tracks.length - 1) {
          this.load(this.index + 1);
          this.play();
        } else {
          this.finished = true;
          this.pending = false;
          this.emit();
        }
      });
    }
    get track() { return this.tracks[this.index]; }
    get isPlaying() { return !this.audio.paused && !this.audio.ended && !this.audio.error; }
    get duration() { return Number.isFinite(this.audio.duration) ? this.audio.duration : this.track.durationHint || 0; }
    get canSeek() { return Number.isFinite(this.audio.duration) && this.audio.duration > 0; }
    emit() { if (this.onChange) this.onChange(this); }
    load(index) {
      this.index = index;
      this.finished = false;
      this.error = "";
      this.audio.src = this.track.file;
      this.audio.load();
      this.loaded = true;
      this.emit();
    }
    async play() {
      this.onBeforePlay();
      if (!this.loaded || this.audio.error) this.load(this.index);
      if (this.finished) this.load(0);
      const request = ++this.request;
      this.pending = true;
      this.error = "";
      this.emit();
      try {
        await this.audio.play();
      } catch (error) {
        if (request !== this.request || error.name === "AbortError") return;
        this.error = error.name === "NotAllowedError"
          ? "Toque novamente para autorizar a reprodução neste navegador."
          : "Áudio indisponível. Confira o caminho em js/data.js e toque para tentar novamente.";
      } finally {
        if (request === this.request) { this.pending = false; this.emit(); }
      }
    }
    pause() {
      ++this.request;
      this.pending = false;
      this.audio.pause();
      this.emit();
    }
    toggle() { if (this.isPlaying || this.pending) this.pause(); else this.play(); }
    seek(seconds) {
      if (!this.canSeek) return;
      this.audio.currentTime = Math.max(0, Math.min(seconds, this.audio.duration));
      this.finished = false;
      this.emit();
    }
    restart() {
      if (!this.loaded) { this.play(); return; }
      this.seek(0);
      this.play();
    }
  }
  window.AlbumPlayer = AlbumPlayer;
  window.formatTime = seconds => {
    const value = Math.max(0, Math.floor(Number(seconds) || 0));
    return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
  };
})();
