// @flow

import { combineReducers } from 'redux';

import { reducer as navbarReducer } from '../navbar';
import { reducer as onboardingReducer } from '../onboarding';
import { reducer as routerReducer } from '../router';
import { reducer as settingsReducer } from '../settings';

export default combineReducers({
    navbar: navbarReducer,
    onboarding: onboardingReducer,
    router: routerReducer,
    settings: settingsReducer
});
