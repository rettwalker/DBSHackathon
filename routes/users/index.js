const express = require('express'),
    router = express.Router(),
    Users = require('../../services/users');


router.get('/:id', (req, res) => {
    Users.emit('getUserInfo', req, res);
});

router.post('/register', (req, res) => {
    Users.emit('registerUser', req, res);
});


module.exports = router;