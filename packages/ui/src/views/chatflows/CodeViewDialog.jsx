import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import {
    Tabs,
    Tab,
    Dialog,
    DialogContent,
    DialogTitle,
    Box,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Stack
} from '@mui/material'
import { CopyBlock, atomOneDark } from 'react-code-blocks'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

// Project import
import { Dropdown } from '@/ui-component/dropdown/Dropdown'
import ShareChatbot from './ShareChatbot'
import EmbedChat from './EmbedChat'

// Const
import { baseURL } from '@/store/constant'
import { SET_CHATFLOW } from '@/store/actions'

// Images
import pythonSVG from '@/assets/images/python.svg'
import javascriptSVG from '@/assets/images/javascript.svg'
import cURLSVG from '@/assets/images/cURL.svg'
import jsonIcon from '@/assets/images/jsonIcon.svg'
import EmbedSVG from '@/assets/images/embed.svg'
import ShareChatbotSVG from '@/assets/images/sharing.png'
import settingsSVG from '@/assets/images/settings.svg'
import { IconBulb } from '@tabler/icons-react'

// API
import apiKeyApi from '@/api/apikey'
import chatflowsApi from '@/api/chatflows'
import configApi from '@/api/config'

// Hooks
import useApi from '@/hooks/useApi'
import { CheckboxInput } from '@/ui-component/checkbox/Checkbox'
import { TableViewOnly } from '@/ui-component/table/Table'

// Helpers
import { unshiftFiles, getConfigExamplesForJS, getConfigExamplesForPython, getConfigExamplesForCurl } from '@/utils/genericHelper'

function TabPanel(props) {
    const { children, value, index, ...other } = props
    return (
        <div
            role='tabpanel'
            hidden={value !== index}
            id={`attachment-tabpanel-${index}`}
            aria-labelledby={`attachment-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 1 }}>{children}</Box>}
        </div>
    )
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired
}

function a11yProps(index) {
    return {
        id: `attachment-tab-${index}`,
        'aria-controls': `attachment-tabpanel-${index}`
    }
}

const CodeViewDialog = ({ show, dialogProps, onCancel }) => {
    const portalElement = document.getElementById('portal')
    const navigate = useNavigate()
    const dispatch = useDispatch()

    // const codes = ['Embed', 'Python', 'JavaScript', 'cURL', 'Share Chatbot']
    const codes = ['json', "Python"]
    const [value, setValue] = useState(0)
    const [keyOptions, setKeyOptions] = useState([])
    const [apiKeys, setAPIKeys] = useState([])
    const [chatflowApiKeyId, setChatflowApiKeyId] = useState('')
    const [selectedApiKey, setSelectedApiKey] = useState({})
    const [checkboxVal, setCheckbox] = useState(false)
    const [nodeConfig, setNodeConfig] = useState({})
    const [nodeConfigExpanded, setNodeConfigExpanded] = useState({})

    const getAllAPIKeysApi = useApi(apiKeyApi.getAllAPIKeys)
    const updateChatflowApi = useApi(chatflowsApi.updateChatflow)
    const getIsChatflowStreamingApi = useApi(chatflowsApi.getIsChatflowStreaming)
    const getConfigApi = useApi(configApi.getConfig)

    const onCheckBoxChanged = (newVal) => {
        setCheckbox(newVal)
        if (newVal) {
            getConfigApi.request(dialogProps.chatflowid)
        }
    }

    const onApiKeySelected = (keyValue) => {
        if (keyValue === 'addnewkey') {
            navigate('/apikey')
            return
        }
        setChatflowApiKeyId(keyValue)
        setSelectedApiKey(apiKeys.find((key) => key.id === keyValue))
        const updateBody = {
            apikeyid: keyValue
        }
        updateChatflowApi.request(dialogProps.chatflowid, updateBody)
    }

    const groupByNodeLabel = (nodes) => {
        const result = {}

        nodes.forEach((item) => {
            const { node, nodeId, label, name, type } = item

            if (!result[node]) {
                result[node] = {
                    nodeIds: [],
                    params: []
                }
            }

            if (!result[node].nodeIds.includes(nodeId)) result[node].nodeIds.push(nodeId)

            const param = { label, name, type }

            if (!result[node].params.some((existingParam) => JSON.stringify(existingParam) === JSON.stringify(param))) {
                result[node].params.push(param)
            }
        })

        // Sort the nodeIds array
        for (const node in result) {
            result[node].nodeIds.sort()
        }

        setNodeConfig(result)
    }

    const handleAccordionChange = (nodeLabel) => (event, isExpanded) => {
        const accordianNodes = { ...nodeConfigExpanded }
        accordianNodes[nodeLabel] = isExpanded
        setNodeConfigExpanded(accordianNodes)
    }

    useEffect(() => {
        if (updateChatflowApi.data) {
            dispatch({ type: SET_CHATFLOW, chatflow: updateChatflowApi.data })
        }
    }, [updateChatflowApi.data, dispatch])

    useEffect(() => {
        if (getConfigApi.data) {
            groupByNodeLabel(getConfigApi.data)
        }
    }, [getConfigApi.data])

    const handleChange = (event, newValue) => {
        setValue(newValue)
    }

    const getCode = (codeLang) => {
        if (codeLang === 'Python') {
            return `from typing import Annotated, Literal, TypedDict
from langchain_core.messages import HumanMessage
from langchain_anthropic import ChatAnthropic
from langchain_core.tools import tool
from langgraph.checkpoint import MemorySaver
from langgraph.graph import END, StateGraph, MessagesState
from langgraph.prebuilt import ToolNode

@tool
def search(query: str):
    """Call to surf the web."""
    if "sf" in query.lower() or "san francisco" in query.lower():
        return ["It's 60 degrees and foggy."]
    return ["It's 90 degrees and sunny."]


tools = [search]

tool_node = ToolNode(tools)

model = ChatAnthropic(model="claude-3-5-sonnet-20240620", temperature=0).bind_tools(tools)

def should_continue(state: MessagesState) -> Literal["tools", END]:
    messages = state['messages']
    last_message = messages[-1]
    if last_message.tool_calls:
        return "tools"
    return END

def call_model(state: MessagesState):
    messages = state['messages']
    response = model.invoke(messages)
    return {"messages": [response]}

workflow = StateGraph(MessagesState)

workflow.add_node("agent", call_model)
workflow.add_node("tools", tool_node)

workflow.set_entry_point("agent")

workflow.add_conditional_edges(
    "agent",
    should_continue,
)

workflow.add_edge("tools", 'agent')
checkpointer = MemorySaver()
app = workflow.compile(checkpointer=checkpointer)
`
        } else if (codeLang === 'JavaScript') {
            return `async function query(data) {
    const response = await fetch(
        "${baseURL}/api/v1/prediction/${dialogProps.chatflowid}",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
    );
    const result = await response.json();
    return result;
}

query({"question": "Hey, how are you?"}).then((response) => {
    console.log(response);
});
`
        } else if (codeLang === 'cURL') {
            return `curl ${baseURL}/api/v1/prediction/${dialogProps.chatflowid} \\
     -X POST \\
     -d '{"question": "Hey, how are you?"}' \\
     -H "Content-Type: application/json"`
        } else if (codeLang === "json") {
            return `
{
  "nodes": [
    {
      "width": 300,
      "height": 253,
      "id": "bufferMemory_0",
      "position": {
        "x": 195.885587148196,
        "y": -256.3028598579891
      },
      "type": "customNode",
      "data": {
        "id": "bufferMemory_0",
        "label": "Buffer Memory",
        "version": 2,
        "name": "bufferMemory",
        "type": "BufferMemory",
        "baseClasses": [
          "BufferMemory",
          "BaseChatMemory",
          "BaseMemory"
        ],
        "category": "Memory",
        "description": "Retrieve chat messages stored in database",
        "inputParams": [
          {
            "label": "Session Id",
            "name": "sessionId",
            "type": "string",
            "description": "If not specified, a random id will be used. Learn <a target=\"_blank\" href=\"https://docs.flowiseai.com/memory#ui-and-embedded-chat\">more</a>",
            "default": "",
            "additionalParams": true,
            "optional": true,
            "id": "bufferMemory_0-input-sessionId-string"
          },
          {
            "label": "Memory Key",
            "name": "memoryKey",
            "type": "string",
            "default": "chat_history",
            "additionalParams": true,
            "id": "bufferMemory_0-input-memoryKey-string"
          }
        ],
        "inputAnchors": [],
        "inputs": {
          "sessionId": "",
          "memoryKey": "chat_history"
        },
        "outputAnchors": [
          {
            "id": "bufferMemory_0-output-bufferMemory-BufferMemory|BaseChatMemory|BaseMemory",
            "name": "bufferMemory",
            "label": "BufferMemory",
            "type": "BufferMemory | BaseChatMemory | BaseMemory"
          }
        ],
        "outputs": {},
        "selected": false
      },
      "selected": false,
      "positionAbsolute": {
        "x": 195.885587148196,
        "y": -256.3028598579891
      },
      "dragging": false
    },
    {
      "width": 300,
      "height": 435,
      "id": "conversationChain_0",
      "position": {
        "x": 958.9887390513221,
        "y": 318.8734467468765
      },
      "type": "customNode",
      "data": {
        "id": "conversationChain_0",
        "label": "Conversation Chain",
        "version": 3,
        "name": "conversationChain",
        "type": "ConversationChain",
        "baseClasses": [
          "ConversationChain",
          "LLMChain",
          "BaseChain",
          "Runnable"
        ],
        "category": "Chains",
        "description": "Chat models specific conversational chain with memory",
        "inputParams": [
          {
            "label": "System Message",
            "name": "systemMessagePrompt",
            "type": "string",
            "rows": 4,
            "description": "If Chat Prompt Template is provided, this will be ignored",
            "additionalParams": true,
            "optional": true,
            "default": "The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.",
            "placeholder": "The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.",
            "id": "conversationChain_0-input-systemMessagePrompt-string"
          }
        ],
        "inputAnchors": [
          {
            "label": "Chat Model",
            "name": "model",
            "type": "BaseChatModel",
            "id": "conversationChain_0-input-model-BaseChatModel"
          },
          {
            "label": "Memory",
            "name": "memory",
            "type": "BaseMemory",
            "id": "conversationChain_0-input-memory-BaseMemory"
          },
          {
            "label": "Chat Prompt Template",
            "name": "chatPromptTemplate",
            "type": "ChatPromptTemplate",
            "description": "Override existing prompt with Chat Prompt Template. Human Message must includes {input} variable",
            "optional": true,
            "id": "conversationChain_0-input-chatPromptTemplate-ChatPromptTemplate"
          },
          {
            "label": "Input Moderation",
            "description": "Detect text that could generate harmful output and prevent it from being sent to the language model",
            "name": "inputModeration",
            "type": "Moderation",
            "optional": true,
            "list": true,
            "id": "conversationChain_0-input-inputModeration-Moderation"
          }
        ],
        "inputs": {
          "inputModeration": "",
          "model": "{{chatAnthropic_0.data.instance}}",
          "memory": "{{bufferMemory_0.data.instance}}",
          "chatPromptTemplate": "{{chatPromptTemplate_0.data.instance}}",
          "systemMessagePrompt": "The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know."
        },
        "outputAnchors": [
          {
            "id": "conversationChain_0-output-conversationChain-ConversationChain|LLMChain|BaseChain|Runnable",
            "name": "conversationChain",
            "label": "ConversationChain",
            "type": "ConversationChain | LLMChain | BaseChain | Runnable"
          }
        ],
        "outputs": {},
        "selected": false
      },
      "selected": false,
      "positionAbsolute": {
        "x": 958.9887390513221,
        "y": 318.8734467468765
      },
      "dragging": false
    },
    {
      "width": 300,
      "height": 670,
      "id": "chatAnthropic_0",
      "position": {
        "x": 757.9773055749514,
        "y": -394.7592261450517
      },
      "type": "customNode",
      "data": {
        "id": "chatAnthropic_0",
        "label": "ChatAnthropic",
        "version": 6,
        "name": "chatAnthropic",
        "type": "ChatAnthropic",
        "baseClasses": [
          "ChatAnthropic",
          "BaseChatModel",
          "BaseLanguageModel",
          "Runnable"
        ],
        "category": "Chat Models",
        "description": "Wrapper around ChatAnthropic large language models that use the Chat endpoint",
        "inputParams": [
          {
            "label": "Connect Credential",
            "name": "credential",
            "type": "credential",
            "credentialNames": [
              "anthropicApi"
            ],
            "id": "chatAnthropic_0-input-credential-credential"
          },
          {
            "label": "Model Name",
            "name": "modelName",
            "type": "asyncOptions",
            "loadMethod": "listModels",
            "default": "claude-3-haiku",
            "id": "chatAnthropic_0-input-modelName-options"
          },
          {
            "label": "Temperature",
            "name": "temperature",
            "type": "number",
            "step": 0.1,
            "default": 0.9,
            "optional": true,
            "id": "chatAnthropic_0-input-temperature-number"
          },
          {
            "label": "Max Tokens",
            "name": "maxTokensToSample",
            "type": "number",
            "step": 1,
            "optional": true,
            "additionalParams": true,
            "id": "chatAnthropic_0-input-maxTokensToSample-number"
          },
          {
            "label": "Top P",
            "name": "topP",
            "type": "number",
            "step": 0.1,
            "optional": true,
            "additionalParams": true,
            "id": "chatAnthropic_0-input-topP-number"
          },
          {
            "label": "Top K",
            "name": "topK",
            "type": "number",
            "step": 0.1,
            "optional": true,
            "additionalParams": true,
            "id": "chatAnthropic_0-input-topK-number"
          },
          {
            "label": "Allow Image Uploads",
            "name": "allowImageUploads",
            "type": "boolean",
            "description": "Automatically uses claude-3-* models when image is being uploaded from chat. Only works with LLMChain, Conversation Chain, ReAct Agent, and Conversational Agent",
            "default": false,
            "optional": true,
            "id": "chatAnthropic_0-input-allowImageUploads-boolean"
          }
        ],
        "inputAnchors": [
          {
            "label": "Cache",
            "name": "cache",
            "type": "BaseCache",
            "optional": true,
            "id": "chatAnthropic_0-input-cache-BaseCache"
          }
        ],
        "inputs": {
          "cache": "",
          "modelName": "claude-3-haiku",
          "temperature": 0.9,
          "maxTokensToSample": "",
          "topP": "",
          "topK": "",
          "allowImageUploads": true
        },
        "outputAnchors": [
          {
            "id": "chatAnthropic_0-output-chatAnthropic-ChatAnthropic|BaseChatModel|BaseLanguageModel|Runnable",
            "name": "chatAnthropic",
            "label": "ChatAnthropic",
            "type": "ChatAnthropic | BaseChatModel | BaseLanguageModel | Runnable"
          }
        ],
        "outputs": {},
        "selected": false
      },
      "selected": false,
      "positionAbsolute": {
        "x": 757.9773055749514,
        "y": -394.7592261450517
      },
      "dragging": false
    },
    {
      "width": 300,
      "height": 690,
      "id": "chatPromptTemplate_0",
      "position": {
        "x": -106.44189698270114,
        "y": 20.133956087516538
      },
      "type": "customNode",
      "data": {
        "id": "chatPromptTemplate_0",
        "label": "Chat Prompt Template",
        "version": 1,
        "name": "chatPromptTemplate",
        "type": "ChatPromptTemplate",
        "baseClasses": [
          "ChatPromptTemplate",
          "BaseChatPromptTemplate",
          "BasePromptTemplate",
          "Runnable"
        ],
        "category": "Prompts",
        "description": "Schema to represent a chat prompt",
        "inputParams": [
          {
            "label": "System Message",
            "name": "systemMessagePrompt",
            "type": "string",
            "rows": 4,
            "placeholder": "You are a helpful assistant that translates {input_language} to {output_language}.",
            "id": "chatPromptTemplate_0-input-systemMessagePrompt-string"
          },
          {
            "label": "Human Message",
            "name": "humanMessagePrompt",
            "type": "string",
            "rows": 4,
            "placeholder": "{text}",
            "id": "chatPromptTemplate_0-input-humanMessagePrompt-string"
          },
          {
            "label": "Format Prompt Values",
            "name": "promptValues",
            "type": "json",
            "optional": true,
            "acceptVariable": true,
            "list": true,
            "id": "chatPromptTemplate_0-input-promptValues-json"
          }
        ],
        "inputAnchors": [],
        "inputs": {
          "systemMessagePrompt": "The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.\nThe AI has the following context:\n{context}",
          "humanMessagePrompt": "{input}",
          "promptValues": "{\"context\":\"{{plainText_0.data.instance}}\",\"input\":\"{{question}}\"}"
        },
        "outputAnchors": [
          {
            "id": "chatPromptTemplate_0-output-chatPromptTemplate-ChatPromptTemplate|BaseChatPromptTemplate|BasePromptTemplate|Runnable",
            "name": "chatPromptTemplate",
            "label": "ChatPromptTemplate",
            "type": "ChatPromptTemplate | BaseChatPromptTemplate | BasePromptTemplate | Runnable"
          }
        ],
        "outputs": {},
        "selected": false
      },
      "selected": false,
      "positionAbsolute": {
        "x": -106.44189698270114,
        "y": 20.133956087516538
      },
      "dragging": false
    },
    {
      "width": 300,
      "height": 487,
      "id": "plainText_0",
      "position": {
        "x": -487.7511991135089,
        "y": 77.83838996645807
      },
      "type": "customNode",
      "data": {
        "id": "plainText_0",
        "label": "Plain Text",
        "version": 2,
        "name": "plainText",
        "type": "Document",
        "baseClasses": [
          "Document"
        ],
        "category": "Document Loaders",
        "description": "Load data from plain text",
        "inputParams": [
          {
            "label": "Text",
            "name": "text",
            "type": "string",
            "rows": 4,
            "placeholder": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...",
            "id": "plainText_0-input-text-string"
          },
          {
            "label": "Metadata",
            "name": "metadata",
            "type": "json",
            "optional": true,
            "additionalParams": true,
            "id": "plainText_0-input-metadata-json"
          }
        ],
        "inputAnchors": [
          {
            "label": "Text Splitter",
            "name": "textSplitter",
            "type": "TextSplitter",
            "optional": true,
            "id": "plainText_0-input-textSplitter-TextSplitter"
          }
        ],
        "inputs": {
          "text": "Welcome to Skyworld Hotel, where your dreams take flight and your stay soars to new heights. Nestled amidst breathtaking cityscape views, our upscale establishment offers an unparalleled blend of luxury and comfort. Our rooms are elegantly appointed, featuring modern amenities and plush furnishings to ensure your relaxation.\n\nIndulge in culinary delights at our rooftop restaurant, offering a gastronomic journey with panoramic vistas. Skyworld Hotel boasts state-of-the-art conference facilities, perfect for business travelers, and an inviting spa for relaxation seekers. Our attentive staff is dedicated to ensuring your every need is met, making your stay memorable.\n\nCentrally located, we offer easy access to local attractions, making us an ideal choice for both leisure and business travelers. Experience the world of hospitality like never before at Skyworld Hotel.",
          "textSplitter": "",
          "metadata": ""
        },
        "outputAnchors": [
          {
            "name": "output",
            "label": "Output",
            "type": "options",
            "options": [
              {
                "id": "plainText_0-output-document-Document|json",
                "name": "document",
                "label": "Document",
                "type": "Document | json"
              },
              {
                "id": "plainText_0-output-text-string|json",
                "name": "text",
                "label": "Text",
                "type": "string | json"
              }
            ],
            "default": "document"
          }
        ],
        "outputs": {
          "output": "text"
        },
        "selected": false
      },
      "selected": false,
      "positionAbsolute": {
        "x": -487.7511991135089,
        "y": 77.83838996645807
      },
      "dragging": false
    }
  ],
  "edges": [
    {
      "source": "bufferMemory_0",
      "sourceHandle": "bufferMemory_0-output-bufferMemory-BufferMemory|BaseChatMemory|BaseMemory",
      "target": "conversationChain_0",
      "targetHandle": "conversationChain_0-input-memory-BaseMemory",
      "type": "buttonedge",
      "id": "bufferMemory_0-bufferMemory_0-output-bufferMemory-BufferMemory|BaseChatMemory|BaseMemory-conversationChain_0-conversationChain_0-input-memory-BaseMemory"
    },
    {
      "source": "chatAnthropic_0",
      "sourceHandle": "chatAnthropic_0-output-chatAnthropic-ChatAnthropic|BaseChatModel|BaseLanguageModel|Runnable",
      "target": "conversationChain_0",
      "targetHandle": "conversationChain_0-input-model-BaseChatModel",
      "type": "buttonedge",
      "id": "chatAnthropic_0-chatAnthropic_0-output-chatAnthropic-ChatAnthropic|BaseChatModel|BaseLanguageModel|Runnable-conversationChain_0-conversationChain_0-input-model-BaseChatModel"
    },
    {
      "source": "plainText_0",
      "sourceHandle": "plainText_0-output-text-string|json",
      "target": "chatPromptTemplate_0",
      "targetHandle": "chatPromptTemplate_0-input-promptValues-json",
      "type": "buttonedge",
      "id": "plainText_0-plainText_0-output-text-string|json-chatPromptTemplate_0-chatPromptTemplate_0-input-promptValues-json"
    },
    {
      "source": "chatPromptTemplate_0",
      "sourceHandle": "chatPromptTemplate_0-output-chatPromptTemplate-ChatPromptTemplate|BaseChatPromptTemplate|BasePromptTemplate|Runnable",
      "target": "conversationChain_0",
      "targetHandle": "conversationChain_0-input-chatPromptTemplate-ChatPromptTemplate",
      "type": "buttonedge",
      "id": "chatPromptTemplate_0-chatPromptTemplate_0-output-chatPromptTemplate-ChatPromptTemplate|BaseChatPromptTemplate|BasePromptTemplate|Runnable-conversationChain_0-conversationChain_0-input-chatPromptTemplate-ChatPromptTemplate"
    }
  ]
}
            `
        }
        return ''
    }

    const getCodeWithAuthorization = (codeLang) => {
        if (codeLang === 'Python') {
            return `import requests

API_URL = "${baseURL}/api/v1/prediction/${dialogProps.chatflowid}"
headers = {"Authorization": "Bearer ${selectedApiKey?.apiKey}"}

def query(payload):
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.json()
    
output = query({
    "question": "Hey, how are you?",
})
`
        } else if (codeLang === 'JavaScript') {
            return `async function query(data) {
    const response = await fetch(
        "${baseURL}/api/v1/prediction/${dialogProps.chatflowid}",
        {
            headers: {
                Authorization: "Bearer ${selectedApiKey?.apiKey}",
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify(data)
        }
    );
    const result = await response.json();
    return result;
}

query({"question": "Hey, how are you?"}).then((response) => {
    console.log(response);
});
`
        } else if (codeLang === 'cURL') {
            return `curl ${baseURL}/api/v1/prediction/${dialogProps.chatflowid} \\
     -X POST \\
     -d '{"question": "Hey, how are you?"}' \\
     -H "Content-Type: application/json" \\
     -H "Authorization: Bearer ${selectedApiKey?.apiKey}"`
        }
        return ''
    }

    const getLang = (codeLang) => {
        if (codeLang === 'Python') {
            return 'python'
        } else if (codeLang === 'JavaScript') {
            return 'javascript'
        } else if (codeLang === 'cURL') {
            return 'bash'
        }
        return 'python'
    }

    const getSVG = (codeLang) => {
        if (codeLang === 'Python') {
            return pythonSVG
        } else if (codeLang === 'JavaScript') {
            return javascriptSVG
        } else if (codeLang === 'Embed') {
            return EmbedSVG
        } else if (codeLang === 'cURL') {
            return cURLSVG
        } else if (codeLang === 'Share Chatbot') {
            return ShareChatbotSVG
        } else if (codeLang === 'Configuration') {
            return settingsSVG
        } else if (codeLang === "json") {
            return jsonIcon
        }
        return pythonSVG
    }

    // ----------------------------CONFIG FORM DATA --------------------------//

    const getConfigCodeWithFormData = (codeLang, configData) => {
        if (codeLang === 'Python') {
            configData = unshiftFiles(configData)
            let fileType = configData[0].type
            if (fileType.includes(',')) fileType = fileType.split(',')[0]
            return `import requests

API_URL = "${baseURL}/api/v1/prediction/${dialogProps.chatflowid}"

# use form data to upload files
form_data = {
    "files": ${`('example${fileType}', open('example${fileType}', 'rb'))`}
}
body_data = {${getConfigExamplesForPython(configData, 'formData')}}

def query(form_data):
    response = requests.post(API_URL, files=form_data, data=body_data)
    return response.json()

output = query(form_data)
`
        } else if (codeLang === 'JavaScript') {
            return `// use FormData to upload files
let formData = new FormData();
${getConfigExamplesForJS(configData, 'formData')}
async function query(formData) {
    const response = await fetch(
        "${baseURL}/api/v1/prediction/${dialogProps.chatflowid}",
        {
            method: "POST",
            body: formData
        }
    );
    const result = await response.json();
    return result;
}

query(formData).then((response) => {
    console.log(response);
});
`
        } else if (codeLang === 'cURL') {
            return `curl ${baseURL}/api/v1/prediction/${dialogProps.chatflowid} \\
     -X POST \\${getConfigExamplesForCurl(configData, 'formData')} \\
     -H "Content-Type: multipart/form-data"`
        }
        return ''
    }

    // ----------------------------CONFIG FORM DATA with AUTH--------------------------//

    const getConfigCodeWithFormDataWithAuth = (codeLang, configData) => {
        if (codeLang === 'Python') {
            configData = unshiftFiles(configData)
            let fileType = configData[0].type
            if (fileType.includes(',')) fileType = fileType.split(',')[0]
            return `import requests

API_URL = "${baseURL}/api/v1/prediction/${dialogProps.chatflowid}"
headers = {"Authorization": "Bearer ${selectedApiKey?.apiKey}"}

# use form data to upload files
form_data = {
    "files": ${`('example${fileType}', open('example${fileType}', 'rb'))`}
}
body_data = {${getConfigExamplesForPython(configData, 'formData')}}

def query(form_data):
    response = requests.post(API_URL, headers=headers, files=form_data, data=body_data)
    return response.json()

output = query(form_data)
`
        } else if (codeLang === 'JavaScript') {
            return `// use FormData to upload files
let formData = new FormData();
${getConfigExamplesForJS(configData, 'formData')}
async function query(formData) {
    const response = await fetch(
        "${baseURL}/api/v1/prediction/${dialogProps.chatflowid}",
        {
            headers: { Authorization: "Bearer ${selectedApiKey?.apiKey}" },
            method: "POST",
            body: formData
        }
    );
    const result = await response.json();
    return result;
}

query(formData).then((response) => {
    console.log(response);
});
`
        } else if (codeLang === 'cURL') {
            return `curl ${baseURL}/api/v1/prediction/${dialogProps.chatflowid} \\
     -X POST \\${getConfigExamplesForCurl(configData, 'formData')} \\
     -H "Content-Type: multipart/form-data" \\
     -H "Authorization: Bearer ${selectedApiKey?.apiKey}"`
        }
        return ''
    }

    // ----------------------------CONFIG JSON--------------------------//

    const getConfigCode = (codeLang, configData) => {
        if (codeLang === 'Python') {
            return `import requests

API_URL = "${baseURL}/api/v1/prediction/${dialogProps.chatflowid}"

def query(payload):
    response = requests.post(API_URL, json=payload)
    return response.json()

output = query({
    "question": "Hey, how are you?",
    "overrideConfig": {${getConfigExamplesForPython(configData, 'json')}
    }
})
`
        } else if (codeLang === 'JavaScript') {
            return `async function query(data) {
    const response = await fetch(
        "${baseURL}/api/v1/prediction/${dialogProps.chatflowid}",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
    );
    const result = await response.json();
    return result;
}

query({
  "question": "Hey, how are you?",
  "overrideConfig": {${getConfigExamplesForJS(configData, 'json')}
  }
}).then((response) => {
    console.log(response);
});
`
        } else if (codeLang === 'cURL') {
            return `curl ${baseURL}/api/v1/prediction/${dialogProps.chatflowid} \\
     -X POST \\
     -d '{"question": "Hey, how are you?", "overrideConfig": {${getConfigExamplesForCurl(configData, 'json')}}' \\
     -H "Content-Type: application/json"`
        }
        return ''
    }

    // ----------------------------CONFIG JSON with AUTH--------------------------//

    const getConfigCodeWithAuthorization = (codeLang, configData) => {
        if (codeLang === 'Python') {
            return `import requests

API_URL = "${baseURL}/api/v1/prediction/${dialogProps.chatflowid}"
headers = {"Authorization": "Bearer ${selectedApiKey?.apiKey}"}

def query(payload):
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.json()

output = query({
    "question": "Hey, how are you?",
    "overrideConfig": {${getConfigExamplesForPython(configData, 'json')}
    }
})
`
        } else if (codeLang === 'JavaScript') {
            return `async function query(data) {
    const response = await fetch(
        "${baseURL}/api/v1/prediction/${dialogProps.chatflowid}",
        {
            headers: {
                Authorization: "Bearer ${selectedApiKey?.apiKey}",
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify(data)
        }
    );
    const result = await response.json();
    return result;
}

query({
  "question": "Hey, how are you?",
  "overrideConfig": {${getConfigExamplesForJS(configData, 'json')}
  }
}).then((response) => {
    console.log(response);
});
`
        } else if (codeLang === 'cURL') {
            return `curl ${baseURL}/api/v1/prediction/${dialogProps.chatflowid} \\
     -X POST \\
     -d '{"question": "Hey, how are you?", "overrideConfig": {${getConfigExamplesForCurl(configData, 'json')}}' \\
     -H "Content-Type: application/json" \\
     -H "Authorization: Bearer ${selectedApiKey?.apiKey}"`
        }
        return ''
    }

    const getMultiConfigCodeWithFormData = (codeLang) => {
        if (codeLang === 'Python') {
            return `# Specify multiple values for a config parameter by specifying the node id
body_data = {
    "openAIApiKey": {
        "chatOpenAI_0": "sk-my-openai-1st-key",
        "openAIEmbeddings_0": "sk-my-openai-2nd-key"
    }
}`
        } else if (codeLang === 'JavaScript') {
            return `// Specify multiple values for a config parameter by specifying the node id
formData.append("openAIApiKey[chatOpenAI_0]", "sk-my-openai-1st-key")
formData.append("openAIApiKey[openAIEmbeddings_0]", "sk-my-openai-2nd-key")`
        } else if (codeLang === 'cURL') {
            return `-F "openAIApiKey[chatOpenAI_0]=sk-my-openai-1st-key" \\
-F "openAIApiKey[openAIEmbeddings_0]=sk-my-openai-2nd-key" \\`
        }
    }

    const getMultiConfigCode = () => {
        return `{
    "overrideConfig": {
        "openAIApiKey": {
            "chatOpenAI_0": "sk-my-openai-1st-key",
            "openAIEmbeddings_0": "sk-my-openai-2nd-key"
        }
    }
}`
    }

    useEffect(() => {
        if (getAllAPIKeysApi.data) {
            const options = [
                {
                    label: 'No Authorization',
                    name: ''
                }
            ]
            for (const key of getAllAPIKeysApi.data) {
                options.push({
                    label: key.keyName,
                    name: key.id
                })
            }
            options.push({
                label: '- Add New Key -',
                name: 'addnewkey'
            })
            setKeyOptions(options)
            setAPIKeys(getAllAPIKeysApi.data)

            if (dialogProps.chatflowApiKeyId) {
                setChatflowApiKeyId(dialogProps.chatflowApiKeyId)
                setSelectedApiKey(getAllAPIKeysApi.data.find((key) => key.id === dialogProps.chatflowApiKeyId))
            }
        }
    }, [dialogProps, getAllAPIKeysApi.data])

    useEffect(() => {
        if (show) {
            getAllAPIKeysApi.request()
            getIsChatflowStreamingApi.request(dialogProps.chatflowid)
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show])

    const component = show ? (
        <Dialog
            open={show}
            fullWidth
            maxWidth='md'
            onClose={onCancel}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
        >
            <DialogTitle sx={{ fontSize: '1rem' }} id='alert-dialog-title'>
                {dialogProps.title}
            </DialogTitle>
            <DialogContent>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <div style={{ flex: 80 }}>
                        <Tabs value={value} onChange={handleChange} aria-label='tabs'>
                            {codes.map((codeLang, index) => (
                                <Tab
                                    icon={
                                        <img style={{ objectFit: 'cover', height: 15, width: 'auto' }} src={getSVG(codeLang)} alt='code' />
                                    }
                                    iconPosition='start'
                                    key={index}
                                    label={codeLang}
                                    {...a11yProps(index)}
                                ></Tab>
                            ))}
                        </Tabs>
                    </div>
                    <div style={{ flex: 20 }}>
                        <Dropdown
                            name='SelectKey'
                            disableClearable={true}
                            options={keyOptions}
                            onSelect={(newValue) => onApiKeySelected(newValue)}
                            value={dialogProps.chatflowApiKeyId ?? chatflowApiKeyId ?? 'Choose an API key'}
                        />
                    </div>
                </div>
                <div style={{ marginTop: 10 }}></div>
                {codes.map((codeLang, index) => (
                    <TabPanel key={index} value={value} index={index}>
                        {(codeLang === 'Embed' || codeLang === 'Share Chatbot') && chatflowApiKeyId && (
                            <>
                                <p>You cannot use API key while embedding/sharing chatbot.</p>
                                <p>
                                    Please select <b>&quot;No Authorization&quot;</b> from the dropdown at the top right corner.
                                </p>
                            </>
                        )}
                        {codeLang === 'Embed' && !chatflowApiKeyId && <EmbedChat chatflowid={dialogProps.chatflowid} />}
                        {codeLang !== 'Embed' && codeLang !== 'Share Chatbot' && codeLang !== 'Configuration' && (
                            <>
                                <CopyBlock
                                    theme={atomOneDark}
                                    text={chatflowApiKeyId ? getCodeWithAuthorization(codeLang) : getCode(codeLang)}
                                    language={getLang(codeLang)}
                                    showLineNumbers={false}
                                    wrapLines
                                />
                                <CheckboxInput label='Show Input Config' value={checkboxVal} onChange={onCheckBoxChanged} />
                                {checkboxVal && getConfigApi.data && getConfigApi.data.length > 0 && (
                                    <>
                                        {Object.keys(nodeConfig)
                                            .sort()
                                            .map((nodeLabel) => (
                                                <Accordion
                                                    expanded={nodeConfigExpanded[nodeLabel] || false}
                                                    onChange={handleAccordionChange(nodeLabel)}
                                                    key={nodeLabel}
                                                    disableGutters
                                                >
                                                    <AccordionSummary
                                                        expandIcon={<ExpandMoreIcon />}
                                                        aria-controls={`nodes-accordian-${nodeLabel}`}
                                                        id={`nodes-accordian-header-${nodeLabel}`}
                                                    >
                                                        <Stack flexDirection='row' sx={{ gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                                                            <Typography variant='h5'>{nodeLabel}</Typography>
                                                            {nodeConfig[nodeLabel].nodeIds.length > 0 &&
                                                                nodeConfig[nodeLabel].nodeIds.map((nodeId, index) => (
                                                                    <div
                                                                        key={index}
                                                                        style={{
                                                                            display: 'flex',
                                                                            flexDirection: 'row',
                                                                            width: 'max-content',
                                                                            borderRadius: 15,
                                                                            background: 'rgb(254,252,191)',
                                                                            padding: 5,
                                                                            paddingLeft: 10,
                                                                            paddingRight: 10
                                                                        }}
                                                                    >
                                                                        <span style={{ color: 'rgb(116,66,16)', fontSize: '0.825rem' }}>
                                                                            {nodeId}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                        </Stack>
                                                    </AccordionSummary>
                                                    <AccordionDetails>
                                                        <TableViewOnly
                                                            rows={nodeConfig[nodeLabel].params}
                                                            columns={Object.keys(nodeConfig[nodeLabel].params[0]).slice(-3)}
                                                        />
                                                    </AccordionDetails>
                                                </Accordion>
                                            ))}
                                        <CopyBlock
                                            theme={atomOneDark}
                                            text={
                                                chatflowApiKeyId
                                                    ? dialogProps.isFormDataRequired
                                                        ? getConfigCodeWithFormDataWithAuth(codeLang, getConfigApi.data)
                                                        : getConfigCodeWithAuthorization(codeLang, getConfigApi.data)
                                                    : dialogProps.isFormDataRequired
                                                        ? getConfigCodeWithFormData(codeLang, getConfigApi.data)
                                                        : getConfigCode(codeLang, getConfigApi.data)
                                            }
                                            language={getLang(codeLang)}
                                            showLineNumbers={false}
                                            wrapLines
                                        />
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                borderRadius: 10,
                                                background: '#d8f3dc',
                                                padding: 10,
                                                marginTop: 10,
                                                marginBottom: 10
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <IconBulb size={30} color='#2d6a4f' />
                                                <span style={{ color: '#2d6a4f', marginLeft: 10, fontWeight: 500 }}>
                                                    You can also specify multiple values for a config parameter by specifying the node id
                                                </span>
                                            </div>
                                            <div style={{ padding: 10 }}>
                                                <CopyBlock
                                                    theme={atomOneDark}
                                                    text={
                                                        dialogProps.isFormDataRequired
                                                            ? getMultiConfigCodeWithFormData(codeLang)
                                                            : getMultiConfigCode()
                                                    }
                                                    language={getLang(codeLang)}
                                                    showLineNumbers={false}
                                                    wrapLines
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                                {getIsChatflowStreamingApi.data?.isStreaming && (
                                    <p>
                                        Read&nbsp;
                                        <a rel='noreferrer' target='_blank' href='https://docs.flowiseai.com/using-flowise/streaming'>
                                            here
                                        </a>
                                        &nbsp;on how to stream response back to application
                                    </p>
                                )}
                            </>
                        )}
                        {codeLang === 'Share Chatbot' && !chatflowApiKeyId && (
                            <ShareChatbot isSessionMemory={dialogProps.isSessionMemory} isAgentCanvas={dialogProps.isAgentCanvas} />
                        )}
                    </TabPanel>
                ))}
            </DialogContent>
        </Dialog>
    ) : null

    return createPortal(component, portalElement)
}

CodeViewDialog.propTypes = {
    show: PropTypes.bool,
    dialogProps: PropTypes.object,
    onCancel: PropTypes.func
}

export default CodeViewDialog
