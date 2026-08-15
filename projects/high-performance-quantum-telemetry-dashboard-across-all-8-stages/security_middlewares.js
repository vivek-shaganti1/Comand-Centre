const express = require('express');
const app = express();
const authenticate = require('./authentication');
const accessControl = require('./access_control');
app.use(authenticate);
app.use(accessControl);
module.exports = app;