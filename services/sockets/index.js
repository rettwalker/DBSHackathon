const io = require('socket.io');

const Sockets = {
    socketsConnection: null,
    setConnection(server) {
        this.socketsConnection = io(server);
    },
    emitNewTopic(newTopic) {
        this.socketsConnection.emit('newTopic', newTopic);
    },
    emitVoteChange() {
        this.socketsConnection.emit('votesChanged');
    }
};


module.exports = Sockets;