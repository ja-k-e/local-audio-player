export default class Track {
  constructor({ title, album, artist, year, file, image, track, idx }) {
    this.id = this._generateId();
    this.idx = idx;
    this.title = title || `Untitled Track ${idx + 1}`;
    this.album = album;
    this.artist = artist;
    this.year = year;
    this.file = file;
    this.image = image;
    this.track = track || idx + 1;
  }

  _generateId() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
      let r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
