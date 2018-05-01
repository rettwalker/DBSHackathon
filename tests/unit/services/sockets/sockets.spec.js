const Sockets = require('../../../../services/sockets'),
    Database = require('../../../../services/database/topics'),
    EventEmitter = require('events'),
    chai = require('chai'),
    sinon = require('sinon'),
    expect = chai.expect;

describe('Abstracted for the sockets', () => {
    let MockSocket, DatabaseMock;
    beforeEach(() => {
        MockSocket = Object.assign({}, EventEmitter.prototype);

        DatabaseMock = sinon.stub(Database, 'on');

    });

    afterEach(() => {
        DatabaseMock.restore();
    });

    it('should create the socket', () => {
        Sockets.setConnection({});
        expect(Sockets.socketsConnection).to.not.be.null;
    });

    it('should emit event on new topic', () => {
        Sockets.socketsConnection = Object.assign({}, EventEmitter.prototype);
        let emitStub = sinon.stub(Sockets.socketsConnection, 'emit');
        let topic = {
            "name": "EmberJS",
            "id": 1
        };
        Sockets.emitNewTopic(topic);
        expect(emitStub.calledWith('newTopic', topic)).to.be.true;
    });

    it('should emit event on new when vote occurs', () => {
        Sockets.socketsConnection = Object.assign({}, EventEmitter.prototype);
        let emitStub = sinon.stub(Sockets.socketsConnection, 'emit');
        Sockets.emitVoteChange();
        expect(emitStub.calledWith('votesChanged')).to.be.true;
    });

});