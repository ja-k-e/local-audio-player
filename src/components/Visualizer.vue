<template>
  <div id="wrapper" v-if="track.id">
    <div id="visualizer" ref="visualizer">
      <div class="background"
        :style="{ backgroundImage }"></div>
      <canvas ref="cvsMain"></canvas>
    </div>
    <div id="audio">
      <nav>
        <button id="play" :class="{ active: playing }" @click="playToggle">
          <span v-if="!playing"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M60.54,512c-17.06,0-30.43-13.86-30.43-31.56V31.55C30.12,13.86,43.48,0,60.55,0A32.94,32.94,0,0,1,77,4.52L465.7,229c10.13,5.85,16.18,16,16.18,27s-6,21.2-16.18,27L77,507.48A32.92,32.92,0,0,1,60.55,512Z"/></svg></span>
          <span v-else><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M395,512a73.14,73.14,0,0,1-73.14-73.14V73.14a73.14,73.14,0,1,1,146.29,0V438.86A73.14,73.14,0,0,1,395,512Z"/><path d="M117,512a73.14,73.14,0,0,1-73.14-73.14V73.14a73.14,73.14,0,1,1,146.29,0V438.86A73.14,73.14,0,0,1,117,512Z"/></svg></span>
        </button>
        <button id="prev" @click="playPrev">
          <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M481.76,510.43c17,0,30.24-13.78,30.24-31.36V32.93c0-17.58-13.28-31.36-30.25-31.36a32.73,32.73,0,0,0-16.3,4.49L128.61,229.12C118.54,234.93,112.53,245,112.53,256s6,21.07,16.08,26.87L465.45,505.94a32.72,32.72,0,0,0,16.3,4.49Z"/><path d="M61.94,499.51a61.94,61.94,0,0,0,61.94-61.93V74.42A61.94,61.94,0,0,0,0,74.42V437.58A61.94,61.94,0,0,0,61.94,499.51Z"/></svg></span>
        </button>
        <button id="next" @click="playNext">
          <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M30.24,510.43c-17,0-30.24-13.78-30.24-31.36V32.93C0,15.35,13.28,1.57,30.25,1.57a32.73,32.73,0,0,1,16.3,4.49L383.39,229.12c10.07,5.81,16.08,15.86,16.08,26.88s-6,21.07-16.08,26.87L46.55,505.94a32.72,32.72,0,0,1-16.3,4.49Z"/><path d="M450.06,499.51a61.94,61.94,0,0,1-61.94-61.93V74.42a61.94,61.94,0,0,1,123.88,0V437.58A61.94,61.94,0,0,1,450.06,499.51Z"/></svg></span>
        </button>
      </nav>
      <div class="progress" ref="progress"
        @mousedown="progressMousedown"
        @mousemove="progressMousemove"
        @mouseleave="progressMove"
        @mouseup="progressMove"
      >
        <span :style="{ width: progressWidth }"></span>
        <canvas ref="cvsProg"></canvas>
      </div>
    </div>
  </div>
</template>

<script>
import Visualizer from "../classes/Visualizer.js";
import Waveform from "../classes/Waveform.js";

export default {
  props: {
    audioSrc: MediaElementAudioSourceNode,
    playing: Boolean,
    playNext: Function,
    playPrev: Function,
    playToggle: Function,
    progress: Number,
    track: Object,
    updateProgress: Function
  },
  watch: {
    track(val) {
      this.visualizer.updateImage(val.image);
    }
  },
  computed: {
    backgroundImage() {
      return this.track.image ? `url('${this.track.image}')` : "none";
    },
    progressWidth() {
      return `${this.progress * 100}%`;
    }
  },
  methods: {
    initialize() {
      this.analyserFreq = this.audioSrc.context.createAnalyser();
      this.analyserTime = this.audioSrc.context.createAnalyser();
      this.audioSrc.connect(this.analyserFreq);
      this.audioSrc.connect(this.analyserTime);
      this.audioSrc.connect(this.audioSrc.context.destination);
      this.$refs.cvsMain.width = this.$refs.visualizer.clientWidth;
      this.$refs.cvsMain.height = this.$refs.visualizer.clientHeight;
      this.$refs.cvsProg.width = this.$refs.progress.clientWidth;
      this.$refs.cvsProg.height = this.$refs.progress.clientHeight;

      this.analyserFreq.fftSize = 256 / 2;
      this.analyserFreq.smoothingTimeConstant = 0.3;
      this.analyserTime.fftSize = 1024;
      this.bufferLengthFreq = this.analyserFreq.frequencyBinCount;
      this.bufferLengthTime = this.analyserTime.frequencyBinCount;
      this.dataArrayFreq = new Uint8Array(this.bufferLengthFreq);
      this.dataArrayTime = new Uint8Array(this.bufferLengthTime);

      this.visualizer = new Visualizer({
        context: this.$refs.cvsMain.getContext("2d"),
        bufferLengthFreq: this.bufferLengthFreq,
        bufferLengthTime: this.bufferLengthTime,
        dataArrayFreq: this.dataArrayFreq,
        dataArrayTime: this.dataArrayTime
      });

      this.visualizer.updateImage(this.track.image);

      this.waveform = new Waveform({
        context: this.$refs.cvsProg.getContext("2d"),
        bufferLengthTime: this.bufferLengthTime,
        dataArrayTime: this.dataArrayTime
      });

      this.renderFrame();
    },
    progressMousedown() {
      this.mousedown = true;
    },
    progressMousemove({ offsetX, target }) {
      if (!this.mousedown) return;
      this.updateProgress(offsetX / target.clientWidth);
    },
    progressMove({ offsetX, target }) {
      if (!this.mousedown) return;
      this.updateProgress(offsetX / target.clientWidth);
      this.mousedown = false;
    },
    renderFrame() {
      this.animFrame = requestAnimationFrame(this.renderFrame.bind(this));
      this.analyserFreq.getByteFrequencyData(this.dataArrayFreq);
      this.analyserTime.getByteTimeDomainData(this.dataArrayTime);

      this.renderMainAnimation();
      this.renderProgAnimation();
    },
    renderMainAnimation() {
      let width = (this.$refs.cvsMain.width = this.$refs.visualizer.clientWidth);
      let height = (this.$refs.cvsMain.height = this.$refs.visualizer.clientHeight);
      this.visualizer.tick(width, height, this.playing);
    },
    renderProgAnimation() {
      const width = (this.$refs.cvsProg.width = this.$refs.progress.clientWidth);
      const height = (this.$refs.cvsProg.height = this.$refs.progress.clientHeight);
      this.waveform.tick(width, height, this.progress);
    }
  },
  beforeDestroy() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
  },
  mounted() {
    this.initialize();
  }
};
</script>

<style scoped>
#wrapper {
  flex: 1;
  --audio-height: 50px;
}
#visualizer {
  height: calc(100% - var(--audio-height));
  position: relative;
  overflow: hidden;
}
#wrapper,
#visualizer .background,
#visualizer canvas {
  height: 100%;
}
#visualizer .background,
#visualizer canvas {
  width: 100%;
}
#visualizer .background {
  background-position: center;
  background-color: white;
  background-size: cover;
  background-repeat: no-repeat;
  image-rendering: pixelated;
  z-index: 1;
  filter: brightness(60%) blur(4px);
  transform: scale(1.2);
}
#visualizer canvas {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
#audio {
  height: var(--audio-height);
  display: flex;
}
#audio nav {
  display: flex;
}
#audio nav button:hover {
  background: rgba(255, 255, 255, 0.1);
}
#audio nav button {
  flex: 1;
  cursor: pointer;
  width: var(--audio-height);
  appearance: none;
  background: transparent;
  border: none;
  outline: none;
  padding: 0;
  margin-right: 0.125rem;
}
#audio nav button span {
  display: flex;
  align-content: center;
  justify-content: center;
  text-align: center;
  width: 100%;
}
#audio nav button span svg {
  width: 10px;
  height: 10px;
  fill: white;
  display: block;
}
#audio .progress {
  flex: 1;
  cursor: col-resize;
}
#audio canvas {
  height: 100%;
  width: 100%;
}
</style>


