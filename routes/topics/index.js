const express = require('express'),
    router = express.Router(),
    Topics = require('../../services/topics');


router.get('/', (req, res) => {
    Topics.emit('getTopics', req, res);
});

router.get('/:id', (req, res) => {
    Topics.emit('getTopic', req, res);
});

router.post('/', (req, res) => {
    Topics.emit('createTopic', req, res);
});

router.put('/:id', (req, res) => {
    Topics.emit('updateTopic', req, res);
});

router.get('/:id/vote', (req, res) => {
    Topics.emit('voteForTopic', req, res);
});

module.exports = router;