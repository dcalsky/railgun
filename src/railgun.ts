/**
 * Created by Dcalsky on 2017/3/17.
 */

import Compiler from './compiler'
import Watcher from './watcher'
import Observer from './observer'

interface Store {
    methods: object
    data: object
}

export class Railgun {
    private rootElement: HTMLElement
    private compiler: Compiler
    private observer: Observer
    private store: Store
    constructor(element: string|object, options: object) {
        this.store = {
            methods: {},
            data: {}
        }
        let watcher = new Watcher(this.store)
        this.rootElement = Railgun.getNode(element)
        this.observer = new Observer(options['data'], options['methods'], watcher)
        this.compiler = new Compiler(this.rootElement, watcher)
    }
    static getNode(element) {
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
