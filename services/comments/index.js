const EventEmitter = require('events'),
    Database = require('../database');

const Comments = () => {
    const commentEmitter = Object.assign({}, EventEmitter.prototype);

    commentEmitter.on('getComment', function (req, res) {
        Database.emit('getComment', this, req.params.id, res);
    });

    commentEmitter.on('createComment', function (req, res) {
        let newComment = {
            topic_id: req.body.topic_id,
            user_id: req.get('USER_ID'),
            message: req.body.message
        };
        Database.emit('createComment', this, newComment, res);
    });

    commentEmitter.on('editComment', function (req, res) {
        let editComment = {
            id: req.params.id,
            topic_id: req.body.topic_id,
            user_id: req.get('USER_ID'),
            message: req.body.message
        };
        Database.emit('editComment', this, editComment, res);
    });

    commentEmitter.on('deleteComment', function (req, res) {

        Database.emit('deleteComment', this, { id: req.params.id, user_id: req.get('USER_ID') }, res);
    });

    commentEmitter.on('done', function (responseValue, res) {
        res.status(200);
        res.json(responseValue);
        return;
    });

    commentEmitter.on('error', function (errorReason, res) {
        res.status(400);
        res.json(errorReason);
        return;
    });
    return commentEmitter;
};

module.exports = Comments();