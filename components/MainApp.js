import React from 'react';
import ReactDom from 'react-dom';
import { HashRouter } from 'react-router-dom';
import { Link, Route, Switch } from 'react-router-dom';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';

import axios from 'axios';

import Index from './Index';
import FormExample from './FormExample';

import $ from 'jquery';

/* ESTE FRAGMENTO DE CODIGO ES REQUERIDO PARA LOS EVENTOS DE TIPO TOUCH O CLICK EN COMPONENTES MATERIAL-UI */
const injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();
/* -------------------------------------------------------------------------------------------------------- */

/* PAGINAS USADAS PARA EL ENRUTAMIENTO */
const PAGES = {
    index: <Index />,
    formExample: <FormExample />
};

const MainApp = React.createClass({
    getInitialState: function () {
        return {
            currPage: 'index',
            drawerOpen: false,
        };
    },

    appBarLeftTap: function () {
        let drawerOpen = this.state.drawerOpen;
        this.setState({ drawerOpen: !drawerOpen });
    },

    /* Esta funcion se ejecutara cada vez que se solicite cambiar el estado de la barra. */
    onDrawerRequestChange: function (open) {
        this.setState({ drawerOpen: open });
    },

    gotoPage: function (page) {
        console.log('GOING TO PAGE: ' + page);
        this.setState({ currPage: page, drawerOpen: false });
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
        let currentPage = PAGES[this.state.currPage];

        return (
            <MuiThemeProvider>
                <div>
                    <AppBar
                        onLeftIconButtonTouchTap={this.appBarLeftTap}
                        title="Shared server" />

                    <Drawer open={this.state.drawerOpen} docked={false} onRequestChange={this.onDrawerRequestChange} >
                        <Link to="/Index" onClick={this.closeDrawer}><MenuItem >Principal</MenuItem></Link>
                        <Link to="/FormExample" onClick={this.closeDrawer}><MenuItem >FormExample</MenuItem></Link>
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

