const ERROR_MSG = "ごめんなさい！エラーです。非対応ブラウザかも？";
const ERROR_TIMEOUT = 10000;
const EMPTY_TEXT: ITextData = { big: "", small: ["", ""] };
const DEFAULT_SCALE: IPictureScale = { scale: 100, x: 0, y: 0 };
const FONT_NAME = "'Noto Sans JP'";
type TDirections = "left" | "up" | "down" | "right";
const DIRECTIONS: TDirections[] = ["left", "up", "down", "right"];
const D_D = {
  left: { x: -1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  right: { x: 1, y: 0 }
};
type TSDirections = "minus" | "plus";
const SCALE_DIRECTIONS: TSDirections[] = ["minus", "plus"];
const SD_D = {
  minus: -1,
  plus: 1
};
const SCALE_MIN = 1;
const SCALE_MAX = 300;
const CONTROL_INTERVAL = 300;
const COPY_TEXT =
  "Copyright (C) 2010 - 2019 SQUARE ENIX CO., LTD. All Rights Reserved.";
const WIDTH = 720;

class HeattecoGenerator {
  private _canvas?: HTMLCanvasElement;
  private _ctx?: CanvasRenderingContext2D;
  private _back: HTMLImageElement;
  private _back_loaded = false;
  private _logo: HTMLImageElement;
  private _logo_loaded = false;
  private _t: ITextData = EMPTY_TEXT;
  private _img?: HTMLImageElement;
  private _scale: IPictureScale = DEFAULT_SCALE;
  private _drawing = false;
  private _copy = true;

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

  public save(): string {
    if (!this.loaded || !this._canvas) return "";
    return this._canvas.toDataURL();
  }

  public setText(t: ITextData) {
    this._t = t;
  }

  public setImage(img: HTMLImageElement) {
    this._img = img;
  }

  public setScale(s: IPictureScale) {
    this._scale = s;
  }

  public setCopy(c: boolean) {
    this._copy = c;
  }

  public draw(): void {
    if (!this.loaded || !this._ctx) return;
    if (this._drawing) return;
    this._drawing = true;
    // clear
    this._ctx.drawImage(this._back, 0, 0);
    // add picture
    this.drawPicture();
    // add text
    this.drawText();
    // add logo
    this._ctx.drawImage(this._logo, 0, 0);
    // add copy
    this.drawCopy();
    this._drawing = false;
  }

  private drawPicture(): void {
    if (!this.loaded || !this._ctx || !this._img) return;
    const w = (this._img.naturalWidth * this._scale.scale) / 100;
    const h = (this._img.naturalHeight * this._scale.scale) / 100;
    this._ctx.drawImage(
      this._img,
      0,
      0,
      this._img.naturalWidth,
      this._img.naturalHeight,
      this._scale.x,
      this._scale.y,
      w,
      h
    );
  }

  private drawText(): void {
    if (!this.loaded || !this._canvas) return;
    this._canvas.style.letterSpacing = "0.25em";
    this._ctx = this._canvas.getContext("2d") || undefined;
    if (!this._ctx) return;
    this._ctx.textAlign = "left";
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

  private drawCopy(): void {
    if (!this.loaded || !this._canvas || !this._copy) return;
    this._canvas.style.letterSpacing = "0";
    this._ctx = this._canvas.getContext("2d") || undefined;
    if (!this._ctx) return;
    this._ctx.textAlign = "right";
    this._ctx.font = "9px " + FONT_NAME;
    this._ctx.fillText(COPY_TEXT, WIDTH - 10, 176);
  }
}

interface ITextData {
  big: string;
  small: string[];
}

interface IPictureScale {
  scale: number;
  x: number;
  y: number;
}

class Controler {
  // text
  private _ctl_b?: HTMLInputElement;
  private _ctl_s1?: HTMLInputElement;
  private _ctl_s2?: HTMLInputElement;
  private _text: ITextData = EMPTY_TEXT;
  // file
  private _ctl_file?: HTMLInputElement;
  // pos
  private _ctl_pr?: HTMLButtonElement;
  private _ctl_dr: HTMLButtonElement[] = [];
  private _x = 0;
  private _y = 0;
  // scale
  private _ctl_sb: HTMLButtonElement[] = [];
  private _ctl_sv?: HTMLInputElement;
  private _scaleval = 100;
  private _scale = DEFAULT_SCALE;
  private _scaleQueueId = -1;
  // copy
  private _ctl_cp?: HTMLInputElement;
  // save
  private _ctl_save?: HTMLButtonElement;
  private _lnk_dl?: HTMLLinkElement;
  private _img_dl?: HTMLImageElement;
  // generator
  private _ht?: HeattecoGenerator;

  public get loaded(): boolean {
    return !(
      !this._ctl_b ||
      !this._ctl_s1 ||
      !this._ctl_s2 ||
      !this._ctl_file ||
      !this._ctl_pr ||
      this._ctl_dr.length != 8 ||
      !this._ctl_sv ||
      this._ctl_sb.length != 4 ||
      !this._ctl_cp ||
      !this._ctl_save ||
      !this._lnk_dl ||
      !this._img_dl
    );
  }

  constructor() {
    // text
    {
      const onchangetext = () => this.onChangeText();
      this._ctl_b = this.getTextInput("bigtext", onchangetext);
      this._ctl_s1 = this.getTextInput("smalltext1", onchangetext);
      this._ctl_s2 = this.getTextInput("smalltext2", onchangetext);
    }
    // picfile
    {
      const pf = document.getElementById("picfile");
      if (pf) {
        pf.addEventListener("change", event => {
          const tg = event.target ? (event.target as HTMLInputElement) : null;
          if (!tg || !tg.files || tg.files.length == 0) return;
          const file = tg.files[0];
          if (file) this.setFile(file);
        });
        this._ctl_file = pf as HTMLInputElement;
      }
    }
    // pos
    {
      this._ctl_pr = this.getButton("pos_reset", () => this.onResetPos());
      DIRECTIONS.forEach(d => {
        const dd = D_D[d];
        const b = this.getButton(d, () => {
          this._x += dd.x;
          this._y += dd.y;
          this.queuePictureScale();
        });
        if (b) this._ctl_dr.push(b);
        const b10 = this.getButton(d + "10", () => {
          this._x += dd.x * 10;
          this._y += dd.y * 10;
          this.queuePictureScale();
        });
        if (b10) this._ctl_dr.push(b10);
      });
    }
    // scale
    {
      const sv = document.getElementById("scale");
      if (sv) this._ctl_sv = sv as HTMLInputElement;
      SCALE_DIRECTIONS.forEach(d => {
        const val = SD_D[d];
        const b = this.getButton(d + "1", () => {
          this._scaleval += val;
          if (this._scaleval < SCALE_MIN) this._scaleval = SCALE_MIN;
          if (this._scaleval > SCALE_MAX) this._scaleval = SCALE_MAX;
          if (this._ctl_sv) this._ctl_sv.value = "" + this._scaleval;
          this.queuePictureScale();
        });
        if (b) this._ctl_sb.push(b);
        const b10 = this.getButton(d + "10", () => {
          this._scaleval += val * 10;
          if (this._scaleval < SCALE_MIN) this._scaleval = SCALE_MIN;
          if (this._scaleval > SCALE_MAX) this._scaleval = SCALE_MAX;
          if (this._ctl_sv) this._ctl_sv.value = "" + this._scaleval;
          this.queuePictureScale();
        });
        if (b10) this._ctl_sb.push(b10);
      });
    }
    // copy
    {
      const c = document.getElementById("copy");
      if (c) {
        this._ctl_cp = c as HTMLInputElement;
        this._ctl_cp.addEventListener("change", () => {
          if (!this._ctl_cp || !this._ht) return;
          this._ht.setCopy(this._ctl_cp.checked);
          this._ht.draw();
        });
      }
    }
    // save
    {
      const a = document.getElementById("dl_link");
      if (a) {
        this._lnk_dl = a as HTMLLinkElement;
      }
      const img = document.getElementById("result");
      if (img) {
        this._img_dl = img as HTMLImageElement;
      }
      this._ctl_save = this.getButton("save", () => {
        if (!this._ht || !this._lnk_dl) return;
        const url = this._ht.save();
        if (url.length === 0) return;
        this._lnk_dl.href = url;
        if (this._img_dl) {
          this._img_dl.src = url;
          this._img_dl.style.visibility = "visible";
        }
        this._lnk_dl.click();
      });
    }
  }

  public setCanvas(ht: HeattecoGenerator): void {
    this._ht = ht;
    this.onChangeText();
  }

  private getButton(id: string, f: () => void): HTMLButtonElement | undefined {
    const b = document.getElementById(id);
    if (b) {
      b.addEventListener("click", f);
      return b as HTMLButtonElement;
    }
    return undefined;
  }

  private queuePictureScale(): void {
    const s: IPictureScale = {
      scale: this._scaleval,
      x: this._x,
      y: this._y
    };
    if (
      this._scale.scale == s.scale &&
      this._scale.x == s.x &&
      this._scale.y == s.y
    )
      return;
    this._scale = s;
    clearTimeout(this._scaleQueueId);
    this._scaleQueueId = setTimeout(() => {
      clearTimeout(this._scaleQueueId);
      this._scaleQueueId = -1;
      if (!this._ht) return;
      this._ht.setScale(this._scale);
      this._ht.draw();
    }, CONTROL_INTERVAL);
  }

  private onResetPos() {
    this._x = 0;
    this._y = 0;
    this.queuePictureScale();
  }

  private setFile(file: File) {
    if (!this._ht) return;
    const img = new Image();
    const fr = new FileReader();
    fr.onload = evt => {
      if (!evt || !evt.target || !evt.target.result) return;
      img.onload = () => {
        if (!this._ht) return;
        this._scaleval = 100;
        if (this._ctl_sv) this._ctl_sv.value = "" + this._scaleval;
        this.onResetPos();
        this._ht.setImage(img);
        this._ht.draw();
      };
      img.src = evt.target.result as string;
    };
    fr.readAsDataURL(file);
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
