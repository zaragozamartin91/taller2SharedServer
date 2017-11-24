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
import RuleEditor from './RuleEditor';

import axios from 'axios';

import Header from './Header';

/* FIN DE IMPORTS -------------------------------------------------------------------------------------- */

const EMPTY_CALLBACK = () => { };

function DeleteRuleDialog(props) {
    const ruleId = props.rule.id || props.rule;
    const token = props.token;

    function deleteRule() {
        axios.delete(`/api/v1/rules/${ruleId}?token=${token}`)
            .then(contents => {
                console.log('Regla eliminada');
                props.onSuccess();
            }).catch(cause => {
                console.error(cause);
                props.onError();
            });
    }

    const actions = [
        <FlatButton
            label="Cancelar"
            primary={true}
            onClick={props.onClose}
        />,
        <FlatButton
            label="Eliminar"
            primary={true}
            onClick={deleteRule}
        />,
    ];

    return (
        <Dialog
            title={`Eliminar regla ${ruleId}`}
            actions={actions}
            modal={true}
            open={props.open}>
            Desea eliminar la regla?
        </Dialog>
    );
}

const Rules = React.createClass({
    getDefaultProps() {
        return { user: {}, token: '' };
    },

    getInitialState() {
        return {
            rules: [],
            snackbarOpen: false,
            snackbarMessage: '',
            deleteRuleDialog: null,
            editRule: null
        };
    },

    loadRules() {
        axios.get(`/api/v1/rules?token=${this.props.token}`)
            .then(contents => {
                const rules = contents.data;
                console.log('rules:');
                console.log(rules);
                this.setState({ rules });
            })
            .catch(cause => {
                console.error(cause);
                this.openSnackbar('Error al obtener las reglas');
            });
    },

    componentDidMount() {
        console.log('token: ' + this.props.token);
        this.loadRules();
    },

    openSnackbar(msg) {
        console.log('Abriendo snack bar');
        this.setState({ snackbarOpen: true, snackbarMessage: msg });
    },

    handleSnackbarRequestClose() {
        this.setState({ snackbarOpen: false });
    },

    openDeleteDialog(rule) {
        const self = this;
        return function () {
            self.setState({ deleteRuleDialog: rule });
        };
    },

    openEditCard(rule) {
        const self = this;
        return function () {
            self.setState({ editRule: rule });
        };
    },

    render() {
        let mainElem = null;

        if (this.state.deleteRuleDialog) {
            const ruleToDelete = this.state.deleteRuleDialog;
            mainElem = <DeleteRuleDialog
                token={this.props.token}
                rule={ruleToDelete}
                open={true}
                onSuccess={() => {
                    this.loadRules();
                    this.setState({ deleteRuleDialog: null });
                    this.openSnackbar('Regla eliminada');
                }}
                onClose={() => this.setState({ deleteRuleDialog: null })}
                onError={() => {
                    this.setState({ deleteRuleDialog: null });
                    this.openSnackbar(`Error al eliminar regla ${ruleToDelete.id}`);
                }} />;
        }

        if (this.state.editRule) {
            const ruleToEdit = this.state.editRule;
            mainElem = <RuleEditor
                token={this.props.token}
                rule={ruleToEdit}
                onClose={() => this.setState({ editRule: null })}
                onSuccess={() => {
                    this.loadRules();
                    this.setState({ editRule: null });
                    this.openSnackbar('Regla actualizada');
                }}
                onError={() => {
                    this.setState({ editRule: null });
                    this.openSnackbar('Error al actualizar la regla');
                }}
            />;
        }

        mainElem = mainElem || this.state.rules.map(rule => {
            const title = `Regla ${rule.id} :: ${rule.language}`;
            const subtitle = `Prioridad ${rule.priority}`;
            const condition = rule.blob.condition;
            const consequence = rule.blob.consequence;

            const backgroundColor = rule.active ? "rgba(255,255,255,0.7)" : "rgba(255,123,123,0.7)";

            return (
                <Card style={{ backgroundColor }} >
                    <CardHeader
                        title={title}
                        subtitle={subtitle} />
                    <CardText expandable={false}>
                        <p><strong>Condicion:</strong> {condition} </p>
                        <p><strong>Consecuencia:</strong> {consequence} </p>
                    </CardText>
                    <CardActions>
                        <FlatButton label="Eliminar" onClick={this.openDeleteDialog(rule)} />
                        <FlatButton label="Editar" onClick={this.openEditCard(rule)} />
                    </CardActions>
                </Card>
            );
        });

        return (
            <div>
                <div className='with-margin'>

                    {mainElem}

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

export default Rules;