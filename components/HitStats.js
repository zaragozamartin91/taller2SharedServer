import React from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import Snackbar from 'material-ui/Snackbar';

import Paper from 'material-ui/Paper';
import { BottomNavigation, BottomNavigationItem } from 'material-ui/BottomNavigation';

import axios from 'axios';

import Header from './Header';

import moment from 'moment';
import Chart from 'chart.js/dist/Chart.min.js';

/* FIN DE IMPORTS -------------------------------------------------------------------------------------- */

const HOURS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

//const goBackIcon = <FontIcon className="material-icons">restore</FontIcon>;
const goBackIcon = <img
    src="/images/ic_restore_white_24px.svg"
    alt="Volver"
    style={{ width: 25, height: 25, display: 'inline' }} />;

const EMPTY_CALLBACK = () => { };

const HitStats = React.createClass({
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

    loadHits() {
        console.log('loadHits:');
        const serverId = this.props.server.id;
        console.log('this.chartCanvas:');
        console.log(this.chartCanvas);

        const url = `/api/v1/hits/${serverId}?token=${this.props.token}`;
        axios.get(url)
            .then(contents => {
                const data = contents.data;
                const tuples = HOURS.map(h => data.find(d => d.hour == h) || { count: 0, hour: h });
                const values = tuples.map(t => t.count);
                const maxValue = Math.max(...values);
                const canvasCtx = this.chartCanvas.getContext('2d');

                const myChart = new Chart(canvasCtx, {
                    type: 'line',
                    data: {
                        labels: HOURS,
                        datasets: [{
                            label: 'Hits por hora',
                            data: values,
                            backgroundColor: 'rgba(153,255,51,0.4)',
                        }],
                    }, options: {
                        responsive: true,
                        scales: {
                            xAxes: [{
                                display: true,
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Hora'
                                }
                            }],
                            yAxes: [{
                                display: true,
                                ticks: {
                                    beginAtZero: true,
                                    steps: 10,
                                    stepValue: 1,
                                    max: maxValue + 1
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
        this.loadHits();
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
                <h1>Estadisticas {serverName}</h1>

                <div style={{ width: '100%', height: '80%' }}>
                    <canvas ref={chartCanvas => { this.chartCanvas = chartCanvas; }} id="myChart"></canvas>
                </div>

                <Snackbar
                    open={this.state.snackbarOpen}
                    message={this.state.snackbarMessage}
                    autoHideDuration={3000}
                    onRequestClose={this.handleSnackbarRequestClose} />


                <BottomNavigation style={{ backgroundColor: '#00BCD4', width: '100%', color: 'white' }}>
                    <BottomNavigationItem style={{ color: 'white' }}
                        label="Volver"
                        icon={goBackIcon}
                        onClick={this.props.goBack} />
                </BottomNavigation>

            </div >
        );
    },

});

export default HitStats;