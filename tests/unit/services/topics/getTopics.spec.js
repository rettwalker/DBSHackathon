const GetTopics = require('../../../../services/topics/getTopics'),
    Database = require('../../../../services/database'),
    chai = require('chai'),
    sinon = require('sinon'),
    expect = chai.expect;


describe('Handles Get Topic Requests', () => {
    let req, res, DBService, GetAllTopicsStub;
    beforeEach(() => {
        GetAllTopicsStub = sinon.stub(Database, 'emit');
    });

    afterEach(() => {
        GetAllTopicsStub.restore();
    });

    it('should emit DB event to get all topics', (done) => {
        res = {
            send: (status) => {
                expect(status).to.equal(200);
            },
            json: (response) => {
                //expect(GetAllTopicsStub.called).to.be.true;
                expect(response).to.be.an('array');
                done();
            }
        };
        GetAllTopicsStub.withArgs('lookUpTopics').callsFake((emitter, request, response) => {
            GetTopics.emit('done', req, res, []);
        });
        GetTopics.emit('getTopics', GetTopics, req, res);

    });

    it('should send the response 200 and an array of topics when successful', (done) => {
        res = {
            send: (status) => {
                expect(status).to.equal(200);
            },
            json: (response) => {
                expect(response).to.be.an('array');
                done();
            }
        };
        GetTopics.emit('done', req, res, []);
    });

    it('should send error response of 400 when there is an error', (done) => {
        let errMsg = {
            message: 'An Error Occurred'
        };
        res = {
            send: (status) => {
                expect(status).to.equal(400);
            },
            json: (response) => {
                expect(response).to.deep.equal(errMsg);
                done();
            }
        };
        GetTopics.req = {};
        GetTopics.res = res;
        GetTopics.emit('error', req, res, errMsg);
    });
});