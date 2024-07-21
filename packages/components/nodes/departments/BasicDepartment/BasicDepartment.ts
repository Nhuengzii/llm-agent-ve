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
                label: 'Input',
                name: 'input',
                type: 'BeforeNode'
            },
            {
                label: 'Agent Name',
                name: 'agentName',
                type: 'string'
            },
            {
                label: 'LLM Type',
                name: 'llmType',
                type: 'options',
                options: [
                    {
                        label: 'LLM API',
                        name: 'llm_api',
                        description: 'LLM API'
                    },
                    {
                        label: 'LLM Local',
                        name: 'llm_local',
                        description: 'LLM Local'
                    },
                    {
                        label: 'LLM Huggingface',
                        name: 'llm_huggingface',
                        description: 'LLM Huggingface'
                    }
                ],
                additionalParams: true,
                optional: true
            },
            {
                label: 'LLM Model',
                name: 'llmModel',
                type: 'options',
                options: [],
                description: 'LLM Model for the agent',
                additionalParams: true
            },
            {
                label: 'Persona',
                name: 'persona',
                type: 'strng',
                rows: 4,
                optional: true,
                additionalParams: true,
                description: 'Persona for the agent',
                placeholder: 'Insert the persona for the agent'
            }
        ]
    }
}

module.exports = { nodeClass: DevDepartmentGraph }
