const Auth = require('../../../../services/auth'),
    EventEmitter = require('events'),
    chai = require('chai'),
    sinon = require('sinon'),
    GetClient = require('../../../../services/database/getClient'),
    expect = chai.expect;

describe('Handle Auth', () => {
    let preUser, newUser, userInfo, req, res, MockClient, GetClientStub;
    beforeEach(() => {
        preUser = { email: 'EMAIL@address.com', password: 'something' };
        userInfo = { id: 1, email: 'EMAIL@address.com', first_name: 'BOB', last_name: 'BOBBY' };
        newUser = { email: 'EMAIL@address.com', first_name: 'BOB', last_name: 'BOBBY', password: 'something' };

        req = {
            body: preUser
        };

        MockClient = Object.assign({}, { query: sinon.stub() }, EventEmitter.prototype);
        GetClientStub = sinon.stub(GetClient, 'getConnection').resolves(MockClient);
    });

    afterEach(() => {
        GetClientStub.restore();
    });

    describe('Check Users Password ', () => {
        it('should get user based off email and password', (done) => {
            let preUser = { email: 'EMAIL@address.com', password: 'something' },
                userInfo = { id: 1, email: 'EMAIL@address.com', first_name: 'BOB', last_name: 'BOBBY' };
            MockClient.query.resolves({
                rows: [userInfo]
            });

            res = {
                status(status) {
                    expect(status).to.equal(200);
                },
                json(user) {
                    expect(GetClientStub.called).to.be.true;
                    expect(MockClient.query.calledWith('SELECT id, email, first_name, last_name FROM users WHERE email=$1 AND password=$2', [preUser.email, preUser.password])).to.be.true;
                    expect(user).to.deep.equal(userInfo);
                    done();
                }
            }


            Auth.login(req, res);
        });

        it('should fail verify user', (done) => {
            MockClient.query.rejects({ message: 'Error', userNotFound: false });
            res = {
                status(status) {
                    expect(status).to.equal(400);
                },
                json(err) {
                    expect(GetClientStub.called).to.be.true;
                    expect(MockClient.query.calledWith('SELECT id, email, first_name, last_name FROM users WHERE email=$1 AND password=$2', [preUser.email, preUser.password])).to.be.true;
                    expect(err).to.deep.equal({ message: 'Error', userNotFound: false });
                    done();
                }
            }
            Auth.login(req, res);
        });

        it('should fail verify user because user not found', (done) => {
            MockClient.query.resolves({
                rows: []
            });
            res = {
                status(status) {
                    expect(status).to.equal(400);
                },
                json(err) {
                    expect(GetClientStub.called).to.be.true;
                    expect(MockClient.query.calledWith('SELECT id, email, first_name, last_name FROM users WHERE email=$1 AND password=$2', [preUser.email, preUser.password])).to.be.true;
                    expect(err).to.deep.equal({ message: 'User Not Found', userNotFound: true });
                    done();
                }
            }
            Auth.login(req, res);
        });
    });
    describe('Register a Users Info ', () => {
        it('should insert a new user', (done) => {
            let createdUser = { id: 1, email: 'EMAIL@address.com', first_name: 'BOB', last_name: 'BOBBY' };
            req.body = newUser;
            MockClient.query.resolves({
                rows: [createdUser]
            });

            res = {
                status(status) {
                    expect(status).to.equal(200);
                },
                json(user) {
                    expect(GetClientStub.called).to.be.true;
                    expect(MockClient.query.calledWith('INSERT INTO users(email, first_name, last_name, password) VALUES($1, $2, $3, $4) RETURNING id, email, first_name, last_name', [newUser.email, newUser.first_name, newUser.last_name, newUser.password])).to.be.true;
                    expect(user).to.deep.equal(createdUser);
                    done();
                }
            }
            Auth.register(req, res);
        });

        it('should fail to insert user', (done) => {
            req.body = newUser;
            MockClient.query.rejects({ message: 'Error' });
            res = {
                status(status) {
                    expect(status).to.equal(400);
                },
                json(err) {
                    expect(GetClientStub.called).to.be.true;
                    expect(MockClient.query.calledWith('INSERT INTO users(email, first_name, last_name, password) VALUES($1, $2, $3, $4) RETURNING id, email, first_name, last_name', [newUser.email, newUser.first_name, newUser.last_name, newUser.password])).to.be.true;
                    expect(err).to.deep.equal({ message: 'Error' });
                    done();
                }
            }
            Auth.register(req, res);
        });
    });
});