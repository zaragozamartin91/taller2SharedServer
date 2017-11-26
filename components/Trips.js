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

import ActionHeader from './ActionHeader';

import axios from 'axios';

import Header from './Header';

/* FIN DE IMPORTS -------------------------------------------------------------------------------------- */

//const goBackIcon = <FontIcon className="material-icons">restore</FontIcon>;
const goBackIcon = <img
    src="/images/ic_restore_white_24px.svg"
    alt="Volver"
    style={{ width: 25, height: 25, display: 'inline' }} />;

const EMPTY_CALLBACK = () => { };

const Trips = React.createClass({
    getDefaultProps() {
        return { token: '', server: {}, goBack: EMPTY_CALLBACK };
    },

    getInitialState() {
        return {
            trips: [],
            snackbarOpen: false,
            snackbarMessage: ''
        };
    },

    loadTrips() {
        const serverId = this.props.server.id;
        axios.get(`/api/v1/trips/server/${serverId}?token=${this.props.token}`)
            .then(contents => {
                const trips = contents.data.trips;
                console.log('trips:');
                console.log(trips);
                this.setState({ trips });
            })
            .catch(cause => {
                console.error(cause);
                this.openSnackbar('Error al obtener los Viajes');
            });
    },

    componentDidMount() {
        console.log('token: ' + this.props.token);
        console.log('server: ' + this.props.server);
        this.loadTrips();
    },

    openSnackbar(msg) {
        console.log('Abriendo snack bar');
        this.setState({ snackbarOpen: true, snackbarMessage: msg });
    },

    handleSnackbarRequestClose() {
        this.setState({ snackbarOpen: false });
    },

    render() {
        const tripCards = this.state.trips.map(trip => {
            const title = `Viaje ${trip.id}`;
            const subtitle = `De ${trip.start.address.street} a ${trip.end.address.street}`;
            const distance = `${trip.distance / 1000} Kilometros`;
            const totalTime = `${trip.totalTime / 60} Minutos`;
            const waitTime = `${trip.waitTime / 60} Minutos`;
            const travelTime = `${trip.travelTime / 60} Minutos`;
            return (
                <Card style={{ backgroundColor: "rgba(255,255,255,0.7)" }} >
                    <CardHeader
                        title={title}
                        subtitle={subtitle} />
                    <CardText expandable={false}>
                        <p><strong>Pasajero:</strong> {trip.passenger} </p>
                        <p><strong>Conductor:</strong> {trip.driver} </p>
                        <p><strong>Distancia:</strong> {distance} </p>
                        <p><strong>Tiempo total:</strong> {totalTime} </p>
                        <p><strong>Tiempo de espera:</strong> {waitTime} </p>
                        <p><strong>Tiempo de viaje:</strong> {travelTime} </p>
                    </CardText>
                </Card>
            );
        });

        const serverName = this.props.server ? this.props.server.name : '';
        console.log('serverName: ' + serverName);

        return (
            <div>
                <ActionHeader onClick={this.props.goBack} />

                <div className='with-margin'>
                    <h1>Viajes de {serverName}</h1>
                    {tripCards}
                    <Snackbar
                        open={this.state.snackbarOpen}
                        message={this.state.snackbarMessage}
                        autoHideDuration={3000}
                        onRequestClose={this.handleSnackbarRequestClose} />

                </div>

            </div>
        );
    }
});

export default Trips;