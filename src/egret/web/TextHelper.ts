namespace egret.web {
    export interface Bin extends egret.Rectangle {
        /**
         * 是否旋转了90°
         */
        rot: boolean;

        clone(): Bin;
    }

    export interface BinPacker {
        width: number;
        height: number;
        rot: boolean;

        usedRects: Bin[];

        freeRects: Bin[];
    }

    export interface ShortSideBinPacker extends BinPacker {
        constructor(width: number, height: number, allowRotation?: boolean);
        /**
         * 扩展大小，如果宽度或者高度比原先小，则返回false
         * @param width 
         * @param height 
         */
        extSize(width: number, height: number): boolean;

        insert(width: number, height: number): Bin;
    }

    export type TextHelper = ReturnType<typeof getTextHelper>;


    export function getTextHelper(context: WebGLRenderContext) {
        let ref: { new(width: number, height: number, allowRotation?: boolean): ShortSideBinPacker } = window["jy"]["ShortSideBinPacker"];
        if (!ref) {
            return {
                render(node: egret.sys.TextNode, render: WebGLRenderer) {
                    let surface = render.canvasRenderBuffer.surface;
                    render.canvasRenderer.renderText(node, render.canvasRenderBuffer.context);

                    // 拷贝canvas到texture
                    let texture = node.$texture;
                    if (!texture) {
                        texture = context.createTexture(surface);
                        node.$texture = texture;
                    } else {
                        // 重新拷贝新的图像
                        context.updateTexture(texture, surface);
                    }
                    // 保存材质尺寸
                    node.$textureWidth = surface.width;
                    node.$textureHeight = surface.height;
                    node.sx = 0;
                    node.sy = 0;
                    node.remTex = true;
                },
                clear() {

                }
            }
                ;
        }
        let $width = 2048, $height = 2048;
        let packer = new ref($width, $height);
        let textCanvas = createCanvas($width, $height);
        let textContext = textCanvas.getContext("2d");
        let texture = context.createTexture(textCanvas);
        return {
            render(node: egret.sys.TextNode, render: WebGLRenderer) {
                let { height, width } = node;
                let { x, y } = packer.insert(width, height);
                textContext.$offsetX = x;
                textContext.$offsetY = y;
                render.canvasRenderer.renderText(node, textContext);
                node.$textureWidth = $width;
                node.$textureHeight = $height;
                node.$texture = texture;
                node.sx = x;
                node.sy = y;
                node.remTex = false;
            },
            clear,
        }

        function clear() {
            packer.usedRects.length = 0;
            packer.freeRects.length = 1;
            textContext.clearRect(0, 0, $width, $height);
        }
    }

}