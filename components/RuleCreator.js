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

import axios from 'axios';

import Header from './Header';

const min = 1;
const max = 20;
const EMPTY_CALLBACK = () => { };

const RuleCreator = React.createClass({
    getDefaultProps() {
        return {
            token: '',
        };
    },

    getInitialState() {
        return {
            condition: 'R.when(true);',
            consequence: 'this.operations.push(v => v);R.next();',
            priority: max,
            active: true,
            language: 'node-rules/javascript',
            snackbarOpen: false,
            snackbarMessage: '',
        };
    },

    toggleActive() {
        const active = !this.state.active;
        this.setState({ active });
    },

    handleSlider(event, value) {
        console.log('Slider value: ' + value);
        const priority = max - value + min;
        this.setState({ priority });
    },

    createRule() {
        const rule = {
            "language": this.state.language,
            "blob": {
                "condition": `function(R){ ${this.state.condition} }`,
                "consequence": `function(R){ ${this.state.consequence} }`,
                "on": true
            },
            "priority": this.state.priority,
            "active": this.state.active
        };

        const config = { headers: { 'Authorization': `Bearer ${this.props.token}` } };
        axios.post(`/api/v1/rules`, rule, config)
            .then(contents => {
                console.log(contents.data);
                this.openSnackbar('Regla creada');
            }).catch(cause => {
                console.error(cause);
                this.openSnackbar('Error al crear regla');
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
        const paddingRight = 10;
        const paddingLeft = 10;
        const color = '#00BCD4';
        const fontSize = 16;

        return (
            <div>
                <Card style={{ backgroundColor: "rgba(255,255,255,0.7)" }} >
                    <CardHeader
                        title={'Crear regla '}
                        subtitle={'Lenguaje ' + this.state.language}
                    />
                    <CardText>
                        <TextField
                            floatingLabelText="Lenguaje"
                            hint="Lenguaje"
                            value={this.state.language}
                            disabled={true}
                        /><br /><br />

                        <span style={{ color, fontSize }}>Condicion</span>
                        <div style={{ width: '100%', color, fontSize }}>
                            <span style={{ paddingRight }}>{'function(R){'}</span>
                            <TextField
                                style={{ width: '50%' }}
                                name="Condicion"
                                value={this.state.condition}
                                multiLine={false}
                                onChange={e => this.setState({ condition: e.target.value })} />
                            <span style={{ paddingLeft, }}>{'}'}</span>
                        </div>

                        <span style={{ color, fontSize }}>Consecuencia</span>
                        <div style={{ width: '100%', color, fontSize }}>
                            <span style={{ paddingRight }}>{'function(R){'}</span>
                            <TextField
                                style={{ width: '50%' }}
                                name="Consecuencia"
                                value={this.state.consequence}
                                multiLine={false}
                                onChange={e => this.setState({ consequence: e.target.value })} />
                            <span style={{ paddingLeft }}>{'}'}</span>
                        </div>

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
                        <FlatButton label="Crear" onClick={this.createRule} primary={true} />
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

export default RuleCreator;