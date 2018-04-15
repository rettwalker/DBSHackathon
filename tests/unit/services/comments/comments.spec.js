const Comments = require('../../../../services/comments'),
    Database = require('../../../../services/database'),
    chai = require('chai'),
    sinon = require('sinon'),
    expect = chai.expect;


describe('Handles Comment Requests', () => {
    let req, res, DBService, DatabaseMock;
    beforeEach(() => {
        DatabaseMock = sinon.stub(Database, 'emit');
    });

    afterEach(() => {
        DatabaseMock.restore();
    });

    describe('Different Comment Events', () => {
        it('should emit DB event to get a Comment', (done) => {
            let getComment = {
                id: 1,
                topic: 1,
                user_id: 1,
                message: 'A Witty Comment'
            };
            req = {
                params: {
                    id: 1
                },
                get: (header) => {
                    return 1;
                }
            };
            res = {};


            DatabaseMock.withArgs('getComment').callsFake((emitter, comment, response) => {
                expect(DatabaseMock.calledWith('getComment', sinon.match.object, req.params.id, res)).to.be.true;
                done();
            });
            Comments.emit('getComment', req, res);

        });

        it('should emit DB event to get a Comment', (done) => {
            let newComment = {
                topic_id: 1,
                user_id: 1,
                message: 'A Witty Comment'
            };
            req = {
                get: (header) => {
                    return 1;
                },
                body: {
                    topic_id: 1,
                    message: 'A Witty Comment'
                }
            };
            res = {};


            DatabaseMock.withArgs('createComment').callsFake((emitter, comment, response) => {
                expect(DatabaseMock.calledWith('createComment', sinon.match.object, newComment, res)).to.be.true;
                done();
            });
            Comments.emit('createComment', req, res);

        });

        it('should emit DB event to edit a users comment', (done) => {
            let getComment = {
                id: 1,
                topic_id: 1,
                user_id: 1,
                message: 'A new Witty Message'
            };
            req = {
                params: {
                    id: 1
                },
                get: (header) => {
                    return 1;
                },
                body: {
                    topic_id: 1,
                    user_id: 1,
                    message: 'A new Witty Message'
                }
            };
            res = {};
            DatabaseMock.withArgs('editComment').callsFake((emitter, response) => {
                expect(DatabaseMock.calledWith('editComment', sinon.match.object, getComment, res)).to.be.true;
                done();
            });
            Comments.emit('editComment', req, res);

        });

        it('should emit DB event to delete a comment', (done) => {
            req = {
                params: {
                    id: 1
                },
                get: (header) => {
                    return 1;
                }
            };
            res = {};
            DatabaseMock.withArgs('deleteComment').callsFake((emitter, response) => {
                expect(DatabaseMock.calledWith('deleteComment', sinon.match.object, { id: req.params.id, user_id: 1 }, res)).to.be.true;
                done();
            });
            Comments.emit('deleteComment', req, res);

        });

    });

    describe('Done Handler', () => {
        it('should handle the response event', (done) => {
            let responseObject = {
                id: 1,
                topic_id: 1,
                user_id: 1,
                message: 'A Witty Message'
            };
            res = {
                status: (status) => {
                    expect(status).to.equal(200);
                },
                json: (response) => {
                    expect(response).to.deep.equal(responseObject);
                    done();
                }
            };
            Comments.emit('done', responseObject, res);
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
            Comments.emit('error', errMsg, res);
        });
    });
});