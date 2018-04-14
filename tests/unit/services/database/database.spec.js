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
});