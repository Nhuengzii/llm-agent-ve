import { getBaseClasses } from '../../../src/utils'
import { INode, INodeParams } from '../../../src/Interface'
import { AgentExecutor } from '../../../src/agents'

class DevDepartmentGraph implements INode {
    label: string
    name: string
    version: number
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'Basic Department'
        this.name = 'basicDepartment'
        this.version = 1.0
        this.type = 'BasicDepartment'
        this.category = 'Department'
        this.icon = 'basicDepartment.png'
        this.description = `Agent that uses Function Calling to pick the tools and args to call`
        this.baseClasses = [this.type, ...getBaseClasses(AgentExecutor)]
        this.inputs = [
            {
                label: 'Agent Name',
                name: 'agentName',
                type: 'string',
                description: 'The name of the agent to call'
            },
            {
                label: 'LLM Model',
                name: 'llmModel',
                type: 'LLM Model',
                description: 'LLM Model for the agent',
                optional: true
            },
            {
                label: 'Embedding Model',
                name: 'embeddingModel',
                type: 'Embedding Model',
                optional: true
            },
            {
                label: 'Tools',
                name: 'tools',
                type: 'Tools',
                description: 'Tools for the agent'
            },
            {
                label: 'Persona',
                name: 'persona',
                type: 'string',
                rows: 5,
                description: 'Persona',
                optional: true,
                placeholder: 'Enter persona',
                additionalParams: true
            }
        ]
    }
}

module.exports = { nodeClass: DevDepartmentGraph }
