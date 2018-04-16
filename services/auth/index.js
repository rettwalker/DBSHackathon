const GetClient = require('../database/getClient');

const Auth = {
    login(req, res) {
        let userCred = {
            email: req.body.email,
            password: req.body.password
        };
        GetClient.getConnection()
            .then(client => {
                const sql = 'SELECT id, email, first_name, last_name FROM users WHERE email=$1 AND password=$2';
                const values = [userCred.email, userCred.password];
                return client.query(sql, values);
            })
            .then(userInfo => {
                if (userInfo.rows.length === 0) {
                    return Promise.reject({ message: 'User Not Found', userNotFound: true });
                }
                res.status(200);
                res.json(userInfo.rows[0]);
                return;
            })
            .catch(err => {
                res.status(400);
                res.json(err);
                return;
            });
    },
    register(req, res) {
        let userInfo = {
            email: req.body.email,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            password: req.body.password
        };
        GetClient.getConnection()
            .then(client => {
                const sql = 'INSERT INTO users(email, first_name, last_name, password) VALUES($1, $2, $3, $4) RETURNING id, email, first_name, last_name';
                const values = [userInfo.email, userInfo.first_name, userInfo.last_name, userInfo.password];
                return client.query(sql, values);
            })
            .then(newUser => {
                res.status(200);
                res.json(newUser.rows[0]);
            })
            .catch(err => {
                res.status(400);
                res.json(err);
            });
    }
};

module.exports = Auth;