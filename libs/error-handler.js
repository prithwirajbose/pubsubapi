var _ = require('lodash');
var appUtils = require('./app-utils.js');
// TODO - When Architect team decides how errors should be displayed
function pushErrorsArrayToErrorResponse(errs, res) {
    var responseData = {
        "requestId": _.get(res, 'req.ctx.requestId', undefined),
        "errors": [],
        "success": false
    };
    if (errs && typeof(errs) == 'object') {
        if (_.isArray(errs)) {
            var param = [];
            for (var i = 0; i < errs.length; i++) {
                if (errs[i].param && !_.isEmpty(errs[i].param) && _.includes(param, errs[i].param)) {
                    continue;
                }
                param.push(errs[i].param);
                var errMsgObj = appUtils.resolveValidationErrorMessage(errs[i].msg, errs[i].param);
                responseData.errors.push({
                    "errorCode": errMsgObj.errorCode,
                    "errorType": errMsgObj.errType,
                    "message": errMsgObj.errorMessage
                });
                res.status(errMsgObj.httpStatus);
            }
        } else {
            var errMsgObj = appUtils.resolveValidationErrorMessage(errs.msg, errs.param);
            responseData.errors.push({
                "errorCode": errMsgObj.errorCode,
                "errorType": errMsgObj.errType,
                "message": errMsgObj.errorMessage
            });
            res.status(errMsgObj.httpStatus);
        }
    }
    return responseData;
}

module.exports.requestError = function(res, errors) {
    var responseData = pushErrorsArrayToErrorResponse(errors, res);
    return res.json(responseData);
};

module.exports.throwValidationError = function(res, errors) {
    var responseData = pushErrorsArrayToErrorResponse(errors, res);
    return res.json(responseData);
};

/** Used by Application for Application errors like Tier 1 Service Unavailable **/
module.exports.appError = function(res, errMsg, httpStatus) {
    var errMsgObj = appUtils.resolveAppErrorMessage(!_.isNil(errMsg) ? errMsg : 'other-error', !_.isNil(httpStatus) ? httpStatus : "500");
    var responseData = {
        "requestId": _.get(res, 'req.ctx.requestId', undefined),
        "errors": [{
            "errorCode": errMsgObj.errorCode,
            "errorType": errMsgObj.errType,
            "message": errMsgObj.errorMessage
        }],
        "success": false
    };
    res.status(!_.isNil(httpStatus) ? _.parseInt(httpStatus, 10) : errMsgObj.httpStatus).send(responseData);
};

/** Used by Framework for Framework errors like JSON Parser Failure **/
module.exports.globalError = function(err, req, res, next) {
    console.error(err);
    var responseData = {
        "requestId": _.get(req, 'ctx.requestId', undefined),
        "errors": [],
        "success": false
    };

    var httpStatus = 500;
    if (err instanceof SyntaxError) {
        var errMsgObj = appUtils.resolveAppErrorMessage('parser-error');
        responseData.errors.push({
            "errorCode": errMsgObj.errorCode,
            "errorType": 'RequestSyntaxError',
            "message": errMsgObj.errorMessage
        });
        httpStatus = errMsgObj.httpStatus;
    } else {
        var errMsgObj = appUtils.resolveAppErrorMessage('other-error');
        responseData.errors.push({
            "errorCode": errMsgObj.errorCode,
            "errorType": errMsgObj.errType,
            "message": errMsgObj.errorMessage
        });

        httpStatus = errMsgObj.httpStatus;
    }
    res.status(httpStatus).send(responseData);
};