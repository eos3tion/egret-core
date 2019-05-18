namespace jy {
    const textureCaches: {
        [colorKey: string]: egret.Texture
    } = {};

    let idx = 0;
    let increaseCount = 5;
    let size = Math.pow(2, increaseCount);
    let canvas = document.createElement("canvas");
    canvas.height = canvas.width = size;
    let bmd = new egret.BitmapData(canvas);
    bmd.$deleteSource = false;
    let ctx = canvas.getContext("2d");

    function checkCanvas() {
        if (idx >= size * size) {
            size <<= 1;
            bmd.width = bmd.height = canvas.height = canvas.width = size << 2;
            increaseCount++;
        }
    }

    /**
     * ```
     * ┌─┬─┐
     * │0│1│
     * ├─┼─┤
     * │2│3│
     * └─┴─┘
     * ```
     */
    const poses = [
        /**0 */[0, 0],
        /**1 */[1, 0],
        /**2 */[0, 1],
        /**3 */[1, 1]
    ]

    function getColorString(c: number) {
        c = c & 0xffffff;
        let cstr = c.toString(16);
        return "#000000".substr(0, 7 - cstr.length) + cstr;
    }
	/**
	 * 颜色工具
	 * @author 3tion
	 *
	 */
    export const ColorUtil = {
        /**
         * 获取颜色字符串 #a1b2c3
         * @param c
         * @return 获取颜色字符串 #a1b2c3
         *
         */
        getColorString,

        /**
         * 将#a1b2c3这样#开头的颜色字符串，转换成颜色数值
         */
        getColorValue(c: string) {
            if (/#[0-9a-f]{6}/i.test(c)) {
                return +("0x" + c.substring(1));
            } else {
                return 0;
            }
        },
        /**
         * 获取一个纯色的纹理
         */
        getTexture(color = 0, alpha = 1) {
            let key = color + "_" + alpha;
            let tex = textureCaches[key];
            if (!tex) {
                checkCanvas();
                textureCaches[key] = tex = new egret.Texture();
                let count = increaseCount;
                let x = 0, y = 0;
                let cidx = idx;
                do {
                    let shift = 2 * count;
                    let area = cidx >> shift;
                    cidx = cidx - (area << shift);
                    let pos = poses[area];
                    x += pos[0] * shift;
                    y += pos[1] * shift;
                    if (!--count) {
                        let pos = poses[cidx];
                        x += pos[0];
                        y += pos[1];
                        break
                    }
                } while (true)

                ctx.globalAlpha = alpha;
                ctx.fillStyle = getColorString(color);
                x <<= 2;
                y <<= 2;
                ctx.fillRect(x, y, 4, 4);
                tex.disposeBitmapData = false;
                tex.bitmapData = bmd;
                if (bmd.webGLTexture) {//清理webgl纹理，让渲染可以重置
                    egret.WebGLUtils.deleteWebGLTexture(bmd);
                    bmd.webGLTexture = null;
                }
                const ww = 2;
                tex.$initData(x + 1, y + 1, ww, ww, 0, 0, ww, ww, ww, ww);
                idx++;
            }
            return tex;
        }
    }
}