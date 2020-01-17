var _ = require('lodash'),
    request = require('request'),
    expressValidator = require('express-validator'),
    errorHandler = require('../libs/error-handler'),
    DBService = require('../services/db.service'),
    Promise = require('bluebird'),
    pubsubModel = require('../models/pubsub.model');

var dbService = new DBService();

function validateRequest(req, res) {
    var result = req.check({
        'token': {
            isNotBlank: {
                errorMessage: 'field-required'
            },
            isString: {
                errorMessage: 'field-isstring'
            },
            isLength: {
                options: [{ min: 3, max: 100 }],
                errorMessage: 'field-lengthlimit'
            },
            errorMessage: 'token is invalid'
        },
        'topic': {
            isNotBlank: {
                errorMessage: 'field-required'
            },
            isString: {
                errorMessage: 'field-isstring'
            },
            isLength: {
                options: [{ min: 3, max: 64 }],
                errorMessage: 'field-lengthlimit'
            },
            errorMessage: 'topic is invalid'
        },
        'message': {
            isString: {
                errorMessage: 'field-isstring'
            },
            isLength: {
                options: [{ max: 1024 }],
                errorMessage: 'field-lengthlimit'
            },
            errorMessage: 'message is invalid'
        }
    });

    var errors = req.validationErrors();
    if (errors) {
        errorHandler.throwValidationError(res, errors);
        return false;
    }
    return true;
}

function publish(data, req, res) {
    return new Promise(function(resolve, reject) {
        try {
            dbService.save(data);
            return resolve(createResponse("Message published.", req));
        } catch (ex) {
            return reject(ex);
        }
        /*dbService.getLast(data.token, data.topic).then(function(msg) {
            return resolve(createResponse(pubsubModel.data(msg), req));
        }).catch(function(err) {
            return reject(err);
        });*/
    })

}

function subscribe(data, req, res) {
    return new Promise(function(resolve, reject) {
        dbService.getLast(data.token, data.topic).then(function(msg) {
            return resolve(createResponse(pubsubModel.data(msg), req));
        }).catch(function(err) {
            return reject(err);
        });
    })

}

function createResponse(result, req) {
    return {
        "requestId": _.get(req, 'ctx.requestId', undefined),
        "success": true,
        "data": result
    };
}

module.exports.allowedRequestFields = ["token", "topic", "message"];
module.exports.validateRequest = validateRequest;
module.exports.publish = publish;
module.exports.subscribe = subscribe;