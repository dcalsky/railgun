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
    update_text(node: HTMLElement, val: any) {
        node.textContent = typeof val == 'undefined' ? '' : val
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
        console.log(node)
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
        let reg = /\{{2}(.*)\}{2}/,
            text = node.textContent
        let result = text.match(reg)
        if (result) {
            let key = result[1].trim()
            Compiler._update('text', node, this.watcher.getVal(key))
            this.watcher.addValueListener(key, val => {
                Compiler._update('text', node, val)
            })
        }
    }

    static _update(type: string, node: HTMLElement, val: any) {
        let fn = utils[`update_${type}`]
        fn && fn(node, val)
    }

    bindElement(node: HTMLElement) {
        let attrs = node.attributes,
            watcher = this.watcher
        Array.prototype.slice.call(attrs).forEach((attr) => {
            let name = attr.name,
                value = attr.value,
                directive
            if (utils.isDirective(name) == -1) {
                return
            }
            directive = name.substring(2)
            if (directive === DIRECTIVE.model) {
                Compiler._update('input', (<HTMLInputElement>node), watcher.getVal(value));
                // Add type event listener
                watcher.addValueListener(value, val => {
                    Compiler._update('input', (<HTMLInputElement>node), val)
                });
                (<HTMLInputElement>node).addEventListener('input', function (event) {
                    watcher.pubVal(value, this.value)
                })
            } else if (directive === DIRECTIVE.eventPrefix) {
                let eventName = name.substring(5) // like click event
                node.addEventListener(eventName, this.watcher.getMethod(eventName))
            }
            // After bind, remove it
            node.removeAttribute(name)
        })
    }
}