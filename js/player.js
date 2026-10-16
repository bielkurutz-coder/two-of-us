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
      this.buffering = false;
      this.prepared = null;
      this.objectURL = null;
      this.finished = false;
      this.error = "";
      this.request = 0;
      ["loadedmetadata", "durationchange", "timeupdate", "play", "playing", "pause", "waiting", "stalled", "seeked", "canplay"].forEach(event => {
        audio.addEventListener(event, () => {
          if (event === "waiting" || (event === "stalled" && audio.readyState < 3)) this.buffering = !audio.paused;
          if (["playing", "pause", "canplay"].includes(event)) this.buffering = false;
          this.prepareNext();
          this.emit();
        });
      });
      audio.addEventListener("progress", () => this.prepareNext());
      audio.addEventListener("error", () => {
        this.pending = false;
        this.buffering = false;
        this.error = "Não foi possível abrir o áudio. Confira o arquivo e toque para tentar novamente.";
        this.emit();
      });
      audio.addEventListener("ended", () => {
        if (this.index < this.tracks.length - 1) {
          this.index += 1;
          this.loaded = false;
          this.play();
        } else {
          this.finished = true;
          this.pending = false;
          this.emit();
        }
      });
    }
    get track() { return this.tracks[this.index]; }
    get isPlaying() { return !this.audio.paused && !this.audio.ended && !this.audio.error && !this.buffering && this.audio.readyState >= 2; }
    get duration() { return Number.isFinite(this.audio.duration) ? this.audio.duration : this.track?.durationHint || 0; }
    get canSeek() { return Number.isFinite(this.audio.duration) && this.audio.duration > 0; }
    emit() { if (this.onChange) this.onChange(this); }
    prepareNext() {
      const next = this.index + 1;
      const remaining = this.duration - this.audio.currentTime;
      if (!this.isPlaying || !this.tracks[next]?.file || remaining > 90 || remaining <= 0 || this.prepared?.index === next) return;
      /* Do not compete with a starved current track. Keep only one next file
         in memory, and retain the same unlocked audio element on iOS. */
      const ranges = this.audio.buffered;
      let ahead = 0;
      for (let i = 0; i < ranges.length; i++) {
        if (ranges.start(i) <= this.audio.currentTime && ranges.end(i) >= this.audio.currentTime) ahead = ranges.end(i) - this.audio.currentTime;
      }
      if (ahead < Math.min(15, remaining - .1)) return;
      this.clearPrepared();
      const prepared = this.prepared = { index: next, controller: new AbortController(), url: null };
      fetch(this.tracks[next].file, { signal: prepared.controller.signal, cache: "force-cache", priority: "low" })
        .then(response => { if (!response.ok) throw new Error("Next track unavailable"); return response.blob(); })
        .then(blob => { if (this.prepared === prepared) prepared.url = URL.createObjectURL(blob); })
        /* A failed warm-up is not a playback error: normal loading retries it. */
        .catch(() => {});
    }
    clearPrepared() {
      this.prepared?.controller.abort();
      if (this.prepared?.url) URL.revokeObjectURL(this.prepared.url);
      this.prepared = null;
    }
    load(index) {
      if (!this.tracks[index]?.file) throw new Error("Missing audio source");
      this.index = index;
      this.finished = false;
      this.error = "";
      this.buffering = false;
      const oldURL = this.objectURL;
      this.objectURL = this.prepared?.index === index ? this.prepared.url : null;
      if (this.objectURL) this.prepared.url = null;
      this.clearPrepared();
      this.audio.src = this.objectURL || this.track.file;
      this.audio.load();
      if (oldURL) URL.revokeObjectURL(oldURL);
      this.loaded = true;
      this.emit();
    }
    async play() {
      const request = ++this.request;
      this.pending = true;
      this.error = "";
      try {
        this.onBeforePlay();
        if (!this.loaded || this.audio.error) this.load(this.index);
        if (this.finished) this.load(0);
        this.emit();
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
      this.buffering = false;
      this.audio.pause();
      this.emit();
    }
    toggle() { if (!this.audio.paused || this.pending) this.pause(); else this.play(); }
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
