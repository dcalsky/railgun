/**
 * Created by Dcalsky on 2017/3/17.
 */

import Compiler from './compiler'
import Watcher from './wather'
import Observer from './observer'


export class Railgun {
    private rootElement: HTMLElement
    private compiler: Compiler
    private observer: Observer
    constructor(element: string|object, options: object) {
        let watcher = new Watcher()
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
