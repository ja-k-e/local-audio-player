<template>
  <div id="app">
    <Loader v-if="view === 0" :handle-data="handleData" :handle-error="handleError" />
    <Interface v-if="view === 1" :files="files" />
  </div>
</template>

<script>
import Interface from "./views/Interface.vue";
import Loader from "./views/Loader.vue";
export default {
  name: "app",
  data() {
    return {
      files: {},
      view: 0
    };
  },
  methods: {
    handleData(files) {
      this.files = files;
      this.view = 1;
    },
    handleError(error) {
      // eslint-disable-next-line
      console.error(error);
    }
  },
  components: { Interface, Loader }
};
</script>

<style>
html,
body,
#app {
  height: 100%;
  overflow: hidden;
}

body {
  color: white;
  background-color: #101010;
  background-position: center;
  font-family: BlinkMacSystemFont, -apple-system, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    "Helvetica", "Arial", sans-serif;
}

section {
  display: flex;
  height: 100%;
}
</style>
