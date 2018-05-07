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
    /**
     * Constructor, grabs elements from the DOM
     */
    function KeyDecoder() {
        /** Context of canvas for displaying image of key */
        this.keyContext = null;
        /** Contect of canvas for displaying crop and alignment information */
        this.ctrlContext = null;
        /** Context of canvas for displaying approximated bitting */
        this.bittingContext = null;
        /** Base64-encoded URL of key image */
        this.imageURL = "";
        /** Current mode/step */
        this.mode = DecoderMode.NONE;
        /** Length of blade, in mm */
        this.bladeLength = -1;
        /** Height of blade, in mm */
        this.bladeHeight = -1;
        /** Vertical pixels per mm */
        this.vPixPermm = 0.0;
        /** Horizontal pixels per mm */
        this.hPixPermm = 0.0;
        /** Spacing between each cut, in mm */
        this.cutSpacing = 0;
        /** Location of first cut, in mm */
        this.firstCut = 0;
        /** Order in which cuts are numbered (0 = bow to tip, 1 = tip to bow) */
        this.cutOrder = 0;
        /** Color to use to display bitting */
        this.bittingColor = "Yellow";
        /** Color to use to display crop boundries */
        this.cropBoxColor = "Red";
        /** Color to use to display bottom alignment line */
        this.bottomAlignColor = "Red";
        /** Color to use to display top alignment line */
        this.topAlignColor = "Orange";
        /** Color to use to display shoulder alignment line */
        this.shoulderAlignColor = "Blue";
        /** Color to use to display tip alignment line */
        this.tipAlignColor = "Green";
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
        this.alignControls.keystoneRatio = $(".alignKeystoneRatio");
        this.alignControls.keystoneSlices = $(".alignKeystoneSlices");
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
    /**
     * Reads the keys from the database, creates canvas contexts, and attaches
     * event callbacks.
     */
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
        $(".keyDecoderControls").masonry({
            //itemSelector: "div:not(.keyDecoder)"
            //percentPosition: true,
            containerStyle: {},
        });
    };
    /**
     * Resizes canvas to size of the element, to prevent distortion
     */
    KeyDecoder.prototype.resizeCanvas = function () {
        var rect = this.keyCanvas.getBoundingClientRect();
        this.keyCanvas.height = this.ctrlCanvas.height = this.bittingCanvas.height = rect.height;
        this.keyCanvas.width = this.ctrlCanvas.width = this.bittingCanvas.width = rect.width;
    };
    /**
     * Called when a new image is chosen. Draws the image on the canvas in order
     * to be cropped.
     */
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
                $(".keyDecoderControls").masonry();
            };
            _this.image.src = _this.imageURL;
        };
        fr.readAsDataURL(this.keyFile.prop("files")[0]);
    };
    /**
     * Called when the DSD database is updated. Clears the selection boxes, and
     * populates the brands.
     */
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
    /**
     * Called when a key brand is selected. Updates the list of keys types.
     */
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
    /**
     * Called when a key type is selected. Updates list of possible number of cuts.
     */
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
            var bottom = this.alignControls.bottom.val();
            var top_1 = this.alignControls.top.val();
            var shoulder = this.alignControls.shoulder.val();
            var tip = this.alignControls.tip.val();
            if (bottom !== undefined && top_1 !== undefined) {
                this.vPixPermm = (((+bottom - +top_1) / 100) * this.ctrlCanvas.height) / this.bladeHeight;
            }
            if (shoulder !== undefined && tip !== undefined) {
                this.hPixPermm = (((+tip - +shoulder) / 100) * this.ctrlCanvas.width) / this.bladeLength;
            }
        }
    };
    /**
     * Called when the number of cuts is selected. Updates the number of select
     * boxes for choosing bitting codes.
     */
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
    /**
     * Called when a bitting is selected for one of the cuts. Redraws bitting
     * lines on the bitting canvas.
     */
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
    /**
     * Redraws image with crop, rotation, flipping, and keystone, then draws
     * alignment lines.
     */
    KeyDecoder.prototype.drawAlign = function () {
        var rotZ = this.alignControls.rotate.val();
        var keyS = this.alignControls.keystoneSlices.val();
        var keyR = this.alignControls.keystoneRatio.val();
        var hFlip = this.alignControls.hFlip.prop("checked");
        var vFlip = this.alignControls.vFlip.prop("checked");
        var bottom = this.alignControls.bottom.val();
        var top = this.alignControls.top.val();
        var shoulder = this.alignControls.shoulder.val();
        var tip = this.alignControls.tip.val();
        var x, y, w, h;
        x = this.cropControls.left.val();
        y = this.cropControls.top.val();
        w = this.cropControls.width.val();
        h = this.cropControls.height.val();
        if (rotZ !== undefined && keyS !== undefined && keyR !== undefined && x !== undefined && y !== undefined && w !== undefined && h !== undefined && this.keyContext !== null) {
            this.keyContext.clearRect(0, 0, this.keyCanvas.width, this.keyCanvas.height);
            this.keyContext.translate(this.keyCanvas.width / 2, this.keyCanvas.height / 2);
            this.keyContext.scale(hFlip ? -1 : 1, vFlip ? -1 : 1);
            this.keyContext.rotate(+rotZ * Math.PI / 180.0);
            this.keyContext.translate(-this.keyCanvas.width / 2, -this.keyCanvas.height / 2);
            //this.doCrop();
            this.cropKeyWithKeystone(+x / 100 * this.image.width, +y / 100 * this.image.height, +w / 100 * this.image.width, +h / 100 * this.image.height, +keyS, +keyR);
            this.keyContext.setTransform(1, 0, 0, 1, 0, 0);
        }
        if (this.ctrlContext !== null) {
            this.ctrlContext.clearRect(0, 0, this.ctrlCanvas.width, this.ctrlCanvas.height);
            if (bottom !== undefined) {
                canvas.drawLine(this.ctrlContext, 0, +bottom / 100 * this.ctrlCanvas.height, this.ctrlCanvas.width, +bottom / 100 * this.ctrlCanvas.height, this.bottomAlignColor);
            }
            if (top !== undefined) {
                canvas.drawLine(this.ctrlContext, 0, +top / 100 * this.ctrlCanvas.height, this.ctrlCanvas.width, +top / 100 * this.ctrlCanvas.height, this.topAlignColor);
            }
            if (shoulder !== undefined) {
                canvas.drawLine(this.ctrlContext, +shoulder / 100 * this.ctrlCanvas.width, 0, +shoulder / 100 * this.ctrlCanvas.width, this.ctrlCanvas.height, this.shoulderAlignColor);
            }
            if (tip !== undefined) {
                canvas.drawLine(this.ctrlContext, +tip / 100 * this.ctrlCanvas.width, 0, +tip / 100 * this.ctrlCanvas.width, this.ctrlCanvas.height, this.tipAlignColor);
            }
        }
    };
    /**
     * Called when alignment controls are changed. Calls drawAlign(), and sets
     * the horizontal and vertical resolution in terms of pixels per mm.
     */
    KeyDecoder.prototype.onAlignChange = function () {
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
    /**
     * Draws the bitting approximation on top of the key for visual inspection.
     *
     * @param depths List of cut depths to display
     */
    KeyDecoder.prototype.drawBittingApproximation = function (depths) {
        var _this = this;
        var bottom = this.alignControls.bottom.val();
        var top = this.alignControls.top.val();
        var shoulder = this.alignControls.shoulder.val();
        var tip = this.alignControls.tip.val();
        if (bottom !== undefined && top !== undefined && shoulder !== undefined && tip !== undefined && this.bittingContext !== null && this.keyDepths !== null) {
            this.bittingContext.clearRect(0, 0, this.keyCanvas.width, this.keyCanvas.height);
            var firstX = void 0;
            var bottomY = +bottom / 100 * this.ctrlCanvas.height;
            var x = 0, y = 0;
            /**
             * Draws a key bitting approximation marker
             *
             * @param x X position, in pixels
             * @param y Y position, in pixels
             */
            var placeBit = function (x, y) {
                if (_this.bittingContext !== null) {
                    canvas.drawLine(_this.bittingContext, x - 8, y - 16, x, y, _this.bittingColor);
                    canvas.drawLine(_this.bittingContext, x + 8, y - 16, x, y, _this.bittingColor);
                    canvas.drawLine(_this.bittingContext, x - 8, y, x + 8, y, _this.bittingColor);
                }
            };
            switch (this.cutOrder) {
                case 0:
                    firstX = this.firstCut * this.hPixPermm + (+shoulder / 100 * this.ctrlCanvas.width);
                    for (var i = 0; i < depths.length; i++) {
                        x = firstX + this.cutSpacing * this.hPixPermm * i;
                        y = bottomY - this.keyDepths[depths[i]].depth * this.vPixPermm;
                        placeBit(x, y);
                    }
                    break;
                case 1:
                    firstX = (+tip / 100 * this.ctrlCanvas.width) - this.firstCut * this.hPixPermm;
                    for (var i = depths.length - 1; i >= 0; i--) {
                        x = firstX - this.cutSpacing * this.hPixPermm * i;
                        y = bottomY - this.keyDepths[depths[i]].depth * this.vPixPermm;
                        placeBit(x, y);
                    }
                    break;
            }
        }
    };
    /*************
     * Crop Mode *
     *************/
    /**
     * Displays crop lines.
     */
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
    /**
     * Crops image.
     */
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
        this.cropKeyWithKeystone(x, y, w, h, 1, 1);
    };
    /**
     * Crops the image of the key, and keystone correct
     *
     * @param x X position
     * @param y Y position
     * @param w Width
     * @param h Height
     * @param nSlices Number of slices used to perform keystone correction
     * @param s Keystone scale (1 = no keystone, <1 = right end is smaller, >1 = right end is larger)
     */
    KeyDecoder.prototype.cropKeyWithKeystone = function (x, y, w, h, nSlices, s) {
        if (this.image.src.length > 0) {
            if (this.keyContext !== null) {
                var sliceWidth = w / nSlices;
                var dSliceWidth = this.keyCanvas.width / nSlices;
                var dsh = this.keyCanvas.height;
                var ddh = ((dsh * s) - dsh) / nSlices;
                this.keyContext.clearRect(0, 0, this.keyCanvas.width, this.keyCanvas.height);
                for (var i = 0; i < nSlices; i++) {
                    this.keyContext.drawImage(this.image, x + sliceWidth * i, y, sliceWidth, h, //this.image.height,
                    dSliceWidth * i, (this.keyCanvas.height - dsh) / 2, dSliceWidth, dsh);
                    dsh += ddh;
                }
            }
        }
    };
    /**
     * Displays crop box over image.
     *
     * @param x Left of crop box
     * @param y Top of crop box
     * @param w Width of crop box
     * @param h Height of crop box
     */
    KeyDecoder.prototype.updateCropBox = function (x, y, w, h) {
        if (this.ctrlContext !== null) {
            this.ctrlContext.clearRect(0, 0, this.ctrlCanvas.width, this.ctrlCanvas.height);
            this.ctrlContext.strokeStyle = this.cropBoxColor;
            this.ctrlContext.strokeRect(x, y, w, h);
        }
    };
    return KeyDecoder;
}());
/**
 * Current mode/step of decoder
 */
var DecoderMode;
/**
 * Current mode/step of decoder
 */
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
