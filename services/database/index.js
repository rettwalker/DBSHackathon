const EventEmitter = require('events'),
    pg = require('pg');

const DataBase = () => {
    const topicEmitter = Object.assign({}, EventEmitter.prototype);

    topicEmitter.on('lookUpTopics', (emitter, req, res) => {
        emitter.emit('done', req, res, []);
    });

    return topicEmitter;
};

module.exports = DataBase();