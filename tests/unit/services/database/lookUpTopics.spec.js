const Database = require('../../../../services/database'),
    EventEmitter = require('events'),
    chai = require('chai'),
    sinon = require('sinon'),
    expect = chai.expect;

describe('Handles Get Topic Requests', () => {
    let emitter, req, res;
    beforeEach(() => {
        emitter = Object.assign({}, EventEmitter.prototype);
        emitter.on('done', sinon.stub());
    });

    it('should emit object', (done) => {
        emitter.on('done', function (req, res, topics) {
            expect(topics).to.be.an('array');
            done();
        });
        Database.emit('lookUpTopics', emitter, req, res);
    });
});