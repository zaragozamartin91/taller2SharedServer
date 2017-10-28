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
        var ctx = this.chartCanvas.getContext('2d');
        var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                datasets: [{
                    label: 'requests',
                    data: [500, 600, 450, 350, 700, 720, 600, 620, 640, 660, 720, 820],
                    backgroundColor: 'rgba(153,255,51,0.4)',

                }],

            }, options: {
                responsive: true,
                scales: {
                    xAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Mes'
                        }
                    }],
                    yAxes: [{
                        display: true,
                        ticks: {
                            beginAtZero: true,
                            steps: 50,
                            stepValue: 5,
                            max: 900
                        }
                    }]
                }
            }
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

        const chartCanvasDiv = <div style={{ width: '100%', height: '100%' }}>
            <canvas ref={chartCanvas => { this.chartCanvas = chartCanvas; }} id="myChart"></canvas>
        </div>;

        return (
            <div>
                <h1>Estadisticas {serverName}</h1>

                {chartCanvasDiv}

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