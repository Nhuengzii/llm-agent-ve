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

class EndNode implements INode {
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
    this.label = 'End Node'
    this.name = 'EndNode'
    this.version = 5.0
    this.type = 'EndNode'
    this.icon = 'route.svg'
    this.category = 'Control'
    this.description = ''
    this.baseClasses = [this.type]
    this.inputs = [
      {
        label: 'Input',
        name: 'input',
        type: 'BeforeNode'
      },
    ]
  }
}

module.exports = { nodeClass: EndNode }
