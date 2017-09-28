import React from 'react';
import ReactDom from 'react-dom';
import { HashRouter } from 'react-router-dom';
import { Link, Route, Switch } from 'react-router-dom';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';

import axios from 'axios';

import Index from './Index';
import FormExample from './FormExample';

/* ESTE FRAGMENTO DE CODIGO ES REQUERIDO PARA LOS EVENTOS DE TIPO TOUCH O CLICK EN COMPONENTES MATERIAL-UI */
const injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();
/* -------------------------------------------------------------------------------------------------------- */

const MainApp = React.createClass({
    getInitialState: function () {
        return {
            drawerOpen: false,
        };
    },

    toggleDrawer: function () {
        this.setState({ drawerOpen: !this.state.drawerOpen });
    },

    /* Esta funcion se ejecutara cada vez que se solicite cambiar el estado de la barra. */
    onDrawerRequestChange: function (open) {
        this.setState({ drawerOpen: open });
    },

    componentDidMount: function () {
        /* SE CARGAN LAS CANCIONES DESPUES QUE EL COMPONENTE HAYA SIDO MONTADO */
        console.log('MainApp DID MOUNT!');
    },

    closeDrawer: function () {
        this.setState({ drawerOpen: false });
    },

    render: function () {
        console.log('RENDERING MainApp!');

        return (
            <MuiThemeProvider>
                <div>
                    <AppBar
                        onLeftIconButtonTouchTap={this.toggleDrawer}
                        title="Shared server" />

                    <Drawer open={this.state.drawerOpen} docked={false} onRequestChange={this.onDrawerRequestChange} >
                        <Link to="/Index" onClick={this.closeDrawer}><MenuItem >Principal</MenuItem></Link>
                        <Link to="/FormExample" onClick={this.closeDrawer}><MenuItem >FormExample</MenuItem></Link>
                        <MenuItem primaryText='Usuarios'
                            rightIcon={<ArrowDropRight />}
                            menuItems={[
                                <Link to="/Users/Create" onClick={this.closeDrawer}><MenuItem >Crear</MenuItem></Link>
                            ]}
                        />
                    </Drawer>

                    <Route path="/Index" component={Index} />
                    <Route path="/FormExample" component={FormExample} />
                </div>
            </MuiThemeProvider>
        );
    }
});

ReactDom.render(
    <HashRouter>
        <MainApp />
    </HashRouter>,
    document.getElementById('root')
);

