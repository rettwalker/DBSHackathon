const Database = require('../../../../services/database/users'),
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