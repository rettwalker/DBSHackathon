const io = require('socket.io');

const Sockets = {
    socketsConnection: null,
    setConnection(server) {
        this.socketsConnection = io(server);
        this.socketsConnection.on('connection', function (socket) {
            console.log('Socket Connection');
        });
    },
    emitNewTopic(newTopic) {
        this.socketsConnection.emit('newTopic', newTopic);
    }
};


module.exports = Sockets;