const EventEmitter = require('events'),
    Database = require('../database');

const GetTopics = () => {
    const topicEmitter = Object.assign({}, EventEmitter.prototype);

    topicEmitter.on('getTopics', function (req, res) {
        Database.emit('lookUpTopics', this, req, res);
    });

    topicEmitter.on('done', function (req, res, topics) {
        res.send(200);
        res.json(topics);
        return;
    });

    topicEmitter.on('error', function (req, res, reason) {
        res.send(400);
        res.json(reason);
        return;
    });

    return topicEmitter;
};


module.exports = GetTopics();