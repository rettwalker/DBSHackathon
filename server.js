const express = require('express'),
    bodyParser = require('body-parser'),
    compression = require('compression'),
    app = express(),
    port = 3000,
    routes = require('./routes'),
    server = require('http').createServer(app),
    Sockets = require('./services/sockets');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(compression());
'Access-Control-Allow-Origin: *'



app.use('/api', (req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    next();
}, routes);

Sockets.setConnection(server);

server.listen(port, () => {
    console.log('We are live on ' + port);
});

module.exports = app;