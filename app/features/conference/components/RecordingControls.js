// @flow

import React, { Component } from 'react';
import styled from 'styled-components';

const RecordingContainer = styled.div`
    position: fixed;
    top: 20px;
    left: 20px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 15px 20px;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 15px;
    min-width: 250px;
`;

const RecordingButton = styled.button`
    background: ${props => props.isRecording ? '#ff4444' : '#28a745'};
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
    font-size: 14px;
    transition: all 0.2s ease;
    
    &:hover {
        opacity: 0.8;
        transform: translateY(-1px);
    }
    
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }
`;

const RecordingStatus = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
`;

const RecordingIndicator = styled.div`
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${props => props.isRecording ? '#ff4444' : '#666'};
    animation: ${props => props.isRecording ? 'pulse 1.5s infinite' : 'none'};
    
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
    }
`;

type Props = {
    /**
     * Jitsi Meet API instance
     */
    api?: Object;
};

type State = {
    /**
     * Whether recording is currently active
     */
    isRecording: boolean;
    
    /**
     * Recording start time
     */
    startTime: ?Date;
    
    /**
     * Any error message
     */
    error: ?string;
    
    /**
     * Loading state
     */
    isLoading: boolean;
    
    /**
     * Screen recording stream
     */
    screenStream: ?MediaStream;
    
    /**
     * Media recorder for screen recording
     */
    mediaRecorder: ?MediaRecorder;
    
    /**
     * Recorded chunks for screen recording
     */
    recordedChunks: Array<Blob>;
};

/**
 * Recording controls component for Jitsi Meet conferences.
 */
class RecordingControls extends Component<Props, State> {
    /**
     * Timer for recording duration display
     */
    _durationTimer: ?IntervalID;

    /**
     * Initializes a new RecordingControls instance.
     */
    constructor(props: Props) {
        super(props);

        this.state = {
            isRecording: false,
            startTime: null,
            error: null,
            isLoading: false,
            screenStream: null,
            mediaRecorder: null,
            recordedChunks: []
        };

        this._onStartRecording = this._onStartRecording.bind(this);
        this._onStopRecording = this._onStopRecording.bind(this);
        this._formatDuration = this._formatDuration.bind(this);
        this._startScreenRecording = this._startScreenRecording.bind(this);
        this._stopScreenRecording = this._stopScreenRecording.bind(this);
    }

    /**
     * Component will unmount lifecycle method.
     */
    componentWillUnmount() {
        if (this._durationTimer) {
            clearInterval(this._durationTimer);
        }
        
        // Clean up screen recording
        if (this.state.screenStream) {
            this.state.screenStream.getTracks().forEach(track => track.stop());
        }
    }

    /**
     * Starts recording.
     */
    async _onStartRecording() {
        if (this.state.isLoading) {
            return;
        }

        console.log('🔴 Record button clicked - setting loading state');
        
        this.setState({ 
            isLoading: true, 
            error: null 
        });

        try {
            await this._startScreenRecording();
        } catch (error) {
            console.log('🚫 Error caught in _onStartRecording:', error);
            // Additional safety net - ensure state is reset
            this.setState({
                isRecording: false,
                startTime: null,
                isLoading: false,
                error: null,
                screenStream: null,
                mediaRecorder: null,
                recordedChunks: []
            });
        }
    }

    /**
     * Starts screen recording using browser API.
     */
    async _startScreenRecording() {
        try {
            console.log('📺 Starting screen recording...');
            
            // Request screen capture
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    mediaSource: 'screen',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    frameRate: { ideal: 30 }
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            });

            console.log('✅ Screen stream obtained successfully');

            // Create media recorder
            const mediaRecorder = new MediaRecorder(screenStream, {
                mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
                    ? 'video/webm;codecs=vp9' 
                    : 'video/webm'
            });

            const recordedChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                console.log('Screen recording stopped');
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                
                // Create download link
                const a = document.createElement('a');
                a.href = url;
                a.download = `medcom-meeting-${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.webm`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                // Clean up
                screenStream.getTracks().forEach(track => track.stop());
                this.setState({
                    screenStream: null,
                    mediaRecorder: null,
                    recordedChunks: []
                });
            };

            // Start recording
            mediaRecorder.start(1000); // Record in 1-second chunks

            this.setState({
                isRecording: true,
                startTime: new Date(),
                error: null,
                isLoading: false,
                screenStream,
                mediaRecorder,
                recordedChunks
            });

            // Start duration timer
            this._durationTimer = setInterval(() => {
                this.forceUpdate();
            }, 1000);

            console.log('🎬 Screen recording started successfully');

        } catch (error) {
            console.log('❌ Error in _startScreenRecording:', error.name, error.message);
            
            // Reset all states when user cancels or error occurs
            this.setState({
                isRecording: false,
                startTime: null,
                isLoading: false,
                error: error.name === 'NotAllowedError' || error.name === 'AbortError' 
                    ? null  // Don't show error for user cancellation
                    : 'Screen recording failed: ' + (error.message || 'Permission denied or not supported'),
                screenStream: null,
                mediaRecorder: null,
                recordedChunks: []
            });
            
            // Clean up timer if it was started
            if (this._durationTimer) {
                clearInterval(this._durationTimer);
                this._durationTimer = null;
            }
            
            console.log('🔄 State reset after error/cancellation');
            
            // Re-throw error so parent can catch it too if needed
            throw error;
        }
    }

    /**
     * Stops screen recording.
     */
    _stopScreenRecording() {
        if (this.state.mediaRecorder && this.state.mediaRecorder.state === 'recording') {
            this.state.mediaRecorder.stop();
        }

        this.setState({
            isRecording: false,
            startTime: null,
            isLoading: false
        });

        if (this._durationTimer) {
            clearInterval(this._durationTimer);
            this._durationTimer = null;
        }
    }

    /**
     * Stops recording.
     */
    _onStopRecording() {
        if (this.state.isLoading) {
            return;
        }

        this.setState({ 
            isLoading: true, 
            error: null 
        });

        this._stopScreenRecording();
    }

    /**
     * Formats recording duration.
     */
    _formatDuration(): string {
        if (!this.state.startTime) {
            return '00:00';
        }

        const now = new Date();
        const duration = Math.floor((now - this.state.startTime) / 1000);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;

        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Render function.
     */
    render() {
        const { api } = this.props;
        const { isRecording, error, isLoading } = this.state;

        // Don't show controls if API is not available
        if (!api) {
            return null;
        }

        return (
            <RecordingContainer>
                <RecordingStatus>
                    <RecordingIndicator isRecording={isRecording} />
                    {isRecording ? (
                        <span>Recording: {this._formatDuration()}</span>
                    ) : (
                        <span>Ready to Record</span>
                    )}
                </RecordingStatus>

                <RecordingButton
                    isRecording={isRecording}
                    onClick={isRecording ? this._onStopRecording : this._onStartRecording}
                    disabled={isLoading}
                >
                    {isLoading ? '...' : (isRecording ? '⏹️ Stop' : '🔴 Record')}
                </RecordingButton>

                {error && (
                    <div style={{ 
                        position: 'absolute', 
                        top: '100%', 
                        left: 0, 
                        right: 0, 
                        background: '#ff4444', 
                        padding: '8px', 
                        borderRadius: '4px', 
                        fontSize: '12px', 
                        marginTop: '5px',
                        maxWidth: '250px'
                    }}>
                        {error}
                    </div>
                )}
            </RecordingContainer>
        );
    }
}

export default RecordingControls;