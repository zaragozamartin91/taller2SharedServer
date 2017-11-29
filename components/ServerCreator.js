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

function ShowTokenDialog(props) {
    const actions = [
        <FlatButton
            label="Ok"
            primary={true}
            onClick={props.onClose}
        />,
    ];

    return (
        <Dialog
            title={`Token de servidor`}
            actions={actions}
            modal={false}
            open={true}>
            {props.serverToken}
        </Dialog>
    );
}

const ServerCreator = React.createClass({
    getDefaultProps() {
        return { token: '', user: null };
    },

    getInitialState() {
        return {
            msgSnackbarOpen: false,
            name: '',
            serverToken: null
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

    handleCreateSuccess(data) {
        //this.openSnackbar(`Servidor creado exitosamente`);
        console.log(data);
        const { server: { token: { token } } } = data;
        console.log(token);
        this.setState({ msgSnackbarOpen: true, snackbarMessage: 'Servidor creado exitosamente' , serverToken: token });
        //this.setState({ serverToken: token });
    },

    handleCreateError(cause) {
        this.openSnackbar(cause.response.data.message);
    },

    checkFields() {
        const { name } = this.state;
        if (!name) return { ok: false, msg: 'Parametros incompletos' };
        return { ok: true };
    },

    createServer() {
        const fieldsCheck = this.checkFields();
        if (!fieldsCheck.ok) return this.openSnackbar(fieldsCheck.msg);

        const { name } = this.state;
        const createdBy = this.props.user.id || this.props.user;

        const body = { name, createdBy };
        const config = { headers: { 'Authorization': `Bearer ${this.props.token}` } };
        axios.post('/api/v1/servers', body, config)
            .then(contents => {
                console.log(contents.data);
                this.handleCreateSuccess(contents.data);
            }).catch(cause => {
                console.error(cause);
                this.handleCreateError(cause);
            });
    },

    render() {
        if (this.state.serverToken) return <ShowTokenDialog
            serverToken={this.state.serverToken}
            onClose={() => this.setState({ serverToken: null })}
        />;

        return (
            <div>
                <Card style={{ backgroundColor: "rgba(255,255,255,0.7)" }} >
                    <CardHeader
                        title="Crear servidor"
                        subtitle="Suscriptor de servicios"
                    />
                    <CardText expandable={false}>
                        <TextField
                            name="Nombre"
                            hint="Nombre"
                            floatingLabelText="Nombre"
                            value={this.state.name}
                            onChange={e => this.setState({ name: e.target.value })} /><br />
                    </CardText>
                    <CardActions>
                        <RaisedButton label="Crear servidor" secondary={true} onClick={this.createServer} />
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

export default ServerCreator;