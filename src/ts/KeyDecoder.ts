/// <reference path="./DSDDatabase.ts"/>
/// <reference path="./CanvasFunctions.ts"/>

class KeyDecoder {
    /** Depth and Space Data database */
    private dsd: DSDDatabase;

    /** Key image file select */
    private keyFile:        JQuery;
    /** Canvas for displaying image of key */
    private keyCanvas:      HTMLCanvasElement;
    /** Context of canvas for displaying image of key */
    private keyContext:     CanvasRenderingContext2D | null = null;
    /** Canvas for displaying crop and alignment information */
    private ctrlCanvas:     HTMLCanvasElement;
    /** Contect of canvas for displaying crop and alignment information */
    private ctrlContext:    CanvasRenderingContext2D | null = null;
    /** Canvas for displaying approximated bitting */
    private bittingCanvas:  HTMLCanvasElement;
    /** Context of canvas for displaying approximated bitting */
    private bittingContext: CanvasRenderingContext2D | null = null;
    /** Base64-encoded URL of key image */
    private imageURL:       string = "";
    /** Image element used to draw image to canvas */
    private image:          HTMLImageElement;

    /** Select element used to select key brand */
    private keyBrandSelect: JQuery;
    /** Select element used to select key type/model */
    private keyTypeSelect:  JQuery;
    /** Select element used to select number of key cuts */
    private keyNCutsSelect: JQuery;

    /** Div containing all image and key bitting controls */
    private bittingControlsDiv: JQuery;

    /** Image crop controls */
    private cropControls:  CropControls;
    /** Key alignment controls */
    private alignControls: AlignControls;

    /** Current mode/step */
    private mode: DecoderMode = DecoderMode.NONE;

    /** List of standard depths for key */
    private keyDepths: DSDJsonEntryDepth[] | null;
    /** Length of blade, in mm */
    private bladeLength: number = -1;
    /** Height of blade, in mm */
    private bladeHeight: number = -1;
    /** Vertical pixels per mm */
    private vPixPermm:   number = 0.0;
    /** Horizontal pixels per mm */
    private hPixPermm:   number = 0.0;
    /** Spacing between each cut, in mm */
    private cutSpacing:  number = 0;
    /** Location of first cut, in mm */
    private firstCut:    number = 0;
    /** Order in which cuts are numbered (0 = bow to tip, 1 = tip to bow) */
    private cutOrder:    number = 0;

    /** Color to use to display bitting */
    private bittingColor:       string = "Yellow";
    /** Color to use to display crop boundries */
    private cropBoxColor:       string = "Red";
    /** Color to use to display bottom alignment line */
    private bottomAlignColor:   string = "Red";
    /** Color to use to display top alignment line */
    private topAlignColor:      string = "Orange";
    /** Color to use to display shoulder alignment line */
    private shoulderAlignColor: string = "Blue";
    /** Color to use to display tip alignment line */
    private tipAlignColor:      string = "Green";

    /**
     * Constructor, grabs elements from the DOM
     */
    public constructor() {
        this.dsd = new DSDDatabase();

        this.keyFile = $(".keyFile");
        this.keyCanvas     = <HTMLCanvasElement>$(".keyCanvas")[0];
        this.ctrlCanvas    = <HTMLCanvasElement>$(".controlCanvas")[0];
        this.bittingCanvas = <HTMLCanvasElement>$(".bittingCanvas")[0];
        this.image = new Image();

        this.cropControls        = <CropControls>new Object();
        this.cropControls.left   = $(".cropLeft");
        this.cropControls.top    = $(".cropTop");
        this.cropControls.width  = $(".cropWidth");
        this.cropControls.height = $(".cropHeight");

        this.alignControls                = <AlignControls>new Object();
        this.alignControls.rotate         = $(".alignRotate");
        this.alignControls.keystoneRatio  = $(".alignKeystoneRatio");
        this.alignControls.keystoneSlices = $(".alignKeystoneSlices");
        this.alignControls.hFlip          = $(".alignHFlip");
        this.alignControls.vFlip          = $(".alignVFlip");

        this.alignControls.bottom   = $(".alignBottom");
        this.alignControls.top      = $(".alignTop");
        this.alignControls.shoulder = $(".alignShoulder");
        this.alignControls.tip      = $(".alignTip");

        this.keyBrandSelect = $(".keyBrandSelect");
        this.keyTypeSelect  = $(".keyTypeSelect");
        this.keyNCutsSelect  = $(".keyNCutsSelect");

        this.bittingControlsDiv = $(".bittingControls");

        this.keyDepths = null;
    }

    /**
     * Reads the keys from the database, creates canvas contexts, and attaches
     * event callbacks.
     */
    public init() {
        this.dsd.readDatabase("dsd.json", () => this.onDSDUpdate());

        this.keyFile.on("change", () => { this.onKeyFileChange() });

        this.keyContext     = this.keyCanvas.getContext("2d");
        this.ctrlContext    = this.ctrlCanvas.getContext("2d");
        this.bittingContext = this.bittingCanvas.getContext("2d");

        this.resizeCanvas();

        $(".cropCtrl").on("change", () => { this.onCropChange(); this.mode = DecoderMode.CROP; });
        $(".cropButton").on("click", () => { this.doCrop(); this.mode = DecoderMode.ALIGN; });

        $(".alignCtrl").on("change", () => { this.onAlignChange(); this.mode = DecoderMode.ALIGN; });
        
        this.keyBrandSelect.on("change", () => { this.onKeyBrandChange(); });
        this.keyTypeSelect.on("change",  () => { this.onKeyTypeChange(); });
        this.keyNCutsSelect.on("change", () => { this.onNCutsChange(); });

        $(".keyDecoderControls").masonry({
            //itemSelector: "div:not(.keyDecoder)"
            //percentPosition: true,
            containerStyle: {},
        });
    }

    /**
     * Resizes canvas to size of the element, to prevent distortion
     */
    private resizeCanvas() {
        let rect = this.keyCanvas.getBoundingClientRect();
        this.keyCanvas.height = this.ctrlCanvas.height = this.bittingCanvas.height = rect.height;
        this.keyCanvas.width  = this.ctrlCanvas.width  = this.bittingCanvas.width  = rect.width;
    }

    /**
     * Called when a new image is chosen. Draws the image on the canvas in order
     * to be cropped.
     */
    private onKeyFileChange() {
        console.info(this.keyFile.prop("files")[0]);

        let fr = new FileReader();
        fr.onload = () => {
            console.debug(fr.result);
            this.imageURL = fr.result;

            this.image.onload = () => {
                if(this.keyContext !== null) {
                    this.keyContext.clearRect(0, 0, this.keyCanvas.width, this.keyCanvas.height);
                    this.keyContext.drawImage(this.image, 0, 0, this.keyCanvas.width, this.keyCanvas.height);
                }

                $(".keyDecoderControls").masonry();
            }

            this.image.src = this.imageURL;
        };

        fr.readAsDataURL(this.keyFile.prop("files")[0]);
    }

    /**
     * Called when the DSD database is updated. Clears the selection boxes, and
     * populates the brands.
     */
    private onDSDUpdate() {
        this.keyBrandSelect.empty();
        this.keyTypeSelect.empty();

        let brands = this.dsd.getNames();
        brands.forEach((val: string, idx: number) => {
            this.keyBrandSelect.append(
                $("<option/>", {
                    value: val
                }).text(val)
            );
        });

        this.onKeyBrandChange();
    }

    /**
     * Called when a key brand is selected. Updates the list of keys types.
     */
    private onKeyBrandChange() {
        this.keyTypeSelect.empty();

        let brand = this.keyBrandSelect.val();

        if(brand !== undefined) {
            let types = this.dsd.getTypes(""+brand);
            types.forEach((val: DSDTypeRef, idx: number) => {
                this.keyTypeSelect.append(
                    $("<option/>", {
                        value: val.idx
                    }).text(val.name)
                );
            });

            this.onKeyTypeChange();
        }
    }

    /**
     * Called when a key type is selected. Updates list of possible number of cuts.
     */
    private onKeyTypeChange() {
        let type = this.keyTypeSelect.val();

        this.keyNCutsSelect.empty();

        if(type !== undefined) {
            this.keyDepths   = this.dsd.getDepths(+type);
            this.bladeLength = this.dsd.getBladeLength(+type);
            this.bladeHeight = this.dsd.getBladeHeight(+type);
            this.cutSpacing  = this.dsd.getCutSpacing(+type);
            this.firstCut    = this.dsd.getFirstCutPos(+type);
            this.cutOrder    = this.dsd.getOrder(+type);
            
            this.dsd.getNCuts(+type).forEach((val: number) => {
                this.keyNCutsSelect.append(
                    $("<option/>", {
                        value: val
                    }).text(""+val)
                );
            });

            this.onNCutsChange();

            let bottom         = this.alignControls.bottom.val();
            let top            = this.alignControls.top.val();
            let shoulder       = this.alignControls.shoulder.val();
            let tip            = this.alignControls.tip.val();
            if(bottom !== undefined && top !== undefined) {
                this.vPixPermm = (((+bottom - +top) / 100) * this.ctrlCanvas.height) / this.bladeHeight;
            }
    
            if(shoulder !== undefined && tip !== undefined) {
                this.hPixPermm = (((+tip - +shoulder) / 100) * this.ctrlCanvas.width) / this.bladeLength;         
            }
        }
    }

    /**
     * Called when the number of cuts is selected. Updates the number of select
     * boxes for choosing bitting codes.
     */
    private onNCutsChange() {
        let nCuts = this.keyNCutsSelect.val();
        this.bittingControlsDiv.empty();

        if(nCuts !== undefined && this.keyDepths !== null) {
            for(let i = 0; i < +nCuts; i++) {
                this.bittingControlsDiv.append(
                    $("<select/>").addClass("depthSelect").data("cut", i)
                );
            }

            for(let i = 0; i < this.keyDepths.length; i++) {
                $(".depthSelect").append(
                    $("<option/>", {
                        val: i
                    }).text(this.keyDepths[i].cut)
                ).on("click", () => { this.onBittingChange(); });
            }
        }
    }

    /**
     * Called when a bitting is selected for one of the cuts. Redraws bitting
     * lines on the bitting canvas.
     */
    private onBittingChange() {
        let nCuts = this.keyNCutsSelect.val();
        if(nCuts !== undefined) {
            let depths = new Array(+nCuts);

            $(".depthSelect").each((idx: number, elem: HTMLElement) => {
                let cut   = $(elem).data("cut");
                let depth = $(elem).val();

                if(cut !== undefined && depth !== undefined) {
                    depths[+cut] = +depth;
                }
            });

            this.drawBittingApproximation(depths);
        }
    }
    
    /**************
     * Align Mode * 
     **************/

    /**
     * Redraws image with crop, rotation, flipping, and keystone, then draws
     * alignment lines.
     */
    private drawAlign() {
        let rotZ           = this.alignControls.rotate.val();
        let keyS           = this.alignControls.keystoneSlices.val();
        let keyR           = this.alignControls.keystoneRatio.val();
        let hFlip: boolean = this.alignControls.hFlip.prop("checked");
        let vFlip: boolean = this.alignControls.vFlip.prop("checked");

        let bottom         = this.alignControls.bottom.val();
        let top            = this.alignControls.top.val();
        let shoulder       = this.alignControls.shoulder.val();
        let tip            = this.alignControls.tip.val();

        let x, y, w, h;
        x = this.cropControls.left.val();
        y = this.cropControls.top.val();
        w = this.cropControls.width.val();
        h = this.cropControls.height.val();

        if(rotZ !== undefined && keyS !== undefined && keyR !== undefined && x !== undefined && y !== undefined && w !== undefined && h !== undefined && this.keyContext !== null) {
            this.keyContext.clearRect(0, 0, this.keyCanvas.width, this.keyCanvas.height);
            this.keyContext.translate(this.keyCanvas.width / 2, this.keyCanvas.height / 2);
            this.keyContext.scale(hFlip ? -1 : 1, vFlip ? -1 : 1);
            this.keyContext.rotate(+rotZ * Math.PI/180.0);
            this.keyContext.translate(-this.keyCanvas.width / 2, -this.keyCanvas.height / 2);
            //this.doCrop();
            this.cropKeyWithKeystone(
                +x/100 * this.image.width, +y/100 * this.image.height,
                +w/100 * this.image.width, +h/100 * this.image.height,
                +keyS, +keyR
            );
            this.keyContext.setTransform(1, 0, 0, 1, 0, 0);
        }

        if(this.ctrlContext !== null) {
            this.ctrlContext.clearRect(0, 0, this.ctrlCanvas.width, this.ctrlCanvas.height);
            if(bottom !== undefined) {
                canvas.drawLine(this.ctrlContext,
                    0, +bottom/100 * this.ctrlCanvas.height,
                    this.ctrlCanvas.width, +bottom/100 * this.ctrlCanvas.height,
                    this.bottomAlignColor
                );
            }
            if(top !== undefined) {
                canvas.drawLine(this.ctrlContext,
                    0, +top/100 * this.ctrlCanvas.height,
                    this.ctrlCanvas.width, +top/100 * this.ctrlCanvas.height,
                    this.topAlignColor
                );
            }
            if(shoulder !== undefined) {
                canvas.drawLine(this.ctrlContext,
                    +shoulder/100 * this.ctrlCanvas.width, 0,
                    +shoulder/100 * this.ctrlCanvas.width, this.ctrlCanvas.height, 
                    this.shoulderAlignColor
                );
            }
            if(tip !== undefined) {
                canvas.drawLine(this.ctrlContext,
                    +tip/100 * this.ctrlCanvas.width, 0,
                    +tip/100 * this.ctrlCanvas.width, this.ctrlCanvas.height, 
                    this.tipAlignColor
                );
            }
        }
    }

    /**
     * Called when alignment controls are changed. Calls drawAlign(), and sets
     * the horizontal and vertical resolution in terms of pixels per mm.
     */
    private onAlignChange() {

        let bottom         = this.alignControls.bottom.val();
        let top            = this.alignControls.top.val();
        let shoulder       = this.alignControls.shoulder.val();
        let tip            = this.alignControls.tip.val();

        this.drawAlign();

        if(bottom !== undefined && top !== undefined) {
            this.vPixPermm = (((+bottom - +top) / 100) * this.ctrlCanvas.height) / this.bladeHeight;
        }

        if(shoulder !== undefined && tip !== undefined) {
            this.hPixPermm = (((+tip - +shoulder) / 100) * this.ctrlCanvas.width) / this.bladeLength;         
        }
    }

    /**
     * Draws the bitting approximation on top of the key for visual inspection.
     * 
     * @param depths List of cut depths to display
     */
    private drawBittingApproximation(depths: number[]) {
        let bottom         = this.alignControls.bottom.val();
        let top            = this.alignControls.top.val();
        let shoulder       = this.alignControls.shoulder.val();
        let tip            = this.alignControls.tip.val();

        if(bottom !== undefined && top !== undefined && shoulder !== undefined && tip !== undefined && this.bittingContext !== null && this.keyDepths !== null) {
            this.bittingContext.clearRect(0, 0, this.keyCanvas.width, this.keyCanvas.height);

            let firstX;
            let bottomY = +bottom / 100 * this.ctrlCanvas.height;

            let x = 0, y = 0;

            /**
             * Draws a key bitting approximation marker
             * 
             * @param x X position, in pixels
             * @param y Y position, in pixels
             */
            let placeBit = (x: number, y: number) => {
                if(this.bittingContext !== null) {
                    canvas.drawLine(this.bittingContext, x - 8, y - 16, x,     y, this.bittingColor);
                    canvas.drawLine(this.bittingContext, x + 8, y - 16, x,     y, this.bittingColor);
                    canvas.drawLine(this.bittingContext, x - 8, y,      x + 8, y, this.bittingColor);
                }
            }
            
            switch(this.cutOrder) {
                case 0:
                    firstX  = this.firstCut * this.hPixPermm + (+shoulder / 100 * this.ctrlCanvas.width);

                    for(let i = 0; i < depths.length; i++) {
                        x = firstX + this.cutSpacing * this.hPixPermm * i;
                        y = bottomY - this.keyDepths[depths[i]].depth * this.vPixPermm;
                        placeBit(x, y);
                    }
                    break;
                
                case 1:
                    firstX  = (+tip / 100 * this.ctrlCanvas.width) - this.firstCut * this.hPixPermm;

                    for(let i = depths.length - 1; i >= 0; i--) {
                        x = firstX - this.cutSpacing * this.hPixPermm * i;
                        y = bottomY - this.keyDepths[depths[i]].depth * this.vPixPermm;
                        placeBit(x, y);
                    }
                    break;
            }
        }
    }

    /*************
     * Crop Mode *
     *************/

    /**
     * Displays crop lines.
     */
    private onCropChange() {
        let x, y, w, h;
        x = this.cropControls.left.val();
        y = this.cropControls.top.val();
        w = this.cropControls.width.val();
        h = this.cropControls.height.val();

        if(this.mode != DecoderMode.CROP) {
            if(this.image.src.length > 0) {
                if(this.keyContext !== null) {
                    this.keyContext.clearRect(0, 0, this.keyCanvas.width, this.keyCanvas.height);
                    this.keyContext.drawImage(this.image, 0, 0, this.keyCanvas.width, this.keyCanvas.height);
                }
            }
        }

        if(x !== undefined && y !== undefined && w !== undefined && h !== undefined) {
            this.updateCropBox(+x/100 * this.keyCanvas.width, +y/100 * this.keyCanvas.height, +w/100 * this.keyCanvas.width, +h/100 * this.keyCanvas.height);
        } else {
            console.debug({
                "x": x,
                "y": y,
                "w": w,
                "h": h
            });
        }
    }

    /**
     * Crops image.
     */
    private doCrop() {
        let x, y, w, h;
        x = this.cropControls.left.val();
        y = this.cropControls.top.val();
        w = this.cropControls.width.val();
        h = this.cropControls.height.val();

        if(this.ctrlContext !== null) {
            this.ctrlContext.clearRect(0, 0, this.ctrlCanvas.width, this.ctrlCanvas.height);
        }

        if(x !== undefined && y !== undefined && w !== undefined && h !== undefined) {
            this.cropKey(+x/100 * this.image.width, +y/100 * this.image.height, +w/100 * this.image.width, +h/100 * this.image.height);
        } else {
            console.debug({
                "x": x,
                "y": y,
                "w": w,
                "h": h
            });
        }
    }

    /**
     * Crops the image of the key
     * @param x X position
     * @param y Y position
     * @param w Width
     * @param h Height
     */
    private cropKey(x: number, y: number, w: number, h: number) {
        this.cropKeyWithKeystone(x, y, w, h, 1, 1);
    }

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
    private cropKeyWithKeystone(x: number, y: number, w: number, h: number, nSlices: number, s: number) {
        if(this.image.src.length > 0) {
            if(this.keyContext !== null) {
                let sliceWidth = w / nSlices;
                let dSliceWidth = this.keyCanvas.width / nSlices;

                let dsh = this.keyCanvas.height;
                let ddh = ((dsh * s) - dsh) / nSlices;
                
                this.keyContext.clearRect(0, 0, this.keyCanvas.width, this.keyCanvas.height);

                for(let i = 0; i < nSlices; i++) {
                    this.keyContext.drawImage(this.image,
                        x + sliceWidth * i, y,
                        sliceWidth, h, //this.image.height,
                        dSliceWidth * i, (this.keyCanvas.height - dsh)/2,
                        dSliceWidth, dsh);
                    
                    dsh += ddh;
                }
            }
        }
    }

    /**
     * Displays crop box over image.
     * 
     * @param x Left of crop box
     * @param y Top of crop box
     * @param w Width of crop box
     * @param h Height of crop box
     */
    private updateCropBox(x: number, y: number, w: number, h: number) {
        if(this.ctrlContext !== null) {
            this.ctrlContext.clearRect(0, 0, this.ctrlCanvas.width, this.ctrlCanvas.height);
            this.ctrlContext.strokeStyle = this.cropBoxColor;
            this.ctrlContext.strokeRect(x, y, w, h);
        }
    }
}

/**
 * Current mode/step of decoder
 */
enum DecoderMode {
    NONE,
    CROP,
    ALIGN
}

/**
 * Controls used to crop the source image
 */
interface CropControls {
    /** Left side of crop boundry */
    left:   JQuery;
    /** Top of crop boundry */
    top:    JQuery;
    /** Width of crop boundry */
    width:  JQuery;
    /** Height of crop boundry */
    height: JQuery;
}

/**
 * Controls used to align key before determining bitting
 */
interface AlignControls {
    /** Image rotation control */
    rotate:         JQuery;
    /** Keystone slice count control */
    keystoneSlices: JQuery;
    /** Keystone ratio control */
    keystoneRatio:  JQuery;
    /** Horizontal flip toggle */
    hFlip:          JQuery;
    /** Vertical flip toggle */
    vFlip:          JQuery;

    /** Bottom of key alignment */
    bottom:   JQuery;
    /** Top of key alignment */
    top:      JQuery;
    /** Key shoulder alignment */
    shoulder: JQuery;
    /** Key tip alignment */
    tip:      JQuery;
}