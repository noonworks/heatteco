const ERROR_MSG = "ごめんなさい！エラーです。非対応ブラウザかも？";
const ERROR_TIMEOUT = 10000;

class HeattecoGenerator {
  private _canvas?: HTMLCanvasElement;
  private _ctx?: CanvasRenderingContext2D;
  private _back: HTMLImageElement;
  private _back_loaded = false;
  private _logo: HTMLImageElement;
  private _logo_loaded = false;

  public get loaded(): boolean {
    return this._back_loaded && this._logo_loaded;
  }

  constructor() {
    // img
    this._back = new Image();
    this._logo = new Image();
    // canvas
    const elm = document.getElementById("generated");
    if (!elm) return;
    this._canvas = elm as HTMLCanvasElement;
    this._ctx = this._canvas.getContext("2d") || undefined;
    if (!this._ctx) return;
    // load img
    this._back.addEventListener("load", () => {
      this._back_loaded = true;
      console.log("back.png loaded.");
    });
    this._back.addEventListener("error", () => {
      console.log("[ERROR!] could not load back.png.");
    });
    this._logo.addEventListener("load", () => {
      this._logo_loaded = true;
      console.log("logo.png loaded.");
    });
    this._logo.addEventListener("error", () => {
      console.log("[ERROR!] could not load logo.png.");
    });
    this._back.src = "img/back.png";
    this._logo.src = "img/logo.png";
  }

  public start() {
    if (!this._ctx) {
      throw new Error(ERROR_MSG);
    }
    const interval = 100;
    let timeout = ERROR_TIMEOUT / interval;
    const intervalId = setInterval(() => {
      timeout--;
      if (this.loaded) {
        clearInterval(intervalId);
        console.log("resources loaded.");
        this.draw();
        return;
      }
      if (timeout < 0) {
        clearInterval(intervalId);
      }
    }, interval);
  }

  public save() {
    if (!this.loaded || !this._canvas) return;
    const url = this._canvas.toDataURL();
    console.log(url);
  }

  private draw(): void {
    if (!this.loaded || !this._ctx) return;
    // clear
    this._ctx.drawImage(this._back, 0, 0);
    // [TODO] add picture
    // [TODO] add text
    // add logo
    this._ctx.drawImage(this._logo, 0, 0);
  }
}

function initialize() {
  const ht = new HeattecoGenerator();
  try {
    ht.start();
  } catch (error) {
    alert(error);
  }
  const interval = 100;
  let timeout = ERROR_TIMEOUT / interval;
  const intervalId = setInterval(() => {
    timeout--;
    if (ht.loaded) {
      clearInterval(intervalId);
      console.log("initialized.");
      return;
    }
    if (timeout < 0) {
      clearInterval(intervalId);
      alert(ERROR_MSG);
    }
  }, interval);
}

window.addEventListener("load", initialize);
