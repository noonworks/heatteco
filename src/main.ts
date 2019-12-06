const ERROR_MSG = "ごめんなさい！エラーです。非対応ブラウザかも？";
const ERROR_TIMEOUT = 10000;
const EMPTY_TEXT: ITextData = { big: "", small: ["", ""] };
const FONT_NAME = "'Noto Sans JP'";

class HeattecoGenerator {
  private _canvas?: HTMLCanvasElement;
  private _ctx?: CanvasRenderingContext2D;
  private _back: HTMLImageElement;
  private _back_loaded = false;
  private _logo: HTMLImageElement;
  private _logo_loaded = false;
  private _t: ITextData = EMPTY_TEXT;

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
    if (!this._ctx) {
      throw new Error(ERROR_MSG);
    }
    this._ctx.textBaseline = "top";
    this._ctx.fillStyle = "#ffffff";
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

  public save() {
    if (!this.loaded || !this._canvas) return;
    const url = this._canvas.toDataURL();
    console.log(url);
  }

  public setText(t: ITextData) {
    this._t = t;
  }

  public draw(): void {
    if (!this.loaded || !this._ctx) return;
    // clear
    this._ctx.drawImage(this._back, 0, 0);
    // [TODO] add picture
    // add text
    this.drawText();
    // add logo
    this._ctx.drawImage(this._logo, 0, 0);
  }

  private drawText(): void {
    if (!this.loaded || !this._ctx || !this._canvas) return;
    if (this._t.big.length > 0) {
      this._ctx.font = "bold 28px " + FONT_NAME;
      this._ctx.fillText(this._t.big, 16, 66);
    }
    if (this._t.small[0].length > 0) {
      this._ctx.font = "16px " + FONT_NAME;
      this._ctx.fillText(this._t.small[0], 20, 127);
    }
    if (this._t.small[1].length > 0) {
      this._ctx.font = "16px " + FONT_NAME;
      this._ctx.fillText(this._t.small[1], 20, 156);
    }
  }
}

interface ITextData {
  big: string;
  small: string[];
}

interface IControler {
  text: ITextData;
}

class Controler {
  // text
  private _ctl_b?: HTMLInputElement;
  private _ctl_s1?: HTMLInputElement;
  private _ctl_s2?: HTMLInputElement;
  private _text: ITextData = EMPTY_TEXT;
  //
  private _ht?: HeattecoGenerator;
  // private _bigtext: string = "";

  public get loaded(): boolean {
    return !(!this._ctl_b || !this._ctl_s1 || !this._ctl_s2);
  }

  public get text(): ITextData {
    if (!this._ctl_b || !this._ctl_s1 || !this._ctl_s2) return EMPTY_TEXT;
    return {
      big: this._ctl_b.value,
      small: [this._ctl_s1.value, this._ctl_s2.value]
    };
  }

  constructor() {
    const onchangetext = () => {
      this.onChangeText();
    };
    this._ctl_b = this.getTextInput("bigtext", onchangetext);
    this._ctl_s1 = this.getTextInput("smalltext1", onchangetext);
    this._ctl_s2 = this.getTextInput("smalltext2", onchangetext);
  }

  public setCanvas(ht: HeattecoGenerator): void {
    this._ht = ht;
    this.onChangeText();
  }

  private onChangeText() {
    if (!this._ctl_b || !this._ctl_s1 || !this._ctl_s2) return;
    const t: ITextData = {
      big: this._ctl_b.value,
      small: [this._ctl_s1.value, this._ctl_s2.value]
    };
    if (
      this._text.big == t.big &&
      this._text.small[0] == t.small[0] &&
      this._text.small[1] == t.small[1]
    )
      return;
    this._text = t;
    if (this._ht) {
      this._ht.setText(t);
      this._ht.draw();
    }
  }

  private getTextInput(
    id: string,
    f: () => void
  ): HTMLInputElement | undefined {
    const t = document.getElementById(id);
    if (t) {
      t.addEventListener("change", f);
      t.addEventListener("keyup", f);
      return t as HTMLInputElement;
    }
    return undefined;
  }
}

function initialize() {
  const ct = new Controler();
  if (!ct.loaded) {
    alert(ERROR_MSG);
    return;
  }
  try {
    const ht = new HeattecoGenerator();
    const interval = 100;
    let timeout = ERROR_TIMEOUT / interval;
    const intervalId = setInterval(() => {
      timeout--;
      if (ht.loaded) {
        clearInterval(intervalId);
        ct.setCanvas(ht);
        console.log("initialized.");
        return;
      }
      if (timeout < 0) {
        clearInterval(intervalId);
        alert(ERROR_MSG);
      }
    }, interval);
  } catch (error) {
    alert(error);
  }
}

window.addEventListener("load", initialize);
