/**
 * Created by Dcalsky on 2017/3/17.
 */

import Compiler from './compiler'
import Watcher from './watcher'
import Observer from './observer'

interface Setting {
    element: string | object
    data?: object
    methods?: object
}

const utils = {
    getElement(element: any) {
        let el
        if (typeof element === 'string') {
            el = document.querySelector(element)
        } else if (element instanceof Object) {
            el = element
        } else {
            throw 'Unsupported element type!'
        }
        return el
    }
}

export class Railgun {
    private rootElement: HTMLElement
    private compiler: Compiler
    private observer: Observer
    private store: object
    constructor(setting: Setting) {
        this.store = {}
        let watcher = new Watcher(this.store)
        this.rootElement = utils.getElement(setting['element'])
        this.observer = new Observer(setting, this.store, watcher)
        this.compiler = new Compiler(this.rootElement, watcher)
    }
}
