// @flow

import {
    SET_ALWAYS_ON_TOP_WINDOW_ENABLED,
    SET_DISABLE_AGC,
    SET_SERVER_URL,
    SET_SERVER_TIMEOUT,
    SET_CURRENT_VIDEO_DEVICE
} from './actionTypes';

const DEFAULT_STATE = {
    alwaysOnTopWindowEnabled: true,
    disableAGC: false,
    serverURL: undefined,
    serverTimeout: undefined,
    currentVideoDeviceId: undefined
};

/**
 * Reduces redux actions for features/settings.
 *
 * @param {Object} state - Current reduced redux state.
 * @param {Object} action - Action which was dispatched.
 * @returns {Object} - Updated reduced redux state.
 */
export default (state = DEFAULT_STATE, action) => {
    switch (action.type) {
    case SET_ALWAYS_ON_TOP_WINDOW_ENABLED:
        return {
            ...state,
            alwaysOnTopWindowEnabled: action.alwaysOnTopWindowEnabled
        };

    case SET_DISABLE_AGC:
        return {
            ...state,
            disableAGC: action.disableAGC
        };

    case SET_SERVER_URL:
        return {
            ...state,
            serverURL: action.serverURL
        };

    case SET_SERVER_TIMEOUT:
        return {
            ...state,
            serverTimeout: action.serverTimeout
        };

    case SET_CURRENT_VIDEO_DEVICE:
        return {
            ...state,
            currentVideoDeviceId: action.deviceId
        };

    default:
        return state;
    }
};
