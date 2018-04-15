const EventEmitter = require('events'),
    Database = require('../database');

const Topics = () => {
    const topicEmitter = Object.assign({}, EventEmitter.prototype);

    topicEmitter.on('getTopics', function (req, res) {
        Database.emit('lookUpTopics', this, res);
    });

    topicEmitter.on('getTopic', function (req, res) {
        Database.emit('getTopic', this, req.params.id, res);
    });

    topicEmitter.on('createTopic', function (req, res) {
        let newTopic = {
            name: req.body.name,
            description: req.body.description
        }
        Database.emit('createNewTopic', this, newTopic, res);
    });

    topicEmitter.on('updateTopic', function (req, res) {
        let newTopic = {
            id: req.params.id,
            name: req.body.name,
            description: req.body.description
        }
        Database.emit('updateTopic', this, newTopic, res);
    });

    topicEmitter.on('done', function (topics, res) {
        res.status(200);
        res.json(topics);
        return;
    });

    topicEmitter.on('error', function (reason, res) {
        res.status(400);
        res.json(reason);
        return;
    });

    return topicEmitter;
};


module.exports = Topics();