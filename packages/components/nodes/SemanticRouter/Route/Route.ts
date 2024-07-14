import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import { BedrockEmbeddings, BedrockEmbeddingsParams } from '@langchain/community/embeddings/bedrock'
import { ICommonObject, INode, INodeData, INodeOptionsValue, INodeParams } from '../../../src/Interface'
import { getBaseClasses, getCredentialData, getCredentialParam } from '../../../src/utils'
import { MODEL_TYPE, getModels, getRegions } from '../../../src/modelLoader'

let placeholderString = `
    Enter your weather queries in a list format like this:
    [
        "What's the weather today?",
        "Weather forecast for [City/Location]",
        "Current temperature in [City/Location]",
        ... (add more questions here)
    ]
`

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
                label: 'Before Node',
                name: 'beforeNode',
                type: 'BeforeNode'
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
                rows: 5,
                placeholder: placeholderString
            }
        ]
    }
}

module.exports = { nodeClass: Route }
