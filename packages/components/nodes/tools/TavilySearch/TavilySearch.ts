import { SearchApi } from '@langchain/community/tools/searchapi'
import { ICommonObject, INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses, getCredentialData, getCredentialParam } from '../../../src/utils'

class TavilySearch_Tools implements INode {
    label: string
    name: string
    version: number
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    credential: INodeParams
    inputs: INodeParams[]

    constructor() {
        this.label = 'Tavily Search'
        this.name = 'tavilySearch'
        this.version = 1.0
        this.type = 'tools'
        this.icon = 'tavilySearch.svg'
        this.category = 'Tools'
        this.description = "Tavily's Search API is a search engine built specifically for AI agents"
        this.inputs = []
        this.baseClasses = [this.type, ...getBaseClasses(SearchApi)]
    }
}

module.exports = { nodeClass: TavilySearch_Tools }
