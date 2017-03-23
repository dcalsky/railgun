/**
 * Created by Dcalsky on 2017/3/19.
 */

const enum NODE_TYPE {
    ELEMENT = 1,
    TEXT = 3
}

const DIRECTIVE = {
    prefix: 'n-',
    loop: 'for',
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
    },
    toArray(value: any) {
        return Array.prototype.slice.call(value, 0)
    }
}

export default class Compiler {
    private watcher
    private context: object | null = null
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
    _observeKey(key: string, node: HTMLElement, text: string, reg: RegExp) {
        // If the special context is existed, then do not add value listener
        !this.context && this.watcher.addValueListener(key, val => {
            // @text is gotten from the closure
            node.textContent = text.replace(reg, (_, n) => {
                let subKeys = n.split('.')
                return n === key ? val : this.watcher.getVal(subKeys)
            })
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
            let subKeys = key.split('.')
            this._observeKey(key, node, text, reg)
            return this.watcher.getVal(subKeys, this.context)
        })
    }
    bindElement(node: HTMLElement | HTMLInputElement) {
        let attrs = node.attributes
        utils.toArray(attrs).forEach((attr) => {
            let name = attr.name,
                value = attr.value,
                directive = utils.getDirective(name)

            if (!utils.isDirective(name)) return

            if (directive === DIRECTIVE.model) {
                this._handleModel(<HTMLInputElement>node, value)
            } else if (utils.getEventPrefix(directive) === DIRECTIVE.eventPrefix) {
                this._handleEvent(node, utils.getEventName(name), value)
            } else if (directive === DIRECTIVE.loop) {
                this._handleLoop(node, value)
            }
            // Finished attribute bind, remove it
            node.removeAttribute(name)
        })
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
        this.renderText(node)
    }
    _handleLoop(node: HTMLElement, expression: string) {
        let reg = /(.+)\s+in\s+(.+)/,
            result = expression.match(reg),
            itemName: string,
            collection: Array<any> | object,
            context: object
        if (!result) {
            throw 'The loop expression is wrong!'
        }
        context = Object.create({})
        itemName = result[1]
        collection = this.watcher.getVal(result[2])
        // If collection is array
        if (Array.isArray(collection)) {
            // Create the special context for rendering variables of child node
            for (let i = 0; i < collection.length; ++i) {
                context[itemName] = collection[i]
                context['$index'] = i
                this.context = context
                this._handleChilds(node.childNodes)
            }
        } else if (collection instanceof Object) {
            let keys = itemName.split(',').map(key => key.trim())
            keys.forEach(key => {
                context[key] = collection[key]
            })
            this.context = context
            this._handleChilds(node.childNodes)
        } else {
            throw 'The type of the collection must be one of Array and Object!'
        }
        // Remove the context which be created while loop
        this.context = null
    }
}