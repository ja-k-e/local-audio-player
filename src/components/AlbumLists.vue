<template>
  <div class="lists" ref="lists">
    <div v-for="album in albums" :key="album.id">
      <p class="album" @click="albumId === album.id ? albumId = null : albumId = album.id">
        <span v-if="album.image" class="img"><img :src="album.image" /></span>
        <span v-else class="svg" v-html="blankSvg"></span>
        <span class="title">
          <span>
            {{ album.title }}
            <span v-if="album.year">({{ album.year }})</span>
          </span>
        </span>
      </p>
      <ul v-if="albumId === album.id">
        <li v-for="id in album.trackIds" :key="id" :class="{ active: currentTrack.id === id }">
          <button @click="setTrack(album.tracks[id])">
            <span>{{ album.tracks[id].track.toString().replace(/\/.+/, "") }}</span>&nbsp;
            <span><span>{{ album.tracks[id].title }} <em>{{ album.tracks[id].artist }}</em></span></span>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
const BLANK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 4" height="4" width="4"><rect x="0" y="0" width="4" height="4" /></svg>`;

export default {
  props: {
    albums: Array,
    currentTrack: Object,
    setTrack: Function
  },
  data() {
    return {
      albumId: this.albums[0].id,
      blankSvg: BLANK_SVG
    };
  }
};
</script>

<style scoped>
.lists {
  overflow-y: auto;
  user-select: none;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
p {
  margin: 0;
}
p,
li button {
  font-size: 12px;
  display: flex;
}
li button {
  display: flex;
  width: 100%;
  appearance: none;
  background: transparent;
  color: white;
  border: none;
  padding: 0;
  font-size: 0.7rem;
  outline: none;
  cursor: pointer;
}
li:not(.active) button:hover {
  background: rgba(255, 255, 255, 0.1);
}
li button > span {
  display: block;
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  height: 30px;
}
li button > span:first-child {
  width: 30px;
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
}
li button > span:last-child {
  flex: 1;
  text-align: left;
}
li button > span:last-child em {
  color: rgba(255, 255, 255, 0.4);
}
ul,
p {
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}
p {
  cursor: pointer;
}
p:hover {
  background: rgba(255, 255, 255, 0.1);
}
li + li {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}
ul {
  background: rgba(255, 255, 255, 0.1);
}
li.active button {
  background: #333;
}
.img,
.svg {
  width: 30px;
  height: 30px;
}
.img img,
.svg >>> svg {
  width: 100%;
  height: auto;
  fill: #666;
}
.title {
  font-weight: bold;
  flex: 1;
  margin-left: 12px;
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
}
</style>

