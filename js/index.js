"use strict";
var canvas;
(function (canvas) {
    function drawLine(ctx, x1, y1, x2, y2, color) {
        if (color === void 0) { color = "black"; }
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.closePath();
        ctx.stroke();
    }
    canvas.drawLine = drawLine;
})(canvas || (canvas = {}));
/// <reference path="./DSDJson.ts"/>
var DSDDatabase = /** @class */ (function () {
    function DSDDatabase() {
        /** Depth and space data */
        this.dsd = null;
    }
    DSDDatabase.prototype.readDatabase = function (url, callback) {
        var _this = this;
        $.getJSON(url, function (data) {
            console.info("DSDDatabase.readDatabase success!");
            _this.dsd = data;
            if (callback !== undefined) {
                callback();
            }
        }).fail(function (err) {
            console.error("DSDDatabase.readDatabase failed: " + err);
        });
    };
    DSDDatabase.prototype.nKeys = function () {
        if (this.dsd !== null) {
            return this.dsd.dsd.length;
        }
        return 0;
    };
    DSDDatabase.prototype.keyNames = function (idx) {
        if (this.dsd !== null) {
            if (idx < this.dsd.dsd.length && idx > 0) {
                return this.dsd.dsd[idx].names;
            }
            else {
                console.error("DSDDatabase.keyNames: idx (" + idx + ") out of range!");
            }
        }
        return new Array();
    };
    DSDDatabase.prototype.keyTypes = function (idx) {
        if (this.dsd !== null) {
            if (idx < this.dsd.dsd.length && idx > 0) {
                return this.dsd.dsd[idx].types;
            }
            else {
                console.error("DSDDatabase.keyTypes: idx (" + idx + ") out of range!");
            }
        }
        return new Array();
    };
    DSDDatabase.prototype.getNames = function () {
        var ret = new Array();
        if (this.dsd !== null) {
            for (var i = 0; i < this.dsd.dsd.length; i++) {
                for (var j = 0; j < this.dsd.dsd[i].names.length; j++) {
                    if (ret.indexOf(this.dsd.dsd[i].names[j]) < 0) {
                        ret.push(this.dsd.dsd[i].names[j]);
                    }
                }
            }
        }
        return ret;
    };
    DSDDatabase.prototype.getTypes = function (name) {
        var ret = new Array();
        if (this.dsd !== null) {
            for (var i = 0; i < this.dsd.dsd.length; i++) {
                if (this.dsd.dsd[i].names.indexOf(name) >= 0) {
                    for (var j = 0; j < this.dsd.dsd[i].types.length; j++) {
                        var type = {
                            name: this.dsd.dsd[i].types[j],
                            idx: i
                        };
                        if (ret.indexOf(type) < 0) {
                            ret.push(type);
                        }
                    }
                }
            }
        }
        return ret;
    };
    DSDDatabase.prototype.getDepths = function (idx) {
        var ret = new Array();
        if (this.dsd !== null) {
            if (idx < 0 || idx >= this.dsd.dsd.length) {
                console.error("DSDDatabase.getDepths(): Index (" + idx + ") out of range!");
            }
            else {
                if ("depths" in this.dsd.dsd[idx]) {
                    ret = this.dsd.dsd[idx].depths;
                }
                else {
                    for (var i = 0; i < this.dsd.dsd[idx].depth_count; i++) {
                        var depth = {
                            cut: "0123456789ABCDEF"[i + this.dsd.dsd[idx].depth_start],
                            depth: this.dsd.dsd[idx].depth0 - (this.dsd.dsd[idx].depth_inc * i)
                        };
                        ret.push(depth);
                    }
                }
            }
        }
        return ret;
    };
    DSDDatabase.prototype.getNCuts = function (idx) {
        var ret = new Array();
        if (this.dsd !== null) {
            if (idx < 0 || idx >= this.dsd.dsd.length) {
                console.error("DSDDatabase.getNCuts(): Index (" + idx + ") out of range!");
            }
            else {
                for (var i = this.dsd.dsd[idx].min_spaces; i <= this.dsd.dsd[idx].max_spaces; i++) {
                    ret.push(i);
                }
            }
        }
        return ret;
    };
    DSDDatabase.prototype.getBladeLength = function (idx) {
        if (this.dsd !== null) {
            if (idx < 0 || idx >= this.dsd.dsd.length) {
                console.error("DSDDatabase.getBladeLength(): Index (" + idx + ") out of range!");
            }
            else {
                return this.dsd.dsd[idx].blade_length;
            }
        }
        return -1;
    };
    DSDDatabase.prototype.getBladeHeight = function (idx) {
        if (this.dsd !== null) {
            if (idx < 0 || idx >= this.dsd.dsd.length) {
                console.error("DSDDatabase.getBladeHeight(): Index (" + idx + ") out of range!");
            }
            else {
                return this.dsd.dsd[idx].blade_height;
            }
        }
        return -1;
    };
    DSDDatabase.prototype.getCutSpacing = function (idx) {
        // TODO: Support non-incremental spacing!
        if (this.dsd !== null) {
            if (idx < 0 || idx >= this.dsd.dsd.length) {
                console.error("DSDDatabase.getCutSpacing(): Index (" + idx + ") out of range!");
            }
            else {
                return this.dsd.dsd[idx].space_inc;
            }
        }
        return -1;
    };
    DSDDatabase.prototype.getFirstCutPos = function (idx) {
        // TODO: Support non-incremental spacing!
        if (this.dsd !== null) {
            if (idx < 0 || idx >= this.dsd.dsd.length) {
                console.error("DSDDatabase.getFirstCutPos(): Index (" + idx + ") out of range!");
            }
            else {
                return this.dsd.dsd[idx].space0;
            }
        }
        return -1;
    };
    DSDDatabase.prototype.getOrder = function (idx) {
        if (this.dsd !== null) {
            if (idx < 0 || idx >= this.dsd.dsd.length) {
                console.error("DSDDatabase.getOrder(): Index (" + idx + ") out of range!");
            }
            else {
                return this.dsd.dsd[idx].order;
            }
        }
        return -1;
    };
    return DSDDatabase;
}());
/// <reference path="./DSDDatabase.ts"/>
/// <reference path="./CanvasFunctions.ts"/>
var KeyDecoder = /** @class */ (function () {
    function KeyDecoder() {
        this.keyContext = null;
        this.ctrlContext = null;
        this.bittingContext = null;
        this.imageURL = "";
        this.mode = DecoderMode.NONE;
        this.bladeLength = -1;
        this.bladeHeight = -1;
        this.vPixPermm = 0.0;
        this.hPixPermm = 0.0;
        this.cutSpacing = 0;
        this.firstCut = 0;
        this.cutOrder = 0;
        this.dsd = new DSDDatabase();
        this.keyFile = $(".keyFile");
        this.keyCanvas = $(".keyCanvas")[0];
        this.ctrlCanvas = $(".controlCanvas")[0];
        this.bittingCanvas = $(".bittingCanvas")[0];
        this.image = new Image();
        this.cropControls = new Object();
        this.cropControls.left = $(".cropLeft");
        this.cropControls.top = $(".cropTop");
        this.cropControls.width = $(".cropWidth");
        this.cropControls.height = $(".cropHeight");
        this.alignControls = new Object();
        this.alignControls.rotate = $(".alignRotate");
        this.alignControls.hFlip = $(".alignHFlip");
        this.alignControls.vFlip = $(".alignVFlip");
        this.alignControls.bottom = $(".alignBottom");
        this.alignControls.top = $(".alignTop");
        this.alignControls.shoulder = $(".alignShoulder");
        this.alignControls.tip = $(".alignTip");
        this.keyBrandSelect = $(".keyBrandSelect");
        this.keyTypeSelect = $(".keyTypeSelect");
        this.keyNCutsSelect = $(".keyNCutsSelect");
        this.bittingControlsDiv = $(".bittingControls");
        this.keyDepths = null;
    }
    KeyDecoder.prototype.init = function () {
        var _this = this;
        this.dsd.readDatabase("dsd.json", function () { return _this.onDSDUpdate(); });
        this.keyFile.on("change", function () { _this.onKeyFileChange(); });
        this.keyContext = this.keyCanvas.getContext("2d");
        this.ctrlContext = this.ctrlCanvas.getContext("2d");
        this.bittingContext = this.bittingCanvas.getContext("2d");
        this.resizeCanvas();
        $(".cropCtrl").on("change", function () { _this.onCropChange(); _this.mode = DecoderMode.CROP; });
        $(".cropButton").on("click", function () { _this.doCrop(); _this.mode = DecoderMode.ALIGN; });
        $(".alignCtrl").on("change", function () { _this.onAlignChange(); _this.mode = DecoderMode.ALIGN; });
        this.keyBrandSelect.on("change", function () { _this.onKeyBrandChange(); });
        this.keyTypeSelect.on("change", function () { _this.onKeyTypeChange(); });
        this.keyNCutsSelect.on("change", function () { _this.onNCutsChange(); });
    };
    KeyDecoder.prototype.resizeCanvas = function () {
        var rect = this.keyCanvas.getBoundingClientRect();
        this.keyCanvas.height = this.ctrlCanvas.height = this.bittingCanvas.height = rect.height;
        this.keyCanvas.width = this.ctrlCanvas.width = this.bittingCanvas.width = rect.width;
    };
    KeyDecoder.prototype.onKeyFileChange = function () {
        var _this = this;
        console.info(this.keyFile.prop("files")[0]);
        var fr = new FileReader();
        fr.onload = function () {
            console.debug(fr.result);
            _this.imageURL = fr.result;
            _this.image.onload = function () {
                if (_this.keyContext !== null) {
                    _this.keyContext.clearRect(0, 0, _this.keyCanvas.width, _this.keyCanvas.height);
                    _this.keyContext.drawImage(_this.image, 0, 0, _this.keyCanvas.width, _this.keyCanvas.height);
                }
            };
            _this.image.src = _this.imageURL;
        };
        fr.readAsDataURL(this.keyFile.prop("files")[0]);
    };
    KeyDecoder.prototype.onDSDUpdate = function () {
        var _this = this;
        this.keyBrandSelect.empty();
        this.keyTypeSelect.empty();
        var brands = this.dsd.getNames();
        brands.forEach(function (val, idx) {
            _this.keyBrandSelect.append($("<option/>", {
                value: val
            }).text(val));
        });
        this.onKeyBrandChange();
    };
    KeyDecoder.prototype.onKeyBrandChange = function () {
        var _this = this;
        this.keyTypeSelect.empty();
        var brand = this.keyBrandSelect.val();
        if (brand !== undefined) {
            var types = this.dsd.getTypes("" + brand);
            types.forEach(function (val, idx) {
                _this.keyTypeSelect.append($("<option/>", {
                    value: val.idx
                }).text(val.name));
            });
            this.onKeyTypeChange();
        }
    };
    KeyDecoder.prototype.onKeyTypeChange = function () {
        var _this = this;
        var type = this.keyTypeSelect.val();
        this.keyNCutsSelect.empty();
        if (type !== undefined) {
            this.keyDepths = this.dsd.getDepths(+type);
            this.bladeLength = this.dsd.getBladeLength(+type);
            this.bladeHeight = this.dsd.getBladeHeight(+type);
            this.cutSpacing = this.dsd.getCutSpacing(+type);
            this.firstCut = this.dsd.getFirstCutPos(+type);
            this.cutOrder = this.dsd.getOrder(+type);
            this.dsd.getNCuts(+type).forEach(function (val) {
                _this.keyNCutsSelect.append($("<option/>", {
                    value: val
                }).text("" + val));
            });
            this.onNCutsChange();
        }
    };
    KeyDecoder.prototype.onNCutsChange = function () {
        var _this = this;
        var nCuts = this.keyNCutsSelect.val();
        this.bittingControlsDiv.empty();
        if (nCuts !== undefined && this.keyDepths !== null) {
            for (var i = 0; i < +nCuts; i++) {
                this.bittingControlsDiv.append($("<select/>").addClass("depthSelect").data("cut", i));
            }
            for (var i = 0; i < this.keyDepths.length; i++) {
                $(".depthSelect").append($("<option/>", {
                    val: i
                }).text(this.keyDepths[i].cut)).on("click", function () { _this.onBittingChange(); });
            }
        }
    };
    KeyDecoder.prototype.onBittingChange = function () {
        var nCuts = this.keyNCutsSelect.val();
        if (nCuts !== undefined) {
            var depths_1 = new Array(+nCuts);
            $(".depthSelect").each(function (idx, elem) {
                var cut = $(elem).data("cut");
                var depth = $(elem).val();
                if (cut !== undefined && depth !== undefined) {
                    depths_1[+cut] = +depth;
                }
            });
            this.drawBittingApproximation(depths_1);
        }
    };
    /**************
     * Align Mode *
     **************/
    KeyDecoder.prototype.drawAlign = function () {
        var rot = this.alignControls.rotate.val();
        var hFlip = this.alignControls.hFlip.prop("checked");
        var vFlip = this.alignControls.vFlip.prop("checked");
        var bottom = this.alignControls.bottom.val();
        var top = this.alignControls.top.val();
        var shoulder = this.alignControls.shoulder.val();
        var tip = this.alignControls.tip.val();
        if (rot !== undefined && this.keyContext !== null) {
            this.keyContext.clearRect(0, 0, this.keyCanvas.width, this.keyCanvas.height);
            this.keyContext.translate(this.keyCanvas.width / 2, this.keyCanvas.height / 2);
            this.keyContext.scale(hFlip ? -1 : 1, vFlip ? -1 : 1);
            this.keyContext.rotate(+rot * Math.PI / 180.0);
            this.keyContext.translate(-this.keyCanvas.width / 2, -this.keyCanvas.height / 2);
            this.doCrop();
            this.keyContext.setTransform(1, 0, 0, 1, 0, 0);
        }
        if (this.ctrlContext !== null) {
            this.ctrlContext.clearRect(0, 0, this.ctrlCanvas.width, this.ctrlCanvas.height);
            if (bottom !== undefined) {
                canvas.drawLine(this.ctrlContext, 0, +bottom / 100 * this.ctrlCanvas.height, this.ctrlCanvas.width, +bottom / 100 * this.ctrlCanvas.height, "red");
            }
            if (top !== undefined) {
                canvas.drawLine(this.ctrlContext, 0, +top / 100 * this.ctrlCanvas.height, this.ctrlCanvas.width, +top / 100 * this.ctrlCanvas.height, "orange");
            }
            if (shoulder !== undefined) {
                canvas.drawLine(this.ctrlContext, +shoulder / 100 * this.ctrlCanvas.width, 0, +shoulder / 100 * this.ctrlCanvas.width, this.ctrlCanvas.height, "blue");
            }
            if (tip !== undefined) {
                canvas.drawLine(this.ctrlContext, +tip / 100 * this.ctrlCanvas.width, 0, +tip / 100 * this.ctrlCanvas.width, this.ctrlCanvas.height, "green");
            }
        }
    };
    KeyDecoder.prototype.onAlignChange = function () {
        var rot = this.alignControls.rotate.val();
        var hFlip = this.alignControls.hFlip.prop("checked");
        var vFlip = this.alignControls.vFlip.prop("checked");
        var bottom = this.alignControls.bottom.val();
        var top = this.alignControls.top.val();
        var shoulder = this.alignControls.shoulder.val();
        var tip = this.alignControls.tip.val();
        this.drawAlign();
        if (bottom !== undefined && top !== undefined) {
            this.vPixPermm = (((+bottom - +top) / 100) * this.ctrlCanvas.height) / this.bladeHeight;
        }
        if (shoulder !== undefined && tip !== undefined) {
            this.hPixPermm = (((+tip - +shoulder) / 100) * this.ctrlCanvas.width) / this.bladeLength;
        }
    };
    KeyDecoder.prototype.drawBittingApproximation = function (depths) {
        var bottom = this.alignControls.bottom.val();
        var top = this.alignControls.top.val();
        var shoulder = this.alignControls.shoulder.val();
        var tip = this.alignControls.tip.val();
        if (bottom !== undefined && top !== undefined && shoulder !== undefined && tip !== undefined && this.bittingContext !== null && this.keyDepths !== null) {
            this.bittingContext.clearRect(0, 0, this.keyCanvas.width, this.keyCanvas.height);
            var firstX = void 0;
            var bottomY = +bottom / 100 * this.ctrlCanvas.height;
            switch (this.cutOrder) {
                // TODO: Support tip-relative
                case 0:
                    firstX = this.firstCut * this.hPixPermm + (+shoulder / 100 * this.ctrlCanvas.width);
                    for (var i = 0; i < depths.length; i++) {
                        var x = firstX + this.cutSpacing * this.hPixPermm * i;
                        var y = bottomY - this.keyDepths[depths[i]].depth * this.vPixPermm;
                        canvas.drawLine(this.bittingContext, x - 8, y, x + 8, y, "yellow");
                    }
                    break;
                case 1:
                    firstX = (+tip / 100 * this.ctrlCanvas.width) - this.firstCut * this.hPixPermm;
                    for (var i = depths.length - 1; i >= 0; i--) {
                        var x = firstX - this.cutSpacing * this.hPixPermm * i;
                        var y = bottomY - this.keyDepths[depths[i]].depth * this.vPixPermm;
                        canvas.drawLine(this.bittingContext, x - 8, y, x + 8, y, "yellow");
                    }
                    break;
            }
        }
    };
    /*************
     * Crop Mode *
     *************/
    KeyDecoder.prototype.onCropChange = function () {
        var x, y, w, h;
        x = this.cropControls.left.val();
        y = this.cropControls.top.val();
        w = this.cropControls.width.val();
        h = this.cropControls.height.val();
        if (this.mode != DecoderMode.CROP) {
            if (this.image.src.length > 0) {
                if (this.keyContext !== null) {
                    this.keyContext.clearRect(0, 0, this.keyCanvas.width, this.keyCanvas.height);
                    this.keyContext.drawImage(this.image, 0, 0, this.keyCanvas.width, this.keyCanvas.height);
                }
            }
        }
        if (x !== undefined && y !== undefined && w !== undefined && h !== undefined) {
            this.updateCropBox(+x / 100 * this.keyCanvas.width, +y / 100 * this.keyCanvas.height, +w / 100 * this.keyCanvas.width, +h / 100 * this.keyCanvas.height);
        }
        else {
            console.debug({
                "x": x,
                "y": y,
                "w": w,
                "h": h
            });
        }
    };
    KeyDecoder.prototype.doCrop = function () {
        var x, y, w, h;
        x = this.cropControls.left.val();
        y = this.cropControls.top.val();
        w = this.cropControls.width.val();
        h = this.cropControls.height.val();
        if (this.ctrlContext !== null) {
            this.ctrlContext.clearRect(0, 0, this.ctrlCanvas.width, this.ctrlCanvas.height);
        }
        if (x !== undefined && y !== undefined && w !== undefined && h !== undefined) {
            this.cropKey(+x / 100 * this.image.width, +y / 100 * this.image.height, +w / 100 * this.image.width, +h / 100 * this.image.height);
        }
        else {
            console.debug({
                "x": x,
                "y": y,
                "w": w,
                "h": h
            });
        }
    };
    /**
     * Crops the image of the key
     * @param x X position
     * @param y Y position
     * @param w Width
     * @param h Height
     */
    KeyDecoder.prototype.cropKey = function (x, y, w, h) {
        if (this.image.src.length > 0) {
            if (this.keyContext !== null) {
                this.keyContext.clearRect(0, 0, this.keyCanvas.width, this.keyCanvas.height);
                this.keyContext.drawImage(this.image, x, y, w, h, 0, 0, this.keyCanvas.width, this.keyCanvas.height);
            }
        }
    };
    KeyDecoder.prototype.updateCropBox = function (x, y, w, h) {
        if (this.ctrlContext !== null) {
            this.ctrlContext.clearRect(0, 0, this.ctrlCanvas.width, this.ctrlCanvas.height);
            this.ctrlContext.strokeStyle = "red";
            this.ctrlContext.strokeRect(x, y, w, h);
        }
    };
    return KeyDecoder;
}());
var DecoderMode;
(function (DecoderMode) {
    DecoderMode[DecoderMode["NONE"] = 0] = "NONE";
    DecoderMode[DecoderMode["CROP"] = 1] = "CROP";
    DecoderMode[DecoderMode["ALIGN"] = 2] = "ALIGN";
})(DecoderMode || (DecoderMode = {}));
/// <reference path="./KeyDecoder.ts"/>
var decoder;
$("document").ready(function () {
    decoder = new KeyDecoder();
    console.info("Created KeyDecoder");
    decoder.init();
    console.info("Initialized KeyDecoder");
});
