//

var express = require('express');
var app = express();
var server = require('http').Server(app);
var scribe = require('scribe-js')();
var console = process.console; // for logs
var path = require('path');
var db = require('./mongoDB.js');

module.exports = {};
module.exports.app = app;
module.exports.server = server;

app.set('port', (process.env.PORT || 5000));
app.all('*',function(req,res,next)
{
    if (!req.get('Origin')) return next();

    res.set('Access-Control-Allow-Origin','*'); // allows everyone to send requests. todo: Should be switched with single ip later
    res.set('Access-Control-Allow-Methods','GET,POST');
    res.set('Access-Control-Allow-Headers','X-Requested-With,Content-Type');
    res.set('Access-Control-Allow-Credentials','true');

    if ('OPTIONS' == req.method) return res.status(200).end();

    next();
});
//app.get('/', function(req, res) {
//    res.sendFile(__dirname + '/client/test.html');
//});
app.use('/pages', function(req, res, next) {
    var pagename = "";
    if (req.originalUrl.match(/\./) === null) {
        pagename = req.originalUrl.substring(6);
        console.log(pagename);
        req.url = "/";
    }
    next();
});
app.use(express.static(__dirname + '/'));
app.use('/pages', express.static(__dirname + '/pages'));

server.listen(app.get('port'), function () {
    console.log("server started. Listening on port " + app.get('port'));
});
// logging

app.use('/logs', scribe.webPanel());