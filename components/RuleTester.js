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
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';


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
            mts: "0",
            type: 'passenger',
            pocketBalanceValue: "0",
            pocketBalanceCurrency: "ARS",
            email: 'callefalsa123@gmail.com',
            todayTripCount: "0",
            tripCount: "0",
            initialValue: "0",
            result: null,

            dayOfWeek: moment().day(),
            hour: moment().hour(),
            date: new Date(),
            time: new Date(),
        };
    },

    validateParams() {
        if (!this.state.mts.match(/^\d+$/)) return { valid: false, message: 'Distancia invalida' };
        if (!this.state.initialValue.match(/^-?\d+(\.\d+)?$/)) return { valid: false, message: 'Costo inicial invalido' };
        if (!this.state.email.match(/^(\w|\.)+@(\w+\.\w+)+$/)) return { valid: false, message: 'Email invalido' };

        if (!this.state.todayTripCount.match(/^\d+$/)) return { valid: false, message: 'Cantidad de viajes del dia invalido' };
        if (!this.state.tripCount.match(/^\d+$/)) return { valid: false, message: 'Cantidad de viajes invalido' };

        if (!this.state.pocketBalanceValue.match(/^-?\d+(\.\d+)?$/)) return { valid: false, message: 'Balance invalido' };

        return { valid: true };
    },


    testRule() {
        const paramsValidation = this.validateParams();
        if (!paramsValidation.valid) return this.openSnackbar(paramsValidation.message);

        const rule = this.props.rule;

        let { mts, type, pocketBalanceValue, pocketBalanceCurrency, email,
            dayOfWeek, hour, todayTripCount, tripCount, initialValue } = this.state;
        mts = parseInt(mts);
        pocketBalanceValue = parseFloat(pocketBalanceValue);
        initialValue = parseFloat(initialValue);
        todayTripCount = parseInt(todayTripCount);
        tripCount = parseInt(tripCount);

        const facts = [
            {
                "language": rule.language,
                "blob": {
                    mts, type, pocketBalance: {
                        currency: pocketBalanceCurrency, value: pocketBalanceValue
                    }, email, dayOfWeek, hour, todayTripCount, tripCount, initialValue
                }
            }
        ];

        const config = { headers: { 'Authorization': `Bearer ${this.props.token}` } };
        axios.post(`/api/v1/rules/${this.props.rule.id}/run`, facts, config)
            .then(contents => {
                console.log(contents.data);
                this.openSnackbar('Verificacion OK');
                this.setState({ result: contents.data.facts[0].blob });
            }).catch(cause => {
                console.error(cause);
                this.openSnackbar('Error al verificar regla');
            });
    },

    openSnackbar(msg) {
        console.log('Abriendo snack bar');
        this.setState({ snackbarOpen: true, snackbarMessage: msg });
    },

    handleSnackbarRequestClose() {
        this.setState({ snackbarOpen: false });
    },

    handleDateChange(event, date) {
        const dayOfWeek = moment(date).day();
        console.log('Dia de la semana: ' + dayOfWeek);
        this.setState({ dayOfWeek, date });
    },


    handleHourChange(event, date) {
        this.setState({ hour: moment(date).hour(), time: date });
    },

    render() {
        const rule = this.props.rule;
        const resultP = this.state.result == null ? <div /> :
            <p style={{ color: '#00BCD4', fontSize: 16 }}>{this.state.result}</p>;

        return (
            <div>
                <Card style={{ backgroundColor: "rgba(255,255,255,0.7)" }} >
                    <CardHeader
                        title={`Probar regla ${rule.id}`}
                        subtitle={`Lenguaje ${rule.language}`}
                    />

                    <CardText>
                        {resultP}

                        <SelectField
                            style={{ width: '40%', marginRight: 4 }}
                            floatingLabelText="Tipo cliente"
                            value={this.state.type}
                            onChange={(event, index, value) => this.setState({ type: value })}>

                            <MenuItem value={'passenger'} primaryText="Pasajero" />
                            <MenuItem value={'driver'} primaryText="Chofer" />
                        </SelectField>

                        <SelectField
                            style={{ width: '40%', marginRight: 4 }}
                            floatingLabelText="Moneda"
                            value={this.state.pocketBalanceCurrency}
                            onChange={(event, index, value) => this.setState({ pocketBalanceCurrency: value })}>

                            <MenuItem value={'ARS'} primaryText="Pesos" />
                            <MenuItem value={'USD'} primaryText="Dolares" />
                            <MenuItem value={'EUR'} primaryText="Euros" />
                        </SelectField>

                        <TextField
                            style={{ width: '40%', marginRight: 4 }}
                            name="Distancia"
                            hint="Distancia (mts)"
                            floatingLabelText="Distancia (mts)"
                            value={this.state.mts}
                            onChange={e => this.setState({ mts: e.target.value })} />

                        <TextField
                            style={{ width: '40%', marginRight: 4 }}
                            name="Costo inicial"
                            hint="Costo inicial"
                            floatingLabelText="Costo inicial"
                            value={this.state.initialValue}
                            onChange={e => this.setState({ initialValue: e.target.value })} />

                        <TextField
                            style={{ width: '40%', marginRight: 4 }}
                            name="Balance"
                            hint="Balance"
                            floatingLabelText="Balance"
                            value={this.state.pocketBalanceValue}
                            onChange={e => this.setState({ pocketBalanceValue: e.target.value })} />

                        <TextField
                            style={{ width: '40%', marginRight: 4 }}
                            name="Viajes de hoy"
                            hint="Viajes de hoy"
                            floatingLabelText="Viajes de hoy"
                            value={this.state.todayTripCount}
                            onChange={e => this.setState({ todayTripCount: e.target.value })} />

                        <TextField
                            style={{ width: '40%', marginRight: 4 }}
                            name="Viajes totales"
                            hint="Viajes totales"
                            floatingLabelText="Viajes totales"
                            value={this.state.tripCount}
                            onChange={e => this.setState({ tripCount: e.target.value })} />

                        <TextField
                            style={{ width: '75%' }}
                            name="Email"
                            hint="Email"
                            floatingLabelText="Email"
                            value={this.state.email}
                            multiLine={true}
                            onChange={e => this.setState({ email: e.target.value })} /><br />

                        <DatePicker
                            hintText="Dia"
                            floatingLabelText="Seleccionar fecha"
                            autoOk={true}
                            value={this.state.date}
                            onChange={this.handleDateChange} />

                        <TimePicker
                            format="24hr"
                            hintText="Hora"
                            floatingLabelText="Hora"
                            autoOk={true}
                            value={this.state.time}
                            onChange={this.handleHourChange} />
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