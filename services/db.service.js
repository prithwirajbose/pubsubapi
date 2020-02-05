require('dotenv').config();
var Promise = require('bluebird');
const sqlite3 = require('sqlite3').verbose();

function DBService() {
    this.db = new sqlite3.Database('./db/msg.db', (err) => {
        if (err) {
            throw err;
        }
        console.log('Connected to the msg database.');
        var that = this;
        this.db.serialize(function() {
            that.db.run("CREATE TABLE IF NOT EXISTS messages (token TEXT, topic TEXT, message TEXT, " +
                "timestamp INTEGER); CREATE INDEX token_topic_indx on messages (token, topic);");

            /*var stmt = that.db.prepare("INSERT INTO messages VALUES ('abcd',?,'ijklmnopqrst')");
            for (var i = 0; i < 10; i++) {
                stmt.run("Topic " + i);
            }
            stmt.finalize();

            that.db.each("SELECT rowid AS id, token, topic, message from messages", function(err, row) {
                console.log(row.id + ": " + row.token + ": " + row.topic + ": " + row.message);
            });*/
        });
    });

}

DBService.prototype.save = function(data) {
    var stmt = this.db.prepare("INSERT INTO messages VALUES (?,?,?,?)");
    stmt.run(data.token, data.topic, JSON.stringify(data.message), Date.now());
    stmt.finalize();
}

DBService.prototype.get = function(token, topic, limit) {
    var that = this;
    return new Promise(function(resolve, reject) {
        that.db.all("SELECT rowid AS id, token, topic, message, timestamp FROM messages " +
            " where token='" + token + "' and topic='" + topic + "' ORDER BY rowid DESC limit " + (limit > 0 ? limit : 1),
            function(err, rows) {
                if (err) {
                    return reject(err);
                }
                return resolve(rows);
            });
    });
}

module.exports = DBService;