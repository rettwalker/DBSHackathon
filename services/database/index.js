const EventEmitter = require('events'),
    GetClient = require('./getClient');

const DataBase = () => {
    const databaseEmitter = Object.assign({}, EventEmitter.prototype);

    databaseEmitter.on('lookUpTopics', (emitter, res) => {
        GetClient.getConnection()
            .then(client => {
                const sql = 'SELECT * FROM topics';
                return client.query(sql);
            })
            .then(topics => {
                emitter.emit('done', topics.rows, res);
            })
            .catch(err => {
                emitter.emit('error', err, res);
            });

    });

    databaseEmitter.on('createNewTopic', (emitter, newTopic, res) => {
        let ClientInstance = null;
        GetClient.getConnection()
            .then(client => {
                ClientInstance = client;
                const sql = 'SELECT * FROM topics WHERE LOWER(name)=LOWER($1)';
                const values = [newTopic.name]
                return ClientInstance.query(sql, values)
            })
            .then(res => {
                if (res.rows.length !== 0) {
                    return Promise.reject({ message: 'Topic Already Exists' });
                }
                const sql = 'INSERT INTO topics(name, description) VALUES($1, $2) RETURNING *';
                const values = [newTopic.name, newTopic.description]
                return ClientInstance.query(sql, values);
            })
            .then(topics => {
                emitter.emit('done', topics.rows[0], res);
            })
            .catch(err => {
                emitter.emit('error', err, res);
            });
    });

    databaseEmitter.on('updateTopic', (emitter, updateTopic, res) => {
        GetClient.getConnection()
            .then(client => {
                const sql = 'UPDATE topics SET name=$1, description=$2 WHERE id=$3 RETURNING *';
                const values = [updateTopic.name, updateTopic.description, updateTopic.id]
                return client.query(sql, values);
            })
            .then(topics => {
                emitter.emit('done', topics.rows[0], res);
            })
            .catch(err => {
                emitter.emit('error', err, res);
            });
    });



    return databaseEmitter;
};

module.exports = DataBase();