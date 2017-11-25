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

/*
import FontIcon from 'material-ui/FontIcon';
import { blue500, red500, greenA200 } from 'material-ui/styles/colors';
*/

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
            onSuccess: EMPTY_CALLBACK,
            onError: EMPTY_CALLBACK
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
            tripCount
        };
    },

    componentDidMount() {
        const { blob: { condition, consequence }, priority, active } = this.props.rule;
        console.log('Seteando el estado del editor:');
        console.log(condition, consequence, priority, active);
        this.setState({ condition, consequence, priority, active });
    },

    handleSlider(event, value) {
        console.log('Slider value: ' + value);
        const priority = max - value + min;
        this.setState({ priority });
    },

    updateRule() {
        const rule = {
            "_ref": this.props.rule._ref,
            "language": this.props.rule.language,
            "blob": {
                "condition": this.state.condition,
                "consequence": this.state.consequence,
                "on": true
            },
            "priority": this.state.priority,
            "active": this.state.active
        };

        const config = { headers: { 'Authorization': `Bearer ${this.props.token}` } };
        axios.put(`/api/v1/rules/${this.props.rule.id}`, rule, config)
            .then(contents => {
                console.log(contents.data);
                this.props.onSuccess();
            }).catch(cause => {
                console.error(cause);
                this.props.onError();
            });
    },

    render() {
        const rule = this.props.rule;
        const iconStyles = {
            marginRight: 24,
        };
        return (
            <Card style={{ backgroundColor: "rgba(255,255,255,0.7)" }} >
                <CardHeader
                    title={'Editar regla ' + rule.id}
                    subtitle={'Lenguaje ' + rule.language}
                />
                <CardText>
                    <TextField
                        style={{ width: '75%' }}
                        name="Condicion"
                        hint="Condicion"
                        floatingLabelText="Condicion"
                        value={this.state.condition}
                        multiLine={true}
                        onChange={e => this.setState({ condition: e.target.value })} />

                    <TextField
                        style={{ width: '75%' }}
                        name="Consecuencia"
                        hint="Consecuencia"
                        floatingLabelText="Consecuencia"
                        value={this.state.consequence}
                        multiLine={true}
                        onChange={e => this.setState({ consequence: e.target.value })} /><br />


                    <p>Prioridad: {this.state.priority == 1 ? 'Maxima' : this.state.priority}</p>
                    <Slider
                        min={min}
                        max={max}
                        step={1}
                        value={max - this.state.priority + 1}
                        onChange={this.handleSlider} />

                    <Checkbox
                        label='Activa'
                        checked={this.state.active}
                        onClick={this.toggleActive} />
                </CardText>
                <CardActions>
                    <FlatButton label="Cancelar" onClick={this.props.onClose} />
                    <FlatButton label="Actualizar" onClick={this.updateRule} primary={true} />
                </CardActions>
            </Card>);
    }
});

export default RuleTester;