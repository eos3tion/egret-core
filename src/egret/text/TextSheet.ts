namespace egret {


    const min = 256;

    export const enum TextSheetType {
        /**
         * 按文本样式的
         */
        TextStyle = 0,
        /**
         * 按容器来的
         */
        Container = 1,
    }

    interface TextSheet {
        get(char: string): egret.Texture;
    }

    function setCtxSameAsEgret(ctx: CanvasRenderingContext2D) {
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.lineJoin = "round";
    }

    /**
     * 文本的纹理集  
     * 一个样式，关联一个文本纹理集  
     * 或者一个容器中，所有文本绑定到一个纹理集
     */
    function getTextSheet({ font, format, textColor, colorable }: SheetFormat) {
        let canvas = document.createElement("canvas");
        let bmd = new BitmapData(canvas);
        bmd.$deleteSource = false;
        let ctx = canvas.getContext("2d");
        const packer = new ShortSideBinPacker(min, min);
        setCtxSameAsEgret(ctx);
        ctx.font = font;
        const stroke = format.stroke;
        const fillColor = toColorString(textColor);
        const gradients = format.gradients;
        const size = format.size;
        const halfSize = size >> 1;//textBaseline = "middle" 是从中间渲染，所以基于高度要上下补值

        let mul2 = 0, ox = 0, oy = 0;
        if (stroke) {
            mul2 = stroke;
            let strokeColor = format.strokeColor;
            ctx.strokeStyle = toColorString(strokeColor);
            ctx.lineWidth = stroke;
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
        const height = mul2 * 2 + Math.abs(oy) + 1;
        const texs = {} as { [char: string]: Texture };
        let cavnasSize = min;
        resize();
        return {
            colorable,
            get(char: string) {
                let tex = texs[char];
                if (!tex) {
                    let { width } = ctx.measureText(char);
                    width += ow;
                    let bin = packer.insert(width, height);
                    if (!bin) {
                        if (!resize()) {//需要扩大canvas和packer
                            return //返回空纹理
                        }
                        //重新进行装箱
                        bin = packer.insert(width, height);
                        if (!bin) {//再次装箱失败，退出
                            return
                        }
                        const { x, y } = bin;
                        //先填充文本，再stroke描边效果会比较好
                        let fillStyle: CanvasGradient;
                        if (gradients) {
                            fillStyle = ctx.createLinearGradient(x, y - halfSize, x, y + halfSize);
                            for (let i = 0; i < gradients.length; i++) {
                                const colorStop = gradients[i];
                                fillStyle.addColorStop(colorStop[0], colorStop[1]);
                            }
                        }
                        ctx.fillStyle = fillStyle || fillColor;
                        ctx.fillText(char, x, y, width);
                        //将文本绘制到指定区域
                        if (stroke) {
                            ctx.strokeText(char, x, y, width);
                        }
                        let tex = new Texture;
                        tex.disposeBitmapData = false;
                        tex.bitmapData = bmd;
                        if (bmd.webGLTexture) {//清理webgl纹理，让渲染可以重置
                            egret.WebGLUtils.deleteWebGLTexture(bmd);
                            bmd.webGLTexture = null;
                        }
                        tex.$initData(x, y, width, height, 0, 0, width, height, width, height);

                        texs[char] = tex;
                    }
                }
                return tex;
            },
            dispose() {
                bmd.$dispose();
            }

        }
        /**
         * 重置尺寸，尝试扩大一倍
         */
        function resize() {
            if (cavnasSize <= 2048) {
                bmd.width = bmd.height = canvas.width = canvas.height = cavnasSize;
                packer.resize(cavnasSize, cavnasSize);
                cavnasSize *= 2;
                return true;
            }
        }
    }



    const Sheets = {} as { [key: string]: TextSheet };

    export function getTexture(char: string, format: sys.TextFormat) {
        let sheetFormat = getFormat(format);
        let key = sheetFormat.key;
        let sheet = Sheets[key];
        if (!sheet) {
            Sheets[key] = sheet = getTextSheet(sheetFormat);
        }
        return sheet.get(char);
    }

    interface SheetFormat {
        key: string;

        textColor: number;

        format: sys.TextFormat;

        font: string;
        /**
         * 是否可以绘制文本颜色
         */
        colorable: boolean;
    }




    function getFormat(format: sys.TextFormat) {
        let font = getFontString(format);
        let key = font;
        let gradients = format.gradients;
        //颜色不作为样式处理
        let textColor = format.textColor;
        if (gradients) {
            if (gradients.length == 1) {
                textColor = parseInt(gradients[0][1].substr(1), 16);
                format.textColor = textColor;
                format.gradients = undefined;
            } else {//有多级渐变的才作为渐变参数
                key += "0:" + gradients.join("|");
            }
        }
        let shadow = format.shadow;
        let colorable = true;
        if (shadow) {
            key += "1:" + format.shadow.toString();
            colorable = false;
        }
        let stroke = format.stroke;
        if (stroke) {
            key += "2:" + format.stroke + "," + format.strokeColor;
            colorable = false;
        }
        if (colorable) {
            key += "3:" + textColor;
        }
        return {
            font,
            key,
            textColor,
            format,
            colorable
        };
    }
}