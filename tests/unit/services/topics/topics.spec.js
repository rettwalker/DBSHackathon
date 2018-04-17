const Topics = require('../../../../services/topics'),
    Database = require('../../../../services/database/topics'),
    chai = require('chai'),
    sinon = require('sinon'),
    expect = chai.expect;


describe('Handles Get Topic Requests', () => {
    let req, res, DBService, DatabaseMock;
    beforeEach(() => {
        DatabaseMock = sinon.stub(Database, 'emit');
    });

    afterEach(() => {
        DatabaseMock.restore();
    });

    describe('Different Topic Events', () => {
        it('should emit DB event to get all topics', (done) => {
            res = {};
            DatabaseMock.withArgs('lookUpTopics').callsFake((emitter, response) => {
                expect(DatabaseMock.calledWith('lookUpTopics', sinon.match.object, res)).to.be.true;
                done();
            });
            Topics.emit('getTopics', req, res);

        });

        it('should emit DB event to create a new Topic', (done) => {
            let newTopic = {
                name: 'REACT',
                description: 'A Short Description'
            };
            req = {
                body: {
                    name: 'REACT',
                    description: 'A Short Description'
                }
            };
            res = {};
            DatabaseMock.withArgs('createNewTopic').callsFake((emitter, response) => {
                expect(DatabaseMock.calledWith('createNewTopic', sinon.match.object, newTopic, res)).to.be.true;
                done();
            });
            Topics.emit('createTopic', req, res);

        });

        it('should emit DB event to update a Topic', (done) => {
            let updateTopic = {
                id: 1,
                name: 'REACT',
                description: 'A Short Description'
            };
            req = {
                body: {
                    name: 'REACT',
                    description: 'A Short Description'
                },
                params: {
                    id: 1
                }
            };
            res = {};
            DatabaseMock.withArgs('updateTopic').callsFake((emitter, response) => {
                expect(DatabaseMock.calledWith('updateTopic', sinon.match.object, updateTopic, res)).to.be.true;
                done();
            });
            Topics.emit('updateTopic', req, res);
        });

        it('should emit DB event to get a topic and its comments', (done) => {
            req = {
                body: {
                    name: 'REACT',
                    description: 'A Short Description'
                },
                params: {
                    id: 1
                }
            };
            res = {};
            DatabaseMock.withArgs('getTopic').callsFake((emitter, response) => {
                expect(DatabaseMock.calledWith('getTopic', sinon.match.object, req.params.id, res)).to.be.true;
                done();
            });
            Topics.emit('getTopic', req, res);
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
            Topics.emit('error', errMsg, res);
        });
    });
});