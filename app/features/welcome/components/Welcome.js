// @flow

import Page from '@atlaskit/page';
import { AtlasKitThemeProvider } from '@atlaskit/theme';

import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import type { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { createConferenceObjectFromURL } from '../../utils';
import LogoSVG from '../../../images/medcomvision-removebg-preview.png';
import QRScanner from './QRScanner';

import { Body, Header, Wrapper } from '../styled';

type Props = {

    /**
     * Redux dispatch.
     */
    dispatch: Dispatch<*>;

    /**
     * React Router location object.
     */
    location: Object;

    /**
     * I18next translate function.
     */
     t: Function;
};

type State = {
    /**
     * URL of the room to join.
     * If this is not a url it will be treated as room name for default domain.
     */
    url: string;
};

/**
 * Welcome Component.
 */
class Welcome extends Component<Props, State> {
    /**
     * Initializes a new {@code Welcome} instance.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);

        // Initialize url value in state if passed using location state object.
        let url = '';

        // Check and parse url if exists in location state.
        if (props.location.state) {
            const { room, serverURL } = props.location.state;

            if (room && serverURL) {
                url = `${serverURL}/${room}`;
            }
        }

        this.state = {
            url
        };

        // Bind event handlers - only keeping what we need for QR scanning
        this._onQRScanSuccess = this._onQRScanSuccess.bind(this);
    }

    /**
     * Start Onboarding once component is mounted.
     *
     * NOTE: It automatically checks if the onboarding is shown or not.
     *
     * @returns {void}
     */
    componentDidMount() {
        // Removed onboarding initialization
    }

    /**
     * Stop all timers when unmounting.
     *
     * @returns {void}
     */
    componentWillUnmount() {
        // No longer need to clear timeouts since we removed room name generation
    }

    /**
     * Render function of component.
     *
     * @returns {ReactElement}
     */
    render() {
        return (
            <Page>
                <AtlasKitThemeProvider mode = 'light'>
                    <Wrapper>
                        { this._renderHeader() }
                        { this._renderBody() }
                    </Wrapper>
                </AtlasKitThemeProvider>
            </Page>
        );
    }

    /**
     * Renders the body for the welcome page.
     *
     * @returns {ReactElement}
     */
    _renderBody() {
        return (
            <Body>
                {/* <RecentList /> */}
            </Body>
        );
    }

    /**
     * Renders the header for the welcome page.
     *
     * @returns {ReactElement}
     */
    _renderHeader() {
        return (
            <Header>
                <img src = { LogoSVG } alt = 'Medcom Vision Logo' style={{ height: '50px', marginBottom: '20px' }} />
                
                <QRScanner 
                    onScanSuccess={this._onQRScanSuccess}
                    onClose={() => {
                        // Optional: Allow closing scanner, but for now we'll keep it always visible
                        // If you want to allow closing, uncomment the next line:
                        // this.setState({ showQRScanner: false });
                    }}
                />
            </Header>
        );
    }

    /**
     * Handle successful QR scan.
     *
     * @param {string} scannedData - The scanned QR code data.
     * @returns {void}
     */
    _onQRScanSuccess(scannedData: string) {
        console.log('QR scan successful:', scannedData);
        
        // Auto-join immediately when QR code is scanned
        const conference = createConferenceObjectFromURL(scannedData);
        if (conference) {
            this.props.dispatch(push('/conference', conference));
        } else {
            console.error('Invalid meeting URL from QR code:', scannedData);
        }
    }
}

export default compose(connect(), withTranslation())(Welcome);
