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
        this.label = 'Route Layer'
        this.name = 'RouteLayer'
        this.version = 5.0
        this.type = 'RouteLayer'
        this.icon = 'routeLayer.svg'
        this.category = 'Control'
        this.description = ''
        this.baseClasses = [this.type, ...getBaseClasses(BedrockEmbeddings)]
        this.inputs = [
            {
                label: 'Input',
                name: 'input',
                type: 'BeforeNode'
            },
            {
                label: 'Encoder',
                name: 'encoder',
                type: 'options',
                options: [
                    {
                        label: 'OpenAI',
                        name: 'OpenAI'
                    },
                    {
                        label: 'HuggingFace',
                        name: 'HuggingFace'
                    },
                    {
                        label: 'Google',
                        name: 'Google'
                    }
                ],
                default: 'OpenAI'
            }
        ]
    }
}

module.exports = { nodeClass: RouteLayer }
