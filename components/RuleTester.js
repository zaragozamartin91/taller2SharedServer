import React from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import Checkbox from 'material-ui/Checkbox';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import Snackbar from 'material-ui/Snackbar';
import Slider from 'material-ui/Slider';
import moment from 'moment';

import SelectField from 'material-ui/SelectField';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';

import axios from 'axios';

import Header from './Header';

const min = 1;
const max = 20;
const EMPTY_CALLBACK = () => { };

const RuleTester = React.createClass({
    getDefaultProps() {
        return {
            token: '',
            rule: null,
            onClose: EMPTY_CALLBACK,
        };
    },

    getInitialState() {
        const dayOfWeek = moment().day();
        const hour = moment().hour();
        const todayTripCount = 0;
        const tripCount = 0;
        return {
            mts: 0,
            type: 'passenger',
            pocketBalance: 0,
            email: 'callefalsa123@gmail.com',
            dayOfWeek,
            hour,
            todayTripCount,
            tripCount,
        };
    },

    validateParams() {
        if (!this.mts.match(/\d+/)) return { valid: false, message: 'Distancia invalida' };
        if (!this.email.match(/^(\w|\.)+@(\w+\.\w+)+$/)) return { valid: false, message: 'Email invalido' };
        return { valid: true };
    },


    testRule() {
        const paramsValidation = this.validateParams();
        if (!paramsValidation.valid) return this.openSnackbar(paramsValidation.message);

        const { mts, type, pocketBalance, email, dayOfWeek, hour, todayTripCount, tripCount } = this.state;
        const facts = [
            {
                "language": "string",
                "blob": { mts, type, pocketBalance, email, dayOfWeek, hour, todayTripCount, tripCount }
            }
        ];

        const config = { headers: { 'Authorization': `Bearer ${this.props.token}` } };
        axios.post(`/api/v1/rules/${this.props.rule.id}/run`, facts, config)
            .then(contents => {
                console.log(contents.data);

            }).catch(cause => {
                console.error(cause);

            });
    },

    openSnackbar(msg) {
        console.log('Abriendo snack bar');
        this.setState({ snackbarOpen: true, snackbarMessage: msg });
    },

    handleSnackbarRequestClose() {
        this.setState({ snackbarOpen: false });
    },

    render() {
        const rule = this.props.rule;

        return (
            <div>
                <Card style={{ backgroundColor: "rgba(255,255,255,0.7)" }} >
                    <CardHeader
                        title={`Probar regla ${rule.id}`}
                        subtitle={`Lenguaje ${rule.language}`}
                    />

                    <CardText>
                        <SelectField
                            floatingLabelText="Tipo cliente"
                            value={this.state.type}
                            onChange={(event, index, value) => this.setState({ type: value })}>

                            <MenuItem value={'passenger'} primaryText="Pasajero" />
                            <MenuItem value={'driver'} primaryText="Chofer" />
                        </SelectField><br />

                        <TextField
                            name="Distancia"
                            hint="Distancia en metros"
                            floatingLabelText="Distancia en metros"
                            value={this.state.mts}
                            onChange={e => this.setState({ mts: e.target.value })} /><br />

                        <TextField
                            style={{ width: '75%' }}
                            name="Email"
                            hint="Email"
                            floatingLabelText="Email"
                            value={this.state.email}
                            multiLine={true}
                            onChange={e => this.setState({ email: e.target.value })} /><br />

                    </CardText>

                    <CardActions>
                        <FlatButton label="Cancelar" onClick={this.props.onClose} />
                        <FlatButton label="Probar" onClick={this.testRule} primary={true} />
                    </CardActions>
                </Card>

                <Snackbar
                    open={this.state.snackbarOpen}
                    message={this.state.snackbarMessage}
                    autoHideDuration={3000}
                    onRequestClose={this.handleSnackbarRequestClose} />
            </div>);
    }
});

export default RuleTester;