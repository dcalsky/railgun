/**
 * Created by Dcalsky on 2017/3/19.
 */

export default class Observer {
    private watcher
    constructor(setting, store: object, watcher) {
        let { data = {}, methods = {} } = setting,
            dataKeys = Object.keys(data),
            methodKeys = Object.keys(methods)

        this.watcher = watcher
        dataKeys.forEach((key) => {
            this.bindValueListener(data, key, data[key])
        })
        methodKeys.forEach((name) => {
            this.bindEventListener(name, methods[name])
        })
    }
    bindEventListener(name: string, fn: Function) {
        this.watcher.createMethod(name, fn)
    }
    bindValueListener(data: object, key: string, val: any) {
        let watcher = this.watcher
        watcher.createKey(key, val)
        Object.defineProperty(watcher.store.data, key, {
            get() {
                return val
            },
            set(newVal) {
                val = newVal
                watcher.triggerFns(key)
            }
        })
    }
}