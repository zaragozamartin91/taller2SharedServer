const express = require('express');
const router = express.Router();
const path = require('path');
const GlobalConfig = require('../GlobalConfig');

router.get('/', (req, res) => {
  res.redirect(GlobalConfig.mainPath);
});

/* GET home page. */
router.get(GlobalConfig.mainPath, (req, res) => {
  res.render('index', { title: 'Shared server' });
});

router.get('/login', (req, res) => {
  res.render('login', { title: 'Iniciar sesion' });
});

module.exports = router;
