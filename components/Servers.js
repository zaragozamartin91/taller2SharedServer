import React from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import Checkbox from 'material-ui/Checkbox';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import Snackbar from 'material-ui/Snackbar';

import axios from 'axios';

import Header from './Header';
import Trips from './Trips';
import HitStats from './HitStats';
import PassengerStats from './PassengerStats';

/* FIN DE IMPORTS -------------------------------------------------------------------------------------- */

const EMPTY_CALLBACK = () => { };

const CARD_STYLES = {
    unknown: { backgroundColor: 'rgba(255,255,255,0.7)', color: 'black' },
    ok: { backgroundColor: 'rgba(49, 182, 116, 0.64)', color: 'black' },
    err: { backgroundColor: 'rgba(219, 64, 64, 0.75)', color: 'black' },
};

const STATUS_SUFFIX = {
    unknown: '',
    ok: ' - OK',
    err: ' - NO RESPONDE',
};

function DeleteServerDialog(props) {
    const serverId = props.server.id || props.server;
    const token = props.token;

    function deleterServer() {
        axios.delete(`/api/v1/servers/${serverId}?token=${token}`)
            .then(props.onSuccess)
            .catch(props.onError);
    }

    const actions = [
        <FlatButton
            label="Eliminar"
            primary={true}
            onClick={deleterServer}
        />,
        <FlatButton
            label="Cancelar"
            primary={true}
            onClick={props.onClose}
        />,
    ];

    return (
        <Dialog
            title={`Eliminar servidor ${serverId}`}
            actions={actions}
            modal={false}
            open={true}>
            ¿Esta seguro de querer eliminar el servidor?
            Esta accion no es reversible
        </Dialog>
    );
}

function ShowTokenDialog(props) {
    const actions = [
        <FlatButton
            label="Ok"
            primary={true}
            onClick={props.onClose}
        />,
    ];

    return (
        <Dialog
            title={`Token de servidor ${props.server.id}`}
            actions={actions}
            modal={false}
            open={true}>
            {props.serverToken}
        </Dialog>
    );
}

const Servers = React.createClass({
    getDefaultProps() {
        return { token: '' };
    },

    getInitialState() {
        return {
            servers: [],
            snackbarOpen: false,
            snackbarMessage: '',
            tripsServer: null,
            hitsServer: null,
            passengersServer: null,

            tokenServer: null,
            serverToken: null,

            deleteServer: null
        };
    },

    loadServers() {
        axios.get(`/api/v1/servers?token=${this.props.token}`)
            .then(contents => {
                const servers = contents.data.servers;
                console.log('servers:');
                console.log(servers);
                servers.forEach(s => s.status = 'unknown');
                this.setState({ servers });
            })
            .catch(cause => {
                console.error(cause);
                this.openSnackbar('Error al obtener los servidores');
            });
    },

    componentDidMount() {
        console.log('token: ' + this.props.token);
        this.loadServers();
    },

    openSnackbar(msg) {
        console.log('Abriendo snack bar');
        this.setState({ snackbarOpen: true, snackbarMessage: msg });
    },

    handleSnackbarRequestClose() {
        this.setState({ snackbarOpen: false });
    },

    /* TODO: HACER LLAMADA A APP SERVER */
    checkServer(server) {
        const serverId = server.id || server;
        const self = this;

        return function () {
            axios.get(`/api/v1/servers/${serverId}/keepalive?token=${self.props.token}`)
                .then(contents => {
                    server.status = 'ok';
                    self.setState({ servers: self.state.servers });
                })
                .catch(err => {
                    server.status = 'err';
                    self.setState({ servers: self.state.servers });
                });
        };
    },

    viewTrips(server) {
        const self = this;
        return function () {
            self.setState({ tripsServer: server });
        };
    },

    viewHits(server) {
        const self = this;
        return function () {
            self.setState({ hitsServer: server });
        };
    },

    viewPassengerStats(server) {
        const self = this;
        return function () {
            self.setState({ passengersServer: server });
        };
    },

    showToken(server) {
        const self = this;
        return function () {
            axios.get(`/api/v1/token/${server.id}?token=${self.props.token}`)
                .then(response => {
                    self.setState({ tokenServer: server, serverToken: response.data.token });
                })
                .catch(cause => {
                    self.openSnackbar('Error al obtener el token');
                });
        };
    },

    showDeleteDialog(server) {
        const self = this;
        return () => self.setState({ deleterServer: server });
    },

    render() {
        let mainView;
        if (this.state.tripsServer) {
            console.log('Renderizando vista de viajes');
            mainView = <Trips
                server={this.state.tripsServer}
                token={this.props.token}
                goBack={() => this.setState({ tripsServer: null })} />;
        } else if (this.state.hitsServer) {
            console.log('Renderizando vista de estadisticas de endpoints');
            mainView = <HitStats
                server={this.state.hitsServer}
                token={this.props.token}
                goBack={() => this.setState({ hitsServer: null })} />;
        } else if (this.state.passengersServer) {
            console.log('Renderizando vista de estadisticas de pasajeros');
            mainView = <PassengerStats
                server={this.state.passengersServer}
                token={this.props.token}
                goBack={() => this.setState({ passengersServer: null })} />;
        } else if (this.state.tokenServer) {
            console.log('Renderizando dialogo de token de servidor');
            mainView = <ShowTokenDialog
                server={this.state.tokenServer}
                serverToken={this.state.serverToken}
                onClose={() => this.setState({ tokenServer: null, serverToken: null })}
            />;
        } else if (this.state.deleterServer) {
            console.log('Renderizando dialogo de eliminacion de servidor');
            mainView = <DeleteServerDialog
                server={this.state.deleterServer}
                token={this.props.token}
                onClose={() => this.setState({ deleterServer: null })}
                onSuccess={data => {
                    this.openSnackbar(`Servidor ${this.state.deleterServer.id} Eliminado`);
                    this.setState({ deleterServer: null });
                    this.loadServers();
                }}
                onError={cause => {
                    this.openSnackbar(`Error: ${cause.message}`);
                    this.setState({ deleterServer: null });
                }}
            />;
        } else {
            console.log('Renderizando vista de servidores');
            mainView = this.state.servers.map(server => {
                const style = JSON.parse(JSON.stringify(CARD_STYLES[server.status]));
                const subtitle = `${server.name}${STATUS_SUFFIX[server.status]}`;
                return (
                    <Card style={style}>
                        <CardHeader
                            title={server.id}
                            subtitle={subtitle} />
                        <CardText expandable={false}>
                            <p><strong>Creado por:</strong> {server.createdBy} </p>
                            <p><strong>Creado en:</strong> {server.createdTime} </p>
                            <p><strong>Ultima conexion:</strong> {server.lastConnection} </p>
                            {server.url ?
                                <p><strong>Url:</strong> <a>{server.url}</a> </p> :
                                <p><strong>Url DESCONOCIDA</strong> </p>}
                        </CardText>
                        <CardActions>
                            <FlatButton label="Eliminar" secondary={true} onClick={this.showDeleteDialog(server)} />
                            <FlatButton label="Token" onClick={this.showToken(server)} />
                            <FlatButton label="Verificar" onClick={this.checkServer(server)} />
                            <FlatButton label="Viajes" onClick={this.viewTrips(server)} />
                            <FlatButton label="Hits" onClick={this.viewHits(server)} />
                            <FlatButton label="Pasajeros" onClick={this.viewPassengerStats(server)} />
                        </CardActions>
                    </Card>
                );
            });
        }

        return (
            <div>
                {mainView}
                <Snackbar
                    open={this.state.snackbarOpen}
                    message={this.state.snackbarMessage}
                    autoHideDuration={3000}
                    onRequestClose={this.handleSnackbarRequestClose} />
            </div >
        );
    }
});

export default Servers;