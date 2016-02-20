var express = require('express');
var app = express();
var server = require('http').Server(app);
var scribe = require('scribe-js')();
var console = process.console; // for logs
var path = require('path');
var db = require('./server/mongoDB.js');
var pages = require('./server/Pages.js');
var bodyParser = require('body-parser');

module.exports = {};
module.exports.app = app;
module.exports.server = server;

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

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

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});
app.use('/', function(req, res, next) {
    var pagename = req.originalUrl.substring(1); // remove the initial slash

    // if the url contains . or / its probably a call to an internal resource, we pass that right along
    if (/[\.\/]/.test(pagename) === false) {
        console.log("Client trying to connect to page " + pagename);
        console.log("Checking if page " + pagename + " exists");

        console.log(req.url);
        // check if page exists
        if (pages.getPage(pagename) === undefined) {
            console.log("Page " + pagename + " does not exist");
            req.url = "/pages/error/pagenotfound.html";
        }
        else {
            console.log("Page " + pagename + " exists");
            req.url = "/pages/index.html";
        }
        console.log(req.url);
        console.log("-");
    }

    next();
});

app.use(express.static(__dirname + '/'));
app.use('/pages', express.static(__dirname + '/pages'));

server.listen(app.get('port'), function () {
    console.log("server started. Listening on port " + app.get('port'));
});

// logging
app.use('/dev/logs', scribe.webPanel());