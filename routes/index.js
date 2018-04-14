const express = require('express'),
    router = express.Router(),
    topics = require('./topics');
/* GET api listing. */
router.get('/', (req, res) => {
    res.send('api works');
});

router.use('/topics', topics);

module.exports = router;