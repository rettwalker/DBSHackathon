const Users = require('../../../../services/users'),
    Database = require('../../../../services/database'),
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
        it('should emit DB event to get a user info', (done) => {
            let preUser = { email: 'EMAIL@address.com', first_name: 'BOB', last_name: 'BOBBY', password: 'something' };
            req = {
                body: preUser,
                params: {
                    id: 1
                }
            };
            res = {};
            DatabaseMock.withArgs('getUserInfo').callsFake((emitter, response) => {
                expect(DatabaseMock.calledWith('getUserInfo', sinon.match.object, req.params.id, res)).to.be.true;
                done();
            });
            Users.emit('getUserInfo', req, res);
        });
    });

    describe('Done Handler', () => {
        it('should send the response 200 and an array of Users when successful', (done) => {
            res = {
                status: (status) => {
                    expect(status).to.equal(200);
                },
                json: (response) => {
                    expect(response).to.be.an('array');
                    done();
                }
            };
            Users.emit('done', [], res);
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
            Users.emit('error', errMsg, res);
        });
    });
});