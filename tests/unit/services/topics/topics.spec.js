const Topics = require('../../../../services/topics'),
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

    describe('Different Topic Events', () => {
        it('should emit DB event to get all topics', (done) => {
            res = {
                status: (status) => {
                    expect(status).to.equal(200);
                },
                json: (response) => {
                    //expect(GetAllTopicsStub.called).to.be.true;
                    expect(response).to.be.an('array');
                    done();
                }
            };
            GetAllTopicsStub.withArgs('lookUpTopics').callsFake((emitter, response) => {
                Topics.emit('done', [], res);
            });
            Topics.emit('getTopics', req, res);

        });

        it('should emit DB event to create a new Topic', (done) => {
            req = {
                body: {
                    name: 'REACT',
                    description: 'A Short Description'
                }
            };
            res = {
                status: (status) => {
                    expect(status).to.equal(200);
                },
                json: (response) => {
                    //expect(GetAllTopicsStub.called).to.be.true;
                    expect(response).to.be.an('object');
                    done();
                }
            };
            GetAllTopicsStub.withArgs('createNewTopic').callsFake((emitter, response) => {
                Topics.emit('done', {}, res);
            });
            Topics.emit('createTopic', req, res);

        });

        it('should emit DB event to update a Topic', (done) => {
            req = {
                body: {
                    name: 'REACT',
                    description: 'A Short Description'
                },
                params: {
                    id: 1
                }
            };
            res = {
                status: (status) => {
                    expect(status).to.equal(200);
                },
                json: (response) => {
                    //expect(GetAllTopicsStub.called).to.be.true;
                    expect(response).to.be.an('object');
                    done();
                }
            };
            GetAllTopicsStub.withArgs('updateTopic').callsFake((emitter, response) => {
                Topics.emit('done', {}, res);
            });
            Topics.emit('updateTopic', req, res);

        });

    });

    describe('Done Handler', () => {
        it('should send the response 200 and an array of topics when successful', (done) => {
            res = {
                status: (status) => {
                    expect(status).to.equal(200);
                },
                json: (response) => {
                    expect(response).to.be.an('array');
                    done();
                }
            };
            Topics.emit('done', [], res);
        });
    });

    describe('Error Handler', () => {
        it('should send error response of 400 when there is an error', (done) => {
            let errMsg = {
                stack: 'An Error Occurred'
            };
            res = {
                status: (status) => {
                    expect(status).to.equal(400);
                },
                json: (response) => {
                    expect(response).to.deep.equal(errMsg);
                    done();
                }
            };
            Topics.req = {};
            Topics.res = res;
            Topics.emit('error', errMsg, res);
        });
    });
});