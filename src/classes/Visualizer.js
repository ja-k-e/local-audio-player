const PI = Math.PI;

export default class Visualizer {
  constructor({
    context,
    bufferLengthFreq,
    bufferLengthTime,
    dataArrayFreq,
    dataArrayTime
  }) {
    this.ctx = context;
    this.bufferLengthFreq = bufferLengthFreq;
    this.bufferLengthTime = bufferLengthTime;
    this.dataArrayFreq = dataArrayFreq;
    this.dataArrayTime = dataArrayTime;
    this.rot = 0;
    let rpm = 33.3333;
    let mpr = 1 / rpm; // minutes per rotation
    this.spr = mpr * 60; // seconds per rotation
    this.imageLoaded = false;
    this.prevTime = null;
  }

  updateImage(imgSrc) {
    this.imageLoaded = false;
    if (!imgSrc) return;
    // imgSrc = imgSrc || "/default-record.jpg";
    this.image = document.createElement("img");
    this.image.src = imgSrc;
    this.image.onload = () => (this.imageLoaded = true);
  }

  tick(width, height, playing) {
    let now = new Date();
    let fps = this.prevTime ? 1000 / (now - this.prevTime) : 60;
    let inc = playing ? 1 / fps / this.spr : 0; // increment = ratio of how much to rotate per frame (1 = 360deg), to achieve rpm.
    this.prevTime = now;

    this.ctx.clearRect(0, 0, width, height);
    this.ctx.strokeStyle = "white";

    const cx = width * 0.5;
    const cy = height * 0.5;
    const maxRad = Math.min(width, height) * 0.35;
    const angleInRadians = this.rot * 360 * 0.0174533;
    const labelRad = maxRad * 0.3333;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.lineWidth = 8;
    this.ctx.shadowColor = "black";
    this.ctx.strokeStyle = "rgba(20,20,20,1)";
    this.ctx.shadowBlur = 45;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 5;
    this.ctx.arc(cx, cy, maxRad, 0, 2 * PI, false);
    this.ctx.stroke();
    this.ctx.restore();

    this.ctx.fillStyle = "#000";
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, maxRad, 0, PI * 2, true);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.fillStyle = "white";
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, labelRad, 0, PI * 2, true);
    this.ctx.closePath();
    this.ctx.fill();

    if (this.imageLoaded) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, labelRad, 0, PI * 2, true);
      this.ctx.closePath();
      this.ctx.clip();

      this.ctx.translate(cx, cy);
      this.ctx.rotate(angleInRadians);
      this.ctx.drawImage(
        this.image,
        -labelRad,
        -labelRad,
        labelRad * 2,
        labelRad * 2
      );
      this.ctx.rotate(-angleInRadians);
      this.ctx.translate(-cx, -cy);

      this.ctx.beginPath();
      this.ctx.arc(0, 0, labelRad, 0, PI * 2, true);
      this.ctx.clip();
      this.ctx.closePath();
      this.ctx.restore();
    }

    // this.ctx.fillStyle = `rgba(0,0,0,0.3)`;
    // this.ctx.lineWidth = 1.5;
    // this.ctx.beginPath();
    // this.ctx.arc(cx, cy, maxRad, 0, PI * 2, true);
    // this.ctx.fill();

    this.ctx.fillStyle = `rgba(0,0,0,1)`;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 6, 0, PI * 2, false);
    this.ctx.fill();

    this.ctx.lineWidth = width > 1024 ? 2 : 1;
    const avg =
      this.dataArrayFreq.reduce((p, c) => p + c) / this.bufferLengthFreq;

    let rat = 0;
    for (let i = 0; i < this.bufferLengthFreq; i++) {
      let val2 = this.dataArrayFreq[i] / 255.0;
      let val = avg / 255.0;
      let idxRat = i / this.bufferLengthFreq;
      let startRad = labelRad * 1.18;
      let rad = idxRat * (maxRad - startRad) + startRad;
      let start = (rat * 2 - 1) * PI + angleInRadians;
      // let stop = start + PI * 2 * val;
      let stop = start + PI * 2 * (0.5 * val + 0.5);
      rat += 0.15;
      this.ctx.strokeStyle = `rgba(255,255,255,0.1)`;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, rad, 0, PI * 2, false);
      this.ctx.stroke();

      this.ctx.strokeStyle = `rgba(0,0,0,0.9)`;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, rad, start, stop, false);
      this.ctx.stroke();

      this.ctx.strokeStyle = `rgba(255,255,255,${val2 * 0.99})`;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, rad, 0, PI * 2, false);
      this.ctx.stroke();
    }
    this.rot += inc;
  }
}
