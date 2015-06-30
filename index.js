var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var mongoose = require ("mongoose");
var scribe = require('scribe-js')();
var console = process.console;

app.set('port', (process.env.PORT || 5000));

app.all('*',function(req,res,next)
{
    if (!req.get('Origin')) return next();

    res.set('Access-Control-Allow-Origin','*'); // allows everyone to send requests. Should be switched with single ip later
    res.set('Access-Control-Allow-Methods','GET,POST');
    res.set('Access-Control-Allow-Headers','X-Requested-With,Content-Type');
    res.set('Access-Control-Allow-Credentials','true');

    if ('OPTIONS' == req.method) return res.status(200).end();

    next();
});

// --------|
// MongoDB |
// --------|

var uristring = 'mongodb://sdm-backend:sdm235813@ds043962.mongolab.com:43962/heroku_zkp49g4w';

// connect to mongolab
mongoose.connect(uristring, function (err, res) {
    if (err) {
        console.log ('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
        console.log ('Succeeded connected to: ' + uristring);
    }
});

// create sdm page schema
var sdmSchema = new mongoose.Schema({
    name: String,
    CurrentContent: String,
    ContentArray: Array,
    Favorites: Array,
    Settings: { // TODO: add some youtube settings and such later
        bg_color: String,
        Timezone: String,
        TimeDiff: Number // difference from localtime to utc in minutes
    },
    Timers: Array
});
var sdmPage = mongoose.model("sdmpage", sdmSchema);


// ----------|
// Socket.IO |
// ----------|

var online = 0;
var connectedSockets = [];
var tempName = "third";

io.sockets.on('connection', function (socket) {
    online++;
    connectedSockets.push(socket);
    console.log("client connected. Now online: " + online);

    // sends the Page info on init
    sdmPage.findOne({ name: tempName }, { ContentArray: { $slice: 1 },// TODO: name is hardcoded
        _id: 0 },  function(err, page) { // TODO: check if Timers, Favorites and Settings still return when they are not empty
        if (err) return console.error(err);

        // check if any timers has gotten outdated

        // determine local page time
        var utc = Date.now();
        //var ClientDate = new Date(utc);
        var ClientDate = new Date(utc + (-120) * 60000);
        console.log("local page time:");
        console.log(ClientDate);

        // check for each OneTime timer, if it has already passed
        for (var i = 0; i < page.Timers.length; i++) {
            var t = page.Timers[i];
            console.log();
            console.log("checking against timer:");

            var d = new Date(t.ActivationTime);
            console.log(d);

            if (d < ClientDate) {
                console.log("timer removed:");
                console.log(t.ActivationTime);
                // remove timer
            }
        }

        console.log("sent init content to client:");
        console.log(page);
        socket.emit('pageinit', page);
    });


    // if a client pushes new content, update db and other clients
    socket.on('pushcontent', function (newcontent) {
        console.log("New content received: " + newcontent);

        // unshifts newcontent into ContentArray
        sdmPage.update(
            { name: tempName }, // TODO: name is hardcoded
            {
                $push: {
                    'ContentArray': { $each: [newcontent], $position: 0 } } // unshift
            }, function(err, obj) {
                if (err) return console.error(err);
                //console.log(newcontent + " pushed to database");
            }
        );

        // notify other clients
        for (var i = 0; i < connectedSockets.length; i++) {
            var s = connectedSockets[i];
            if (s != socket) {
                s.emit('contentupdate', {'CurrentContent': newcontent});
                console.log("another client notified: " + i);
            }
        }
    });

    // if a client pushes new timer, update db and notify other clients
    socket.on('savetimer', function (newtimer) {
        console.log("new timer received:");
        console.log(newtimer);

        sdmPage.update(
            { name: tempName }, // TODO: name is hardcoded
            {
                $push: { 'Timers': newtimer }
            }, function(err, obj) {
                if (err) return console.error(err);
            }
        );

        // notify other clients
        for (var i = 0; i < connectedSockets.length; i++) {
            var s = connectedSockets[i];
            if (s != socket) {
                s.emit('timerupdate', newtimer);
                console.log("sent new timer to client: " + i);
            }
        }
    });



    socket.on('disconnect', function () {
        online--;
        connectedSockets.splice(connectedSockets.indexOf(socket), 1);
        console.log("Client disconnected. Now online: " + online);
    });
});


// --------|
// Express |
// --------|

app.get('/', function(req, res) {
    res.send('Hello world, see you at /logs');
});
app.use('/logs', scribe.webPanel());

console.addLogger('debug', 'red');
console.addLogger('fun', 'red');

console.time().fun('hello world');
console.tag('This is a test').debug('A test');
console.tag('An object').log({
    a: 'b',
    c: [1, 2, 3]
});

app.get('/get/history', function (request, response) { // params: skip, limit
    var skip = parseInt(request.param('skip'));
    var limit = parseInt(request.param('limit'));
    sdmPage.findOne({ name: tempName }, { ContentArray: { $slice: [skip, limit] }, // TODO: name is hardcoded
            name: 0, Timers: 0, Favorites: 0, Settings: 0, _id: 0 },  function(err, obj) {
        if (err) return console.error(err);

        console.log("Got history:");
        console.log(obj.ContentArray);
        response.send(obj.ContentArray);
    });
});

// ----------|
// Functions |
// ----------|

// generate new sdm instance
//var initMongoDB = function (Name) {
//    var newmongo = new sdmPage({
//        name: Name,
//        Settings: {
//            bg_color: "#ffffff",
//            Timezone: "GMT+0200 (CEST)",
//            TimeDiff: -120
//        }
//    });
//    newmongo.save(function (err) {if (err) console.log('Error on save of db: ' + Name)});
//};
//initMongoDB("third");

server.listen(app.get('port'), function () {
    console.log("server started. Listening on port " + app.get('port'));
});