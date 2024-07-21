import { INode, INodeOutputsValue, INodeParams } from '../../../src/Interface'

class ChatWithAgent implements INode {
    label: string
    name: string
    version: number
    type: string
    icon: string
    category: string
    description: string
    baseClasses: string[]
    inputs: INodeParams[]
    chatHistory: string[]
    output?: INodeOutputsValue[]

    constructor() {
        this.label = 'Chat with agent'
        this.name = 'chatWithAgent'
        this.version = 5.0
        this.type = 'ChatWithAgent'
        this.icon = 'chatWithAgent.svg'
        this.category = 'Inputs'
        this.description = 'Use this node to chat with any agents '
        this.baseClasses = [this.type]
        this.chatHistory = []
        this.inputs = [
            {
                name: 'message',
                label: 'Message',
                description: 'Enter the message to chat with agents',
                type: 'string'
            },
            {
                name: 'agent',
                label: 'Agent',
                description: 'Select the agent to chat with',
                type: 'BeforeNode'
            }
        ]
        this.output = [
            {
                name: 'detailHistory',
                label: 'Full Chat History',
                baseClasses: ['ChatHistory']
            }
        ]
    }
}

module.exports = { nodeClass: ChatWithAgent }
