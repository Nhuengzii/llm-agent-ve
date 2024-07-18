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
        this.label = 'LLMRouter'
        this.name = 'llmRouter'
        this.type = 'llmRouter'
        this.icon = 'LLMRouter.svg'
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
                label: 'LLM',
                name: 'llm',
                type: 'LLM'
            },
            {
                label: 'Agents With Description',
                name: 'toolsWithDescription',
                type: 'string',
                rows: 4,
                placeholder: `List of tuple of tool name and description (tool name must match node name in langgraph)
                    Example:
                    [
                        ("Searcher", "Search for information on the web"),
                        ("Postman", "Run API requests (GET, POST) from the user given URL")
                    ]
                `
            },
            {
                label: 'Agent Names',
                name: 'toolNames',
                type: 'string',
                rows: 2,
                placeholder: `List of tool names (tool name must match node name in langgraph)
                    Example:
                    ["Searcher", "Postman"]
                `
            }
        ]
    }
}

module.exports = { nodeClass: RouteLayer }
