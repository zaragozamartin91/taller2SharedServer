import React from 'react';
import ReactDom from 'react-dom';
import { HashRouter } from 'react-router-dom';
import { Link, Route } from 'react-router-dom';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

import axios from 'axios';

import Index from './Index';
import FormExample from './FormExample';
import Login from './Login';

/* ESTE FRAGMENTO DE CODIGO ES REQUERIDO PARA LOS EVENTOS DE TIPO TOUCH O CLICK EN COMPONENTES MATERIAL-UI */
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();
/* -------------------------------------------------------------------------------------------------------- */

console.log('Parseando cookie ' + document.cookie);
const cookie = document.cookie || '';
const cookieTokenStr = cookie.split('; ').find(s => s.startsWith('token='));
const cookieToken = cookieTokenStr ? cookieTokenStr.replace('token=') : null;

const MainApp = React.createClass({
    getInitialState: function () {
        return {
            drawerOpen: false,
            token: null
        };
    },

    toggleDrawer: function () {
        this.setState({ drawerOpen: !this.state.drawerOpen });
    },

    /* Esta funcion se ejecutara cada vez que se solicite cambiar el estado de la barra. */
    onDrawerRequestChange: function (open) {
        this.setState({ drawerOpen: open });
    },

    componentWillMount: function () {
        console.log('Montando MainApp');
        if (cookieToken) {
            console.log('Se encontro un token en las cookies: ' + cookieToken);
            this.setState({ token: cookieToken });
        }
    },

    componentDidMount: function () {
        /* SE CARGAN LAS CANCIONES DESPUES QUE EL COMPONENTE HAYA SIDO MONTADO */
        console.log('MainApp MONTADA!');
    },

    closeDrawer: function () {
        this.setState({ drawerOpen: false });
    },

    setToken: function (token) {
        token = token.token || token;
        this.setState({ token });
    },

    render: function () {
        console.log('RENDERING MainApp!');

        const token = this.state.token;
        if (token) {
            /* Si un usuario inicio sesion, renderizo la app normal */
            return (
                <MuiThemeProvider>
                    <div>
                        <AppBar
                            onLeftIconButtonTouchTap={this.toggleDrawer}
                            title="Shared server" />

                        <Drawer open={this.state.drawerOpen} docked={false} onRequestChange={this.onDrawerRequestChange} >
                            <MenuItem style={{ fontWeight: 'bold' }} onClick={e => this.logoutForm.submit()}>Cerrar sesion</MenuItem>

                            <Link to="/Index" onClick={this.closeDrawer}><MenuItem >Principal</MenuItem></Link>
                            <Link to="/FormExample" onClick={this.closeDrawer}><MenuItem >FormExample</MenuItem></Link>
                            <MenuItem primaryText='Usuarios'
                                rightIcon={<ArrowDropRight />}
                                menuItems={[
                                    <Link to="/Users/Create" onClick={this.closeDrawer}><MenuItem >Crear</MenuItem></Link>
                                ]} />
                        </Drawer>

                        <Route path="/Index" component={Index} />
                        <Route path="/FormExample" component={FormExample} />

                        <form
                            action='/logout'
                            method='POST'
                            ref={f => this.logoutForm = f}
                            style={{ display: 'hidden' }}></form>
                    </div>
                </MuiThemeProvider>
            );
        } else {
            /* Sino, renderizo la pagina de login */
            return <Login onSubmit={this.setToken} />;
        }
    }
});

ReactDom.render(
    <HashRouter>
        <MainApp />
    </HashRouter>,
    document.getElementById('root')
);

