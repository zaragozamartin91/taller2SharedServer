import React from 'react';
import ReactDom from 'react-dom';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';

import Header from './Header';


/* ESTE FRAGMENTO DE CODIGO ES REQUERIDO PARA LOS EVENTOS DE TIPO TOUCH O CLICK EN COMPONENTES MATERIAL-UI */
const injectTapEventPlugin = require("react-tap-event-plugin");
injectTapEventPlugin();
/* -------------------------------------------------------------------------------------------------------- */

let messageDiv = document.getElementById('message');
let message = messageDiv ? messageDiv.getAttribute('data-value') : null;

const Login = React.createClass({
    submitForm: function () {
        console.log("Submiting form");
        if (this.form) this.form.submit();
    },

    render: function () {
        let msgElem = message ? <p style={{ color: "red" }}>{message}</p> : <div />

        return (
            <div>
                <Header title="Shared server" />
                {msgElem}
                <MuiThemeProvider>
                    <Card>
                        <CardHeader
                            title="Iniciar sesion"
                            subtitle="Usa una cuenta existente." />

                        <CardText expandable={false}>
                            <form method="POST" action="/login" ref={f => { this.form = f }}>
                                <TextField
                                    name="email"
                                    hint="email"
                                    floatingLabelText="email" /><br />

                                <TextField
                                    name="password"
                                    hintText="Password"
                                    floatingLabelText="Password"
                                    type="password" /><br />
                            </form>
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

ReactDom.render(
    <Login />,
    document.getElementById('root')
);