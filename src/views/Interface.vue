<template>
  <section>
    <aside id="sidebar" :class="{ collapsed }">
      <AlbumLists class="will-collapse" :albums="albums" v-if="albums" :current-track="currentTrack" :set-track="setTrack" />
      <button @click="collapsed = !collapsed">
        <svg v-if="collapsed" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 50 50" version="1.1" width="50" height="50"><path style=" " d="M 0 7.5 L 0 12.5 L 50 12.5 L 50 7.5 Z M 0 22.5 L 0 27.5 L 50 27.5 L 50 22.5 Z M 0 37.5 L 0 42.5 L 50 42.5 L 50 37.5 Z "/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="30" height="30"><path d="M 7 4 C 6.744125 4 6.4879687 4.0974687 6.2929688 4.2929688 L 4.2929688 6.2929688 C 3.9019687 6.6839688 3.9019687 7.3170313 4.2929688 7.7070312 L 11.585938 15 L 4.2929688 22.292969 C 3.9019687 22.683969 3.9019687 23.317031 4.2929688 23.707031 L 6.2929688 25.707031 C 6.6839688 26.098031 7.3170313 26.098031 7.7070312 25.707031 L 15 18.414062 L 22.292969 25.707031 C 22.682969 26.098031 23.317031 26.098031 23.707031 25.707031 L 25.707031 23.707031 C 26.098031 23.316031 26.098031 22.682969 25.707031 22.292969 L 18.414062 15 L 25.707031 7.7070312 C 26.098031 7.3170312 26.098031 6.6829688 25.707031 6.2929688 L 23.707031 4.2929688 C 23.316031 3.9019687 22.682969 3.9019687 22.292969 4.2929688 L 15 11.585938 L 7.7070312 4.2929688 C 7.5115312 4.0974687 7.255875 4 7 4 z"/></svg>
      </button>
    </aside>
    <Visualizer
      :audio-src="audioSrc"
      :playing="playing"
      :play-next="playNext"
      :play-prev="playPrev"
      :play-toggle="playToggle"
      :progress="progress"
      :track="currentTrack"
      :update-progress="updateProgress"
      v-if="currentTrack.id && audioSrc" />
    <audio ref="audio"></audio>
  </section>
</template>

<script>
import Album from "../classes/Album.js";
import AlbumLists from "../components/AlbumLists.vue";
import Visualizer from "../components/Visualizer.vue";

export default {
  props: {
    files: Object
  },
  data() {
    const albums = Object.values(this.files).map(a => new Album(a));
    let tracks = {};
    let trackIds = [];
    albums.forEach(album => {
      tracks = Object.assign(tracks, album.tracks);
      trackIds = trackIds.concat(album.trackIds);
    });
    return {
      albums,
      audioSrc: null,
      collapsed: false,
      currentTrack: {},
      currentTrackIdx: 0,
      mousedown: false,
      playing: false,
      progress: 0,
      tracks,
      trackIds
    };
  },
  computed: {},
  methods: {
    setTrack(track) {
      this.currentTrack = this.tracks[track.id];
      this.currentTrackIdx = this.trackIds.indexOf(track.id);
      this.$refs.audio.pause();
      this.$refs.audio.src = URL.createObjectURL(track.file);
      this.updateProgress(0);
      this.play();
    },

    updateProgress(progress) {
      this.progress = progress;
      if (this.$refs.audio.duration)
        this.$refs.audio.currentTime = this.$refs.audio.duration * progress;
    },

    initializeAudio() {
      let audioContext = window.AudioContext || window.webkitAudioContext;
      let ctx = new audioContext();
      this.audioSrc = ctx.createMediaElementSource(this.$refs.audio);
      let _self = this;
      this.eventTimeUpdate = ({ target }) => {
        if (_self.mousedown || !target) return;
        let { currentTime, duration } = target;
        _self.progress = currentTime === 0 ? 0 : currentTime / duration;
      };
      this.eventEnded = () => _self.playNext();
      this.$refs.audio.addEventListener("timeupdate", this.eventTimeUpdate);
      this.$refs.audio.addEventListener("ended", this.eventEnded);
      this.play();
    },

    playNext() {
      const idx = (this.currentTrackIdx + 1) % this.trackIds.length;
      this.setTrack(this.tracks[this.trackIds[idx]]);
    },

    playPrev() {
      const len = this.trackIds.length;
      const idx = (this.currentTrackIdx - 1 + len) % len;
      this.setTrack(this.tracks[this.trackIds[idx]]);
    },

    playToggle() {
      if (this.playing) this.pause();
      else this.play();
    },

    play() {
      this.playing = true;
      this.$refs.audio.play();
    },

    pause() {
      this.playing = false;
      this.$refs.audio.pause();
    }
  },
  components: { AlbumLists, Visualizer },
  beforeDestroy() {
    if (this.eventKeyup) window.removeEventListener("keyup", this.eventKeyup);
    if (this.eventTimeUpdate)
      this.$refs.audio.removeEventListener("timeupdate", this.eventTimeUpdate);
    if (this.eventEnded)
      this.$refs.audio.removeEventListener("ended", this.eventEnded);
    if (this.timeoutRate) window.clearTimeout(this.timeoutRate);
  },
  mounted() {
    this.initializeAudio();
    this.setTrack(this.tracks[this.trackIds[0]]);
    let _self = this;
    this.eventKeyup = ({ keyCode }) => {
      const SPACE = 32;
      const R = 39;
      const L = 37;
      if (keyCode === SPACE) _self.playToggle();
      else if (keyCode === R) _self.playNext();
      else if (keyCode === L) _self.playPrev();
    };
    window.addEventListener("keyup", this.eventKeyup);
  }
};
</script>

<style scoped>
#sidebar {
  width: 350px;
  max-width: 50%;
  box-sizing: border-box;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  background: black;
  border-right: 1px solid #222;
  transition: padding 200ms ease-in-out, width 200ms ease-in-out;
  height: 100%;
}
#sidebar .lists {
  flex: 1;
}
#sidebar > button svg {
  fill: white;
  width: 14px;
  height: 14px;
}
#sidebar > button {
  align-self: flex-end;
  display: block;
  margin-top: auto;
  width: 100%;
  background: #000;
  outline: none;
  cursor: pointer;
  color: white;
  font-size: 0.8rem;
  border: none;
  padding: 0.25rem;
  position: fixed;
  z-index: 999;
  height: 50px;
  width: 50px;
  top: 0;
  left: 350px;
  transition: left 200ms ease-in-out;
}
#sidebar.collapsed > button {
  left: 0;
}
#sidebar.collapsed .will-collapse {
  opacity: 0;
  transition: opacity 0 ease-in-out;
}
#sidebar:not(.collapsed) .will-collapse {
  transition: opacity 100ms ease-in-out 200ms;
}
#sidebar.collapsed {
  width: 0px;
  padding: 0;
}
</style>


