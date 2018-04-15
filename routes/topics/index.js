const express = require('express'),
    router = express.Router(),
    Topics = require('../../services/topics');


router.get('/', (req, res) => {
    Topics.emit('getTopics', req, res);
});

router.post('/', (req, res) => {
    Topics.emit('createTopic', req, res);
});

router.put('/:id', (req, res) => {
    Topics.emit('updateTopic', req, res);
});
module.exports = router;