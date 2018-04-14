const GetClient = require('../../../../services/database/getClient'),
    EventEmitter = require('events'),
    chai = require('chai'),
    sinon = require('sinon'),
    pg = require('pg'),
    expect = chai.expect;

describe('Get DB Client', () => {
    let MockClient, ClientStub;
    beforeEach(() => {
        MockClient = Object.assign({}, { connect: sinon.stub(), end: sinon.stub() }, EventEmitter.prototype);
        ClientStub = sinon.stub(pg, 'Client').callsFake(() => {
            return MockClient;
        });
    });

    afterEach(() => {
        ClientStub.restore();
    });
    it('should get the DB client object', () => {
        expect(GetClient).to.not.be.undefined.and.null;
        expect(GetClient).to.have.property('client');
        expect(GetClient).to.have.property('getConnection');
        expect(GetClient).to.have.property('createConnection');
    });

    describe('Get the Client Connection', () => {
        let CreateConnectStub;
        beforeEach(() => {
            CreateConnectStub = sinon.stub(GetClient, 'createConnection').resolves(MockClient);
        });
        afterEach(() => {
            CreateConnectStub.restore();
        });
        it('should return a connected client', () => {
            GetClient.client = null;
            return GetClient.getConnection().then(res => {
                expect(CreateConnectStub.called).to.be.true;
            });
        });

        it('should return the previous connected client', () => {
            GetClient.client = MockClient;
            return GetClient.getConnection().then(res => {
                expect(res).to.deep.equal(MockClient);
                expect(CreateConnectStub.notCalled).to.be.true;
            });
        });
    });

    describe('Create A Connected Client', () => {
        it('should return a connected client', () => {
            MockClient.connect.resolves({});
            return GetClient.createConnection().then(res => {
                expect(MockClient.connect.called).to.be.true;
                expect(res).to.deep.equal(MockClient);
            });
        });

        it('should return a connected client', (done) => {
            GetClient.client = MockClient;
            MockClient.connect.resolves({});
            MockClient.end.callsFake(() => {
                expect(MockClient.end.called).to.be.true;
                return Promise.resolve(done());
            });
            GetClient.createConnection().then(client => {
                client.emit('error', { message: 'Error' });
            });
        });
    });
});