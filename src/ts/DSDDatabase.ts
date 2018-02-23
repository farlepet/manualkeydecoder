/// <reference path="./DSDJson.ts"/>

class DSDDatabase {
    /** Depth and space data */
    private dsd: DSDJson | null = null;

    constructor() {
    }

    public readDatabase(url: string, callback?: () => any) {
        $.getJSON(url, (data: DSDJson) => {
            console.info("DSDDatabase.readDatabase success!");
            this.dsd = data;

            if(callback !== undefined) {
                callback();
            }
        }).fail((err) => {
            console.error("DSDDatabase.readDatabase failed: " + err);
        });

    }

    public nKeys(): number {
        if(this.dsd !== null) {
            return this.dsd.dsd.length;
        }
        return 0;
    }

    public keyNames(idx: number): string[] {
        if(this.dsd !== null) {
            if(idx < this.dsd.dsd.length && idx > 0) {
                return this.dsd.dsd[idx].names;
            } else {
                console.error("DSDDatabase.keyNames: idx (" + idx + ") out of range!")
            }
        }
        return new Array();
    }

    public keyTypes(idx: number): string[] {
        if(this.dsd !== null) {
            if(idx < this.dsd.dsd.length && idx > 0) {
                return this.dsd.dsd[idx].types;
            } else {
                console.error("DSDDatabase.keyTypes: idx (" + idx + ") out of range!")
            }
        }
        return new Array();
    }

    public getNames(): string[] {
        let ret: string[] = new Array();

        if(this.dsd !== null) {
            for(let i = 0; i < this.dsd.dsd.length; i++) {
                for(let j = 0; j < this.dsd.dsd[i].names.length; j++) {
                    if(ret.indexOf(this.dsd.dsd[i].names[j]) < 0) {
                        ret.push(this.dsd.dsd[i].names[j]);
                    }
                }
            }
        }

        return ret;
    }

    public getTypes(name: string): DSDTypeRef[] {
        let ret: DSDTypeRef[] = new Array();

        if(this.dsd !== null) {
            for(let i = 0; i < this.dsd.dsd.length; i++) {
                if(this.dsd.dsd[i].names.indexOf(name) >= 0) {
                    for(let j = 0; j < this.dsd.dsd[i].types.length; j++) {
                        let type: DSDTypeRef = {
                            name: this.dsd.dsd[i].types[j],
                            idx:  i
                        };
                        if(ret.indexOf(type) < 0) {
                            ret.push(type);
                        }
                    }
                }
            }
        }

        return ret;
    }

    public getDepths(idx: number): DSDJsonEntryDepth[] {
        let ret: DSDJsonEntryDepth[] = new Array();

        if(this.dsd !== null) {
            if(idx < 0 || idx >= this.dsd.dsd.length) {
                console.error("DSDDatabase.getDepths(): Index (" + idx + ") out of range!");
            } else {
                if("depths" in this.dsd.dsd[idx]) {
                    ret = this.dsd.dsd[idx].depths;
                } else {
                    for(let i = 0; i < this.dsd.dsd[idx].depth_count; i++) {
                        let depth: DSDJsonEntryDepth = {
                            cut: "0123456789ABCDEF"[i + this.dsd.dsd[idx].depth_start],
                            depth: this.dsd.dsd[idx].depth0 - (this.dsd.dsd[idx].depth_inc * i)
                        };
                        ret.push(depth);
                    }
                }
            }
        }

        return ret;
    }

    public getNCuts(idx: number): number[] {
        let ret: number[] = new Array();


        if(this.dsd !== null) {
            if(idx < 0 || idx >= this.dsd.dsd.length) {
                console.error("DSDDatabase.getNCuts(): Index (" + idx + ") out of range!");
            } else {
                for(let i = this.dsd.dsd[idx].min_spaces; i <= this.dsd.dsd[idx].max_spaces; i++) {
                    ret.push(i);
                }
            }
        }

        return ret;
    }

    public getBladeLength(idx: number): number {
        if(this.dsd !== null) {
            if(idx < 0 || idx >= this.dsd.dsd.length) {
                console.error("DSDDatabase.getBladeLength(): Index (" + idx + ") out of range!");
            } else {
                return this.dsd.dsd[idx].blade_length;
            }
        }

        return -1;
    }

    public getBladeHeight(idx: number): number {
        if(this.dsd !== null) {
            if(idx < 0 || idx >= this.dsd.dsd.length) {
                console.error("DSDDatabase.getBladeHeight(): Index (" + idx + ") out of range!");
            } else {
                return this.dsd.dsd[idx].blade_height;
            }
        }

        return -1;
    }

    public getCutSpacing(idx: number): number {
        // TODO: Support non-incremental spacing!
        if(this.dsd !== null) {
            if(idx < 0 || idx >= this.dsd.dsd.length) {
                console.error("DSDDatabase.getCutSpacing(): Index (" + idx + ") out of range!");
            } else {
                return this.dsd.dsd[idx].space_inc;
            }
        }

        return -1;
    }

    public getFirstCutPos(idx: number): number {
        // TODO: Support non-incremental spacing!
        if(this.dsd !== null) {
            if(idx < 0 || idx >= this.dsd.dsd.length) {
                console.error("DSDDatabase.getFirstCutPos(): Index (" + idx + ") out of range!");
            } else {
                return this.dsd.dsd[idx].space0;
            }
        }

        return -1;
    }

    public getOrder(idx: number): number {
        if(this.dsd !== null) {
            if(idx < 0 || idx >= this.dsd.dsd.length) {
                console.error("DSDDatabase.getOrder(): Index (" + idx + ") out of range!");
            } else {
                return this.dsd.dsd[idx].order;
            }
        }

        return -1;
    }
}

interface DSDTypeRef {
    name: string;
    idx:  number;
}