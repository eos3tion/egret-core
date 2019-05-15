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


namespace egret {
    /**
     * @private
     * @version Egret 2.4
     * @platform Web,Native
     */
    export module TextFieldUtils {

        /**
         * 获取第一个绘制的行数
         * @param textfield 文本
         * @returns {number} 行数，从0开始
         * @private
         */
        export function $getStartLine(textfield: egret.TextField): number {
            let textHeight = $getTextHeight(textfield);
            let startLine = 0;
            let textFieldHeight = textfield._textFieldHeight;
            if (!isNaN(textFieldHeight)) {//
                if (textHeight < textFieldHeight) {//最大高度比需要显示的高度小

                }
                else if (textHeight > textFieldHeight) {//最大高度比需要显示的高度大
                    startLine = Math.max(textfield._scrollV - 1, 0);
                    startLine = Math.min(textfield._numLines - 1, startLine);
                }

                if (!textfield._multiline) {
                    startLine = Math.max(textfield._scrollV - 1, 0);
                    let numLines = textfield._numLines;
                    if (numLines > 0) {
                        startLine = Math.min(numLines - 1, startLine);
                    }
                }
            }

            return startLine;
        }

        /**
         * 获取水平比例
         * @param textfield 文本
         * @returns {number} 水平比例
         * @private
         */
        export function $getHalign(textfield: egret.TextField): number {
            let lineArr = textfield.$getLinesArr();
            let halign = 0;
            let { _textAlign } = textfield;
            if (_textAlign == HorizontalAlign.CENTER) {
                halign = 0.5;
            }
            else if (_textAlign == HorizontalAlign.RIGHT) {
                halign = 1;
            }

            if (textfield._type == egret.TextFieldType.INPUT && !textfield._multiline && lineArr.length > 1) {
                halign = 0;
            }

            return halign;
        }

        /**
         * @private
         * 
         * @param textfield 
         * @returns 
         */
        export function $getTextHeight(textfield: egret.TextField): number {
            return egret.TextFieldType.INPUT == textfield._type && !textfield._multiline ?
                textfield._fontSize : (textfield._textHeight + (textfield._numLines - 1) * textfield._lineSpacing);
        }

        /**
         * 获取垂直比例
         * @param textfield 文本
         * @returns {number} 垂直比例
         * @private
         */
        export function $getValign(textfield: egret.TextField): number {
            let textHeight = $getTextHeight(textfield);
            //if (textfield._type == egret.TextFieldType.INPUT) {
            //    if (textfield._multiline) {
            //return 0;
            //}
            //return 0.5;
            //}
            let { _textFieldHeight, _verticalAlign } = textfield;
            if (!isNaN(_textFieldHeight)) {//
                if (textHeight < _textFieldHeight) {//最大高度比需要显示的高度小
                    let valign = 0;
                    if (_verticalAlign == VerticalAlign.MIDDLE)
                        valign = 0.5;
                    else if (_verticalAlign == VerticalAlign.BOTTOM)
                        valign = 1;

                    return valign;
                }
            }
            return 0;
        }

        /**
         * 根据x、y获取文本项
         * @param textfield 文本
         * @param x x坐标值
         * @param y y坐标值
         * @returns 文本单项
         * @private
         */
        export function $getTextElement(textfield: egret.TextField, x: number, y: number) {
            let hitTextEle = $getHit(textfield, x, y);
            let lineArr = textfield.$getLinesArr();
            if (hitTextEle) {
                let ele = lineArr[hitTextEle.lineIndex];
                if (ele) {
                    let elements = ele.elements;
                    if (elements) {
                        return elements[hitTextEle.textElementIndex];
                    }
                }
            }
        }

        /**
         * 获取文本点击块
         * @param textfield 文本
         * @param x x坐标值
         * @param y y坐标值
         * @returns 文本点击块
         * @private
         */
        export function $getHit(textfield: egret.TextField, x: number, y: number) {
            let lineArr = textfield.$getLinesArr();
            let textFieldWidth = textfield._textFieldWidth;
            if (textFieldWidth == 0) {//文本可点击区域
                return;
            }
            let line = 0;

            let textHeight = $getTextHeight(textfield);
            let startY = 0;
            let textFieldHeight = textfield._textFieldHeight;
            if (!isNaN(textFieldHeight) && textFieldHeight > textHeight) {
                let valign = $getValign(textfield);
                startY = valign * (textFieldHeight - textHeight);
                if (startY != 0) {
                    y -= startY;
                }
            }

            let startLine = $getStartLine(textfield);
            let lineH = 0;
            let lineSpacing = textfield._lineSpacing;
            for (let i = startLine; i < lineArr.length; i++) {
                let lineEle = lineArr[i];
                if (lineH + lineEle.height >= y) {
                    if (lineH < y) {
                        line = i + 1;
                    }
                    break;
                }
                else {
                    lineH += lineEle.height;
                }

                if (lineH + lineSpacing > y) {
                    return;
                }

                lineH += lineSpacing;
            }
            if (line == 0) {
                return;
            }
            let lineElement = lineArr[line - 1];

            if (isNaN(textFieldWidth)) {
                textFieldWidth = textfield.textWidth;
            }
            let halign = $getHalign(textfield);
            x -= halign * (textFieldWidth - lineElement.width);
            let lineW = 0;
            for (let i = 0; i < lineElement.elements.length; i++) {
                let iwTE = lineElement.elements[i];

                if (lineW + iwTE.width <= x) {
                    lineW += iwTE.width;
                }
                else if (lineW < x) {
                    return { "lineIndex": line - 1, "textElementIndex": i };
                }
            }
        }

        /**
         * 获取当前显示多少行
         * @param textfield 文本
         * @returns {number} 显示的行数
         * @private
         */
        export function $getScrollNum(textfield: egret.TextField) {
            let scrollNum = 1;
            if (textfield._multiline) {
                let height = textfield.height;
                let size = textfield.size;
                let lineSpacing = textfield.lineSpacing;
                scrollNum = Math.floor(height / (size + lineSpacing));
                let leftH = height - (size + lineSpacing) * scrollNum;
                if (leftH > size / 2) {
                    scrollNum++;
                }
            }
            return scrollNum;
        }

    }
}