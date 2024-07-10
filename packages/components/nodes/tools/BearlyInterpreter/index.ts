import { BraveSearch } from "@langchain/community/tools/brave_search";
import { ICommonObject, INode, INodeData, INodeParams } from "../../../src/Interface";
import { getCredentialData, getCredentialParam } from "../../../src/utils";
class BearlyInterpreter_Tools implements INode {
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
    this.label = 'Bearly Interpreter'
    this.name = 'bearlyInterpreter'
    this.version = 1.0
    this.type = 'BearlyInterpreter'
    this.icon = 'bearly.svg'
    this.category = 'Tools'
    this.description = "Evaluates Python code in a sandboxed Bearly environment. "
    this.inputs = []
    this.credential = {
      label: 'API Key',
      name: 'credential',
      type: 'credential',
      credentialNames: ['bearyAPI']
    }
    this.baseClasses = [this.type]
  }

  async init(nodeData: INodeData, _: string, options: ICommonObject): Promise<any> {
    return
    // const credentialData = await getCredentialData(nodeData.credential ?? '', options)
    // const braveApiKey = getCredentialParam('braveApiKey', credentialData, nodeData)
    // return new BraveSearch({ apiKey: braveApiKey })
  }
}

module.exports = { nodeClass: BearlyInterpreter_Tools }
