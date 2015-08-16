//

var app = require('express')();
var server = require('http').Server(app);
var scribe = require('scribe-js')();
var console = process.console; // for logs
var path = require('path');

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

server.listen(app.get('port'), function () {
    console.log("server started. Listening on port " + app.get('port'));
});
// logging
app.get('/', function(req, res) {
    //res.send('Logging at /logs');
    //console.log(__dirname + '/client/index.html');
    //console.log("/home/martin/marand.dk/ShowDatMeme/mark.2/server/client/Index.html");
    //res.sendFile('./test.html');
    //res.sendFile('/home/martin/marand.dk/ShowDatMeme/mark.2/server/client/Index.html');
    //console.log(path.join(__dirname, './client', 'index.html'));
    res.sendFile(path.join(__dirname, 'test.html'));
    //res.sendFile('test.html');
});
app.use('/logs', scribe.webPanel());