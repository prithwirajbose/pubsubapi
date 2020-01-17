var expressValidator = require('express-validator');
var _ = require('lodash');

var injectCustomValidators = function(app) {
    app.use(expressValidator({
        customValidators: {
            isString: function(value) {
                return _.isNil(value) || _.isString(value);
            },
            isNotBlank: function(value) {
                return _.trim(value).length > 0;
            },
            isObject: function(value) {
                return _.isNil(value) || typeof(value) === 'object' || typeof(value) === 'array';
            }
        }
    }));
    return app;
};
module.exports.injectCustomValidators = injectCustomValidators;