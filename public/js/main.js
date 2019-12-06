"use strict";
var ERROR_MSG = "ごめんなさい！エラーです。非対応ブラウザかも？";
var ERROR_TIMEOUT = 10000;
var EMPTY_TEXT = { big: "", small: ["", ""] };
var DEFAULT_SCALE = { scale: 100, x: 0, y: 0 };
var FONT_NAME = "'Noto Sans JP'";
var DIRECTIONS = ["left", "up", "down", "right"];
var D_D = {
    left: { x: -1, y: 0 },
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    right: { x: 1, y: 0 }
};
var CONTROL_INTERVAL = 300;
var HeattecoGenerator = /** @class */ (function () {
    function HeattecoGenerator() {
        var _this = this;
        this._back_loaded = false;
        this._logo_loaded = false;
        this._t = EMPTY_TEXT;
        this._scale = DEFAULT_SCALE;
        this._drawing = false;
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
    HeattecoGenerator.prototype.setImage = function (img) {
        this._img = img;
    };
    HeattecoGenerator.prototype.setScale = function (s) {
        this._scale = s;
    };
    HeattecoGenerator.prototype.draw = function () {
        if (!this.loaded || !this._ctx)
            return;
        if (this._drawing)
            return;
        this._drawing = true;
        // clear
        this._ctx.drawImage(this._back, 0, 0);
        // add picture
        this.drawPicture();
        // add text
        this.drawText();
        // add logo
        this._ctx.drawImage(this._logo, 0, 0);
        this._drawing = false;
    };
    HeattecoGenerator.prototype.drawPicture = function () {
        if (!this.loaded || !this._ctx || !this._img)
            return;
        console.log(this._scale);
        // original size
        console.log("" + this._img.naturalWidth + " x " + this._img.naturalHeight);
        var w = this._img.naturalWidth;
        var h = this._img.naturalHeight;
        this._ctx.drawImage(this._img, 0, 0, this._img.naturalWidth, this._img.naturalHeight, this._scale.x, this._scale.y, w, h);
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
        this._ctl_dr = [];
        this._x = 0;
        this._y = 0;
        // scale
        this._scale = DEFAULT_SCALE;
        this._scaleQueueId = -1;
        // text
        var onchangetext = function () { return _this.onChangeText(); };
        this._ctl_b = this.getTextInput("bigtext", onchangetext);
        this._ctl_s1 = this.getTextInput("smalltext1", onchangetext);
        this._ctl_s2 = this.getTextInput("smalltext2", onchangetext);
        // picfile
        {
            var pf = document.getElementById("picfile");
            if (pf) {
                pf.addEventListener("change", function (event) {
                    var tg = event.target ? event.target : null;
                    if (!tg || !tg.files || tg.files.length == 0)
                        return;
                    var file = tg.files[0];
                    if (file)
                        _this.setFile(file);
                });
                this._ctl_file = pf;
            }
        }
        // pos
        this._ctl_pr = this.getButton("pos_reset", function () { return _this.onResetPos(); });
        DIRECTIONS.forEach(function (d) {
            var dd = D_D[d];
            var b = _this.getButton(d, function () {
                _this._x += dd.x;
                _this._y += dd.y;
                _this.queuePictureScale();
            });
            if (b)
                _this._ctl_dr.push(b);
            var b10 = _this.getButton(d + "10", function () {
                _this._x += dd.x * 10;
                _this._y += dd.y * 10;
                _this.queuePictureScale();
            });
            if (b10)
                _this._ctl_dr.push(b10);
        });
    }
    Object.defineProperty(Controler.prototype, "loaded", {
        get: function () {
            return !(!this._ctl_b ||
                !this._ctl_s1 ||
                !this._ctl_s2 ||
                !this._ctl_file ||
                !this._ctl_pr ||
                this._ctl_dr.length != 8);
        },
        enumerable: true,
        configurable: true
    });
    Controler.prototype.setCanvas = function (ht) {
        this._ht = ht;
        this.onChangeText();
    };
    Controler.prototype.getButton = function (id, f) {
        var b = document.getElementById(id);
        if (b) {
            b.addEventListener("click", f);
            return b;
        }
        return undefined;
    };
    Controler.prototype.queuePictureScale = function () {
        var _this = this;
        var s = {
            scale: 100,
            x: this._x,
            y: this._y
        };
        if (this._scale.scale == s.scale &&
            this._scale.x == s.x &&
            this._scale.y == s.y)
            return;
        this._scale = s;
        clearTimeout(this._scaleQueueId);
        this._scaleQueueId = setTimeout(function () {
            clearTimeout(_this._scaleQueueId);
            _this._scaleQueueId = -1;
            if (!_this._ht)
                return;
            _this._ht.setScale(_this._scale);
            _this._ht.draw();
        }, CONTROL_INTERVAL);
    };
    Controler.prototype.onResetPos = function () {
        this._x = 0;
        this._y = 0;
        this.queuePictureScale();
    };
    Controler.prototype.setFile = function (file) {
        var _this = this;
        if (!this._ht)
            return;
        var img = new Image();
        var fr = new FileReader();
        fr.onload = function (evt) {
            if (!evt || !evt.target || !evt.target.result)
                return;
            img.onload = function () {
                if (!_this._ht)
                    return;
                _this.onResetPos();
                _this._ht.setImage(img);
                _this._ht.draw();
            };
            img.src = evt.target.result;
        };
        fr.readAsDataURL(file);
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
