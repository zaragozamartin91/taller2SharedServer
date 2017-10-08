import React from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import Snackbar from 'material-ui/Snackbar';

import axios from 'axios';

import Header from './Header';

/* FIN DE IMPORTS -------------------------------------------------------------------------------------- */

const EMPTY_CALLBACK = () => { };


function DeleteUserDialog(props) {
    function deleteUser() {
        const userId = props.user.id;
        axios.delete(`/api/v1/business-users/${userId}`, {
            headers: { 'Authorization': `Bearer ${props.token}` }
        }).then(contents => {
            console.log(contents.data);
            props.onSuccess();
        }).catch(cause => {
            console.error(cause);
            props.onError();
        });
    }

    const actions = [
        <FlatButton
            label="Cancelar"
            primary={true}
            onClick={props.onClose}
        />,
        <FlatButton
            label="Eliminar"
            primary={true}
            onClick={deleteUser}
        />,
    ];

    return (
        <Dialog
            title={`Eliminar usuario ${props.user.id}`}
            actions={actions}
            modal={true}
            open={props.open}>
            Desea eliminar el usuario?
        </Dialog>
    );
}

const Users = React.createClass({
    getDefaultProps() {
        return { token: '' };
    },

    getInitialState() {
        return {
            users: [],
            errSnackbarOpen: false,
            openDeleteDialogs: {}
        };
    },

    loadUsers() {
        axios.get(`/api/v1/business-users?token=${this.props.token}`)
            .then(contents => {
                const users = contents.data.businessUser;
                console.log('users:');
                console.log(users);
                this.setState({ users });
            })
            .catch(cause => {
                console.error(cause);
                this.openErrSnackbar('Error al obtener los usuarios');
            });
    },

    componentDidMount() {
        console.log('token: ' + this.props.token);
        this.loadUsers();
    },

    openErrSnackbar(msg) {
        console.log('Abriendo snack bar');
        this.setState({ errSnackbarOpen: true, errSnackbarMessage: msg });
    },

    handleErrSnackbarRequestClose() {
        this.setState({ errSnackbarOpen: false });
    },

    isDeleteDialogOpen(user) {
        const userId = user.id || user;
        return this.state.openDeleteDialogs[userId] == true;
    },

    closeDeleteDialog(user) {
        const self = this;
        return function () {
            const userId = user.id || user;
            const openDeleteDialogs = self.state.openDeleteDialogs;
            openDeleteDialogs[userId] = false;
            self.setState({ openDeleteDialogs });
        };
    },

    openDeleteDialog(user) {
        const self = this;
        return function () {
            const userId = user.id || user;
            const openDeleteDialogs = self.state.openDeleteDialogs;
            openDeleteDialogs[userId] = true;
            self.setState({ openDeleteDialogs });
        };
    },

    render() {
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
                    <FlatButton label="Eliminar" onClick={this.openDeleteDialog(user)} />
                    <FlatButton label="Editar" />
                </CardActions>
                <DeleteUserDialog
                    user={user}
                    token={this.props.token}
                    open={this.isDeleteDialogOpen(user)}
                    onSuccess={this.loadUsers}
                    onClose={this.closeDeleteDialog(user)}
                    onError={() => this.openErrSnackbar(`Error al eliminar el usuario ${user.id}`)} />
            </Card>
        ));

        return (
            <div>
                {userCards}
                <Snackbar
                    open={this.state.errSnackbarOpen}
                    message={this.state.errSnackbarMessage}
                    autoHideDuration={3000}
                    onRequestClose={this.handleErrSnackbarRequestClose}
                />
            </div >
        );
    }
});

export default Users;