import React from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import Snackbar from 'material-ui/Snackbar';

import axios from 'axios';

import Header from './Header';
//import mainConfig from '../config/main-config';

/* FIN DE IMPORTS -------------------------------------------------------------------------------------- */

const EMPTY_CALLBACK = () => { };

const Users = React.createClass({
    getDefaultProps: function () {
        return {
            token: ''
        };
    },

    getInitialState: function () {
        return {
            users: [],
            errSnackbarOpen: false,
        };
    },

    componentDidMount: function () {
        console.log('token: ' + this.props.token);
        axios.get(`/api/v1/business-users?token=${this.props.token}`)
            .then(contents => {
                const users = contents.data.businessUser;
                console.log('users:');
                console.log(users);
                this.setState({ users });
            })
            .catch(cause => {
                console.error(cause);
                this.openErrSnackbar();
            });
    },

    openErrSnackbar: function () {
        this.setState({ errSnackbarOpen: true });
    },

    handleErrSnackbarRequestClose: function () {
        this.setState({ errSnackbarOpen: false });
    },

    render: function () {
        const userCards = this.state.users.map(user => (
            <Card style={{ marginTop: '15px' }}>
                <CardHeader
                    title={user.id}
                    subtitle={user.username}
                />
                <CardText expandable={false}>
                    Nombre: {user.name} <br />
                    Apellido: {user.surname} <br />
                    Roles: {JSON.stringify(user.roles)} <br />
                </CardText>
                <CardActions>
                    <FlatButton label="Eliminar" />
                    <FlatButton label="Editar" />
                </CardActions>
            </Card>
        ));

        return (
            <div>
                {userCards}
                <Snackbar
                    open={this.state.errSnackbarOpen}
                    message="Error al obtener los usuarios"
                    autoHideDuration={3000}
                    onRequestClose={this.handleErrSnackbarRequestClose}
                />
            </div >
        );
    }
});

export default Users;