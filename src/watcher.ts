import {type} from "os";
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
    // Todo: If this data is not defined in setting, setter method will not trigger
    pubVal(key: string, val: any): void {
        this.store.data[key] = val
    }
    triggerFns(key) {
        let fns = this.store.methods[key],
            val = this.store.data[key]
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
    getVal(keys: Array<string> | string, context?: object): string {
        let store = context && Object.keys(context).length > 0 ? context : this.store.data
        if (typeof keys === 'string') {
            return store[keys] || ''
        }
        let value = store[keys[0]]
        for (let i = 1; i < keys.length; ++i) {
            value = value[keys[i]]
        }
        return value == undefined ? '' : value
    }
    addValueListener(key: string, fn: Function): void {
        if (!this.store.methods[key]) {
            this.createKey(key)
        }
        let fns = this.store.methods[key]
        fns.push(fn)
    }
}