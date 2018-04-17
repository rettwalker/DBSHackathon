const EventEmitter = require('events'),
    Database = require('../database/users');

const Users = () => {
    const userEmitter = Object.assign({}, EventEmitter.prototype);

    userEmitter.on('getUserInfo', function (req, res) {
        Database.emit('getUserInfo', this, req.params.id, res);
    });

    userEmitter.on('done', function (topics, res) {
        res.status(200);
        res.json(topics);
        return;
    });

    userEmitter.on('error', function (reason, res) {
        res.status(400);
        res.json(reason);
        return;
    });

    return userEmitter;
};


module.exports = Users();