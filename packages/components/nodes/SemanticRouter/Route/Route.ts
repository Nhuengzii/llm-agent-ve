import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import { BedrockEmbeddings, BedrockEmbeddingsParams } from '@langchain/community/embeddings/bedrock'
import { ICommonObject, INode, INodeData, INodeOptionsValue, INodeParams } from '../../../src/Interface'
import { getBaseClasses, getCredentialData, getCredentialParam } from '../../../src/utils'
import { MODEL_TYPE, getModels, getRegions } from '../../../src/modelLoader'

class Route implements INode {
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
        this.label = 'Route'
        this.name = 'Route'
        this.version = 5.0
        this.type = 'Route'
        this.icon = 'route.svg'
        this.category = 'Semantic Router'
        this.description = 'Semantic Router is a superfast decision-making  for your LLMs and agents'
        this.baseClasses = [this.type, ...getBaseClasses(BedrockEmbeddings)]
        this.inputs = [
            {
                label: 'Route Layer',
                name: 'routeLayer',
                type: 'RouteLayer'
            },
            {
                label: 'Route Name',
                name: 'routeName',
                type: 'string',
                placeholder: 'Nmae of the route'
            },
            {
                label: 'Utterances',
                name: 'utterances',
                type: 'string',
                rows: 4,
                placeholder: '...'
            }
        ]
    }
}

module.exports = { nodeClass: Route }
