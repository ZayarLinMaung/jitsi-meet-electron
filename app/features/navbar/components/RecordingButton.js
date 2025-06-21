// @flow

import React, { Component } from 'react';
import styled from 'styled-components';

const RecordingToggle = styled.button`
    background: ${props => props.isRecording ? '#ff4444' : 'transparent'};
    color: ${props => props.isRecording ? 'white' : '#333'};
    border: 2px solid ${props => props.isRecording ? '#ff4444' : '#ddd'};
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease;
    margin-left: auto;
    margin-right: 20px;
    
    &:hover {
        background: ${props => props.isRecording ? '#cc3333' : '#f5f5f5'};
        transform: translateY(-1px);
    }
    
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }
`;

const RecordingIndicator = styled.span`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.isRecording ? '#fff' : '#ff4444'};
    animation: ${props => props.isRecording ? 'pulse 1s infinite' : 'none'};
    
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.6; }
        100% { opacity: 1; }
    }
`;

type Props = {
    /**
     * Callback when recording state should change
     */
    onToggleRecording?: () => void;
    
    /**
     * Current recording state
     */
    isRecording?: boolean;
    
    /**
     * Whether the button is disabled
     */
    disabled?: boolean;
};

/**
 * Recording toggle button for navbar.
 */
class RecordingButton extends Component<Props> {
    /**
     * Render function.
     */
    render() {
        const { onToggleRecording, isRecording = false, disabled = false } = this.props;
        
        return (
            <RecordingToggle
                isRecording={isRecording}
                onClick={onToggleRecording}
                disabled={disabled}
                title={isRecording ? 'Stop Recording' : 'Start Recording'}
            >
                <RecordingIndicator isRecording={isRecording} />
                {isRecording ? 'Recording' : 'Record'}
            </RecordingToggle>
        );
    }
}

export default RecordingButton; 