import React from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';

import Header from './Header';

/* FIN DE IMPORTS -------------------------------------------------------------------------------------- */

const EMPTY_CALLBACK = () => { };

const Login = React.createClass({
    getInitialState: function () {
        return { username: '', password: '' };
    },

    getDefaultProps: function () {
        return { onSubmit: EMPTY_CALLBACK };
    },

    submitForm: function () {
        const user = { username: this.state.username, password: this.state.password };
        console.log('Subiendo:');
        console.log(user);
        this.props.onSubmit(user);
    },

    handleKeyPress: function (event) {
        if (event.key == 'Enter') this.submitForm();
    },

    render: function () {
        return (
            <div onKeyPress={this.handleKeyPress}>
                <Header title="Shared server" />

                <MuiThemeProvider>
                    <Card>
                        <CardHeader
                            title="Iniciar sesion"
                            subtitle="Usuario de negocio" />

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