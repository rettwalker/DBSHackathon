const Database = require('../../../../services/database'),
    EventEmitter = require('events'),
    chai = require('chai'),
    sinon = require('sinon'),
    GetClient = require('../../../../services/database/getClient'),
    expect = chai.expect;

describe('Handles DB Requests', () => {
    let emitter, req, res, MockClient, GetClientStub;
    beforeEach(() => {
        MockClient = Object.assign({}, { query: sinon.stub() }, EventEmitter.prototype);
        GetClientStub = sinon.stub(GetClient, 'getConnection').resolves(MockClient);

        emitter = Object.assign({}, EventEmitter.prototype);
        emitter.on('done', sinon.stub());
    });

    afterEach(() => {
        GetClientStub.restore();
    });

    describe('Look Up Topics', () => {
        it('should return the topics back to the object that emitted the request', (done) => {
            MockClient.query.resolves({
                rows: []
            });
            emitter.on('done', function (topics, res) {
                expect(GetClientStub.called).to.be.true;
                expect(MockClient.query.calledWith('SELECT * FROM topics')).to.be.true;
                expect(topics).to.be.an('array');
                done();
            });
            Database.emit('lookUpTopics', emitter, res);
        });

        it('should return the topics back to the object that emitted the request', (done) => {
            MockClient.query.rejects({
                message: 'Error'
            });
            emitter.on('error', function (reason, res) {
                expect(GetClientStub.called).to.be.true;
                expect(MockClient.query.calledWith('SELECT * FROM topics')).to.be.true;
                expect(reason).to.deep.equal({
                    message: 'Error'
                });
                done();
            });
            Database.emit('lookUpTopics', emitter, res);
        });

    });

    describe('Get a Single Topic and its Comments', () => {
        it('should return the topic and its comments back to the object that emitted the request', (done) => {
            let topicId = 1;
            let response = {
                id: 1,
                name: 'EmberJS',
                comments: [
                    { id: 1, topic_id: 1, user_id: 1, message: 'A Witty Comment' }
                ]
            };
            MockClient.query.onCall(0).resolves({
                rows: [{ id: 1, name: 'EmberJS' }]
            });

            MockClient.query.onCall(1).resolves({
                rows: [{ id: 1, topic_id: 1, user_id: 1, message: 'A Witty Comment' }]
            });
            emitter.on('done', function (topicAndComment, res) {
                expect(GetClientStub.called).to.be.true;
                expect(MockClient.query.firstCall.calledWith('SELECT * FROM topics WHERE id=$1', [topicId])).to.be.true;
                expect(MockClient.query.secondCall.calledWith('SELECT * FROM comments WHERE topic_id=$1', [topicId])).to.be.true;
                expect(topicAndComment).to.deep.equal(response);
                done();
            });
            Database.emit('getTopic', emitter, topicId, res);
        });

        it('should return return error when Topic is Not Found ', (done) => {
            let topicId = 1;
            MockClient.query.resolves({
                rows: []
            });
            emitter.on('error', function (reason, res) {
                expect(GetClientStub.called).to.be.true;
                expect(MockClient.query.firstCall.calledWith('SELECT * FROM topics WHERE id=$1', [topicId])).to.be.true;
                expect(reason).to.deep.equal({ message: 'Topic Not Found' });
                done();
            });
            Database.emit('getTopic', emitter, topicId, res);
        });

        it('should return return error when getting Topic or Comments', (done) => {
            let topicId = 1;
            MockClient.query.rejects({
                message: 'Error'
            });
            emitter.on('error', function (reason, res) {
                expect(GetClientStub.called).to.be.true;
                expect(MockClient.query.firstCall.calledWith('SELECT * FROM topics WHERE id=$1', [topicId])).to.be.true;
                expect(reason).to.deep.equal({
                    message: 'Error'
                });
                done();
            });
            Database.emit('getTopic', emitter, topicId, res);
        });

    });

    describe('Create New Topics', () => {
        it('should return the topics back to the object that emitted the request', (done) => {
            let newTopic = { name: 'brianc', description: 'A Short Description' };
            MockClient.query.onCall(0).resolves({
                rows: []
            });
            MockClient.query.onCall(1).resolves({
                rows: [newTopic]
            });
            emitter.on('done', function (createdTopic, res) {
                expect(GetClientStub.called).to.be.true;
                expect(MockClient.query.firstCall.calledWith('SELECT * FROM topics WHERE LOWER(name)=LOWER($1)', [newTopic.name])).to.be.true;
                expect(MockClient.query.secondCall.calledWith('INSERT INTO topics(name, description) VALUES($1, $2) RETURNING *', [newTopic.name, newTopic.description])).to.be.true;
                expect(createdTopic).to.deep.equal(newTopic);
                done();
            });
            Database.emit('createNewTopic', emitter, newTopic, res);
        });

        it('should return error because DB error', (done) => {
            let newTopic = { name: 'brianc', description: 'A Short Description' };
            MockClient.query.onCall(0).resolves({
                rows: []
            });
            MockClient.query.onCall(1).rejects({
                message: 'Error'
            });
            emitter.on('error', function (error, res) {
                expect(GetClientStub.called).to.be.true;
                expect(MockClient.query.firstCall.calledWith('SELECT * FROM topics WHERE LOWER(name)=LOWER($1)', [newTopic.name])).to.be.true;
                expect(MockClient.query.secondCall.calledWith('INSERT INTO topics(name, description) VALUES($1, $2) RETURNING *', [newTopic.name, newTopic.description])).to.be.true;
                expect(error).to.deep.equal({
                    message: 'Error'
                });
                done();
            });
            Database.emit('createNewTopic', emitter, newTopic, res);
        });

        it('should return error because DB error', (done) => {
            let newTopic = { name: 'brianc', description: 'A Short Description' };
            MockClient.query.onCall(0).resolves({
                rows: [newTopic]
            });
            emitter.on('error', function (error, res) {
                expect(GetClientStub.called).to.be.true;
                expect(MockClient.query.calledWith('SELECT * FROM topics WHERE LOWER(name)=LOWER($1)', [newTopic.name])).to.be.true;
                expect(MockClient.query.callCount).to.equal(1);
                expect(error).to.deep.equal({
                    message: 'Topic Already Exists'
                });
                done();
            });
            Database.emit('createNewTopic', emitter, newTopic, res);
        });
    });

    describe('Update A Topic', () => {
        it('should Update a Topic', (done) => {
            let updateTopic = { id: 1, name: 'brianc', description: 'A Short Description New' };
            MockClient.query.resolves({
                rows: [updateTopic]
            });
            emitter.on('done', function (updatedTopic, res) {
                expect(GetClientStub.called).to.be.true;
                expect(MockClient.query.calledWith('UPDATE topics SET name=$1, description=$2 WHERE id=$3 RETURNING *', [updateTopic.name, updateTopic.description, updateTopic.id])).to.be.true;
                expect(updatedTopic).to.deep.equal(updateTopic);
                done();
            });
            Database.emit('updateTopic', emitter, updateTopic, res);
        });

        it('should fail to update the topic', (done) => {
            let updateTopic = { id: 1, name: 'brianc', description: 'A Short Description New' };
            MockClient.query.rejects({ message: 'Error' });
            emitter.on('error', function (updatedTopic, res) {
                expect(GetClientStub.called).to.be.true;
                expect(MockClient.query.calledWith('UPDATE topics SET name=$1, description=$2 WHERE id=$3 RETURNING *', [updateTopic.name, updateTopic.description, updateTopic.id])).to.be.true;
                expect(updatedTopic).to.deep.equal({ message: 'Error' });
                done();
            });
            Database.emit('updateTopic', emitter, updateTopic, res);
        });
    });

    describe('Get a Comment', () => {
        it('should get a comment', (done) => {
            let comment = { id: 1, topic_id: 1, user_id: 1, message: 'Witty Comment' };
            MockClient.query.resolves({
                rows: [comment]
            });
            emitter.on('done', function (foundComment, res) {
                expect(GetClientStub.called).to.be.true;
                expect(MockClient.query.calledWith('SELECT * FROM comments WHERE id=$1', [comment.id])).to.be.true;
                expect(foundComment).to.deep.equal(comment);
                done();
            });
            Database.emit('getComment', emitter, comment.id, res);
        });

        it('should respond with error if no comment returned', (done) => {
            let comment = { id: 1, topic_id: 1, user_id: 1, message: 'Witty Comment' };
            MockClient.query.resolves({
                rows: []
            });
            emitter.on('error', function (error, res) {
                expect(GetClientStub.called).to.be.true;
                expect(MockClient.query.calledWith('SELECT * FROM comments WHERE id=$1', [comment.id])).to.be.true;
                expect(error).to.deep.equal({ message: 'Comment Not Found' });
                done();
            });
            Database.emit('getComment', emitter, comment.id, res);
        });

        it('should fail to get the comment', (done) => {
            let comment = { id: 1, topic_id: 1, user_id: 1, message: 'Witty Comment' };
            MockClient.query.rejects({ message: 'Error' });
            emitter.on('error', function (error, res) {
                expect(GetClientStub.called).to.be.true;
                expect(MockClient.query.calledWith('SELECT * FROM comments WHERE id=$1', [comment.id])).to.be.true;
                expect(error).to.deep.equal({ message: 'Error' });
                done();
            });
            Database.emit('getComment', emitter, comment.id, res);
        });
    });

    describe('Create a Comment', () => {
        it('should Create a Comment', (done) => {
            let comment = { topic_id: 1, user_id: 1, message: 'Witty Comment' };
            let createdComment = { id: 1, topic_id: 1, user_id: 1, message: 'Witty Comment' };

            MockClient.query.resolves({
                rows: [createdComment]
            });
            emitter.on('done', function (newComment, res) {
                expect(GetClientStub.called).to.be.true;
                expect(MockClient.query.calledWith('INSERT INTO comments(topic_id, user_id, message) VALUES($1, $2, $3) RETURNING *', [comment.topic_id, comment.user_id, comment.message])).to.be.true;
                expect(newComment).to.deep.equal(createdComment);
                done();
            });
            Database.emit('createComment', emitter, comment, res);
        });

        it('should fail to create a comment', (done) => {
            let comment = { topic_id: 1, user_id: 1, message: 'Witty Comment' };
            MockClient.query.rejects({ message: 'Error' });
            emitter.on('error', function (error, res) {
                expect(GetClientStub.called).to.be.true;
                expect(MockClient.query.calledWith('INSERT INTO comments(topic_id, user_id, message) VALUES($1, $2, $3) RETURNING *', [comment.topic_id, comment.user_id, comment.message])).to.be.true;
                expect(error).to.deep.equal({ message: 'Error' });
                done();
            });
            Database.emit('createComment', emitter, comment, res);
        });
    });

    describe('Update A Comment', () => {
        it('should update a comment', (done) => {
            let editComment = {
                id: 1,
                topic_id: 1,
                user_id: 1,
                message: 'A Witty Comment'
            };
            MockClient.query.onCall(0).resolves({
                rows: [{ user_id: editComment.id }]
            });
            MockClient.query.onCall(1).resolves({
                rows: [editComment]
            });
            emitter.on('done', function (updatedComment, res) {
                expect(GetClientStub.called).to.be.true;
                expect(MockClient.query.firstCall.calledWith('SELECT user_id FROM comments WHERE id=$1', [editComment.id])).to.be.true;
                expect(MockClient.query.secondCall.calledWith('UPDATE comments SET message=$1 WHERE id=$2 RETURNING *', [editComment.message, editComment.id])).to.be.true;
                expect(updatedComment).to.deep.equal(editComment);
                done();
            });
            Database.emit('editComment', emitter, editComment, res);
        });

        it('should get a comment by throw error because comment not owned by user', (done) => {
            let editComment = {
                id: 1,
                topic_id: 1,
                user_id: 1,
                message: 'A Witty Comment'
            };
            MockClient.query.onCall(0).resolves({
                rows: [{ user_id: 2 }]
            });
            emitter.on('error', function (error, res) {
                expect(GetClientStub.called).to.be.true;
                expect(MockClient.query.calledWith('SELECT user_id FROM comments WHERE id=$1', [editComment.id])).to.be.true;
                expect(MockClient.query.callCount).to.equal(1);
                expect(error).to.deep.equal({ message: 'User does not own comment' });
                done();
            });
            Database.emit('editComment', emitter, editComment, res);
        });

        it('should get a comment but throw error because comment not found', (done) => {
            let editComment = {
                id: 1,
                topic_id: 1,
                user_id: 1,
                message: 'A Witty Comment'
            };
            MockClient.query.onCall(0).resolves({
                rows: []
            });
            emitter.on('error', function (error, res) {
                expect(GetClientStub.called).to.be.true;
                expect(MockClient.query.calledWith('SELECT user_id FROM comments WHERE id=$1', [editComment.id])).to.be.true;
                expect(MockClient.query.callCount).to.equal(1);
                expect(error).to.deep.equal({ message: 'Comment Not Found' });
                done();
            });
            Database.emit('editComment', emitter, editComment, res);
        });

        it('should fail to update a comment', (done) => {
            let editComment = {
                id: 1,
                topic_id: 1,
                user_id: 1,
                message: 'A New Witty Comment'
            };
            MockClient.query.onCall(0).resolves({
                rows: [{ user_id: editComment.id }]
            });
            MockClient.query.onCall(1).rejects({ message: 'Error' });
            emitter.on('error', function (error, res) {
                expect(GetClientStub.called).to.be.true;
                expect(MockClient.query.firstCall.calledWith('SELECT user_id FROM comments WHERE id=$1', [editComment.id])).to.be.true;
                expect(MockClient.query.secondCall.calledWith('UPDATE comments SET message=$1 WHERE id=$2 RETURNING *', [editComment.message, editComment.id])).to.be.true;
                expect(error).to.deep.equal({ message: 'Error' });
                done();
            });
            Database.emit('editComment', emitter, editComment, res);
        });
    });

    describe('Delete A Comment', () => {
        it('should delete a comment', (done) => {
            let editComment = {
                id: 1,
                topic_id: 1,
                user_id: 1,
                message: 'A Witty Comment'
            };
            MockClient.query.onCall(0).resolves({
                rows: [{ user_id: editComment.id }]
            });
            MockClient.query.onCall(1).resolves({
                rows: [editComment]
            });
            emitter.on('done', function (deleteMessage, res) {
                expect(GetClientStub.called).to.be.true;
                expect(MockClient.query.firstCall.calledWith('SELECT user_id FROM comments WHERE id=$1', [editComment.id])).to.be.true;
                expect(MockClient.query.secondCall.calledWith('DELETE FROM comments S WHERE id=$1', [editComment.id])).to.be.true;
                expect(deleteMessage).to.deep.equal({ message: 'Comment Successfully Deleted' });
                done();
            });
            Database.emit('deleteComment', emitter, { id: 1, user_id: 1 }, res);
        });

        it('should get a comment by throw error because comment not owned by user', (done) => {
            let editComment = {
                id: 1,
                topic_id: 1,
                user_id: 1,
                message: 'A Witty Comment'
            };
            MockClient.query.onCall(0).resolves({
                rows: [{ user_id: 2 }]
            });
            emitter.on('error', function (error, res) {
                expect(GetClientStub.called).to.be.true;
                expect(MockClient.query.calledWith('SELECT user_id FROM comments WHERE id=$1', [editComment.id])).to.be.true;
                expect(MockClient.query.callCount).to.equal(1);
                expect(error).to.deep.equal({ message: 'User does not own comment' });
                done();
            });
            Database.emit('deleteComment', emitter, { id: 1, user_id: 1 }, res);
        });

        it('should get a comment by throw error because comment not owned by user', (done) => {
            let editComment = {
                id: 1,
                topic_id: 1,
                user_id: 1,
                message: 'A Witty Comment'
            };
            MockClient.query.onCall(0).resolves({
                rows: []
            });
            emitter.on('error', function (error, res) {
                expect(GetClientStub.called).to.be.true;
                expect(MockClient.query.calledWith('SELECT user_id FROM comments WHERE id=$1', [editComment.id])).to.be.true;
                expect(MockClient.query.callCount).to.equal(1);
                expect(error).to.deep.equal({ message: 'Comment Not Found' });
                done();
            });
            Database.emit('deleteComment', emitter, { id: 1, user_id: 1 }, res);
        });

        it('should fail to delete a comment', (done) => {
            let editComment = {
                id: 1,
                topic_id: 1,
                user_id: 1,
                message: 'A New Witty Comment'
            };
            MockClient.query.onCall(0).resolves({
                rows: [{ user_id: editComment.id }]
            });
            MockClient.query.onCall(1).rejects({ message: 'Error' });
            emitter.on('error', function (error, res) {
                expect(GetClientStub.called).to.be.true;
                expect(MockClient.query.firstCall.calledWith('SELECT user_id FROM comments WHERE id=$1', [editComment.id])).to.be.true;
                expect(MockClient.query.secondCall.calledWith('DELETE FROM comments S WHERE id=$1', [editComment.id])).to.be.true;
                expect(error).to.deep.equal({ message: 'Error' });
                done();
            });
            Database.emit('deleteComment', emitter, { id: 1, user_id: 1 }, res);
        });
    });

    describe('Get a Users Info', () => {
        it('should get a users info', (done) => {
            let userInfo = { id: 1, email: 'EMAIL@address.com', first_name: 'BOB', last_name: 'BOBBY' };
            MockClient.query.resolves({
                rows: [userInfo]
            });
            emitter.on('done', function (info, res) {
                expect(GetClientStub.called).to.be.true;
                expect(MockClient.query.calledWith('SELECT id, email, first_name, last_name FROM users WHERE id=$1', [userInfo.id])).to.be.true;
                expect(info).to.deep.equal(userInfo);
                done();
            });
            Database.emit('getUserInfo', emitter, userInfo.id, res);
        });

        it('should respond with error if no user info returned', (done) => {
            let userInfo = { id: 1, email: 'EMAIL@address.com', first_name: 'BOB', last_name: 'BOBBY' };
            MockClient.query.resolves({
                rows: []
            });
            emitter.on('error', function (error, res) {
                expect(GetClientStub.called).to.be.true;
                expect(MockClient.query.calledWith('SELECT id, email, first_name, last_name FROM users WHERE id=$1', [userInfo.id])).to.be.true;
                expect(error).to.deep.equal({ message: 'User Not Found' });
                done();
            });
            Database.emit('getUserInfo', emitter, userInfo.id, res);
        });

        it('should fail to get user info', (done) => {
            let userInfo = { id: 1, email: 'EMAIL@address.com', first_name: 'BOB', last_name: 'BOBBY' };
            MockClient.query.rejects({ message: 'Error' });
            emitter.on('error', function (error, res) {
                expect(GetClientStub.called).to.be.true;
                expect(MockClient.query.calledWith('SELECT id, email, first_name, last_name FROM users WHERE id=$1', [userInfo.id])).to.be.true;
                expect(error).to.deep.equal({ message: 'Error' });
                done();
            });
            Database.emit('getUserInfo', emitter, userInfo.id, res);
        });
    });
});