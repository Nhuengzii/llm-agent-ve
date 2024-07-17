import { flatten } from 'lodash'
import { AgentExecutor } from 'langchain/agents'
import { pull } from 'langchain/hub'
import { Tool } from '@langchain/core/tools'
import type { PromptTemplate } from '@langchain/core/prompts'
import { BaseLanguageModel } from '@langchain/core/language_models/base'
import { additionalCallbacks } from '../../../src/handler'
import { getBaseClasses } from '../../../src/utils'
import { ICommonObject, INode, INodeData, INodeParams } from '../../../src/Interface'
import { createReactAgent } from '../../../src/agents'
import { checkInputs, Moderation } from '../../moderation/Moderation'
import { formatResponse } from '../../outputparsers/OutputParserHelpers'

class ToolNode_Tools implements INode {
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
        this.label = 'Tool Node'
        this.name = 'toolNode'
        this.version = 2.0
        this.type = 'ToolNode'
        this.category = 'Tools'
        this.icon = 'customtool.svg'
        this.description = 'Create langgraph node with tools'
        this.baseClasses = [this.type]
        this.inputs = [
            {
                label: 'Input',
                name: 'input',
                type: 'BeforeNode'
            },
            {
                label: 'Allowed Tools',
                name: 'tools',
                type: 'Tool',
                list: true
            },
        ]
    }

    async init(): Promise<any> {
        return null
    }

    async run(nodeData: INodeData, input: string, options: ICommonObject): Promise<string | object> {
        const model = nodeData.inputs?.model as BaseLanguageModel
        const maxIterations = nodeData.inputs?.maxIterations as string
        let tools = nodeData.inputs?.tools as Tool[]
        const moderations = nodeData.inputs?.inputModeration as Moderation[]

        if (moderations && moderations.length > 0) {
            try {
                // Use the output of the moderation chain as input for the ReAct Agent for LLMs
                input = await checkInputs(moderations, input)
            } catch (e) {
                await new Promise((resolve) => setTimeout(resolve, 500))
                //streamResponse(options.socketIO && options.socketIOClientId, e.message, options.socketIO, options.socketIOClientId)
                return formatResponse(e.message)
            }
        }

        tools = flatten(tools)

        const prompt = await pull<PromptTemplate>('hwchase17/react')

        const agent = await createReactAgent({
            llm: model,
            tools,
            prompt
        })

        const executor = new AgentExecutor({
            agent,
            tools,
            verbose: process.env.DEBUG === 'true' ? true : false,
            maxIterations: maxIterations ? parseFloat(maxIterations) : undefined
        })

        const callbacks = await additionalCallbacks(nodeData, options)

        const result = await executor.invoke({ input }, { callbacks })

        return result?.output
    }
}

module.exports = { nodeClass: ToolNode_Tools }
