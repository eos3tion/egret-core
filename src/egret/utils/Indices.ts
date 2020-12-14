namespace egret {

    const indices = new Uint16Array(12288);
    for (let i = 0, j = 0; i < 12288; i += 6, j += 4) {
        indices[i + 0] = j + 0;
        indices[i + 1] = j + 1;
        indices[i + 2] = j + 2;
        indices[i + 3] = j + 0;
        indices[i + 4] = j + 2;
        indices[i + 5] = j + 3;
    }

    export const SharedIndices = indices;
}
