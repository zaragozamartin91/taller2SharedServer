import React from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';

import axios from 'axios';

import Header from './Header';
//import mainConfig from '../config/main-config';

/* FIN DE IMPORTS -------------------------------------------------------------------------------------- */

const EMPTY_CALLBACK = () => { };

const Login = React.createClass({
    getInitialState: function () {
        return {
            username: '',
            password: '',
            errMsg: null,
        };
    },

    getDefaultProps: function () {
        return { onSubmit: EMPTY_CALLBACK };
    },

    submitForm: function () {
        const data = { username: this.state.username, password: this.state.password, backoffice: true };
        console.log('Subiendo:');
        console.log(data);

        axios.post('/api/v1/token', data)
            .then(contents => {
                console.log('Contenido:');
                console.log(contents.data);
                this.props.onSubmit(contents.data.token);
            })
            .catch(cause => {
                console.error('Error');
                this.setState({ errMsg: 'Credenciales invalidas' });
            });
    },

    handleKeyPress: function (event) {
        if (event.key == 'Enter') this.submitForm();
    },

    render: function () {
        const cardHeader = this.state.errMsg ?
            <CardHeader
                title="Iniciar sesion"
                subtitle={this.state.errMsg}
                style={{backgroundColor:'rgba(225, 11, 11, 0.19)'}} /> :
            <CardHeader
                title="Iniciar sesion"
                subtitle='Ingrese credenciales' />;

        return (
            <div onKeyPress={this.handleKeyPress}>
                <Header title="Shared server" />

                <MuiThemeProvider>
                    <Card>
                        {cardHeader}

                        <CardText expandable={false}>
                            <TextField
                                name="username"
                                hint="username"
                                floatingLabelText="username"
                                value={this.state.username}
                                onChange={e => this.setState({ username: e.target.value })} /><br />

                            <TextField
                                name="password"
                                hintText="Password"
                                floatingLabelText="Password"
                                type="password"
                                value={this.state.password}
                                onChange={e => this.setState({ password: e.target.value })} /><br />
                        </CardText>

                        <CardActions>
                            <FlatButton label="Iniciar sesion" onClick={this.submitForm} />
                        </CardActions>
                    </Card>

                </MuiThemeProvider >
            </div>
        );
    }
});

export default Login;