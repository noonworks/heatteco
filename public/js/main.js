"use strict";
var ERROR_MSG = "ごめんなさい！エラーです。非対応ブラウザかも？";
var ERROR_TIMEOUT = 10000;
var HeattecoGenerator = /** @class */ (function () {
    function HeattecoGenerator() {
        var _this = this;
        this._back_loaded = false;
        this._logo_loaded = false;
        // img
        this._back = new Image();
        this._logo = new Image();
        // canvas
        var elm = document.getElementById("generated");
        if (!elm)
            return;
        this._canvas = elm;
        this._ctx = this._canvas.getContext("2d") || undefined;
        if (!this._ctx)
            return;
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
    HeattecoGenerator.prototype.start = function () {
        var _this = this;
        if (!this._ctx) {
            throw new Error(ERROR_MSG);
        }
        var interval = 100;
        var timeout = ERROR_TIMEOUT / interval;
        var intervalId = setInterval(function () {
            timeout--;
            if (_this.loaded) {
                clearInterval(intervalId);
                console.log("resources loaded.");
                _this.draw();
                return;
            }
            if (timeout < 0) {
                clearInterval(intervalId);
            }
        }, interval);
    };
    HeattecoGenerator.prototype.save = function () {
        if (!this.loaded || !this._canvas)
            return;
        var url = this._canvas.toDataURL();
        console.log(url);
    };
    HeattecoGenerator.prototype.draw = function () {
        if (!this.loaded || !this._ctx)
            return;
        // clear
        this._ctx.drawImage(this._back, 0, 0);
        // [TODO] add picture
        // [TODO] add text
        // add logo
        this._ctx.drawImage(this._logo, 0, 0);
    };
    return HeattecoGenerator;
}());
function initialize() {
    var ht = new HeattecoGenerator();
    try {
        ht.start();
    }
    catch (error) {
        alert(error);
    }
    var interval = 100;
    var timeout = ERROR_TIMEOUT / interval;
    var intervalId = setInterval(function () {
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
