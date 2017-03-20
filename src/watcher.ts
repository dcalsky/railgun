/**
 * Created by Dcalsky on 2017/3/19.
 */

interface Store {
    data: object,
    methods: object
}

export default class Watcher {
    public store: Store
    constructor(store) {
        this.store = {
            data: {},
            methods: {}
        }
    }
    createKey(key: string, val: any = null): object {
        let obj = this.store.data[key] = val
        this.store.methods[key] = []
        return obj
    }
    pubVal(key: string, val: any): void {
        let fns = this.store.methods[key]
        for (let i = 0; i < fns.length; ++i) {
            fns[i](val)
        }
    }
    createMethod(name: string, fn: Function): void {
        if (!this.store.data[name]) {
            this.createKey(name, fn.bind(this.store.data))
        }
    }
    getMethod(name: string): Function {
        let method = this.store.data[name]
        if (!method) {
            throw `Cannot find *${name}* method!`
        }
        return method
    }
    getVal(key: string): string {
        return this.store.data[key] || ''
    }
    addValueListener(key: string, cb: Function): void {
        let fns = this.store.methods[key]
        fns.push(cb)
    }
}