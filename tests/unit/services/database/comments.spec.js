const Database = require('../../../../services/database/comments'),
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
});