<template>
  <section>
    <div>
      <input id="folder" @change="e => handleInput(e)" type="file" multiple webkitdirectory directory />
      <p><span>Folder</span>Drop or Click to Load</p>
    </div>
    <div>
      <input id="file" @change="e => handleInput(e)" type="file" multiple />
      <p><span>File(s)</span>Drop or Click to Load</p>
    </div>
  </section>
</template>

<script>
import jsmediatags from "jsmediatags";

export default {
  props: {
    handleData: Function,
    handleError: Function
  },
  methods: {
    handleFiles(files, count) {
      const data = {};
      const _self = this;
      files.forEach((file, i) => {
        jsmediatags.read(file, {
          onSuccess({ tags }) {
            let { album, artist, title, picture, track, year } = tags;
            let image = null;
            if (picture) {
              let base64 = "";
              for (let i = 0; i < picture.data.length; i++)
                base64 += String.fromCharCode(picture.data[i]);
              image = `data: ${picture.format};base64,${window.btoa(base64)}`;
            }
            data[album] = data[album] || {};
            data[album][i] = {
              file,
              title,
              artist,
              album,
              track,
              year,
              image,
              idx: i
            };
            count--;
            if (count <= 0) _self.handleData(data);
          },
          onError(error) {
            _self.handleError(error);
          }
        });
      });
    },
    handleInput({ target }) {
      const files = Array.from(target.files).filter(
        f => f.type.match(/^audio\//) !== null
      );
      const count = files.length;
      if (count > 0) this.handleFiles(files, count);
    }
  }
};
</script>

<style lang="css" scoped>
section > div {
  flex: 1;
  height: 100%;
}
section > div + div {
  border-left: 1px solid #202020;
}
section > div p {
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  margin: 0;
  flex-direction: column;
  justify-content: center;
  align-content: center;
  color: #ffffff;
}
section > div p span {
  font-size: 4rem;
}
section > div input {
  cursor: pointer;
  position: absolute;
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  outline: none;
  opacity: 0;
}
</style>
