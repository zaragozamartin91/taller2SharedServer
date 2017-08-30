import React from 'react';
import ReactDom from 'react-dom';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';

import axios from 'axios';

import Index from './Index';
import FormExample from './FormExample';

/* ESTE FRAGMENTO DE CODIGO ES REQUERIDO PARA LOS EVENTOS DE TIPO TOUCH O CLICK EN COMPONENTES MATERIAL-UI */
var injectTapEventPlugin = require('react-tap-event-plugin');
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
            songIndex: 0,
            playlist: []
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
                        <MenuItem onTouchTap={e => this.gotoPage('index')}>Principal</MenuItem>
                        <MenuItem onTouchTap={e => this.gotoPage('formExample')}>Ejemplo formulario</MenuItem>
                    </Drawer>

                    {currentPage}
                </div>
            </MuiThemeProvider>
        );
    }
});

ReactDom.render(
    <MainApp />,
    document.getElementById('root')
);

