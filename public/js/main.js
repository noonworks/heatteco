"use strict";
var ERROR_MSG = "ごめんなさい！エラーです。非対応ブラウザかも？";
var ERROR_TIMEOUT = 10000;
var EMPTY_TEXT = { big: "", small: ["", ""] };
var FONT_NAME = "'Noto Sans JP'";
var HeattecoGenerator = /** @class */ (function () {
    function HeattecoGenerator() {
        var _this = this;
        this._back_loaded = false;
        this._logo_loaded = false;
        this._t = EMPTY_TEXT;
        // img
        this._back = new Image();
        this._logo = new Image();
        // canvas
        var elm = document.getElementById("generated");
        if (!elm)
            return;
        this._canvas = elm;
        this._ctx = this._canvas.getContext("2d") || undefined;
        if (!this._ctx) {
            throw new Error(ERROR_MSG);
        }
        this._ctx.textBaseline = "top";
        this._ctx.fillStyle = "#ffffff";
        // load img
        this._back.addEventListener("load", function () {
            _this._back_loaded = true;
            console.log("back.png loaded.");
        });
        this._back.addEventListener("error", function () {
            console.log("[ERROR!] could not load back.png.");
        });
        this._logo.addEventListener("load", function () {
            _this._logo_loaded = true;
            console.log("logo.png loaded.");
        });
        this._logo.addEventListener("error", function () {
            console.log("[ERROR!] could not load logo.png.");
        });
        this._back.src = "img/back.png";
        this._logo.src = "img/logo.png";
    }
    Object.defineProperty(HeattecoGenerator.prototype, "loaded", {
        get: function () {
            return this._back_loaded && this._logo_loaded;
        },
        enumerable: true,
        configurable: true
    });
    HeattecoGenerator.prototype.save = function () {
        if (!this.loaded || !this._canvas)
            return;
        var url = this._canvas.toDataURL();
        console.log(url);
    };
    HeattecoGenerator.prototype.setText = function (t) {
        this._t = t;
    };
    HeattecoGenerator.prototype.draw = function () {
        if (!this.loaded || !this._ctx)
            return;
        // clear
        this._ctx.drawImage(this._back, 0, 0);
        // [TODO] add picture
        // add text
        this.drawText();
        // add logo
        this._ctx.drawImage(this._logo, 0, 0);
    };
    HeattecoGenerator.prototype.drawText = function () {
        if (!this.loaded || !this._ctx || !this._canvas)
            return;
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
    };
    return HeattecoGenerator;
}());
var Controler = /** @class */ (function () {
    function Controler() {
        var _this = this;
        this._text = EMPTY_TEXT;
        var onchangetext = function () {
            _this.onChangeText();
        };
        this._ctl_b = this.getTextInput("bigtext", onchangetext);
        this._ctl_s1 = this.getTextInput("smalltext1", onchangetext);
        this._ctl_s2 = this.getTextInput("smalltext2", onchangetext);
    }
    Object.defineProperty(Controler.prototype, "loaded", {
        // private _bigtext: string = "";
        get: function () {
            return !(!this._ctl_b || !this._ctl_s1 || !this._ctl_s2);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Controler.prototype, "text", {
        get: function () {
            if (!this._ctl_b || !this._ctl_s1 || !this._ctl_s2)
                return EMPTY_TEXT;
            return {
                big: this._ctl_b.value,
                small: [this._ctl_s1.value, this._ctl_s2.value]
            };
        },
        enumerable: true,
        configurable: true
    });
    Controler.prototype.setCanvas = function (ht) {
        this._ht = ht;
        this.onChangeText();
    };
    Controler.prototype.onChangeText = function () {
        if (!this._ctl_b || !this._ctl_s1 || !this._ctl_s2)
            return;
        var t = {
            big: this._ctl_b.value,
            small: [this._ctl_s1.value, this._ctl_s2.value]
        };
        if (this._text.big == t.big &&
            this._text.small[0] == t.small[0] &&
            this._text.small[1] == t.small[1])
            return;
        this._text = t;
        if (this._ht) {
            this._ht.setText(t);
            this._ht.draw();
        }
    };
    Controler.prototype.getTextInput = function (id, f) {
        var t = document.getElementById(id);
        if (t) {
            t.addEventListener("change", f);
            t.addEventListener("keyup", f);
            return t;
        }
        return undefined;
    };
    return Controler;
}());
function initialize() {
    var ct = new Controler();
    if (!ct.loaded) {
        alert(ERROR_MSG);
        return;
    }
    try {
        var ht_1 = new HeattecoGenerator();
        var interval = 100;
        var timeout_1 = ERROR_TIMEOUT / interval;
        var intervalId_1 = setInterval(function () {
            timeout_1--;
            if (ht_1.loaded) {
                clearInterval(intervalId_1);
                ct.setCanvas(ht_1);
                console.log("initialized.");
                return;
            }
            if (timeout_1 < 0) {
                clearInterval(intervalId_1);
                alert(ERROR_MSG);
            }
        }, interval);
    }
    catch (error) {
        alert(error);
    }
}
window.addEventListener("load", initialize);
