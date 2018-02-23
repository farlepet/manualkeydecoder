/** Root of DSD json file */
interface DSDJson {
    /** List of depth and space information for different keys */
    dsd:  DSDJsonEntry[];
    /** Information about data contained in dsd */
    info: DSDJsonInfo;
}

/** DSD entry */
interface DSDJsonEntry {
    /** Brand names */
    names: string[];
    /** Keyways, blanks, and other identifiers */
    types: string[];

    /** Whether or not depths are spaced evenly */
    incremental_depths:  boolean;
    /** Whether or not cuts are spaced evenly */
    incremental_spacing: boolean;

    /** Distance of first cut from base of blade, in mm */
    depth0: number;
    /** Difference of each cut, in mm */
    depth_inc: number;
    /** Number of first depth */
    depth_start: number;
    /** Number of distinct depths */
    depth_count: number;

    /** List of depths, present if incremental_depths is false */
    depths: DSDJsonEntryDepth[];

    /** Distance of center of first cut from reference point, in mm */
    space0: number;
    /** Distance between cuts, in mm */
    space_inc: number;
    /** Minimum number of cuts */
    min_spaces: number;
    /** Maximum number of cuts */
    max_spaces: number;

    /** Length of blade, in mm, from shoulder to tip */
    blade_length: number;
    /** Height of blade, in mm, from shoulder to tip */
    blade_height: number;

    /** How to order and find cuts */
    order: number;
}

/** Cut depth entry */
interface DSDJsonEntryDepth {
    /** Name of cut depth */
    cut: string;
    /** Distance of cut from base of blade, in mm */
    depth: number;
}

/** DSD file information */
interface DSDJsonInfo {
    order_types: string[number];
}