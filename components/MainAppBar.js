import React from 'react';
import { Link } from 'react-router-dom';

import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import IconButton from 'material-ui/IconButton';

const MainAppBar = React.createClass({
    getInitialState: function () {
        return {
            drawerOpen: false
        };
    },

    getDefaultProps: function () {
        return {
            onLogout: () => { }
        };
    },

    closeDrawer: function () {
        this.setState({ drawerOpen: false });
    },

    toggleDrawer: function () {
        const drawerOpen = !this.state.drawerOpen;
        this.setState({ drawerOpen });
    },

    render: function () {
        return (
            <div >
                <AppBar
                    onLeftIconButtonTouchTap={this.toggleDrawer}
                    title="Shared server" />

                <Drawer open={this.state.drawerOpen} docked={false} onRequestChange={open => this.setState({ drawerOpen: open })} >
                    <MenuItem style={{ fontWeight: 'bold' }} onClick={this.props.onLogout}>Cerrar sesion</MenuItem>

                    <Link to="/index" onClick={this.closeDrawer}><MenuItem >Principal</MenuItem></Link>
                    <MenuItem primaryText='Usuarios'
                        rightIcon={<ArrowDropRight />}
                        menuItems={[
                            <Link to="/users/create" onClick={this.closeDrawer}><MenuItem >Crear</MenuItem></Link>,
                            <Link to="/users/list" onClick={this.closeDrawer}><MenuItem >Ver</MenuItem></Link>
                        ]} />
                    <Link to="/servers/list" onClick={this.closeDrawer}><MenuItem >Servidores</MenuItem></Link>
                </Drawer>
            </div >
        );
    }
});

export default MainAppBar;