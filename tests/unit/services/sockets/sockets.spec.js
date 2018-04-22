const Sockets = require('../../../../services/sockets'),
    Database = require('../../../../services/database/topics'),
    EventEmitter = require('events'),
    chai = require('chai'),
    sinon = require('sinon'),
    expect = chai.expect;

describe('Abstracted for the sockets', () => {
    it('should create the socket', () => {
        Sockets.setConnection({});
        expect(Sockets.socketsConnection).to.not.be.null;
    });

    it('should have on connection listener', () => {
        Sockets.setConnection({});
        Sockets.socketsConnection.emit('connection', {});
    });

    it('should have on connection listener', () => {
        Sockets.socketsConnection = Object.assign({}, EventEmitter.prototype);
        let emitStub = sinon.stub(Sockets.socketsConnection, 'emit');
        let topic = {
            "name": "EmberJS",
            "id": 1
        };
        Sockets.emitNewTopic(topic);
        expect(emitStub.calledWith('newTopic', topic)).to.be.true;
    });
});