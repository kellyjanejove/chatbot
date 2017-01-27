var express = require('express');
var app = express();
var path = require('path');

//app.use(express.static(path.join(__dirname, 'public')));
app.use('/.tmp', express.static(__dirname + '/.tmp'));
app.use('/app', express.static(__dirname + '/app'));
app.use('/Content', express.static(__dirname + '/Content'));
app.use('/fonts', express.static(__dirname + '/fonts'));
app.use('/images', express.static(__dirname + '/images'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/public', express.static(__dirname + '/public'));
app.use('/Scripts', express.static(__dirname + '/Scripts'));

// viewed at http://localhost:8888
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/specs.html', function (req, res) {
    res.sendFile(path.join(__dirname + '/specs.html'));
});

app.listen(8888);