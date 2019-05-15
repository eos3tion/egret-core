namespace egret {

    export class Bin extends Rectangle {
        /**
         * 是否旋转了90°
         */
        rot = false;

        clone() {
            let bin = new Bin(this.x, this.y, this.width, this.height);
            bin.rot = this.rot;
            return bin;
        }
    }

    export interface BinPacker {
        width: number;
        height: number;
        rot: boolean;

        usedRects: Bin[];

        freeRects: Bin[];
    }

    export interface ShortSideBinPacker extends BinPacker { }

    /**
     * 短边优先装箱  
     * 动态装箱，暂时只用短边优先的单一策略
     */
    export class ShortSideBinPacker {

        constructor(width: number, height: number, allowRotation?: boolean) {
            this.width = width;
            this.height = height;
            this.rot = !!allowRotation;
            this.usedRects = [];
            this.freeRects = [new Bin(0, 0, width, height)];
        }

        /**
         * 调整大小，如果宽度或者高度比原先小，则返回false
         * @param width 
         * @param height 
         */
        resize(width: number, height: number) {
            let { width: ow, height: oh } = this;
            if (width < ow || height < oh) {
                return false;
            }
            this.width = width;
            this.height = height;
            this.freeRects.push(
                /**右侧增加一个高度和原本相同的 */new Bin(ow, 0, width - ow, oh),
                /** 下方整块 */new Bin(0, oh, width, height - oh)
            )
            return true
        }

        insert(width: number, height: number) {
            let bestShortSideFit = Infinity;
            let bestLongSideFit = 0;
            const { freeRects, rot: rotations } = this;
            const { min, max, abs } = Math;
            let bestNode = new Bin;
            for (let i = 0, len = freeRects.length; i < len; i++) {
                let { width: w, height: h, x, y } = freeRects[i];
                // Try to place the Rect in upright (non-flipped) orientation.
                if (w >= width && h >= height) {
                    let leftoverHoriz = abs(w - width);
                    let leftoverVert = abs(h - height);
                    let shortSideFit = min(leftoverHoriz, leftoverVert);
                    let longSideFit = max(leftoverHoriz, leftoverVert);

                    if (shortSideFit < bestShortSideFit || (shortSideFit == bestShortSideFit && longSideFit < bestLongSideFit)) {
                        bestNode.x = x;
                        bestNode.y = y;
                        bestNode.width = width;
                        bestNode.height = height;
                        bestShortSideFit = shortSideFit;
                        bestLongSideFit = longSideFit;
                    }
                }
                if (rotations && w >= height && h >= width) {
                    let flippedLeftoverHoriz = abs(w - height);
                    let flippedLeftoverVert = abs(h - width);
                    let flippedShortSideFit = min(flippedLeftoverHoriz, flippedLeftoverVert);
                    let flippedLongSideFit = max(flippedLeftoverHoriz, flippedLeftoverVert);

                    if (flippedShortSideFit < bestShortSideFit || (flippedShortSideFit == bestShortSideFit && flippedLongSideFit < bestLongSideFit)) {
                        bestNode.x = x;
                        bestNode.y = y;
                        bestNode.width = height;
                        bestNode.height = width;
                        bestShortSideFit = flippedShortSideFit;
                        bestLongSideFit = flippedLongSideFit;
                    }
                }
            }
            if (bestNode.width) {
                placeRect(bestNode, this);
                return bestNode;
            }
        }
    }

    function placeRect(node: Bin, packer: BinPacker): void {
        let { freeRects, usedRects } = packer;
        let numRectsToProcess = freeRects.length;
        for (let i = 0; i < numRectsToProcess; i++) {
            if (splitFreeNode(freeRects[i], node, packer)) {
                freeRects.splice(i, 1);
                --i;
                --numRectsToProcess;
            }
        }


        //去重
        pruneFreeList(packer);

        usedRects.push(node);
    }

    function splitFreeNode(freeNode: Bin, usedNode: Bin, packer: BinPacker) {
        let { freeRects } = packer;
        // Test with SAT if the Rects even intersect.
        let { x, y, right, bottom } = usedNode;
        let { x: fx, y: fy, right: fr, bottom: fb } = freeNode;
        if (x >= fr || right <= fx || y >= fb || bottom <= y) {
            return false;
        }
        let newNode: Bin;
        if (x < fr && right > fx) {
            // New node at the top side of the used node.
            if (y > fy && y < fb) {
                newNode = freeNode.clone();
                newNode.height = y - newNode.y;
                freeRects.push(newNode);
            }

            // New node at the bottom side of the used node.
            if (bottom < fb) {
                newNode = freeNode.clone();
                newNode.y = bottom;
                newNode.height = fb - bottom;
                freeRects.push(newNode);
            }
        }

        if (y < fb && bottom > fy) {
            // New node at the left side of the used node.
            if (x > fx && x < fr) {
                newNode = freeNode.clone();
                newNode.width = x - newNode.x;
                freeRects.push(newNode);
            }
            // New node at the right side of the used node.
            if (right < fr) {
                newNode = freeNode.clone();
                newNode.x = right;
                newNode.width = fr - right;
                freeRects.push(newNode);
            }
        }

        return true;
    }

    function pruneFreeList(packer: BinPacker) {
        let { freeRects } = packer;
        let len = freeRects.length;
        for (let i = 0; i < freeRects.length; i++)
            for (let j = i + 1; j < len; j++) {
                let a = freeRects[i];
                let b = freeRects[j]
                if (b.containsRect(a)) {
                    freeRects.splice(i, 1);
                    break;
                }
                if (a.containsRect(b)) {
                    freeRects.splice(j, 1);
                }
            }
    }
}