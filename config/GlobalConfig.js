console.log('DEFINIENDO GlobalConfig');

/**
 * Configuracion global.
 * @class
 */
function GlobalConfig() {
    this.profile = 'dev';
    this.mainPath = '/main';
    this.apiVersion = 'v1';
}

/**
 * Obtiene el prefijo de rutas de la API.
 * @return {string} prefijo de rutas de la API.
 */
GlobalConfig.prototype.getApiRoutePrefix = function() {
    return `/api/${this.apiVersion}`;
};

/**
 * Construye una ruta.
 * @param {string} route Sufijo de ruta (ej: /users/all).
 * @return {string} ruta construida (ej: /api/v1/users/all).
 */
GlobalConfig.prototype.buildRoute = function (route) {
    const routePrefix = this.getApiRoutePrefix();
    return `${routePrefix}${route}`;
};

/**
 * Establece el perfil de desarrollo.
 * @param {string} profile Perfil usado (ej: "test").
 * @return {GlobalConfig} this.
 */
GlobalConfig.prototype.setProfile = function (profile) {
    this.profile = profile;
    return this;
};

const globalCfg = new GlobalConfig();

module.exports = globalCfg;