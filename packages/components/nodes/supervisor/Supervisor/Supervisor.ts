import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import { BedrockEmbeddings, BedrockEmbeddingsParams } from '@langchain/community/embeddings/bedrock'
import { ICommonObject, INode, INodeData, INodeOptionsValue, INodeParams } from '../../../src/Interface'
import { getBaseClasses, getCredentialData, getCredentialParam } from '../../../src/utils'

class RouteLayer implements INode {
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
        this.label = 'Supervisor'
        this.name = 'supervisor'
        this.type = 'supervisor'
        this.icon = 'supervisor.svg'
        this.version = 1.0
        this.category = 'Supervisor'
        this.description = ''
        this.baseClasses = [this.type, ...getBaseClasses(BedrockEmbeddings)]
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
                label: 'List of Agents',
                name: 'listOfAgents',
                type: 'string',
                optional: true,
                additionalParams: true
            }
        ]
    }
}

module.exports = { nodeClass: RouteLayer }
