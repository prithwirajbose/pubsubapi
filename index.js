var PORT = process.env.PORT || 5000;

var express = require('express'),
    request = require('request'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    routes = require('./routes'),
    expressValidator = require('express-validator');

var errorHandling = require('./libs/error-handler.js');
var customValidators = require('./libs/custom-validators.js');
var appUtils = require('./libs/app-utils');
//Create Express App
var app = express();

//Parse Input as JSON
app.use(bodyParser.json({ extended: true }));
app.use('/', appUtils.setContext);
app.use(errorHandling.globalError);
app.use(cors());

//Custom Validators
app = customValidators.injectCustomValidators(app);

//Setup Routes
app.use('/', routes);

var server = app.listen(PORT, function() {
    console.log('NodeJS API Running on port ' + PORT);
});
module.exports = server;