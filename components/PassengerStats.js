import React from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import Snackbar from 'material-ui/Snackbar';

import Paper from 'material-ui/Paper';

import axios from 'axios';

import ActionHeader from './ActionHeader';

import moment from 'moment';
import Chart from 'chart.js/dist/Chart.min.js';

/* FIN DE IMPORTS -------------------------------------------------------------------------------------- */

const EMPTY_CALLBACK = () => { };

const PassengerStats = React.createClass({
    getDefaultProps() {
        return { token: '', server: {}, goBack: EMPTY_CALLBACK };
    },

    getInitialState() {
        return {
            hits: [],
            snackbarOpen: false,
            snackbarMessage: ''
        };
    },

    loadStats() {
        console.log('loadStats:');
        const serverId = this.props.server.id;
        console.log('this.chartCanvas:');
        console.log(this.chartCanvas);
        const ctx = this.chartCanvas.getContext('2d');

        const url = `/api/v1/servers/${serverId}/freqpassengers?token=${this.props.token}`;
        axios.get(url).then(contents => {
            const labels = contents.data.map(d => d.username);
            const data = contents.data.map(d => d.trip_count);
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Pasajeros frecuentes',
                        data,
                        backgroundColor: '#7AB73E',
                    }]
                }, options: {
                    responsive: true,
                    scales: {
                        yAxes: [{
                            display: true,
                            ticks: {
                                beginAtZero: true,
                            }
                        }]
                    }
                }
            });
        }).catch(cause => {
            console.error(cause);
            this.openSnackbar(cause.message);
        });

    },

    componentDidMount() {
        console.log('componentDidMount:');
        console.log('\ttoken: ' + this.props.token);
        console.log('\tserver: ' + this.props.server);
        this.loadStats();
    },

    openSnackbar(msg) {
        console.log('Abriendo snack bar');
        this.setState({ snackbarOpen: true, snackbarMessage: msg });
    },

    handleSnackbarRequestClose() {
        this.setState({ snackbarOpen: false });
    },

    render() {
        const serverName = this.props.server ? this.props.server.name : '';
        console.log('serverName: ' + serverName);

        return (
            <div>

                <ActionHeader onClick={this.props.goBack} />

                <div className='with-margin'>
                    <h1>Estadisticas {serverName}</h1>

                    <Paper
                        zDepth={2}
                        className='with-margin'
                        style={{ backgroundColor: 'rgba(255,255,255,0.5)' }} >

                        <div style={{ width: '100%', height: '80%' }}>
                            <canvas ref={chartCanvas => { this.chartCanvas = chartCanvas; }} id="myChart"></canvas>
                        </div>

                        <Snackbar
                            open={this.state.snackbarOpen}
                            message={this.state.snackbarMessage}
                            autoHideDuration={3000}
                            onRequestClose={this.handleSnackbarRequestClose} />
                    </Paper>
                </div >

            </div >
        );
    },

});

export default PassengerStats;