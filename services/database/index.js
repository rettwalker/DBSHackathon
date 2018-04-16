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

    databaseEmitter.on('getTopic', (emitter, topicId, res) => {
        let ClientInstance = null;
        let TopicAndComments = null;
        GetClient.getConnection()
            .then(client => {
                ClientInstance = client;
                const sql = 'SELECT * FROM topics WHERE id=$1';
                const value = [topicId];
                return ClientInstance.query(sql, value);
            })
            .then(topic => {
                if (topic.rows.length === 0) {
                    return Promise.reject({ message: 'Topic Not Found' });
                }

                TopicAndComments = topic.rows[0];
                const sql = 'SELECT * FROM comments WHERE topic_id=$1';
                const value = [topicId];
                return ClientInstance.query(sql, value);
            })
            .then(comments => {
                TopicAndComments.comments = comments.rows;
                emitter.emit('done', TopicAndComments, res);
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

    databaseEmitter.on('getComment', (emitter, commentId, res) => {
        GetClient.getConnection()
            .then(client => {
                const sql = 'SELECT * FROM comments WHERE id=$1';
                const values = [commentId];
                return client.query(sql, values);
            })
            .then(origComment => {
                if (origComment.rows.length === 0) {
                    return Promise.reject({ message: 'Comment Not Found' });
                }
                emitter.emit('done', origComment.rows[0], res);
            })
            .catch(err => {
                emitter.emit('error', err, res);
            });
    });

    databaseEmitter.on('createComment', (emitter, comment, res) => {
        GetClient.getConnection()
            .then(client => {
                const sql = 'INSERT INTO comments(topic_id, user_id, message) VALUES($1, $2, $3) RETURNING *';
                const values = [comment.topic_id, comment.user_id, comment.message];
                return client.query(sql, values);
            })
            .then(origComment => {
                emitter.emit('done', origComment.rows[0], res);
            })
            .catch(err => {
                emitter.emit('error', err, res);
            });
    });

    databaseEmitter.on('editComment', (emitter, comment, res) => {
        let ClientInstance = null;
        GetClient.getConnection()
            .then(client => {
                ClientInstance = client;
                const sql = 'SELECT user_id FROM comments WHERE id=$1';
                const values = [comment.id];
                return ClientInstance.query(sql, values);
            })
            .then(origComment => {
                if (origComment.rows.length === 0) {
                    return Promise.reject({ message: 'Comment Not Found' });
                }
                if (origComment.rows[0].user_id != comment.user_id) {
                    return Promise.reject({ message: 'User does not own comment' });
                }

                const sql = 'UPDATE comments SET message=$1 WHERE id=$2 RETURNING *';
                const values = [comment.message, comment.id];
                return ClientInstance.query(sql, values);
            })
            .then(updatedComment => {
                emitter.emit('done', updatedComment.rows[0], res);
            })
            .catch(err => {
                emitter.emit('error', err, res);
            });
    });

    databaseEmitter.on('deleteComment', (emitter, comment, res) => {
        let ClientInstance = null;
        GetClient.getConnection()
            .then(client => {
                ClientInstance = client;
                const sql = 'SELECT user_id FROM comments WHERE id=$1';
                const values = [comment.id];
                return ClientInstance.query(sql, values);
            })
            .then(origComment => {
                if (origComment.rows.length === 0) {
                    return Promise.reject({ message: 'Comment Not Found' });
                }

                if (origComment.rows[0].user_id != comment.user_id) {
                    return Promise.reject({ message: 'User does not own comment' });
                }

                const sql = 'DELETE FROM comments S WHERE id=$1';
                const values = [comment.id];
                return ClientInstance.query(sql, values);
            })
            .then(removedCommentRes => {
                emitter.emit('done', { message: 'Comment Successfully Deleted' }, res);
            })
            .catch(err => {
                emitter.emit('error', err, res);
            });
    });

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