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

const CreateUserForm = React.createClass({
    getDefaultProps() {
        return { token: '' };
    },

    getInitialState() {
        return {
            msgSnackbarOpen: false,
            username: '',
            name: '',
            surname: '',
            password: '',
            passwordRepeat: '',
            roles: []
        };
    },

    componentDidMount() {
        console.log('token: ' + this.props.token);
    },

    openSnackbar(msg) {
        console.log('Abriendo snack bar');
        this.setState({ msgSnackbarOpen: true, snackbarMessage: msg });
    },

    handleSnackbarRequestClose() {
        this.setState({ msgSnackbarOpen: false });
    },

    handleUserCreateSuccess(user) {
        const userId = user.businessUser.id;
        this.openSnackbar(`Usuario ${userId} creado`);
    },

    handleUserCreateError(cause) {
        this.openSnackbar(cause.response.data.message);
    },

    addRole(role) {
        this.state.roles.push(role);
        this.setState({ roles: this.state.roles });
    },

    removeRole(role) {
        const roles = this.state.roles.filter(r => r != role);
        this.setState({ roles });
    },

    toggleRole(role) {
        return () => this.hasRole(role) ? this.removeRole(role) : this.addRole(role);
    },

    hasRole(role) {
        return this.state.roles.indexOf(role) >= 0;
    },

    checkFields() {
        const { username, name, surname, password , passwordRepeat, roles } = this.state;
        if (!username || !name || !surname || !password || !passwordRepeat) return { ok: false, msg: 'Parametros incompletos' };
        if (roles.length == 0) return { ok: false, msg: 'El usuario debe tener al menos un rol' };
        if( password != passwordRepeat ) return { ok: false, msg: 'Los passwords no coinciden' };
        return { ok: true };
    },

    createUser() {
        const fieldsCheck = this.checkFields();
        if (!fieldsCheck.ok) return this.openSnackbar(fieldsCheck.msg);

        const { username, name, surname, password, roles = [] } = this.state;
        const body = { username, name, surname, password, roles };
        const config = { headers: { 'Authorization': `Bearer ${this.props.token}` } };
        axios.post('/api/v1/business-users', body, config)
            .then(contents => {
                console.log(contents.data);
                this.handleUserCreateSuccess(contents.data);
            }).catch(cause => {
                console.error(cause);
                this.handleUserCreateError(cause);
            });
    },

    render() {

        const checkBoxes = [
            <Checkbox label='user' checked={this.hasRole('user')} onClick={this.toggleRole('user')} />,
            <Checkbox label='admin' checked={this.hasRole('admin')} onClick={this.toggleRole('admin')} />,
            <Checkbox label='manager' checked={this.hasRole('manager')} onClick={this.toggleRole('manager')} />,
        ];

        return (
            <div>
                <Card style={{ backgroundColor: "rgba(255,255,255,0.7)" }} >
                    <CardHeader
                        title="Crear usuario"
                        subtitle="Administradores de servidor"
                    />
                    <CardText expandable={false}>
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
                        <TextField
                            name="password"
                            hintText="Confirmacion password"
                            floatingLabelText="Confirmacion password"
                            type="password"
                            value={this.state.passwordRepeat}
                            onChange={e => this.setState({ passwordRepeat: e.target.value })} /><br />
                        <div style={{ margin: '10px' }}>
                            {checkBoxes}
                        </div>
                    </CardText>
                    <CardActions>
                        <RaisedButton label="Crear usuario" secondary={true} onClick={this.createUser} />
                    </CardActions>
                </Card>

                <Snackbar
                    open={this.state.msgSnackbarOpen}
                    message={this.state.snackbarMessage}
                    autoHideDuration={3000}
                    onRequestClose={this.handleSnackbarRequestClose}
                />
            </div>
        );
    }
});

export default CreateUserForm;