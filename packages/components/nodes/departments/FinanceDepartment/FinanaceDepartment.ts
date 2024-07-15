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
                label: 'Tool Calling Chat Model',
                name: 'model',
                type: 'BaseChatModel',
                description:
                    'Only compatible with models that are capable of function calling: ChatOpenAI, ChatMistral, ChatAnthropic, ChatGoogleGenerativeAI, ChatVertexAI, GroqChat'
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
                label: 'Agent Name',
                name: 'agentName',
                type: 'string',
                optional: true
            },
            {
                label: 'Input Key',
                name: 'inputKey',
                type: 'string',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Ouput Key',
                name: 'outputKey',
                type: 'string',
                optional: true,
                additionalParams: true
            }
        ]
    }
}

module.exports = { nodeClass: FinanceDepartmentGraph }
