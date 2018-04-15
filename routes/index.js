const express = require('express'),
    router = express.Router(),
    topics = require('./topics'),
    comments = require('./comments');
/* GET api listing. */
router.get('/', (req, res) => {
    res.send('api works');
});

router.use('/topics', topics);

router.use('/comments', comments);

module.exports = router;