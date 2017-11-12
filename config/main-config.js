const mainPath = '/main';
const apiVersion = 'v1';

module.exports = {
    mainPath,
    apiVersion,
    apiRoutesPrefix: `/api/${apiVersion}`,
    tokenSecret: 'El antiguo equipo de bindie',
    PAYMENTS_API_URL: process.env.PAYMENTS_API_URL || 'https://shielded-escarpment-27661.herokuapp.com/api/v1',
    LLEVAME_PING_URL: 'api/v1/keepalive'
};