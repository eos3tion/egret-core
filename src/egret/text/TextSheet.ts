namespace egret {


    /**
     * 用于在一张纹理上，处理大量不同样式的文本
     */
    export function getTextSheet(sheetSize = 256) {
        let canvas = document.createElement("canvas");
        canvas.width = canvas.height = sheetSize;
        let bmd = new BitmapData(canvas);
        bmd.$deleteSource = false;
        let ctx = canvas.getContext("2d");
        const packer = new jy.ShortSideBinPacker(sheetSize, sheetSize);
        const texs = {} as { [char: string]: Texture };
        return {
            getTexture(char: string, format: sys.TextFormat) {
                let sheetFormat = getFormat(format);
                return _getTexture(char, sheetFormat);
            },
            dispose() {
                bmd.$dispose();
            }
        }
        function _getTexture(char: string, sheetFormat: TextSheetFormat) {
            let { key, format, font } = sheetFormat;
            key = key + "_" + char;
            let tex = texs[key];
            if (!tex) {
                const stroke = format.stroke;
                let mul2 = 0, ox = 0, oy = 0;
                if (stroke) {
                    mul2 = stroke;
                }
                const shadow = format.shadow;
                if (shadow) {
                    let shadowBlur = shadow[0];
                    if (shadowBlur) {
                        mul2 = Math.max(mul2, shadowBlur);
                        ctx.shadowBlur = shadowBlur;
                        ctx.shadowColor = shadow[1] || "black";
                        ctx.shadowOffsetX = ox = shadow[2] || 0;
                        ctx.shadowOffsetY = oy = shadow[3] || 0;
                    }
                }
                const ow = mul2 * 2 + Math.abs(ox) + 1;//默认每个字有1像素padding
                const size = format.size;
                let height = size + mul2 * 2 + Math.abs(oy) + 1;
                let { width } = ctx.measureText(char);
                let fontWidth = width;
                width = Math.ceil(width);
                width += ow;
                let bin = packer.insert(width, height);
                if (!bin) {
                    return //返回空纹理
                }
                ctx.textAlign = "left";
                ctx.textBaseline = "top";
                ctx.font = font;
                const fillColor = toColorString(format.textColor | 0xffffff);
                const gradients = format.gradients;
                let { x, y } = bin;
                //先填充文本，再stroke描边效果会比较好
                let fillStyle: CanvasGradient;
                if (gradients) {
                    fillStyle = ctx.createLinearGradient(x, y, x, y + size);
                    for (let i = 0; i < gradients.length; i++) {
                        const colorStop = gradients[i];
                        fillStyle.addColorStop(colorStop[0], colorStop[1]);
                    }
                }

                //将文本绘制到指定区域
                if (stroke) {
                    let strokeColor = format.strokeColor | 0;
                    ctx.strokeStyle = toColorString(strokeColor);
                    ctx.lineWidth = stroke + 1;//stroke 增加1像素
                    ctx.strokeText(char, x, y);
                }
                ctx.fillStyle = fillStyle || fillColor;
                ctx.fillText(char, x, y);
                tex = new Texture;
                tex.disposeBitmapData = false;
                tex.bitmapData = bmd;
                if (bmd.webGLTexture) {//清理webgl纹理，让渲染可以重置，重新上传到gpu
                    egret.WebGLUtils.deleteWebGLTexture(bmd);
                    bmd.webGLTexture = null;
                }
                tex.$initData(x, y, fontWidth, height - 1, 0, 0, width, height, width, height);
                texs[key] = tex;
            }
            return tex;
        }
    }

    export const DefaultTextSheet = getTextSheet(2048);

    export type TextSheet = typeof DefaultTextSheet;

    export interface TextSheetFormat {
        font: string;
        format: sys.TextFormat;
        key: string;
    }

    export namespace sys {
        export interface TextFormat {
            sheetFormat?: TextSheetFormat;
        }
    }

    function getFormat(format: sys.TextFormat) {
        let sheetFormat = format.sheetFormat;
        if (!sheetFormat) {
            let font = getFontString(format);
            let key = font;
            let gradients = format.gradients;
            let color: string;
            if (gradients) {
                if (gradients.length == 1) {
                    format.textColor = parseInt(gradients[0][1].substr(1), 16);
                    gradients = undefined;
                } else {
                    color = gradients.join("|");
                }
            }
            if (!gradients) {
                color = format.textColor + "";
            }
            key += " 0:" + color;

            let shadow = format.shadow;
            if (shadow) {
                key += " 1:" + format.shadow.toString();
            }
            let stroke = format.stroke;
            if (stroke) {
                let strokeColor = format.strokeColor | 0;
                format.strokeColor = strokeColor;
                key += " 2:" + format.stroke + "," + strokeColor;
            }
            format.sheetFormat = sheetFormat = {
                font,
                key,
                format
            }
        }
        return sheetFormat;
    }
}