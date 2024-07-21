import { INode, INodeParams } from '../../../src/Interface'

let placeholderString = `
    Enter your weather queries in a list format like this:
    [
        "What's the weather today?",
        "Weather forecast for [City/Location]",
        "Current temperature in [City/Location]",
        ... (add more questions here)
    ]
`

class StartNode implements INode {
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
        this.label = 'Start Node'
        this.name = 'StartNode'
        this.version = 5.0
        this.type = 'StartNode'
        this.icon = 'route.svg'
        this.category = 'Control'
        this.description = ''
        this.baseClasses = [this.type]
        this.inputs = [
            {
                name: 'StartMessage',
                label: 'Start Message',
                description: 'Enter the message to start the flow',
                type: 'string'
            }
        ]
    }
}

module.exports = { nodeClass: StartNode }
