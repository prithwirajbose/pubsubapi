var _ = require('lodash'),
    globalErrorMessages = require("../locale/en-US/error-messages.json");

const uuidv4 = require('uuid/v4');

var xmlParserOptions = {
    attrPrefix: "",
    textNodeName: "text",
    // ignoreNonTextNodeAttr : true,
    ignoreTextNodeAttr: false,
    ignoreNameSpace: true,
    // ignoreRootElement : false,
    textNodeConversion: false
        // textAttrConversion : false
};

var indexOf = function(obj, key) {
    if (_.isArray(obj))
        return _.indexOf(obj, key);
    else {
        var i = -1,
            indx;
        for (indx in obj) {
            i++;
            if (obj.hasOwnProperty(indx) && indx == key) {
                return i;
            }
        }
        return i;
    }
};

module.exports.resolveValidationErrorMessage = function(msgcode, paramName) {
    var errCd = 1999;
    var errMsg = !_.isNil(msgcode) ? msgcode :
        (!_.isNil(paramName) ? paramName : 'Request parameter') +
        ' is invalid';
    if (_.has(globalErrorMessages.validationErrors, msgcode)) {
        errCd = _.parseInt('1' +
            _.padStart(indexOf(globalErrorMessages.validationErrors,
                msgcode), 3, '0'), 10);
        errMsg = _.get(globalErrorMessages.validationErrors, msgcode);
    }

    if (!_.isNil(errMsg) && !_.isNil(paramName) && _.includes(errMsg, '{{paramName}}')) {
        errMsg = _.replace(errMsg, '{{paramName}}', paramName);
    }

    return {
        "errorCode": errCd,
        "errType": "RequestError",
        "errorMessage": errMsg,
        "httpStatus": 400
    };
};

module.exports.resolveAppErrorMessage = function(errMsgCd) {
    var errCd = 2999;
    var errMsg = !_.isNil(errMsgCd) ? errMsgCd : 'A service error has occured';
    if (_.has(globalErrorMessages.appErrors, errMsgCd)) {
        errCd = _.parseInt('2' +
            _.padStart(indexOf(globalErrorMessages.appErrors,
                errMsgCd), 3, '0'), 10);
        errMsg = _.get(globalErrorMessages.appErrors, errMsgCd);
    }

    return {
        "errorCode": errCd,
        "errType": "ApplicationError",
        "errorMessage": errMsg,
        "httpStatus": 500
    };
};


/**
 * Override of FasterXML parser
 */
var parseXmlToJson = function(xmlBody) {
    var json = fastXmlParser.parse(xmlBody, xmlParserOptions);
    return restoreXmlSpecialCharsInJson(json);
}

module.exports.setContext = function(req, res, next) {
    _.set(req, 'ctx', {
        requestId: uuidv4(),
        token: _.get(req, 'body.token')
    });
    return next();
}