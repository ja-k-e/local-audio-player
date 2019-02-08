import Track from "./Track.js";

export default class Album {
  constructor(album) {
    let first = Object.values(album)[0];
    this.title = first.album || "Untitled Album";
    this.year = first.year;
    this.artists = [];
    this.images = [];
    Object.values(album).forEach(({ image, artist }) => {
      if (!this.artists.includes(artist)) this.artists.push(artist);
      if (!this.images.includes(image)) this.images.push(image);
    });
    this.trackIds = [];
    this.tracks = {};
    Object.values(album).forEach((track, i) => {
      track.idx = i;
      let t = new Track(track);
      this.trackIds.push(t.id);
      this.tracks[t.id] = t;
    });
    this.image = this.images[0];
    this.id = this.tracks[this.trackIds[0]].id;
    this.trackIds.sort((a, b) => {
      let trackA = parseInt(this.tracks[a].track),
        trackB = parseInt(this.tracks[b].track);
      if (trackA > trackB) return 1;
      if (trackA < trackB) return -1;
      return 0;
    });
  }
}
