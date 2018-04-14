const express = require('express'),
    bodyParser = require('body-parser'),
    compression = require('compression'),
    app = express(),
    port = 3000,
    routes = require('./routes');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(compression());


app.use('/api', routes);


app.listen(port, () => {
    console.log('We are live on ' + port);
});

module.exports = app;