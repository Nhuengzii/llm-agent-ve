import { getBaseClasses } from '../../../src/utils'
import { INode, INodeParams } from '../../../src/Interface'
import { AgentExecutor } from '../../../src/agents'

class FinanceDepartmentGraph implements INode {
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
        this.label = 'FinanceDepartment'
        this.name = 'financeDepartment'
        this.version = 1.0
        this.type = 'FinanceDepartment'
        this.category = 'Department'
        this.icon = 'financeDepartment.png'
        this.description = `Agent that uses Function Calling to pick the tools and args to call`
        this.baseClasses = [this.type, ...getBaseClasses(AgentExecutor)]
        this.inputs = [
            {
                label: 'Input',
                name: 'input',
                type: 'BeforeNode'
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
                ]
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
                label: 'Agent Name',
                name: 'agentName',
                type: 'string',
                optional: true,
                additionalParams: true
            }
        ]
    }
}

module.exports = { nodeClass: FinanceDepartmentGraph }
