import PropTypes from 'prop-types'
import { useContext, useEffect, useRef, useState } from 'react'
import { Handle, Position, useUpdateNodeInternals } from 'reactflow'

// material-ui
import { flowContext } from '@/store/context/ReactFlowContext'
import { isValidConnection } from '@/utils/genericHelper'
import { Box, Tooltip, Typography } from '@mui/material'
import { styled, useTheme } from '@mui/material/styles'
import { tooltipClasses } from '@mui/material/Tooltip'

const CustomWidthTooltip = styled(({ className, ...props }) => <Tooltip {...props} classes={{ popper: className }} />)({
    [`& .${tooltipClasses.tooltip}`]: {
        maxWidth: 500
    }
})

// ===========================|| NodeOutputHandler ||=========================== //

const NodeSpecialOutputHandler = ({ output, data, disabled = false }) => {
    const theme = useTheme()
    const ref = useRef(null)
    const updateNodeInternals = useUpdateNodeInternals()
    const [position, setPosition] = useState(0)
    const [dropdownValue, setDropdownValue] = useState(null)
    const { reactFlowInstance } = useContext(flowContext)

    useEffect(() => {
        if (ref.current && ref.current?.offsetTop && ref.current?.clientHeight) {
            setTimeout(() => {
                setPosition(ref.current?.offsetTop + ref.current?.clientHeight / 2)
                updateNodeInternals(data.id)
            }, 0)
        }
    }, [data.id, ref, updateNodeInternals])

    useEffect(() => {
        setTimeout(() => {
            updateNodeInternals(data.id)
        }, 0)
    }, [data.id, position, updateNodeInternals])

    useEffect(() => {
        if (dropdownValue) {
            setTimeout(() => {
                updateNodeInternals(data.id)
            }, 0)
        }
    }, [data.id, dropdownValue, updateNodeInternals])

    return (
        <div ref={ref}>
            <>
                <CustomWidthTooltip placement='right' title={output.type}>
                    <Handle
                        type='source'
                        position={Position.Right}
                        key={output.id}
                        id={output.id}
                        isValidConnection={(connection) => isValidConnection(connection, reactFlowInstance)}
                        style={{
                            height: 10,
                            width: 10,
                            backgroundColor: data.selected ? theme.palette.primary.main : theme.palette.text.secondary,
                            top: position
                        }}
                    />
                </CustomWidthTooltip>
                <Box sx={{ p: 2, textAlign: 'end' }}>
                    <Typography>{output.label}</Typography>
                </Box>
            </>
        </div>
    )
}

NodeSpecialOutputHandler.propTypes = {
    output: PropTypes.object,
    data: PropTypes.object,
    disabled: PropTypes.bool
}

export default NodeSpecialOutputHandler
