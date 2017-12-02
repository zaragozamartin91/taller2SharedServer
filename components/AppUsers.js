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
import moment from 'moment';

import ActionHeader from './ActionHeader';
import Header from './Header';

/* FIN DE IMPORTS -------------------------------------------------------------------------------------- */

const EMPTY_CALLBACK = () => { };
const CURRS = { ARS: 'PESOS', USD: 'DOLARES', EUR: 'EUROS' };

function UserBalance(props) {
    const { user, user: { balance }, goBack } = props;
    const balanceCards = balance.map(bal => {

        return (<Card style={{ backgroundColor: "rgba(255,255,255,0.7)" }} >
            <CardHeader
                title={`Balance de ${user.id}`}
                subtitle={`moneda ${CURRS[bal.currency] || 'PESOS'}`} />

            <CardText expandable={false}>
                <p><strong>Valor:</strong> {bal.value}</p>
            </CardText>
        </Card>);
    });

    const elem = (<div>
        <ActionHeader onClick={goBack} />
        {balanceCards}
    </div>);
    console.log(elem);
    return elem;
}

function UserCars(props) {
    const { user, user: { cars }, goBack } = props;
    console.log('UserCars:');
    console.log(user);
    console.log(cars);
    const carCards = cars.map(car => {
        const carProperties = car.properties.map(property => <p><strong>{property.name}:</strong> {property.value}</p>);

        return (<Card style={{ backgroundColor: "rgba(255,255,255,0.7)" }} >
            <CardHeader
                title={`Auto ${car.id}`}
                subtitle={`de ${user.id}`} />

            <CardText expandable={false}>{carProperties}</CardText>
        </Card>);
    });

    const elem = (<div>
        <ActionHeader onClick={goBack} />
        {carCards}
    </div>);
    console.log(elem);
    return elem;
}

const AppUsers = React.createClass({
    getDefaultProps() {
        return { token: '' };
    },

    getInitialState() {
        return {
            users: [],
            errSnackbarOpen: false,
            carsUser: null,
            balanceUser: null
        };
    },

    loadUsers() {
        axios.get(`/api/v1/users?token=${this.props.token}`)
            .then(contents => {
                const users = contents.data.users;
                console.log('users:');
                console.log(users);
                this.setState({ users });
            })
            .catch(cause => {
                console.error(cause);
                this.openErrSnackbar('Error al obtener los usuarios');
            });
    },

    componentDidMount() {
        console.log('token: ' + this.props.token);
        this.loadUsers();
    },

    openErrSnackbar(msg) {
        console.log('Abriendo snack bar');
        this.setState({ errSnackbarOpen: true, errSnackbarMessage: msg });
    },

    handleErrSnackbarRequestClose() {
        this.setState({ errSnackbarOpen: false });
    },

    showCars(user) {
        const self = this;
        return function () {
            self.setState({ carsUser: user });
        };
    },

    showBalance(user) {
        const self = this;
        return function () {
            self.setState({ balanceUser: user });
        };
    },

    handleUserDeleteSuccess(user) {
        const self = this;
        return function () {
            self.closeDeleteDialog(user)();
            self.loadUsers();
            self.openErrSnackbar('Usuario eliminado');
        };
    },

    handleUserEditSuccess(user) {
        const self = this;
        return function () {
            self.closeEditCard(user)();
            self.loadUsers();
            self.openErrSnackbar('Usuario actualizado');
        };
    },

    render() {
        if (this.state.users.length == 0) {
            return <div>No users...</div>;
        }

        let mainElem = null;

        if (this.state.carsUser) {
            mainElem = <UserCars
                user={this.state.carsUser}
                goBack={() => this.setState({ carsUser: null })}
            />;
        }

        if (this.state.balanceUser) {
            mainElem = <UserBalance
                user={this.state.balanceUser}
                goBack={() => this.setState({ balanceUser: null })}
            />;
        }

        mainElem = mainElem || this.state.users.map(user => {
            const backColors = ['#1A9386', 'rgb(21, 114, 105)', '#134E48'];
            const mdate = moment(user.birthdate);
            const birth = `${mdate.date()}/${mdate.month() + 1}/${mdate.year()}`;

            const cardActions = user.type == 'driver' ?
                <CardActions><FlatButton label="Autos" onClick={this.showCars(user)} /><FlatButton label="Balance" onClick={this.showBalance(user)} /></CardActions> :
                <CardActions><FlatButton label="Balance" onClick={this.showBalance(user)} /></CardActions>;

            return (<Card style={{ backgroundColor: "rgba(255,255,255,0.7)" }} >
                <CardHeader
                    title={user.id}
                    subtitle={user.applicationOwner} />

                <CardText expandable={false}>
                    <p><strong>Tipo:</strong> {user.type == 'passenger' ? 'pasajero' : 'chofer'}</p>
                    <p><strong>Username:</strong> {user.username}</p>
                    <p><strong>Nombre:</strong> {user.name} {user.surname}</p>
                    <p><strong>Nacionalidad:</strong> {user.country}</p>
                    <p><strong>Correo:</strong> {user.email}</p>
                    <p><strong>Fecha de nacimiento:</strong> {birth}</p>
                </CardText>

                {cardActions}
            </Card>);
        });


        return (
            <div >
                {mainElem}

                <Snackbar
                    open={this.state.errSnackbarOpen}
                    message={this.state.errSnackbarMessage}
                    autoHideDuration={3000}
                    onRequestClose={this.handleErrSnackbarRequestClose}
                />
            </div >
        );
    },

});

export default AppUsers;