import PropTypes from 'prop-types'
import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// material-ui
import { Popper } from '@mui/material'
import { useTheme } from '@mui/material/styles'

// third-party

// project imports
import { StyledFab } from '@/ui-component/button/StyledFab'

// icons
import { IconPlayerPlay } from '@tabler/icons-react'

// const
import { SET_COMPONENT_NODES } from '@/store/actions'
import { useReactFlow } from 'reactflow'

// ==============================|| ADD NODES||============================== //
function a11yProps(index) {
    return {
        id: `attachment-tab-${index}`,
        'aria-controls': `attachment-tabpanel-${index}`
    }
}

const blacklistCategoriesForAgentCanvas = ['Agents', 'Memory', 'Record Manager']
const allowedAgentModel = {}

const output = [
    {
        id: 'promptTemplate_0',
        output: 'Hey what are you looking for?',
    },
    {
        id: 'RouteLayer_0',
        output: 'tester',
    },
    {
        id: 'devDepartment_4',
        output: 'I am a developer',
    }
]

const RunWorkflow = ({ nodesData, node, isAgentCanvas }) => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    const dispatch = useDispatch()
    const reactFlow = useReactFlow()
    const outputStep = useRef(0)

    const [searchValue, setSearchValue] = useState('')
    const [nodes, setNodes] = useState({})
    const [isRunning, setIsRunning] = useState(false)
    const [categoryExpanded, setCategoryExpanded] = useState({})
    const [tabValue, setTabValue] = useState(0)

    const anchorRef = useRef(null)
    const prevOpen = useRef(isRunning)
    const ps = useRef()

    // Temporary method to handle Deprecating Vector Store and New ones
    const categorizeVectorStores = (nodes, accordianCategories, isFilter) => {
        const obj = { ...nodes }
        const vsNodes = obj['Vector Stores'] ?? []
        const deprecatingNodes = []
        const newNodes = []
        for (const vsNode of vsNodes) {
            if (vsNode.badge === 'DEPRECATING') deprecatingNodes.push(vsNode)
            else newNodes.push(vsNode)
        }
        delete obj['Vector Stores']
        if (deprecatingNodes.length) {
            obj['Vector Stores;DEPRECATING'] = deprecatingNodes
            accordianCategories['Vector Stores;DEPRECATING'] = isFilter ? true : false
        }
        if (newNodes.length) {
            obj['Vector Stores;NEW'] = newNodes
            accordianCategories['Vector Stores;NEW'] = isFilter ? true : false
        }
        setNodes(obj)
    }

    const scrollTop = () => {
        const curr = ps.current
        if (curr) {
            curr.scrollTop = 0
        }
    }

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue)
        filterSearch(searchValue, newValue)
    }

    const getSearchedNodes = (value) => {
        if (isAgentCanvas) {
            const nodes = nodesData.filter((nd) => !blacklistCategoriesForAgentCanvas.includes(nd.category))
            const passed = nodes.filter((nd) => {
                const passesQuery = nd.name.toLowerCase().includes(value.toLowerCase())
                const passesCategory = nd.category.toLowerCase().includes(value.toLowerCase())
                return passesQuery || passesCategory
            })
            return passed
        }
        const nodes = nodesData.filter((nd) => nd.category !== 'Multi Agents')
        const passed = nodes.filter((nd) => {
            const passesQuery = nd.name.toLowerCase().includes(value.toLowerCase())
            const passesCategory = nd.category.toLowerCase().includes(value.toLowerCase())
            return passesQuery || passesCategory
        })
        return passed
    }

    const filterSearch = (value, newTabValue) => {
        setSearchValue(value)
        setTimeout(() => {
            if (value) {
                const returnData = getSearchedNodes(value)
                groupByCategory(returnData, newTabValue ?? tabValue, true)
                scrollTop()
            } else if (value === '') {
                groupByCategory(nodesData, newTabValue ?? tabValue)
                scrollTop()
            }
        }, 500)
    }

    const groupByTags = (nodes, newTabValue = 0) => {
        const langchainNodes = nodes.filter((nd) => !nd.tags)
        const llmaindexNodes = nodes.filter((nd) => nd.tags && nd.tags.includes('LlamaIndex'))
        if (newTabValue === 0) {
            return langchainNodes
        } else {
            return llmaindexNodes
        }
    }

    const groupByCategory = (nodes, newTabValue, isFilter) => {
        if (isAgentCanvas) {
            const accordianCategories = {}
            const result = nodes.reduce(function(r, a) {
                r[a.category] = r[a.category] || []
                r[a.category].push(a)
                accordianCategories[a.category] = isFilter ? true : false
                return r
            }, Object.create(null))

            const filteredResult = {}
            for (const category in result) {
                // Filter out blacklisted categories
                if (!blacklistCategoriesForAgentCanvas.includes(category)) {
                    // Filter out LlamaIndex nodes
                    const nodes = result[category].filter((nd) => !nd.tags || !nd.tags.includes('LlamaIndex'))
                    if (!nodes.length) continue

                    // Only allow specific models for specific categories
                    if (Object.keys(allowedAgentModel).includes(category)) {
                        const allowedModels = allowedAgentModel[category]
                        filteredResult[category] = nodes.filter((nd) => allowedModels.includes(nd.name))
                    } else {
                        filteredResult[category] = nodes
                    }
                }
            }
            setNodes(filteredResult)
            categorizeVectorStores(filteredResult, accordianCategories, isFilter)
            accordianCategories['Multi Agents'] = true
            setCategoryExpanded(accordianCategories)
        } else {
            const taggedNodes = groupByTags(nodes, newTabValue)
            const accordianCategories = {}
            const result = taggedNodes.reduce(function(r, a) {
                r[a.category] = r[a.category] || []
                r[a.category].push(a)
                accordianCategories[a.category] = isFilter ? true : false
                return r
            }, Object.create(null))

            const filteredResult = {}
            for (const category in result) {
                if (category === 'Multi Agents') {
                    continue
                }
                filteredResult[category] = result[category]
            }
            setNodes(filteredResult)
            categorizeVectorStores(filteredResult, accordianCategories, isFilter)
            setCategoryExpanded(accordianCategories)
        }
    }

    const handleAccordionChange = (category) => (event, isExpanded) => {
        const accordianCategories = { ...categoryExpanded }
        accordianCategories[category] = isExpanded
        setCategoryExpanded(accordianCategories)
    }

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return
        }
        setIsRunning(false)
    }

    const handleRun = () => {
        // reactFlow.setNodes((n) => {
        //     return n.map((node, id) => {
        //         if (id == 0) return { ...node, selected: true, data: { ...node.data, label: "kut", log: "hi ", current: true } }
        //         else return node
        //     })
        // })
        // reactFlow.setEdges(e => {
        //     return e.map(edge => {
        //         return { ...edge, animated: true }
        //     })
        // })

        const id = setInterval(() => {
            reactFlow.setNodes((nodes) => {
                return nodes.map((node) => {
                    if (output[outputStep.current].id === node.id) {
                        return { ...node, data: { ...node.data, current: true, log: output[outputStep.current].output } }
                    }
                    else if (node.data.current) {
                        return { ...node, data: { ...node.data, current: false } }
                    } else {
                        return node
                    }
                })
            })
            // reactFlow.setEdges((edges) => {
            //     const targetNode = output[outputStep.current].id
            //     return edges.map((edge) => {
            //         if (edge.)
            //     })
            // })
            outputStep.current = (outputStep.current + 1) % output.length
        }, 2 * 1000)
    }

    const onDragStart = (event, node) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify(node))
        event.dataTransfer.effectAllowed = 'move'
    }

    useEffect(() => {
        if (prevOpen.current === true && isRunning === false) {
            anchorRef.current.focus()
        }

        prevOpen.current = isRunning
    }, [isRunning])

    useEffect(() => {
        if (node) setIsRunning(false)
    }, [node])

    useEffect(() => {
        if (nodesData) {
            groupByCategory(nodesData)
            dispatch({ type: SET_COMPONENT_NODES, componentNodes: nodesData })
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nodesData, dispatch])

    return (
        <>
            <StyledFab
                sx={{ position: 'absolute', right: 70, top: 20 }}
                ref={anchorRef}
                size='small'
                color='primary'
                aria-label='add'
                title='Run workflow'
                onClick={handleRun}
            >
                <IconPlayerPlay />
            </StyledFab>
            <Popper
                placement='bottom-end'
                open={isRunning}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
                popperOptions={{
                    modifiers: [
                        {
                            name: 'offset',
                            options: {
                                offset: [-40, 14]
                            }
                        }
                    ]
                }}
                sx={{ zIndex: 1000 }}
            ></Popper>
        </>
    )
}

RunWorkflow.propTypes = {
    nodesData: PropTypes.array,
    node: PropTypes.object,
    isAgentCanvas: PropTypes.bool
}

export default RunWorkflow
