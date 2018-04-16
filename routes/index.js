const express = require('express'),
    router = express.Router(),
    topics = require('./topics'),
    comments = require('./comments'),
    users = require('./users'),
    Auth = require('../services/auth');
/* GET api listing. */
router.get('/', (req, res) => {
    res.send('api works');
});

router.post('/login', Auth.login);

router.post('/register', Auth.register);

router.get('/logout', (req, res) => {
    res.status(200).json({ message: 'You Are Now Logged Out' });
});

const checkForHeader = (req, res, next) => {
    if (!req.get('USER_ID')) {
        res.status(401).json({ message: 'Not Logged In' });
    }
    next();
}

router.use('/topics', checkForHeader, topics);

router.use('/comments', checkForHeader, comments);

router.use('/users', checkForHeader, users);

module.exports = router;