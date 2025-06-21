// @flow

import ArrowLeft from '@atlaskit/icon/glyph/arrow-left';
import { AkCustomDrawer } from '@atlaskit/navigation';
import { SpotlightTarget } from '@atlaskit/onboarding';

import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { closeDrawer, DrawerContainer, Logo } from '../../navbar';
import { SettingsContainer, TogglesContainer } from '../styled';
import {
    setWindowAlwaysOnTop, setDisableAGC, setCurrentVideoDevice
} from '../actions';

import SettingToggle from './SettingToggle';
import ServerURLField from './ServerURLField';
import ServerTimeoutField from './ServerTimeoutField';
import VideoDeviceSelector from './VideoDeviceSelector';

/**
 * Drawer that open when SettingsAction is clicked.
 */
class SettingsDrawer extends Component {
    /**
     * Initializes a new {@code SettingsDrawer} instance.
     *
     * @inheritdoc
     */
    constructor(props) {
        super(props);

        this._onBackButton = this._onBackButton.bind(this);
        this._onVideoDeviceSelect = this._onVideoDeviceSelect.bind(this);
    }

    /**
     * Render function of component.
     *
     * @returns {ReactElement}
     */
    render() {
        const { t } = this.props;

        return (
            <AkCustomDrawer
                backIcon = { <ArrowLeft label = { t('settings.back') } /> }
                isOpen = { this.props.isOpen }
                onBackButton = { this._onBackButton }
                primaryIcon = { <Logo /> } >
                <DrawerContainer>
                    <SettingsContainer>
                        <SpotlightTarget name = 'server-setting'>
                            <ServerURLField />
                        </SpotlightTarget>
                        <SpotlightTarget name = 'server-timeout'>
                            <ServerTimeoutField />
                        </SpotlightTarget>
                        <TogglesContainer>
                            <SpotlightTarget
                                name = 'always-on-top-window'>
                                <SettingToggle
                                    label = { t('settings.alwaysOnTopWindow') }
                                    settingChangeEvent = { setWindowAlwaysOnTop }
                                    settingName = 'alwaysOnTopWindowEnabled' />
                            </SpotlightTarget>
                            <SettingToggle
                                label = { t('settings.disableAGC') }
                                settingChangeEvent = { setDisableAGC }
                                settingName = 'disableAGC' />
                        </TogglesContainer>
                        <VideoDeviceSelector
                            onDeviceSelect={this._onVideoDeviceSelect}
                            currentDeviceId={this.props._currentVideoDeviceId}
                        />
                    </SettingsContainer>
                </DrawerContainer>
            </AkCustomDrawer>
        );
    }

    /**
     * Closes the drawer when back button is clicked.
     *
     * @returns {void}
     */
    _onBackButton() {
        this.props.dispatch(closeDrawer());
    }

    /**
     * Handles video device selection.
     */
    _onVideoDeviceSelect(deviceId) {
        // Store the selected device ID
        this.props.dispatch(setCurrentVideoDevice(deviceId));
        
        // If in a conference, switch the video device
        if (this.props._api) {
            this.props._api.executeCommand('setVideoInputDevice', deviceId);
        }
    }

    componentDidUpdate(prevProps) {
        // Removed onboarding initialization
    }
}

export default compose(connect(), withTranslation())(SettingsDrawer);
