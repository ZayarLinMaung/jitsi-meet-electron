// @flow

import React, { Component } from 'react';
import jsQR from 'jsqr';
import styled from 'styled-components';
import Button from '@atlaskit/button';

const ScannerContainer = styled.div`
    position: relative;
    width: 600px;
    height: 600px;
    border: 2px solid #0052CC;
    border-radius: 12px;
    overflow: hidden;
    margin: 20px auto;
    background: #000;
`;

// Fix: Forward ref for styled video
const Video = React.forwardRef((props, ref) => (
    <video ref={ref} {...props} />
));

const Overlay = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 500px;
    height: 500px;
    border: 2px solid #36B37E;
    border-radius: 12px;
    pointer-events: none;
    z-index: 2;
`;

const DebugInfo = styled.div`
    position: absolute;
    top: 5px;
    left: 5px;
    background: rgba(0,0,0,0.7);
    color: white;
    padding: 5px;
    font-size: 10px;
    border-radius: 3px;
    z-index: 3;
    display: none; /* Hidden for minimal UI */
`;

const Controls = styled.div`
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 16px;
`;

const StatusText = styled.p`
    text-align: center;
    color: #172B4D;
    margin: 12px 0;
    font-size: 14px;
`;

/**
 * QR Scanner Component for scanning meeting URLs.
 */
export default class QRScanner extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isScanning: false,
            hasPermission: null,
            error: null,
            stream: null,
            videoStatus: 'initializing'
        };
        this.videoRef = React.createRef();
        this.canvasRef = React.createRef();
        this.scanInterval = null;
        this._loggedFirstScan = false;
        this._scanCount = 0;
    }

    /**
     * Start the QR scanner when component mounts.
     */
    componentDidMount() {
        // Use setTimeout to ensure component is fully mounted
        setTimeout(() => {
            this._requestCameraPermission();
        }, 200);
    }

    /**
     * Clean up scanner when component unmounts.
     */
    componentWillUnmount() {
        this._stopScanning();
        this._stopStream();
    }

    /**
     * Request camera permission first.
     */
    _requestCameraPermission = async () => {
        try {
            console.log('Requesting camera permission...');
            
            // First check if getUserMedia is available
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera API not available');
            }

            // List available devices first
            const devices = await navigator.mediaDevices.enumerateDevices();
            console.log('Available devices:', devices);

            // Request camera access with minimal constraints
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: {
                    width: 640,
                    height: 480
                }
            });

            console.log('Camera permission granted, stream:', stream);
            console.log('Video tracks:', stream.getVideoTracks());
            
            this.setState({ 
                hasPermission: true, 
                error: null,
                stream,
                videoStatus: 'stream-ready'
            });

            // Initialize scanner immediately after getting stream
            this._initializeScanner();

        } catch (error) {
            console.error('Camera permission error:', error);
            let errorMessage = 'Camera access denied or not available';
            
            if (error.name === 'NotAllowedError') {
                errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.';
            } else if (error.name === 'NotFoundError') {
                errorMessage = 'No webcam found on this device.';
            } else if (error.name === 'NotSupportedError') {
                errorMessage = 'Camera not supported on this browser.';
            }

            this.setState({ 
                hasPermission: false,
                error: errorMessage
            });
        }
    };

    /**
     * Initialize the QR scanner.
     */
    _initializeScanner = async () => {
        try {
            console.log('Starting QR scanner initialization...');
            
            const video = this.videoRef.current;
            if (!video) {
                this.setState({ error: 'Video element not found' });
                return;
            }

            if (!this.state.stream) {
                this.setState({ error: 'Camera stream not available' });
                return;
            }

            console.log('Setting up video stream...');
            
            // Set up video stream
            video.srcObject = this.state.stream;
            video.muted = true;
            video.autoplay = true;
            video.playsInline = true;

            // Try to play the video
            try {
                await video.play();
                console.log('✅ Video is playing!');
                
                this.setState({ 
                    isScanning: true,
                    error: null,
                    videoStatus: 'init-complete'
                });
                
                this._startScanningLoop();
            } catch (playError) {
                console.error('Error playing video:', playError);
                this.setState({ 
                    error: 'Failed to start video stream: ' + playError.message
                });
            }
            
        } catch (error) {
            console.error('Error in scanner initialization:', error);
            this.setState({ 
                error: 'Failed to initialize QR scanner: ' + error.message
            });
        }
    };

    /**
     * Start the scanning loop.
     */
    _startScanningLoop = () => {
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
        }

        this.scanInterval = setInterval(() => {
            this._scanQRCode();
        }, 100);
    };

    /**
     * Scan for QR code in the video stream.
     */
    _scanQRCode = () => {
        const video = this.videoRef.current;
        const canvas = this.canvasRef.current;

        if (!video || !canvas || !this.state.isScanning) {
            return;
        }

        const context = canvas.getContext('2d');
        if (!context) {
            return;
        }

        try {
            // Draw video frame to canvas
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Get image data for QR detection
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            
            // Scan for QR code
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code) {
                if (!this._loggedFirstScan) {
                    console.log('First QR code detected:', code.data);
                    this._loggedFirstScan = true;
                }
                
                this._scanCount++;
                if (this._scanCount >= 3) { // Require 3 successful scans
                    this._stopScanning();
                    this._stopStream();
                    this.props.onScanSuccess(code.data);
                }
            }
        } catch (error) {
            console.error('Error scanning QR code:', error);
            // Don't update state to avoid re-renders
        }
    };

    /**
     * Stop the scanning loop.
     */
    _stopScanning = () => {
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
            this.scanInterval = null;
        }
        this.setState({ isScanning: false });
    };

    /**
     * Stop the video stream.
     */
    _stopStream = () => {
        if (this.state.stream) {
            this.state.stream.getTracks().forEach(track => {
                try {
                    track.stop();
                } catch (error) {
                    console.warn('Error stopping track:', error);
                }
            });
            this.setState({ stream: null });
        }
    };

    /**
     * Render the QR scanner component.
     */
    render() {
        const { error, videoStatus } = this.state;

        return (
            <div>
                <ScannerContainer>
                    <Video
                        ref={this.videoRef}
                        playsInline
                        autoPlay
                        muted
                        onLoadedMetadata={() => {
                            console.log('Video metadata loaded');
                            const video = this.videoRef.current;
                            if (video) {
                                console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);
                            }
                        }}
                        onError={(e) => {
                            console.error('Video error:', e);
                            this.setState({ 
                                error: 'Failed to initialize video: ' + e.message
                            });
                        }}
                        style={{ 
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            backgroundColor: '#000'
                        }}
                    />
                    <Overlay />
                    <canvas
                        ref={this.canvasRef}
                        style={{ display: 'none' }}
                    />
                    <DebugInfo>
                        Status: {videoStatus}
                    </DebugInfo>
                </ScannerContainer>
                
                {error && (
                    <StatusText style={{ color: '#DE350B' }}>
                        {error}
                    </StatusText>
                )}
                
                <Controls>
                    <Button
                        appearance="primary"
                        onClick={this.props.onClose}
                    >
                        Close Scanner
                    </Button>
                </Controls>
            </div>
        );
    }
} 