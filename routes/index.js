const routes = require('express').Router();

var _ = require('lodash');
var errorHandler = require('../libs/error-handler.js');
var pubsubController = require('../controllers/pubsub');
var path = require('path');


function setupHeader(res) {
    res.setHeader('Content-Type', 'application/json');
}

function checkRequestParamNames(req, res, controller) {
    console.log(controller.allowedRequestFields);
    var failedKeys = '';
    var comma = '';
    if (_.has(controller, 'allowedRequestFields') && _.isArray(_.get(controller, 'allowedRequestFields'))) {
        var allowedRequestFields = _.get(controller, 'allowedRequestFields');
        if (req.body) {
            for (var key in req.body) {
                if (req.body.hasOwnProperty(key)) {
                    if (!_.includes(allowedRequestFields, key)) {
                        failedKeys += comma + key;
                        comma = ', ';
                    }
                }
            }
        }
    }
    if (!_.isNil(failedKeys) && failedKeys.length > 0) {
        res = errorHandler.requestError(res, { "msg": "request-param-not-allowed", "param": failedKeys });
        return false;
    }
    return true;
}

routes.get('/', function(req, res) {
     res.sendFile(path.join(__dirname+ '/../talk.html'));
});

routes.post('/publish', function(req, res) {
    if (!checkRequestParamNames(req, res, pubsubController)) {
        return res;
    }
    setupHeader(res);

    if (pubsubController.validateRequest(req, res)) {
        pubsubController.publish(req.body, req, res).then(function(respData) {
            return res.status(200).json(respData);
        }).catch(function(err) {
            console.log(err);
            errorHandler.appError(res, "An internal error has occured. Please try again.", 500);
        });
    }
});

routes.post('/subscribe', function(req, res) {
    if (!checkRequestParamNames(req, res, pubsubController)) {
        return res;
    }
    setupHeader(res);

    if (pubsubController.validateRequest(req, res)) {
        pubsubController.subscribe(req.body, req, res).then(function(respData) {
            return res.status(200).json(respData);
        }).catch(function(err) {
            console.log(err);
            errorHandler.appError(res, "An internal error has occured. Please try again.", 500);
        });
    }
});


module.exports = routes;
