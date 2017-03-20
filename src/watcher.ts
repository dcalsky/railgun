/**
 * Created by Dcalsky on 2017/3/19.
 */

interface Store {
    methods: object
    data: object
}

export default class Watcher {
    store: Store
    constructor(store) {
        this.store = store
    }
    createKey(key: string, val: any = null): object {
        let obj = this.store.data[key] = {
            fns: [],
            val: val
        }
        return obj

    }
    pubVal(key: string, val: any): void {
        let fns = this.store.data[key].fns
        fns.forEach((fn) => {
            fn(val)
        })
    }
    createMethod(name: string, fn: Function): void {
        this.store.methods[name] = fn
    }
    getMethod(name: string): Function {
        let fn = this.store.methods[name]
        if (!fn) {
            throw 'Cannot find this method!'
        }
        return fn
    }
    getVal(key: string): string {
        let obj = this.store.data[key]
        return obj ? obj.val : ''
    }
    addValueListener(key: string, cb: Function): void {
        let obj = this.store.data[key] || this.createKey(key)
        obj.fns.push(cb)
    }
}