/**
 * Created by Dcalsky on 2017/3/19.
 */

const NODE_TYPE = {
    element: 1,
    text: 3
}

const DIRECTIVE = {
    prefix: 'n-',
    model: 'model',
    eventPrefix: 'on'
}

const utils = {
    isDirective(attr) {
        return attr.indexOf(DIRECTIVE.prefix)
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
        let nodes = Array.prototype.slice.call(root.childNodes, 0)
        nodes.forEach((node) => {
            this.handleChildNode(node)
        })
    }

    handleChildNode(nodes: HTMLElement) {
        let node = nodes as HTMLElement,
            nodeType = node.nodeType
        switch (nodeType) {
            case NODE_TYPE.element:
                this.bindElement(node)
                break
            case NODE_TYPE.text:
                this.renderText(node)
                break
        }
    }

    renderText(node: HTMLElement) {
        let reg = /\{{2}(.*?)\}{2}/g,
            text = node.textContent,
            results = reg.test(text)
        if (!results) return
        node.textContent = text.replace(reg, (_, key) => {
            this.watcher.addValueListener(key, val => {
                node.textContent = text.replace(reg, (m, n) => {
                    if (n == key) {
                        return val
                    } else {
                        return this.watcher.getVal(n)
                    }
                })
            })
            return this.watcher.getVal(key)
        })
    }

    // After bind, remove it
    // Do not change the value of input which is been typing
    // Get the initial value
    // Add type event listener
    bindElement(node: HTMLElement | HTMLInputElement) {
        let attrs = node.attributes,
            watcher = this.watcher
        Array.prototype.slice.call(attrs, 0).forEach((attr) => {
            let name = attr.name,
                value = attr.value,
                directive = utils.getDirective(name)

            if (utils.isDirective(name) == -1) return
            if (directive === DIRECTIVE.model) {
                utils.update_input((<HTMLInputElement>node), watcher.getVal(value))
                watcher.addValueListener(value, val => {
                    if (val === (<HTMLInputElement>node).value) return
                    utils.update_input((<HTMLInputElement>node), val)
                })
                node.addEventListener('input', function (event) {
                    watcher.pubVal(value, (<HTMLInputElement>this).value)
                })
            } else if (utils.getEventPrefix(directive) === DIRECTIVE.eventPrefix) {
                let eventName = utils.getEventName(name)
                node.addEventListener(eventName, this.watcher.getMethod(value))
            }
            node.removeAttribute(name)
        })
        this.renderText(node)
    }
}