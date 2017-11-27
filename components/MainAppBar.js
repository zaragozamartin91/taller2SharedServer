import React from 'react';
import { Link } from 'react-router-dom';

import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';

import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';


function SubMenu(props) {
    return <IconMenu
        iconButtonElement={
            <IconButton ><MoreVertIcon
                className='submenu-svg'
                style={{ color: 'white', fill: 'white' }} />
            </IconButton>
        }
        targetOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}>

        <MenuItem primaryText="Cerrar sesion" onClick={props.onLogout} />
    </IconMenu>;
}

SubMenu.muiName = 'IconMenu';

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
                    iconElementRight={<SubMenu onLogout={this.props.onLogout} />}
                    title="Shared server" />

                <Drawer open={this.state.drawerOpen} docked={false} onRequestChange={open => this.setState({ drawerOpen: open })} >
                    <Link to="/index" onClick={this.closeDrawer}><MenuItem >Principal</MenuItem></Link>
                    <MenuItem primaryText='Usuarios'
                        rightIcon={<ArrowDropRight />}
                        menuItems={[
                            <Link to="/users/create" onClick={this.closeDrawer}><MenuItem >Crear</MenuItem></Link>,
                            <Link to="/users/list" onClick={this.closeDrawer}><MenuItem >Ver</MenuItem></Link>
                        ]} />

                    <MenuItem primaryText='Servidores'
                        rightIcon={<ArrowDropRight />}
                        menuItems={[
                            <Link to="/servers/list" onClick={this.closeDrawer}><MenuItem >Ver</MenuItem></Link>,
                            <Link to="/servers/create" onClick={this.closeDrawer}><MenuItem >Crear</MenuItem></Link>,
                        ]} />

                    <MenuItem primaryText='Reglas'
                        rightIcon={<ArrowDropRight />}
                        menuItems={[
                            <Link to="/rules/list" onClick={this.closeDrawer}><MenuItem >Ver</MenuItem></Link>,
                            <Link to="/rules/create" onClick={this.closeDrawer}><MenuItem >Crear</MenuItem></Link>
                        ]} />
                </Drawer>
            </div >
        );
    }
});

export default MainAppBar;