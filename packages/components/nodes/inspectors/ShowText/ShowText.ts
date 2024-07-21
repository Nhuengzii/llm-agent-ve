import { INode, INodeParams } from '../../../src/Interface'

class ShowText implements INode {
    label: string
    name: string
    version: number
    type: string
    icon: string
    category: string
    description: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'Show Text'
        this.name = 'showText'
        this.version = 5.0
        this.type = 'ShowText'
        this.icon = 'magnifyingGlasses.svg'
        this.category = 'Inspectors'
        this.description = ''
        this.baseClasses = [this.type]
        this.inputs = [
            {
                name: 'text',
                label: 'Text',
                description: 'Show text output',
                type: 'BeforeNode'
            }
        ]
    }
}

module.exports = { nodeClass: ShowText }
