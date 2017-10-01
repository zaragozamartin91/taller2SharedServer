const express = require('express');
const router = express.Router();
const path = require('path');
const config = require('../config/main-config');
const logger = require('log4js').getLogger();

router.get('/', (req, res) => {
    res.redirect(config.mainPath);
});

/* GET home page. */
router.get(config.mainPath, (req, res) => {
    logger.debug('HEEEYYY');
    res.render('index', { title: 'Shared server' });
});

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect(config.mainPath);
});

module.exports = router;
