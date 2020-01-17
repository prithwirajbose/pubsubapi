var _ = require('lodash');

function data(data) {
    data = _.isArray(data) && data.length > 0 ? data[0] : data;
    return {
        topic: data.topic,
        message: data.message,
        timestamp: new Date(data.timestamp)
    };
}

module.exports.data = data;