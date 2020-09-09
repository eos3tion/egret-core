//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

interface WebGLTexture {
    smoothing?: boolean;
}

namespace egret.web {
    /**
     * @private
     * draw类型，所有的绘图操作都会缓存在drawData中，每个drawData都是一个drawable对象
     * $renderWebGL方法依据drawable对象的类型，调用不同的绘制方法
     */
    export const enum DRAWABLE_TYPE {
        TEXTURE,
        RECT,
        PUSH_MASK,
        POP_MASK,
        BLEND,
        RESIZE_TARGET,
        CLEAR_COLOR,
        ACT_BUFFER,
        ENABLE_SCISSOR,
        DISABLE_SCISSOR,
        SMOOTHING
    }

    export interface DrawData {
        type: DRAWABLE_TYPE;
    }

    export interface BlendDrawData {
        type: DRAWABLE_TYPE.BLEND;
        value: string;
    }

    export interface CountableDrawData extends DrawData {

        count: number;
    }

    export interface TextureDrawData extends CountableDrawData {
        type: DRAWABLE_TYPE.TEXTURE;
        texture: WebGLTexture;
        filter: Filter;

        textureWidth: number;
        textureHeight: number;

        sourceX: number;
        sourceY: number;
        sourceWidth: number;
        sourceHeight: number;
        /**
         * 纹理数组
         */
        texs: WebGLTexture[];

    }

    export interface ChangeSmoothingData extends CountableDrawData {
        texture: WebGLTexture;
        smoothing: boolean;
    }

    export interface SizedDrawData extends DrawData {
        type: DRAWABLE_TYPE.RESIZE_TARGET | DRAWABLE_TYPE.ACT_BUFFER;

        height: number;
        width: number;

        buffer: WebGLRenderBuffer;
    }

    export interface EnableScissorDrawData {
        type: DRAWABLE_TYPE.ENABLE_SCISSOR;
        height: number;
        width: number;
        x: number;
        y: number;
    }

    /**
     * @private
     * 绘制指令管理器
     * 用来维护drawData数组
     */
    export class WebGLDrawCmdManager {

        /**
         * 用于缓存绘制命令的数组
         */
        public drawData = [] as DrawData[];

        public drawDataLen = 0;

        public constructor() {

        }

        /**
         * 压入绘制矩形指令
         */
        public pushDrawRect(): void {
            let { drawDataLen, drawData } = this;
            let last = drawData[drawDataLen - 1] as CountableDrawData;
            let count = 2;
            if (drawDataLen == 0 || last.type != DRAWABLE_TYPE.RECT) {
                let data = (drawData[drawDataLen] || {}) as CountableDrawData;
                data.type = DRAWABLE_TYPE.RECT;
                data.count = count;
                drawData[drawDataLen] = data;
                drawDataLen++;
                this.drawDataLen = drawDataLen;
            } else {
                last.count += count;
            }
        }

        /**
         * 压入绘制texture指令
         */
        public pushDrawTexture(texture: WebGLTexture, count: number, maxTextureCount: number, filter?: any, textureWidth?: number, textureHeight?: number, sourceX?: number, sourceY?: number, sourceWidth?: number, sourceHeight?: number) {
            let { drawDataLen, drawData } = this;
            let idx = 0;
            if (filter) {
                // 目前有滤镜的情况下不会合并绘制
                let data = (drawData[drawDataLen] || {}) as TextureDrawData;
                data.type = DRAWABLE_TYPE.TEXTURE;
                data.texture = texture;
                data.filter = filter;
                data.count = count;
                data.textureWidth = textureWidth;
                data.textureHeight = textureHeight;
                data.sourceX = sourceX || 0;
                data.sourceY = sourceY || 0;
                data.sourceWidth = sourceWidth || textureWidth;
                data.sourceHeight = sourceHeight || textureHeight;
                drawData[drawDataLen] = data;
                this.drawDataLen = drawDataLen + 1;
            } else {
                //检查纹理数组
                let needNew = true;
                if (drawDataLen) {
                    let last = drawData[drawDataLen - 1] as TextureDrawData;
                    if (last.type == DRAWABLE_TYPE.TEXTURE && !last.filter) {
                        let texs = last.texs;
                        if (texs) {
                            idx = texs.indexOf(texture);
                            if (idx > -1) {
                                needNew = false;
                            } else {
                                let len = texs.length;
                                if (len < maxTextureCount) {
                                    texs[len] = texture;
                                    idx = len;
                                    needNew = false;
                                }
                            }
                            if (!needNew) {//无需创建新的
                                last.count += count;
                            }
                        }
                    }
                }
                if (needNew) {
                    idx = 0;
                    let data = (drawData[drawDataLen] || {}) as TextureDrawData;
                    data.type = DRAWABLE_TYPE.TEXTURE;
                    data.texture = texture;
                    data.count = count;
                    data.texs = [texture];
                    drawData[drawDataLen] = data;
                    this.drawDataLen = drawDataLen + 1;
                }


                // if (drawDataLen == 0 || last.type != DRAWABLE_TYPE.TEXTURE || texture != last.texture || last.filter) {
                //     let data = (drawData[drawDataLen] || {}) as TextureDrawData;
                //     data.type = DRAWABLE_TYPE.TEXTURE;
                //     data.texture = texture;
                //     data.count = count;
                //     drawData[drawDataLen] = data;
                //     this.drawDataLen = drawDataLen + 1;
                // } else {
                //     last.count += count;
                // }

            }
            return idx;
        }

        public pushChangeSmoothing(texture: WebGLTexture, smoothing: boolean): void {
            texture.smoothing = smoothing;
            let { drawDataLen, drawData } = this;
            let data = (drawData[drawDataLen] || {}) as ChangeSmoothingData;
            data.type = DRAWABLE_TYPE.SMOOTHING;
            data.texture = texture;
            data.smoothing = smoothing;
            drawData[drawDataLen] = data;
            this.drawDataLen = drawDataLen + 1;
        }

        /**
         * 压入pushMask指令
         */
        public pushPushMask(count = 1): void {
            let { drawDataLen, drawData } = this;
            let data = (drawData[drawDataLen] || {}) as CountableDrawData;
            data.type = DRAWABLE_TYPE.PUSH_MASK;
            data.count = count * 2;
            drawData[drawDataLen] = data;
            this.drawDataLen = drawDataLen + 1;
        }

        /**
         * 压入popMask指令
         */
        public pushPopMask(count: number = 1): void {
            let { drawDataLen, drawData } = this;
            let data = (drawData[drawDataLen] || {}) as CountableDrawData;
            data.type = DRAWABLE_TYPE.POP_MASK;
            data.count = count * 2;
            drawData[drawDataLen] = data;
            this.drawDataLen = drawDataLen + 1;
        }

        /**
         * 压入混色指令
         */
        public pushSetBlend(value: string): void {
            let { drawDataLen, drawData } = this;
            let len = drawDataLen;
            // 有无遍历到有效绘图操作
            let drawState = false;
            for (let i = len - 1; i >= 0; i--) {
                let data = drawData[i];

                if (data) {
                    let type = data.type;
                    if (type == DRAWABLE_TYPE.TEXTURE || type == DRAWABLE_TYPE.RECT) {
                        drawState = true;
                    }

                    // 如果与上一次blend操作之间无有效绘图，上一次操作无效
                    if (!drawState && type == DRAWABLE_TYPE.BLEND) {
                        drawData.splice(i, 1);
                        drawDataLen--;
                        continue;
                    }

                    // 如果与上一次blend操作重复，本次操作无效
                    if (type == DRAWABLE_TYPE.BLEND) {
                        if ((data as BlendDrawData).value == value) {
                            this.drawDataLen = drawDataLen;
                            return;
                        } else {
                            break;
                        }
                    }
                }
            }

            let data = (drawData[drawDataLen] || {}) as BlendDrawData;
            data.type = DRAWABLE_TYPE.BLEND;
            data.value = value;
            drawData[drawDataLen] = data;
            this.drawDataLen = drawDataLen + 1;
        }

        /*
         * 压入resize render target命令
         */
        public pushResize(buffer: WebGLRenderBuffer, width: number, height: number) {
            let { drawDataLen, drawData } = this;
            let data = (drawData[drawDataLen] || {}) as SizedDrawData;
            data.type = DRAWABLE_TYPE.RESIZE_TARGET;
            data.buffer = buffer;
            data.width = width;
            data.height = height;
            drawData[drawDataLen] = data;
            this.drawDataLen = drawDataLen + 1;
        }

        /*
         * 压入clear color命令
         */
        public pushClearColor() {
            let { drawDataLen, drawData } = this;
            let data = (drawData[drawDataLen] || {}) as DrawData;
            data.type = DRAWABLE_TYPE.CLEAR_COLOR;
            drawData[drawDataLen] = data;
            this.drawDataLen = drawDataLen + 1;
        }

        /**
         * 压入激活buffer命令
         */
        public pushActivateBuffer(buffer: WebGLRenderBuffer) {
            let { drawDataLen, drawData } = this;
            let len = drawDataLen;
            // 有无遍历到有效绘图操作
            let drawState = false;
            for (let i = len - 1; i >= 0; i--) {
                let data = drawData[i];

                if (data) {
                    let type = data.type;
                    if (type != DRAWABLE_TYPE.BLEND && type != DRAWABLE_TYPE.ACT_BUFFER) {
                        drawState = true;
                    }

                    // 如果与上一次buffer操作之间无有效绘图，上一次操作无效
                    if (!drawState && type == DRAWABLE_TYPE.ACT_BUFFER) {
                        drawData.splice(i, 1);
                        drawDataLen--;
                        continue;
                    }

                    // 如果与上一次buffer操作重复，本次操作无效
                    // if(data.type == DRAWABLE_TYPE.ACT_BUFFER) {
                    //     if(data.buffer == buffer) {
                    //         return;
                    //     } else {
                    //         break;
                    //     }
                    // }
                }
            }

            let data = (drawData[drawDataLen] || {}) as SizedDrawData;
            data.type = DRAWABLE_TYPE.ACT_BUFFER;
            data.buffer = buffer;
            let rootRenderTarget = buffer.rootRenderTarget;
            data.width = rootRenderTarget.width;
            data.height = rootRenderTarget.height;
            drawData[drawDataLen] = data;
            this.drawDataLen = drawDataLen + 1;
        }

        /*
         * 压入enabel scissor命令
         */
        public pushEnableScissor(x: number, y: number, width: number, height: number) {
            let { drawDataLen, drawData } = this;
            let data = (drawData[drawDataLen] || {}) as EnableScissorDrawData;
            data.type = DRAWABLE_TYPE.ENABLE_SCISSOR;
            data.x = x;
            data.y = y;
            data.width = width;
            data.height = height;
            drawData[drawDataLen] = data;
            this.drawDataLen = drawDataLen + 1;
        }

        /*
         * 压入disable scissor命令
         */
        public pushDisableScissor() {
            let { drawDataLen, drawData } = this;
            let data = drawData[drawDataLen] || {} as DrawData;
            data.type = DRAWABLE_TYPE.DISABLE_SCISSOR;
            drawData[drawDataLen] = data;
            this.drawDataLen = drawDataLen + 1;
        }

        /**
         * 清空命令数组
         */
        public clear(): void {
            let { drawDataLen, drawData } = this;
            for (let i = 0; i < drawDataLen; i++) {
                let data = drawData[i] as any;
                data.count = 0;
                data.texs = null;
                data.texture = null;
                data.filter = null;
            }
            this.drawDataLen = 0;
        }

    }
}
