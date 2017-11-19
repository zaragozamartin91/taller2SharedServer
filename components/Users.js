import React from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import Checkbox from 'material-ui/Checkbox';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import Snackbar from 'material-ui/Snackbar';

import axios from 'axios';

import Header from './Header';

/* FIN DE IMPORTS -------------------------------------------------------------------------------------- */

const EMPTY_CALLBACK = () => { };

const EditUserCard = React.createClass({
    getDefaultProps() {
        return {
            user: {},
            token: ''
        };
    },

    removeRole(role) {
        const roles = this.state.roles.filter(r => r != role);
        this.setState({ roles });
    },

    addRole(role) {
        this.state.roles.push(role);
        this.setState({ roles: this.state.roles });
    },

    toggleRole(role) {
        return () => this.hasRole(role) ? this.removeRole(role) : this.addRole(role);
    },

    hasRole(role) {
        return this.state.roles.indexOf(role) >= 0;
    },

    componentWillMount() {
        const { username, name, surname, password, roles, _ref } = this.props.user;
        this.setState({ username, name, surname, password, roles, _ref });
    },

    checkFields() {
        const { username, name, surname, password } = this.state;
        if (!username || !name || !surname || !password) return { ok: false, msg: 'Parametros incompletos' };
        return { ok: true };
    },

    updateUser() {
        const fieldsCheck = this.checkFields();
        if (!fieldsCheck.ok) return this.openErrSnackbar(fieldsCheck.msg);

        const userId = this.props.user.id;
        const { username, name, surname, password, roles, _ref } = this.state;
        const body = { username, name, surname, password, roles, _ref };
        const config = { headers: { 'Authorization': `Bearer ${this.props.token}` } };
        axios.put(`/api/v1/business-users/${userId}`, body, config)
            .then(contents => {
                console.log(contents.data);
                this.props.onSuccess();
            }).catch(cause => {
                console.error(cause);
                this.props.onError();
            });
    },

    render() {
        const roles = this.state.roles;
        const checkBoxes = [
            <Checkbox label='user' checked={this.hasRole('user')} onClick={this.toggleRole('user')} />,
            <Checkbox label='admin' checked={this.hasRole('admin')} onClick={this.toggleRole('admin')} />,
            <Checkbox label='manager' checked={this.hasRole('manager')} onClick={this.toggleRole('manager')} />,
        ];

        return (
            <Card style={{ backgroundColor: "rgba(255,255,255,0.8)" }} >
                <CardHeader
                    title='Editar usuario'
                    subtitle={this.state.username}
                />
                <CardText>
                    <TextField
                        name="username"
                        hint="username"
                        floatingLabelText="username"
                        value={this.state.username}
                        onChange={e => this.setState({ username: e.target.value })} /><br />
                    <TextField
                        name="Nombre"
                        hint="Nombre"
                        floatingLabelText="Nombre"
                        value={this.state.name}
                        onChange={e => this.setState({ name: e.target.value })} /><br />
                    <TextField
                        name="Apellido"
                        hint="Apellido"
                        floatingLabelText="Apellido"
                        value={this.state.surname}
                        onChange={e => this.setState({ surname: e.target.value })} /><br />
                    <TextField
                        name="password"
                        hintText="Password"
                        floatingLabelText="Password"
                        type="password"
                        value={this.state.password}
                        onChange={e => this.setState({ password: e.target.value })} /><br />

                    {checkBoxes}
                </CardText>
                <CardActions>
                    <FlatButton label="Cancelar" onClick={this.props.onClose} />
                    <FlatButton label="Actualizar" onClick={this.updateUser} />
                </CardActions>
            </Card>);
    }
});

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
            updatingUser: null,
            deletingUser: null
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
        console.log('USERS DID MOUNT');
    },

    openErrSnackbar(msg) {
        console.log('Abriendo snack bar');
        this.setState({ errSnackbarOpen: true, errSnackbarMessage: msg });
    },

    handleErrSnackbarRequestClose() {
        this.setState({ errSnackbarOpen: false });
    },

    closeDeleteDialog(user) {
        const self = this;
        return function () {
            self.setState({ deletingUser: null });
        };
    },

    openDeleteDialog(user) {
        const self = this;
        return function () {
            const userId = user.id || user;
            self.setState({ deletingUser: userId });
        };
    },

    closeEditCard(user) {
        const self = this;
        return function () {
            self.setState({ updatingUser: null });
        };
    },

    openEditCard(user) {
        const self = this;
        return function () {
            const userId = user.id || user;
            self.setState({ updatingUser: userId });
        };
    },

    handleUserDeleteSuccess(user) {
        const self = this;
        return function () {
            self.closeDeleteDialog(user)();
            self.loadUsers();
            self.openErrSnackbar('Usuario eliminado');
        };
    },

    handleUserEditSuccess(user) {
        const self = this;
        return function () {
            self.closeEditCard(user)();
            self.loadUsers();
            self.openErrSnackbar('Usuario actualizado');
        };
    },

    render() {
        if (this.state.users.length == 0) {
            return <div>No users...</div>;
        }

        let editUserCard = null;
        if (this.state.updatingUser) {
            const user = this.state.users.find(u => u.id == this.state.updatingUser);
            editUserCard = <EditUserCard
                user={user}
                token={this.props.token}
                onClose={this.closeEditCard(user)}
                onSuccess={this.handleUserEditSuccess(user)}
                onError={() => this.openErrSnackbar(`Error al actualizar el usuario ${user.id}`)}
            />;
        }

        let deleteUserDialog = null;
        if (this.state.deletingUser) {
            console.log('Creando dialogo de eliminacion');
            const user = this.state.users.find(u => u.id == this.state.deletingUser);
            deleteUserDialog = <DeleteUserDialog
                user={user}
                token={this.props.token}
                open={true}
                onSuccess={this.handleUserDeleteSuccess(user)}
                onClose={this.closeDeleteDialog(user)}
                onError={() => this.openErrSnackbar(`Error al eliminar el usuario ${user.id}`)} />;
        }

        const userCards = this.state.users.map(user => (
            <Card style={{ backgroundColor: "rgba(255,255,255,0.8)" }} >
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
                    <FlatButton label="Editar" onClick={this.openEditCard(user)} />
                </CardActions>
            </Card>
        ));

        const mainElem = editUserCard || deleteUserDialog || userCards;

        return (
            <div >
                {mainElem}
                <Snackbar
                    open={this.state.errSnackbarOpen}
                    message={this.state.errSnackbarMessage}
                    autoHideDuration={3000}
                    onRequestClose={this.handleErrSnackbarRequestClose}
                />
            </div >
        );
    },

});

export default Users;