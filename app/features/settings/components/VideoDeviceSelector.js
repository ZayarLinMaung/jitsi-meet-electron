import React, { Component } from 'react';
import styled from 'styled-components';

const Container = styled.div`
    margin: 20px 0;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 8px;
    color: #172B4D;
    font-weight: 500;
`;

const Select = styled.select`
    width: 100%;
    padding: 8px;
    border: 1px solid #DFE1E6;
    border-radius: 3px;
    background-color: white;
    font-size: 14px;
    color: #172B4D;
    
    &:focus {
        outline: none;
        border-color: #4C9AFF;
        box-shadow: 0 0 0 2px rgba(76, 154, 255, 0.2);
    }
`;

const ErrorMessage = styled.div`
    color: #DE350B;
    margin-top: 8px;
    font-size: 12px;
`;

const InfoMessage = styled.div`
    color: #172B4D;
    margin-top: 8px;
    font-size: 12px;
`;

/**
 * Component for selecting video input devices including PCIe capture cards.
 */
class VideoDeviceSelector extends Component {
    constructor(props) {
        super(props);

        this.state = {
            devices: [],
            selectedDevice: null,
            error: null,
            isLoading: true
        };
    }

    componentDidMount() {
        this._enumerateDevices();
    }

    async _enumerateDevices() {
        try {
            // First check if mediaDevices API is available
            if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
                throw new Error('Media devices API not supported in this browser');
            }

            // Request permissions first to ensure we can access device labels
            try {
                await navigator.mediaDevices.getUserMedia({ video: true });
            } catch (permError) {
                console.warn('Permission error:', permError);
                // Continue anyway as we might still get device IDs
            }

            const devices = await navigator.mediaDevices.enumerateDevices();
            
            // Add v4l2 devices with proper error handling
            const v4l2Devices = [];
            try {
                // Try to detect v4l2 devices
                for (let i = 1; i <= 4; i++) {
                    const deviceId = `/dev/video${i}`;
                    try {
                        // Try to get device capabilities
                        const stream = await navigator.mediaDevices.getUserMedia({
                            video: {
                                deviceId: { exact: deviceId }
                            }
                        });
                        // If successful, add the device
                        v4l2Devices.push({
                            deviceId,
                            label: `V4L2 Capture Card ${i}`,
                            stream
                        });
                        // Stop the test stream
                        stream.getTracks().forEach(track => track.stop());
                    } catch (deviceError) {
                        console.warn(`V4L2 device ${deviceId} not available:`, deviceError);
                        // Continue to next device
                    }
                }
            } catch (v4l2Error) {
                console.warn('Error detecting V4L2 devices:', v4l2Error);
            }

            // Combine regular video devices with v4l2 devices
            const videoDevices = [
                ...devices
                    .filter(device => device.kind === 'videoinput')
                    .map(device => ({
                        label: device.label || `Camera ${device.deviceId.slice(0, 5)}`,
                        value: device.deviceId
                    })),
                ...v4l2Devices.map(device => ({
                    label: device.label,
                    value: device.deviceId
                }))
            ];

            if (videoDevices.length === 0) {
                this.setState({
                    devices: [],
                    selectedDevice: null,
                    error: 'No video input devices found',
                    isLoading: false
                });
                return;
            }

            this.setState({ 
                devices: videoDevices,
                selectedDevice: this.props.currentDeviceId || (videoDevices[0]?.value || null),
                error: null,
                isLoading: false
            });
        } catch (error) {
            console.error('Error enumerating devices:', error);
            this.setState({ 
                devices: [],
                selectedDevice: null,
                error: 'Failed to get video devices. Please check your permissions and device connections.',
                isLoading: false
            });
        }
    }

    _onDeviceChange = (event) => {
        const deviceId = event.currentTarget.value;
        this.setState({ selectedDevice: deviceId });
        if (this.props.onDeviceSelect) {
            try {
                this.props.onDeviceSelect(deviceId);
            } catch (error) {
                console.error('Error selecting device:', error);
                this.setState({
                    error: 'Failed to select device. Please try another device.'
                });
            }
        }
    }

    render() {
        const { devices, selectedDevice, error, isLoading } = this.state;

        if (isLoading) {
            return (
                <Container>
                    <Label>Video Input Device</Label>
                    <InfoMessage>Loading available devices...</InfoMessage>
                </Container>
            );
        }

        if (error) {
            return (
                <Container>
                    <Label>Video Input Device</Label>
                    <ErrorMessage>{error}</ErrorMessage>
                </Container>
            );
        }

        if (devices.length === 0) {
            return (
                <Container>
                    <Label>Video Input Device</Label>
                    <InfoMessage>No video devices found. Please connect a camera or capture card.</InfoMessage>
                </Container>
            );
        }

        return (
            <Container>
                <Label>Video Input Device</Label>
                <Select
                    value={selectedDevice || ''}
                    onChange={this._onDeviceChange}
                >
                    <option value="">Select a video device...</option>
                    {devices.map(device => (
                        <option key={device.value} value={device.value}>
                            {device.label}
                        </option>
                    ))}
                </Select>
            </Container>
        );
    }
}

export default VideoDeviceSelector; 