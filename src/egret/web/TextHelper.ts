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
                    if (!node.dirtyRender) {
                        return
                    }
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

                },
                update() {

                }
            }
        }
        let $width = 1024, $height = 1024;
        let packer = new ref($width, $height);
        let textCanvas = createCanvas($width, $height);
        let textContext = textCanvas.getContext("2d");
        let texture = context.createTexture(textCanvas);
        let changed = false;
        return {
            render(node: egret.sys.TextNode, render: WebGLRenderer) {
                let { height, width } = node;
                let { x, y } = packer.insert(width - 2, height - 2);
                textContext.$offsetX = x + 2;
                textContext.$offsetY = y + 2;
                render.canvasRenderer.renderText(node, textContext);
                node.$textureWidth = $width;
                node.$textureHeight = $height;
                node.$texture = texture;
                node.sx = x;
                node.sy = y;
                node.remTex = false;
                changed = true;
            },
            clear() {
                packer.usedRects.length = 0;
                packer.freeRects.length = 1;
                let first = packer.freeRects[0];
                first.x = 0;
                first.y = 0;
                first.width = $width;
                first.height = $height;
                textContext.clearRect(0, 0, $width, $height);
            },
            update() {
                if (changed) {
                    context.updateTexture(texture, textCanvas);
                    let gl = context.context;
                    gl.bindTexture(gl.TEXTURE_2D, null);
                    changed = false;
                }
            }
        }
    }

}