/**
 * Created by Dcalsky on 2017/3/19.
 */

export default class Observer {
    private watcher
    constructor(data: object, methods: object, watcher) {
        let dataKeys = Object.keys(data),
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
        console.log(name)
        console.log(fn)
        this.watcher.createMethod(name, fn)
    }
    bindValueListener(data: object, key: string, val: any) {
        let watcher = this.watcher
        watcher.createKey(key, val)
        Object.defineProperty(data, key, {
            get() {
              console.log(`get: ${key}`)
                return val
            },
            set(newVal) {
                console.log(`set: ${key}`)
                val = newVal
                watcher.pubVal(key, val)
            }
        })
    }
}