// @flow

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { SettingsDrawer } from '../../settings';

import Logo from './Logo';

type Props = {
    /**
     * Whether Settings Drawer is open or not.
     */
    _isSettingsDrawerOpen: boolean
};

/**
 * Navigation Bar component.
 */
class Navbar extends Component<Props> {
    /**
     * Render function of component.
     *
     * @returns {ReactElement}
     */
    render() {
        return (
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                height: '60px', 
                padding: '0 20px',
                backgroundColor: '#fff',
                borderBottom: '1px solid #e0e0e0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <Logo />
                    <SettingsDrawer
                        isOpen = { this.props._isSettingsDrawerOpen }
                        key = { 0 } />
            </div>
        );
    }
}

/**
 * Maps (parts of) the redux state to the React props.
 *
 * @param {Object} state - The redux state.
 * @returns {{
 *     _isSettingsDrawerOpen: boolean
 * }}
 */
function _mapStateToProps(state: Object) {
    return {
        _isSettingsDrawerOpen: state.navbar.openDrawer === SettingsDrawer
    };
}

export default connect(_mapStateToProps)(Navbar);
