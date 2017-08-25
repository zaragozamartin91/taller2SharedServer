import React from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';

/* EL SIGUIENTE ES UN COMPONENTE DE EJEMPLO DE FORMULARIO EN REACT. */

const FormExample = React.createClass({
    getInitialState: function () {
        return { msg: null };
    },

    submitForm: function () {
        console.log("SUBIENDO FORMULARIO");
        /* La invocacion a this.setState provoca que el componente entero vuelva a renderizarse
        llamando a render() */
        this.setState({ msg: "Formulario subido!" });
    },

    render: function () {
        let msgDiv = this.state.msg ? <p style={{ color: "green" }} >{this.state.msg}</p> : <div />;

        return (
            <div>
                {msgDiv}
                <MuiThemeProvider>
                    <Card>
                        <CardHeader
                            title="Formulario de prueba"
                            subtitle="Ejemplo de formulario usando react y material-ui." />

                        <CardText expandable={false}>
                            <TextField
                                name="email"
                                hint="email"
                                floatingLabelText="email" /><br />

                            <TextField
                                name="password"
                                hintText="Password"
                                floatingLabelText="Password"
                                type="password" /><br />
                        </CardText>
                        <CardActions>
                            <FlatButton label="Subir" onClick={this.submitForm} />
                        </CardActions>
                    </Card>
                </MuiThemeProvider >
            </div>
        );
    }
});

/* Exporto el componente creado para que pueda ser importado desde otros modulos */
export default FormExample;