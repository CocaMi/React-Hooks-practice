export class FadeInAnimation {
  constructor(node) {
    this.node = node;
    this.startTime = null;
    this.frameId = null;
  }

  start(duration) {
    this.duration = duration;
    this.startTime = performance.now();
    this.frameId = requestAnimationFrame(this.animate.bind(this));
  }

  animate(time) {
    const progress = (time - this.startTime) / this.duration;

    if (progress < 1) {
      this.node.style.opacity = progress;
      this.frameId = requestAnimationFrame(this.animate.bind(this));
    } else {
      this.node.style.opacity = 1;
    }
  }

  stop() {
    cancelAnimationFrame(this.frameId);
  }
}
