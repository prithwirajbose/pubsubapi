var _ = require('lodash');

function data(rows) {
    if (_.isNil(rows)) {
        return null;
    }

    if (!_.isArray(rows)) {
        rows = [rows];
    }

    return _.map(rows, function(data) {
        data = _.isArray(data) && data.length > 0 ? data[0] : data;
        var msg = data.message;

        try {
            msg = JSON.parse(msg);
        } catch (e) {
            //silently ignore
        }

        return {
            topic: data.topic,
            id: data.id,
            message: msg,
            timestamp: (new Date(data.timestamp)).toLocaleString('en-GB', { timeZone: 'UTC' })
        };
    });
}

module.exports.data = data;