const EventEmitter = require('events'),
    GetClient = require('./getClient');

const DataBase = () => {
    const databaseEmitter = Object.assign({}, EventEmitter.prototype);

    databaseEmitter.on('getUserInfo', (emitter, userId, res) => {
        GetClient.getConnection()
            .then(client => {
                const sql = 'SELECT id, email, first_name, last_name FROM users WHERE id=$1';
                const values = [userId];
                return client.query(sql, values);
            })
            .then(userInfo => {
                if (userInfo.rows.length === 0) {
                    return Promise.reject({ message: 'User Not Found' });
                }
                emitter.emit('done', userInfo.rows[0], res);
            })
            .catch(err => {
                emitter.emit('error', err, res);
            });
    });

    return databaseEmitter;
};

module.exports = DataBase();