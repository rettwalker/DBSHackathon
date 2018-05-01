const Database = require('../../../../services/database/topics'),
    EventEmitter = require('events'),
    chai = require('chai'),
    sinon = require('sinon'),
    GetClient = require('../../../../services/database/getClient'),
    Sockets = require('../../../../services/sockets'),
    expect = chai.expect;

describe('Handles DB Requests', () => {
    let emitter, req, res, MockClient, GetClientStub, SocketEmitterStub, SocketVoteChangeStub;
    beforeEach(() => {
        MockClient = Object.assign({}, { query: sinon.stub() }, EventEmitter.prototype);
        GetClientStub = sinon.stub(GetClient, 'getConnection').resolves(MockClient);

        SocketEmitterStub = sinon.stub(Sockets, 'emitNewTopic');
        SocketVoteChangeStub = sinon.stub(Sockets, 'emitVoteChange');
        emitter = Object.assign({}, EventEmitter.prototype);
        emitter.on('done', sinon.stub());
    });

    afterEach(() => {
        GetClientStub.restore();
        SocketEmitterStub.restore();
        SocketVoteChangeStub.restore();
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
                expect(SocketEmitterStub.calledWith(createdTopic)).to.be.true;
                expect(GetClientStub.called).to.be.true;
                expect(MockClient.query.firstCall.calledWith('SELECT * FROM topics WHERE LOWER(name)=LOWER($1)', [newTopic.name])).to.be.true;
                expect(MockClient.query.secondCall.calledWith('INSERT INTO topics(name, description, votes) VALUES($1, $2, 0) RETURNING *', [newTopic.name, newTopic.description])).to.be.true;
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
                expect(MockClient.query.secondCall.calledWith('INSERT INTO topics(name, description, votes) VALUES($1, $2, 0) RETURNING *', [newTopic.name, newTopic.description])).to.be.true;
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

    describe('Vote on A Topic', () => {
        it('should upvote the topic', (done) => {
            let updateTopic = { id: 1 };
            let upVotedTopic = { id: 1, name: 'brianc', description: 'A Short Description New', votes: 1 };
            MockClient.query.resolves({
                rows: [upVotedTopic]
            });
            emitter.on('done', function (updatedTopic, res) {
                expect(SocketVoteChangeStub.called).to.be.true;
                expect(GetClientStub.called).to.be.true;
                expect(MockClient.query.calledWith('UPDATE topics SET votes=votes+1 WHERE id=$1 RETURNING *', [updateTopic.id])).to.be.true;
                expect(updatedTopic).to.deep.equal(upVotedTopic);
                done();
            });
            Database.emit('upVoteTopic', emitter, updateTopic, res);
        });

        it('should fail to upvote the topic', (done) => {
            let updateTopic = { id: 1 };
            MockClient.query.rejects({ message: 'Error' });
            emitter.on('error', function (updatedTopic, res) {
                expect(GetClientStub.called).to.be.true;
                expect(MockClient.query.calledWith('UPDATE topics SET votes=votes+1 WHERE id=$1 RETURNING *', [updateTopic.id])).to.be.true;
                expect(updatedTopic).to.deep.equal({ message: 'Error' });
                done();
            });
            Database.emit('upVoteTopic', emitter, updateTopic, res);
        });
    });
});