var _ = require('lodash');

function data(data) {
    // console.log(json);
    return {
        topic: data.topic,
        message: data.message,
        timestamp: new Date(data.timestamp)
    };
}

module.exports.data = data;