/**
 * Created by Dcalsky on 2017/3/19.
 */

const enum NODE_TYPE {
    ELEMENT = 1,
    TEXT = 3
}

const DIRECTIVE = {
    prefix: 'n-',
    for: 'for',
    model: 'model',
    eventPrefix: 'on'
}

const utils = {
    isDirective(attr): boolean {
        return attr.indexOf(DIRECTIVE.prefix) !== -1
    },
    getDirective(attrName: string) {
        return attrName.substring(2)
    },
    getEventName(attrName: string) {
        return attrName.substring(5)
    },
    getEventPrefix(directive: string) {
        return directive.substring(0, 2)
    },
    update_text(node: HTMLElement, start: number, end: number, val: any) {
        let text = node.textContent,
            leftText = text.substring(0, start),
            rightText = text.substring(end, text.length)

        node.textContent = leftText + val + rightText
    },
    update_input(node: HTMLInputElement, val: any) {
        node.value = typeof val == 'undefined' ? '' : val
    }
}

export default class Compiler {
    private watcher

    constructor(root: HTMLElement, watcher) {
        this.watcher = watcher
        this._handleChilds(root.childNodes)
    }

    _handleChilds(nodes: NodeList) {
        let nodesArray = Array.prototype.slice.call(nodes, 0)
        nodesArray.forEach((node) => {
            this.handleNode(node)
        })
    }
    handleNode(node: HTMLElement) {
        let nodeType = node.nodeType
        switch (nodeType) {
            case NODE_TYPE.ELEMENT:
                this.bindElement(node)
                break
            case NODE_TYPE.TEXT:
                this.renderText(node)
                break
        }
        this._handleChilds(node.childNodes)
    }
    renderText(node: HTMLElement) {
        let reg = /\{{2}(.*?)\}{2}/g,
            text = node.textContent,
            results = reg.test(text)

        if (!results) return
        node.textContent = text.replace(reg, (_, key) => {
            this.watcher.addValueListener(key, val => {
                node.textContent = text.replace(reg, (m, n) => {
                    return n == key ? val : this.watcher.getVal(n)
                })
            })
            return this.watcher.getVal(key)
        })
    }
    bindElement(node: HTMLElement | HTMLInputElement) {
        let attrs = node.attributes,
            watcher = this.watcher
        Array.prototype.slice.call(attrs, 0).forEach((attr) => {
            let name = attr.name,
                value = attr.value,
                directive = utils.getDirective(name)

            if (utils.isDirective(name)) return

            if (directive === DIRECTIVE.model) {
                this._handleModel(<HTMLInputElement>node, value)
            } else if (utils.getEventPrefix(directive) === DIRECTIVE.eventPrefix) {
                this._handleEvent(node, utils.getEventName(name), value)
            } else if (directive === DIRECTIVE.for) {
                this._handleFor(node)
            }
            // Finished attribute bind, remove it
            node.removeAttribute(name)
        })
        this.renderText(node)
    }
    _handleModel(node: HTMLInputElement, key: string) {
        let watcher = this.watcher
        utils.update_input(node, watcher.getVal(key))
        watcher.addValueListener(key, val => {
            // Do not change the value of input which is been typing
            if (val === node.value) return
            utils.update_input(node, val)
        })
        node.addEventListener('input', function (event) {
            watcher.pubVal(key, this.value)
        })
    }
    _handleEvent(node: HTMLElement, eventName: string, key: string) {
        node.addEventListener(eventName, this.watcher.getMethod(key))
    }
    _handleFor(node) {

    }
}