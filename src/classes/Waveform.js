export default class Waveform {
  constructor({ context, bufferLengthTime, dataArrayTime }) {
    this.ctx = context;
    this.bufferLengthTime = bufferLengthTime;
    this.dataArrayTime = dataArrayTime;
  }

  tick(width, height, progress) {
    this.ctx.fillStyle = "#333";
    this.ctx.fillRect(0, 0, width * progress, height);
    this.ctx.lineWidth = width > 1024 ? 2 : 1;
    this.ctx.lineJoin = "round";
    this.ctx.lineCap = "round";
    this.ctx.strokeStyle = "white";
    this.ctx.beginPath();
    let sliceWidth = (width * 1.0) / (this.bufferLengthTime - 1);
    let x = 0;

    for (let i = 0; i < this.bufferLengthTime; i++) {
      let v = this.dataArrayTime[i] / 128.0;
      let y = v * height * 0.3 + height * 0.2;
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
      x += sliceWidth;
    }
    this.ctx.stroke();
  }
}
