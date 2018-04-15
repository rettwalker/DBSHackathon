const express = require('express'),
    router = express.Router(),
    Comments = require('../../services/comments');


router.get('/:id', (req, res) => {
    Comments.emit('getComment', req, res);
});

router.post('/', (req, res) => {
    Comments.emit('createComment', req, res);
})

router.delete('/:id', (req, res) => {
    Comments.emit('deleteComment', req, res);
});

router.put('/:id', (req, res) => {
    Comments.emit('editComment', req, res);
});
module.exports = router;