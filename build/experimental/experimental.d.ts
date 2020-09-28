declare namespace egret.experimental {
    /**
     * @private
     */
    let debug: boolean;
    const ExifTags: {
        36864: string;
        40960: string;
        40961: string;
        40962: string;
        40963: string;
        37121: string;
        37122: string;
        37500: string;
        37510: string;
        40964: string;
        36867: string;
        36868: string;
        37520: string;
        37521: string;
        37522: string;
        33434: string;
        33437: string;
        34850: string;
        34852: string;
        34855: string;
        34856: string;
        37377: string;
        37378: string;
        37379: string;
        37380: string;
        37381: string;
        37382: string;
        37383: string;
        37384: string;
        37385: string;
        37396: string;
        37386: string;
        41483: string;
        41484: string;
        41486: string;
        41487: string;
        41488: string;
        41492: string;
        41493: string;
        41495: string;
        41728: string;
        41729: string;
        41730: string;
        41985: string;
        41986: string;
        41987: string;
        41988: string;
        41989: string;
        41990: string;
        41991: string;
        41992: string;
        41993: string;
        41994: string;
        41995: string;
        41996: string;
        40965: string;
        42016: string;
    };
    const TiffTags: {
        256: string;
        257: string;
        34665: string;
        34853: string;
        40965: string;
        258: string;
        259: string;
        262: string;
        274: string;
        277: string;
        284: string;
        530: string;
        531: string;
        282: string;
        283: string;
        296: string;
        273: string;
        278: string;
        279: string;
        513: string;
        514: string;
        301: string;
        318: string;
        319: string;
        529: string;
        532: string;
        306: string;
        270: string;
        271: string;
        272: string;
        305: string;
        315: string;
        33432: string;
    };
    const GPSTags: {
        0: string;
        1: string;
        2: string;
        3: string;
        4: string;
        5: string;
        6: string;
        7: string;
        8: string;
        9: string;
        10: string;
        11: string;
        12: string;
        13: string;
        14: string;
        15: string;
        16: string;
        17: string;
        18: string;
        19: string;
        20: string;
        21: string;
        22: string;
        23: string;
        24: string;
        25: string;
        26: string;
        27: string;
        28: string;
        29: string;
        30: string;
    };
    const StringValues: {
        ExposureProgram: {
            0: string;
            1: string;
            2: string;
            3: string;
            4: string;
            5: string;
            6: string;
            7: string;
            8: string;
        };
        MeteringMode: {
            0: string;
            1: string;
            2: string;
            3: string;
            4: string;
            5: string;
            6: string;
            255: string;
        };
        LightSource: {
            0: string;
            1: string;
            2: string;
            3: string;
            4: string;
            9: string;
            10: string;
            11: string;
            12: string;
            13: string;
            14: string;
            15: string;
            17: string;
            18: string;
            19: string;
            20: string;
            21: string;
            22: string;
            23: string;
            24: string;
            255: string;
        };
        Flash: {
            0: string;
            1: string;
            5: string;
            7: string;
            9: string;
            13: string;
            15: string;
            16: string;
            24: string;
            25: string;
            29: string;
            31: string;
            32: string;
            65: string;
            69: string;
            71: string;
            73: string;
            77: string;
            79: string;
            89: string;
            93: string;
            95: string;
        };
        SensingMethod: {
            1: string;
            2: string;
            3: string;
            4: string;
            5: string;
            7: string;
            8: string;
        };
        SceneCaptureType: {
            0: string;
            1: string;
            2: string;
            3: string;
        };
        SceneType: {
            1: string;
        };
        CustomRendered: {
            0: string;
            1: string;
        };
        WhiteBalance: {
            0: string;
            1: string;
        };
        GainControl: {
            0: string;
            1: string;
            2: string;
            3: string;
            4: string;
        };
        Contrast: {
            0: string;
            1: string;
            2: string;
        };
        Saturation: {
            0: string;
            1: string;
            2: string;
        };
        Sharpness: {
            0: string;
            1: string;
            2: string;
        };
        SubjectDistanceRange: {
            0: string;
            1: string;
            2: string;
            3: string;
        };
        FileSource: {
            3: string;
        };
        Components: {
            0: string;
            1: string;
            2: string;
            3: string;
            4: string;
            5: string;
            6: string;
        };
    };
    class EXIF {
        static getData(img: any, callback: any): boolean;
        static getTag(img: any, tag: any): any;
        static getIptcTag(img: any, tag: any): any;
        static getAllTags(img: any): {};
        static getAllIptcTags(img: any): {};
        static pretty(img: any): string;
        static readFromBinaryFile(file: any): any;
    }
}
declare namespace egret.experimental {
    /**
    * @language en_US
    * The pickPhoto method provides ability for picking a photo.
    * @version Egret 4.0
    * @platform Web
    */
    /**
     * @language zh_CN
     * pickPhoto API提供用于选取照片的方法。
     * @version Egret 4.0
     * @platform Web
     */
    function pickPhoto(): Promise<string>;
}
