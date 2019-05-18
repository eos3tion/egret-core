namespace jy {
    /**
     * 获取指定数据
     * @param key 
     * @param opts 
     */
    export function getOptional<T>(key: keyof T, opts: ArrayLike<T>) {
        for (let i = 0; i < opts.length; i++) {
            const opt = opts[i];
            let v = opt && opt[key];
            if (v != undefined) {
                return v;
            }
        }
    }
}